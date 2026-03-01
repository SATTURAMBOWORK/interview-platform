import { useEffect, useMemo, useState } from "react";
import axios from "../../api/axios";
import { 
  Target, Zap, Activity, Flame
} from "lucide-react";
import { motion, useSpring } from "framer-motion";

import DsaStats from "../../components/user/DsaStats";
import DsaCalendar from "../../components/user/DsaCalendar";
import DsaProblemTable from "../../components/user/DsaProblemList";
import DsaProgressRing from "../../components/user/DsaProgressRing";
import DsaSkeletonDashboard from "../../components/user/DsaDashboardSkeleton";
import usePageTitle from "../../hooks/usePageTitle";

const DsaDashboard = () => {
  usePageTitle("DSA Arena");
  const [stats, setStats] = useState(null);
  const [calendar, setCalendar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [solvedProblemIds, setSolvedProblemIds] = useState([]);
  const [attemptedProblemIds, setAttemptedProblemIds] = useState([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [acceptedSubmissions, setAcceptedSubmissions] = useState(0);
  const [groupedTopicProblems, setGroupedTopicProblems] = useState({});
  const [userProblemStats, setUserProblemStats] = useState({});

  // 3D Physics for Hero Tilt
  const heroRotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const heroRotateY = useSpring(0, { stiffness: 150, damping: 20 });

  const fetchDashboardData = async () => {
    try {
      const [statsRes, calendarRes, solvedRes, problemsRes] = await Promise.all([
        axios.get("/dsa/stats"),
        axios.get("/dsa/calendar"),
        axios.get("/dsa/solved"),
        axios.get("/dsa/problems"),
      ]);

      setStats(statsRes.data.stats);
      setCalendar(calendarRes.data);
      setSolvedProblemIds(solvedRes.data.solvedProblemIds || []);
      setAttemptedProblemIds(solvedRes.data.attemptedProblemIds || []);
      setTotalSubmissions(solvedRes.data.totalSubmissions || 0);
      setAcceptedSubmissions(solvedRes.data.acceptedSubmissions || 0);
      setUserProblemStats(solvedRes.data.perProblemStats || {});

      const nextGroupedProblems = (Array.isArray(problemsRes.data) ? problemsRes.data : []).reduce((acc, problem) => {
        const tags = Array.isArray(problem.tags) && problem.tags.length > 0
          ? problem.tags
          : ["untagged"];

        tags.forEach((tag) => {
          const topic = String(tag).toLowerCase();
          if (!acc[topic]) {
            acc[topic] = [];
          }
          acc[topic].push(problem);
        });

        return acc;
      }, {});

      setGroupedTopicProblems(nextGroupedProblems);
    } catch (error) {
      console.error("Failed to load dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const totalProblems = useMemo(() => 
    Object.values(groupedTopicProblems).reduce((sum, list) => sum + list.length, 0), 
  [groupedTopicProblems]);

  const masteryPercentage = totalProblems > 0 
    ? Math.round((solvedProblemIds.length / totalProblems) * 100) 
    : 0;

  // Calculate topic-wise statistics
  const topicStats = useMemo(() => {
    return Object.entries(groupedTopicProblems).map(([topic, problems]) => {
      const solvedCount = problems.filter(p => solvedProblemIds.includes(p._id)).length;
      const totalCount = problems.length;
      const percentage = totalCount > 0 ? Math.round((solvedCount / totalCount) * 100) : 0;
      
      return {
        topic,
        solved: solvedCount,
        total: totalCount,
        percentage,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [groupedTopicProblems, solvedProblemIds]);

  const bestTopic = topicStats.length > 0 ? topicStats[0] : null;
  const weakestTopic = topicStats.length > 0 ? topicStats[topicStats.length - 1] : null;

  const attemptedQuestionTitles = useMemo(() => {
    const allProblems = Object.values(groupedTopicProblems).flat();
    const attemptedSet = new Set(attemptedProblemIds.map((id) => String(id)));
    const unique = new Map();

    allProblems.forEach((problem) => {
      const problemId = String(problem?._id || "");
      if (attemptedSet.has(problemId) && !unique.has(problemId)) {
        unique.set(problemId, problem?.title || "Untitled Problem");
      }
    });

    return Array.from(unique.values());
  }, [groupedTopicProblems, attemptedProblemIds]);

  // Calculate acceptance rate (accepted submissions / total submissions)
  const acceptanceRate = totalSubmissions > 0 
    ? Math.round((acceptedSubmissions / totalSubmissions) * 100) 
    : 0;

  // SVG Circle Calculations
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  if (loading) return <DsaSkeletonDashboard />;

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-cyan-500/30">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]"></div>
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[100px]"></div>
      </div>

      <header className="relative pt-8 pb-4 px-6 max-w-[1600px] mx-auto">
        <motion.div
          style={{ rotateX: heroRotateX, rotateY: heroRotateY, transformPerspective: 1200, "--mouse-x": "50%", "--mouse-y": "50%" }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
            e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
            heroRotateX.set(-((y / rect.height) - 0.5) * 10);
            heroRotateY.set(((x / rect.width) - 0.5) * 10);
          }}
          onMouseLeave={() => {
            heroRotateX.set(0);
            heroRotateY.set(0);
          }}
          className="group relative overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-10 md:p-14 transition-all duration-300 hover:border-cyan-400/40"
        >
          {/* NEON MOUSE SPOTLIGHT EFFECT */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          
          <div className="relative z-10 grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase font-mono">
                <Activity className="w-4 h-4 animate-pulse" /> System Interface Online
              </div>
              <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight font-header uppercase">
                Ascend Your <br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                  DSA Legacy
                </span>
              </h1>
              <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                Elite performance tracking for algorithmic mastery. Build consistency, solve patterns, and dominate the interview arena.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                {[{ icon: Target, label: "Optimization", color: "text-cyan-400" }, { icon: Zap, label: "Complexity", color: "text-purple-400" }, { icon: Flame, label: "Streak", color: "text-orange-400" }].map((item, i) => (
                  <div key={i} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${item.color} font-mono`}>
                    <item.icon className="w-4 h-4" /> {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* DYNAMIC MASTERY RING (Filled only by solved count) */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative">
                <svg className="w-56 h-56 md:w-64 md:h-64 -rotate-90">
                  <circle cx="50%" cy="50%" r={radius} className="stroke-white/5 fill-none" strokeWidth="12" />
                  <motion.circle
                    cx="50%" cy="50%" r={radius}
                    className="stroke-cyan-500 fill-none"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (circumference * masteryPercentage) / 100 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeLinecap: "round", filter: "drop-shadow(0 0 8px rgba(6,182,212,0.8))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none font-mono">
                    {masteryPercentage}%
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400 mt-2">Sync Rate</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </header>

      <main className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* STATS & METRICS (BENTO) */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              className="relative overflow-hidden group p-8 rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md"
              style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <h4 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-6 font-mono">Performance Core</h4>
              <DsaStats stats={stats} />
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-4 font-mono">Achievement Ring</h4>
              <DsaProgressRing
                easy={{ solved: stats?.easy?.solved || 0, total: stats?.easy?.total || 0 }}
                medium={{ solved: stats?.medium?.solved || 0, total: stats?.medium?.total || 0 }}
                hard={{ solved: stats?.hard?.solved || 0, total: stats?.hard?.total || 0 }}
                attemptedCount={attemptedProblemIds.length}
              />
            </motion.div>
          </div>

          {/* CALENDAR & VISUAL HEATMAP */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative overflow-hidden group p-10 rounded-[2.5rem] bg-white/5 border border-white/10 shadow-2xl backdrop-blur-md"
              style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.12),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="flex items-center justify-between mb-10">
                <h4 className="text-lg font-bold uppercase tracking-tighter text-white font-header">Consistency Heatmap</h4>
                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                  <span className="w-3 h-3 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,1)]"></span>
                  <span className="text-xs font-mono text-slate-400">Active Monitoring</span>
                </div>
              </div>
              <DsaCalendar data={calendar} />
            </motion.div>

            {/* NEW: INSIGHTS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Best Topic */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-400/20 shadow-xl backdrop-blur-md group hover:border-green-400/40 transition-all"
                style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(34,197,94,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-green-400 font-mono font-bold">Best Topic</p>
                  <h5 className="text-xl font-black text-white capitalize mt-1">{bestTopic?.topic || "N/A"}</h5>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-green-400">{bestTopic?.percentage || 0}%</span>
                  <span className="text-sm text-slate-400">({bestTopic?.solved || 0}/{bestTopic?.total || 0})</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${bestTopic?.percentage || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ boxShadow: "0 0 10px rgba(34, 197, 94, 0.6)" }}
                  />
                </div>
              </motion.div>

              {/* Weakest Topic */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-orange-500/10 to-red-500/5 border border-orange-400/20 shadow-xl backdrop-blur-md group hover:border-orange-400/40 transition-all"
                style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(251,146,60,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-orange-400 font-mono font-bold">Focus Area</p>
                  <h5 className="text-xl font-black text-white capitalize mt-1">{weakestTopic?.topic || "N/A"}</h5>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-orange-400">{weakestTopic?.percentage || 0}%</span>
                  <span className="text-sm text-slate-400">({weakestTopic?.solved || 0}/{weakestTopic?.total || 0})</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-orange-500 to-red-400"
                    initial={{ width: 0 }}
                    animate={{ width: `${weakestTopic?.percentage || 0}%` }}
                    transition={{ duration: 1, delay: 0.5 }}
                    style={{ boxShadow: "0 0 10px rgba(251, 146, 60, 0.6)" }}
                  />
                </div>
              </motion.div>

              {/* Acceptance Rate */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-blue-500/5 border border-cyan-400/20 shadow-xl backdrop-blur-md group hover:border-cyan-400/40 transition-all"
                style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-cyan-400 font-mono font-bold">Acceptance Rate</p>
                </div>
                <span className="text-3xl font-black text-cyan-400">{acceptanceRate}%</span>
              </motion.div>

              {/* Total Submissions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/5 border border-purple-400/20 shadow-xl backdrop-blur-md group hover:border-purple-400/40 transition-all"
                style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                  e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(168,85,247,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="mb-4">
                  <p className="text-xs uppercase tracking-wider text-purple-400 font-mono font-bold">Total Submissions</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-purple-400">{totalSubmissions}</span>
                  <span className="text-sm text-slate-400">attempts</span>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs">
                  <span className="text-slate-400">{acceptedSubmissions} accepted submissions</span>
                  <span className="text-slate-400">{attemptedProblemIds.length} questions attempted</span>
                </div>
                {attemptedQuestionTitles.length > 0 && (
                  <p className="mt-3 text-xs text-slate-400 truncate" title={attemptedQuestionTitles.join(", ")}>
                    Attempted: {attemptedQuestionTitles.length === 1
                      ? attemptedQuestionTitles[0]
                      : `${attemptedQuestionTitles[0]} +${attemptedQuestionTitles.length - 1} more`}
                  </p>
                )}
              </motion.div>

            </div>
          </div>

          {/* PROBLEM TABLE SECTION */}
          <section className="lg:col-span-12 mt-4">
            <div className="flex items-center gap-4 mb-8">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent" />
                <h3 className="text-2xl font-black text-white tracking-tighter italic uppercase font-header flex items-center gap-3">
                  <Zap className="w-6 h-6 text-cyan-400 fill-cyan-400/20" /> 
                  Terminal Directory
                </h3>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />
            </div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden group rounded-[2.5rem] border border-white/10 bg-white/5 p-4 md:p-8 backdrop-blur-xl shadow-2xl"
              style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
              }}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.10),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <DsaProblemTable
                groupedProblems={groupedTopicProblems}
                solvedProblemIds={solvedProblemIds}
                attemptedProblemIds={attemptedProblemIds}
                userProblemStats={userProblemStats}
              />
            </motion.div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default DsaDashboard;