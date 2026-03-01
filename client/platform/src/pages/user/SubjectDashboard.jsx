import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, useSpring } from "framer-motion";
import { 
  ArrowLeft, 
  TrendingUp, 
  CheckCircle2, 
  BarChart3, 
  Clock,
  Activity,
  Zap
} from "lucide-react";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

function SubjectDashboard() {
  usePageTitle("Subject Overview");
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [subject, setSubject] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 3D Physics for Hero Tilt
  const heroRotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const heroRotateY = useSpring(0, { stiffness: 150, damping: 20 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectRes, attemptsRes] = await Promise.all([
          api.get(`/subjects/${subjectId}`),
          api.get(`/attempts/user/subject/${subjectId}`),
        ]);

        setSubject(subjectRes.data);
        const attemptsData = Array.isArray(attemptsRes.data)
          ? attemptsRes.data
          : attemptsRes.data?.attempts || [];
        setAttempts(attemptsData);
      } catch (error) {
        console.error("Failed to load subject dashboard", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [subjectId]);

  const totalAttempts = attempts.length;
  const attemptsWithAccuracy = useMemo(() => 
    attempts.map((a) => ({
      ...a,
      accuracyPercent: Math.round((a.correctCount / 50) * 100)
    })), [attempts]);

  const bestScore = totalAttempts === 0 ? 0 : Math.max(...attemptsWithAccuracy.map((a) => a.accuracyPercent));
  const averageScore = totalAttempts === 0 ? 0 : Math.round(
    attempts.reduce((sum, a) => sum + (a.correctCount || 0), 0) / totalAttempts
  );
  const accuracy = totalAttempts === 0 ? 0 : Math.round(
    (attempts.reduce((sum, a) => sum + a.correctCount, 0) / (totalAttempts * 50)) * 100
  );

  const scoreValues = useMemo(() => 
    [...attemptsWithAccuracy].reverse().map((a) => a.accuracyPercent), 
  [attemptsWithAccuracy]);

  const recentAttempts = useMemo(() => [...attemptsWithAccuracy].reverse().slice(0, 5), [attemptsWithAccuracy]);

  if (loading) return <div className="min-h-screen bg-[#0a0a16] flex items-center justify-center text-cyan-400 font-mono animate-pulse">SYNCING_CORE...</div>;
  if (!subject) return null;

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-cyan-500/30">
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]"></div>
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[100px]"></div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-10">
        
        {/* COMPACT NAV */}
        <motion.button
          whileHover={{ x: -5 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 font-bold text-[10px] uppercase tracking-[0.3em] font-mono transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Terminal
        </motion.button>

        {/* COMPACT HERO - NO STATS */}
        <header className="relative">
          <motion.div
            style={{ 
              rotateX: heroRotateX, 
              rotateY: heroRotateY, 
              transformPerspective: 1200, 
              "--mouse-x": "50%", 
              "--mouse-y": "50%" 
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
              heroRotateX.set(-((y / rect.height) - 0.5) * 8);
              heroRotateY.set(((x / rect.width) - 0.5) * 8);
            }}
            onMouseLeave={() => {
              heroRotateX.set(0);
              heroRotateY.set(0);
            }}
            className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-8 md:p-10 transition-all duration-300 hover:border-cyan-400/30 shadow-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.18),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            
            <div className="relative z-10 space-y-4">
              
              
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter uppercase font-header">
                <span className="bg-gradient-to-r from-white via-slate-300 to-slate-500 bg-clip-text text-transparent opacity-50">Analysis:</span><br />
                <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_10px_rgba(6,182,212,0.4)] pb-1 inline-block">
                  {subject?.name}
                </span>
              </h1>
              
              <p className="text-slate-500 text-sm max-w-lg font-medium font-mono uppercase tracking-wider">
                Full diagnostic and historical record of subject-specific performance metrics.
              </p>
            </div>
          </motion.div>
        </header>

        {/* KPI BENTO GRID (The actual stats) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Attempts", val: totalAttempts, icon: Clock, color: "text-cyan-400", bg: "bg-cyan-400/5", glow: "rgba(6,182,212,0.35)" },
            { label: "Peak Score", val: `${bestScore}%`, icon: TrendingUp, color: "text-emerald-400", bg: "bg-emerald-400/5", glow: "rgba(52,211,153,0.35)" },
            { label: "Avg Score", val: averageScore, icon: BarChart3, color: "text-purple-400", bg: "bg-purple-400/5", glow: "rgba(168,85,247,0.35)" },
            { label: "Accuracy", val: `${accuracy}%`, icon: CheckCircle2, color: "text-orange-400", bg: "bg-orange-400/5", glow: "rgba(251,146,60,0.35)" }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.06, boxShadow: `0 0 20px ${kpi.glow}` }}
              style={{ transition: "box-shadow 0.2s, border-color 0.2s" }}
              className={`border border-white/5 rounded-2xl p-5 backdrop-blur-md hover:border-white/30 transition-colors cursor-default ${kpi.bg}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">{kpi.label}</p>
              </div>
              <p className={`text-2xl font-black ${kpi.color} tracking-tighter font-mono`}>{kpi.val}</p>
            </motion.div>
          ))}
        </div>

        {/* PERFORMANCE & LOGS */}
        <div className="grid lg:grid-cols-12 gap-6">
          <motion.div className="lg:col-span-8 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-400 mb-8 uppercase tracking-widest font-mono flex items-center gap-2">
                <BarChart3 className="w-3 h-3" /> Historical Trend_Map
            </h3>
            {scoreValues.length > 0 ? (
              <div className="h-56 relative">
                <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                  <path
                    d={`M 0 ${150 - (scoreValues[0] * 1.5)} ${scoreValues.map((v, i) => `L ${(i / (scoreValues.length - 1)) * 500} ${150 - (v * 1.5)}`).join(' ')} L 500 150 L 0 150 Z`}
                    fill="url(#trendFill)"
                  />
                  <defs>
                    <linearGradient id="trendFill" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.2"/>
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0"/>
                    </linearGradient>
                  </defs>
                  <motion.path
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5 }}
                    d={`M 0 ${150 - (scoreValues[0] * 1.5)} ${scoreValues.map((v, i) => `L ${(i / (scoreValues.length - 1)) * 500} ${150 - (v * 1.5)}`).join(' ')}`}
                    stroke="#06B6D4" strokeWidth="2" fill="none"
                  />
                </svg>
              </div>
            ) : (
              <div className="h-56 flex items-center justify-center text-slate-600 font-mono text-xs uppercase">No_Records_Found</div>
            )}
          </motion.div>

          <motion.div className="lg:col-span-4 bg-white/5 border border-white/10 rounded-[2rem] p-8 backdrop-blur-md">
            <h3 className="text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest font-mono flex items-center gap-2">
                <Clock className="w-3 h-3" /> Event_Logs
            </h3>
            <div className="space-y-3">
              {recentAttempts.length === 0 ? (
                <p className="text-[10px] text-slate-600 font-mono text-center py-6 uppercase">No_Records_Found</p>
              ) : (
                recentAttempts.map((attempt, idx) => {
                  const pct = attempt.accuracyPercent;
                  const isGood = pct >= 70;
                  const timeAgo = (() => {
                    const diff = (Date.now() - new Date(attempt.createdAt)) / 1000;
                    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
                    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
                    return new Date(attempt.createdAt).toLocaleDateString();
                  })();
                  return (
                    <div
                      key={idx}
                      onClick={() => navigate(`/attempt/${attempt._id}`)}
                      className="p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-cyan-400/20 transition-all group cursor-pointer"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isGood ? 'bg-emerald-400' : 'bg-orange-400'}`} />
                          <p className="text-[10px] font-bold text-slate-400 font-mono">{timeAgo}</p>
                        </div>
                        <div className={`text-sm font-black font-mono ${isGood ? 'text-emerald-400' : 'text-orange-400'}`}>
                          {pct}%
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-[9px] text-slate-600 font-mono">{attempt.correctCount ?? 0} / 50 correct</p>
                        <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Review →</span>
                      </div>
                      <div className="mt-2 h-1 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${isGood ? 'bg-emerald-400' : 'bg-orange-400'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        </div>

        {/* ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.button
            whileHover={{ scale: 1.01, boxShadow: "0 0 20px rgba(6,182,212,0.3)" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate(`/test/${subjectId}`)}
            className="px-8 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 text-[#0a0a16] font-black rounded-2xl text-[10px] uppercase tracking-[0.3em] font-mono shadow-lg"
          >
            Execute Assessment
          </motion.button>
          <motion.button
            whileHover={{ backgroundColor: "rgba(255,255,255,0.08)" }}
            whileTap={{ scale: 0.99 }}
            onClick={() => navigate("/dashboard")}
            className="px-8 py-5 border border-white/10 text-slate-400 font-bold rounded-2xl text-[10px] uppercase tracking-[0.3em] font-mono"
          >
            Return to Core
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default SubjectDashboard;