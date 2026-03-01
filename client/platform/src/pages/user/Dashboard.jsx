import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import usePageTitle from "../../hooks/usePageTitle";
import { motion, useMotionValue } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
  Code2,
  Award,
  Zap,
  Calendar,
  Trophy,
  Layers,
  Flame,
  Activity,
  Sparkles,
  Target,
  Star,
  Brain,
  Rocket,
  Heart,
} from "lucide-react";
import api from "../../api/axios";
import SubjectCard from "../../components/user/SubjectCard";

const formatDateKey = (date) => date.toISOString().slice(0, 10);

function UserDashboard() {
  usePageTitle("Dashboard");
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [user, setUser] = useState(null);
  const [dsaStats, setDsaStats] = useState(null);
  const [starResponses, setStarResponses] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Mouse tracking for parallax (left card only)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const handleMouseMove = (e) => {
    const { clientX, clientY, currentTarget } = e;
    const rect = currentTarget.getBoundingClientRect();
    mouseX.set((clientX - rect.left - rect.width / 2) / 20);
    mouseY.set((clientY - rect.top - rect.height / 2) / 20);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, attemptsRes, userRes, dsaStatsRes, starRes] = await Promise.all([
          api.get("/subjects"),
          api.get("/attempts/my"),
          api.get("/users/profile"),
          api.get("/dsa/stats"),
          api.get("/behavioral/responses").catch(() => ({ data: [] })),
        ]);

        setSubjects(subjectsRes.data);
        setAttempts(attemptsRes.data);
        setUser(userRes.data.user);
        setDsaStats(dsaStatsRes.data);
        const starData = starRes.data?.responses ?? starRes.data;
        setStarResponses(Array.isArray(starData) ? starData : []);
      } catch (error) {
        console.error("Dashboard load error", error);
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            setUser({ username: decoded.username || "User" });
          } catch (e) {
            setUser({ username: "User" });
          }
        }
      }
    };

    fetchData();
  }, []);

  /* ===================== */
  /* KPI CALCULATIONS */
  /* ===================== */
  // Exclude in-progress/timed-out attempts — works even for older docs without a status field
  const completedAttempts = attempts.filter((a) => a.status !== "in-progress");

  const totalAttempts = completedAttempts.length;

  const totalQuestions = completedAttempts.reduce((sum, a) => sum + (a.totalQuestions || 0), 0);

  const accuracy = (() => {
    if (totalAttempts === 0) return 0;
    // Group by subject, compute per-subject accuracy, then average across subjects
    const subjectMap = {};
    completedAttempts.forEach((a) => {
      const sid = typeof a.subject === "string" ? a.subject : a.subject?._id;
      if (!sid) return;
      if (!subjectMap[sid]) subjectMap[sid] = { correct: 0, count: 0 };
      subjectMap[sid].correct += a.correctCount || 0;
      subjectMap[sid].count  += 1;
    });
    const subjectIds = Object.keys(subjectMap);
    if (subjectIds.length === 0) return 0;
    const sumOfSubjectAccuracies = subjectIds.reduce((sum, sid) => {
      const { correct, count } = subjectMap[sid];
      return sum + (correct / (count * 50)) * 100;
    }, 0);
    return Math.round(sumOfSubjectAccuracies / subjectIds.length);
  })();

  const avgTime = (() => {
    if (totalAttempts === 0) return "0m 0s";
    const totalSecs = Math.round(
      completedAttempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0) / totalAttempts
    );
    const m = Math.floor(totalSecs / 60);
    const s = totalSecs % 60;
    return `${m}m ${s}s`;
  })();

  const sortedAttempts = [...completedAttempts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Unique dates on which at least one completed MCQ attempt was made
  const attemptDatesSet = new Set(
    completedAttempts.filter((a) => a.createdAt).map((a) => formatDateKey(new Date(a.createdAt)))
  );

  // Current streak: consecutive days ending today
  const streakDays = (() => {
    if (attemptDatesSet.size === 0) return 0;
    let count = 0;
    for (let i = 0; i < 365; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = formatDateKey(date);
      if (attemptDatesSet.has(key)) count += 1;
      else break;
    }
    return count;
  })();

  // Longest streak ever
  const longestStreak = (() => {
    if (attemptDatesSet.size === 0) return 0;
    const sortedDates = [...attemptDatesSet].sort();
    let maxStreak = 1;
    let current = 1;
    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1]);
      const curr = new Date(sortedDates[i]);
      const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        current += 1;
        if (current > maxStreak) maxStreak = current;
      } else {
        current = 1;
      }
    }
    return maxStreak;
  })();

  const recentAttempts = sortedAttempts.slice(0, 4);

  /* ===================== */
  /* XP & LEVEL SYSTEM     */
  /* ===================== */
  // MCQ: high-score attempts (≥80% accuracy = score ≥ 40/50) → 100 XP each
  const highAccuracyAttempts = completedAttempts.filter((a) => a.score >= 40).length;

  // DSA XP
  const dsaXP =
    (dsaStats?.easy?.solved || 0) * 75 +
    (dsaStats?.medium?.solved || 0) * 150 +
    (dsaStats?.hard?.solved || 0) * 300;

  // STAR/Behavioral XP: ≥80 overallScore → 75 XP, 60–79 → 40 XP
  const starXP = starResponses.reduce((sum, r) => {
    const s = r?.feedback?.overallScore ?? r?.overallScore ?? 0;
    if (s >= 80) return sum + 75;
    if (s >= 60) return sum + 40;
    return sum;
  }, 0);

  const totalXP = highAccuracyAttempts * 100 + streakDays * 25 + dsaXP + starXP;

  const getXPForLevel = (n) => Math.floor((100 * n * (n - 1)) / 2);

  const userLevel = Math.min(Math.floor((1 + Math.sqrt(1 + (8 * totalXP) / 100)) / 2), 100);

  const currentLevelXP = getXPForLevel(userLevel);
  const nextLevelXP = getXPForLevel(userLevel + 1);

  const xpProgress =
    userLevel >= 100
      ? 100
      : Math.max(0, Math.min(100, Math.round(((totalXP - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)));

  const xpToNextLevel = userLevel >= 100 ? 0 : Math.max(0, nextLevelXP - totalXP);

  /* ===================== */
  /* SUBJECT ANALYTICS */
  /* ===================== */
  const getWeakestSubject = () => {
    if (subjects.length === 0) return null;

    const subjectsWithStats = subjects.map((subject) => {
      const subjectAttempts = completedAttempts.filter((a) => {
        const attemptSubjectId = typeof a.subject === "string" ? a.subject : a.subject?._id;
        return attemptSubjectId === subject._id;
      });

      const avgScore =
        subjectAttempts.length === 0
          ? 0
          : Math.round(
              subjectAttempts.reduce(
                (sum, a) => sum + Math.round(((a.correctCount || 0) / 50) * 100),
                0
              ) / subjectAttempts.length
            );

      return { subject, avgScore, attempts: subjectAttempts.length };
    });

    return subjectsWithStats.sort((a, b) => a.avgScore - b.avgScore)[0];
  };

  const weakestSubject = getWeakestSubject();

  const getBestSubject = () => {
    if (subjects.length === 0) return null;

    const subjectsWithStats = subjects.map((subject) => {
      const subjectAttempts = completedAttempts.filter((a) => {
        const attemptSubjectId = typeof a.subject === "string" ? a.subject : a.subject?._id;
        return attemptSubjectId === subject._id;
      });

      const avgScore =
        subjectAttempts.length === 0
          ? 0
          : Math.round(subjectAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / subjectAttempts.length);

      return { subject, avgScore, attempts: subjectAttempts.length };
    });

    return subjectsWithStats.sort((a, b) => b.avgScore - a.avgScore)[0];
  };

  const bestSubject = getBestSubject();

  const getScoreTrend = () => {
    return sortedAttempts.slice(0, 7).reverse().map((attempt, idx) => ({
      day: idx + 1,
      score: Math.round((attempt.correctCount / 50) * 100),
    }));
  };

  const scoreTrend = getScoreTrend();

  return (
    <div
      className="min-h-screen bg-cover bg-center"
      style={{
        fontFamily: "var(--font-body)",
        backgroundColor: "#0a0a16",
        backgroundAttachment: "fixed",
      }}
    >
      {/* ANIMATED BACKGROUND */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#0a0a16] via-[#1a0a2e] to-[#0f0a1a]" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{ duration: 8, repeat: Infinity, delay: 1 }}
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"
        />
      </div>

      {/* Floating particles */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        {[...Array(10)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 100 }}
            animate={{
              opacity: [0, 0.6, 0],
              y: [100, -100],
              x: Math.random() * (typeof window !== "undefined" ? window.innerWidth : 1000),
            }}
            transition={{
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 bg-cyan-400 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
          />
        ))}
      </div>


      {/* MAIN CONTENT */}
      <div className="max-w-[1600px] mx-auto px-8 py-12 space-y-12 pt-8">
        {/* 3-COLUMN MAIN GRID (aligned + equal heights) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:items-stretch lg:auto-rows-fr">
          {/* LEFT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.01, y: -3 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => {
              mouseX.set(0);
              mouseY.set(0);
            }}
            className="relative overflow-hidden h-full"
          >
            {/* Floating sparkles */}
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{
                    opacity: [0, 1, 0],
                    y: [0, -80],
                    x: (Math.random() - 0.5) * 60,
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.5,
                  }}
                  style={{
                    position: "absolute",
                    left: `${25 + i * 20}%`,
                    top: "50%",
                  }}
                >
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                </motion.div>
              ))}
            </div>

            <div className="relative bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md hover:bg-white/8 hover:border-cyan-400/20 transition-all group h-full flex flex-col">
              <motion.div style={{ x: mouseX, y: mouseY }} className="relative z-10 flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-8">
                  <h3
                    className="text-lg font-bold text-white uppercase tracking-tight"
                    style={{ fontFamily: "var(--font-header)" }}
                  >
                    Your Progress
                  </h3>
                </div>

                {/* CIRCULAR PROGRESS GRID */}
                <div className="grid grid-cols-2 gap-6 mb-8">
                  {/* Skill */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
                    onHoverStart={() => setHoveredCard("skill")}
                    onHoverEnd={() => setHoveredCard(null)}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center gap-3 cursor-pointer"
                  >
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <defs>
                          <filter id="skillGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx="60" cy="60" r="54" stroke="rgba(6,182,212,0.2)" strokeWidth="3" fill="none" />
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="54"
                          stroke="#06B6D4"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${339 * (accuracy / 100)} 339`}
                          strokeLinecap="round"
                          filter="url(#skillGlow)"
                          className="drop-shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                          initial={{ strokeDasharray: "0 339" }}
                          animate={{ strokeDasharray: `${339 * (accuracy / 100)} 339` }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.p
                          animate={hoveredCard === "skill" ? { scale: [1, 1.2, 1] } : {}}
                          className="text-3xl font-bold text-cyan-400 font-mono tracking-tighter"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {accuracy || 0}%
                        </motion.p>
                        <p className="text-xs text-slate-400 text-center">Accuracy</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center font-mono uppercase tracking-wider">Skill Rating</p>
                  </motion.div>

                  {/* Streak */}
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, 5, -5, 0] }}
                    onHoverStart={() => setHoveredCard("streak")}
                    onHoverEnd={() => setHoveredCard(null)}
                    transition={{ type: "spring", stiffness: 300 }}
                    className="flex flex-col items-center gap-3 cursor-pointer"
                  >
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                        <defs>
                          <filter id="streakGlow">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                              <feMergeNode in="coloredBlur" />
                              <feMergeNode in="SourceGraphic" />
                            </feMerge>
                          </filter>
                        </defs>
                        <circle cx="60" cy="60" r="54" stroke="rgba(251,147,60,0.2)" strokeWidth="3" fill="none" />
                        <motion.circle
                          cx="60"
                          cy="60"
                          r="54"
                          stroke="#FB923C"
                          strokeWidth="4"
                          fill="none"
                          strokeDasharray={`${339 * (Math.min(streakDays, 100) / 100)} 339`}
                          strokeLinecap="round"
                          filter="url(#streakGlow)"
                          className="drop-shadow-[0_0_15px_rgba(251,147,60,0.8)]"
                          initial={{ strokeDasharray: "0 339" }}
                          animate={{ strokeDasharray: `${339 * (Math.min(streakDays, 100) / 100)} 339` }}
                          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <motion.p
                          animate={hoveredCard === "streak" ? { scale: [1, 1.2, 1] } : {}}
                          className="text-3xl font-bold text-orange-400 font-mono tracking-tighter"
                          style={{ fontFamily: "var(--font-mono)" }}
                        >
                          {streakDays}
                        </motion.p>
                        <p className="text-xs text-slate-400">days</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 text-center font-mono uppercase tracking-wider">Streak</p>
                  </motion.div>
                </div>

                {/* TOTALS */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <motion.div
                    whileHover={{ scale: 1.08, boxShadow: "0 0 25px rgba(168,85,247,0.5)", rotate: [0, -2, 2, 0] }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg backdrop-blur-sm hover:border-purple-400/60 hover:bg-purple-500/20 transition-all cursor-pointer relative overflow-hidden"
                  >
                    <motion.p
                      whileHover={{ scale: 1.1 }}
                      className="text-2xl font-bold text-purple-400 font-mono tracking-tighter relative z-10"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {totalQuestions}
                    </motion.p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase flex items-center gap-1 relative z-10">
                      Questions
                      <Star className="w-3 h-3 text-purple-400" />
                    </p>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.08, boxShadow: "0 0 25px rgba(6,182,212,0.5)", rotate: [0, 2, -2, 0] }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all cursor-pointer"
                  >
                    <motion.p
                      whileHover={{ scale: 1.1 }}
                      className="text-2xl font-bold text-cyan-400 font-mono tracking-tighter relative z-10"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {totalAttempts}
                    </motion.p>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase flex items-center gap-1 relative z-10">
                      Attempts
                      <Zap className="w-3 h-3 text-cyan-400" />
                    </p>
                  </motion.div>
                </div>

                {/* KEY STATS */}
                <div className="mt-auto">
                  <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-widest font-mono flex items-center gap-2">
                    Key Stats
                    <motion.span animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                    </motion.span>
                  </h4>

                  <div className="space-y-3">
                    {[
                      {
                        label: "High Score",
                        value: `${completedAttempts.length > 0 ? Math.round(Math.max(...completedAttempts.map((a) => a.score))) : 0}%`,
                        color: "purple",
                        icon: Trophy,
                      },
                      { label: "Longest Streak", value: `${longestStreak} days`, color: "orange", icon: Flame },
                      { label: "Avg Time / Test", value: avgTime, color: "blue", icon: Brain },
                      bestSubject && {
                        label: "Best Subject",
                        value: bestSubject.subject.name,
                        color: "green",
                        icon: Star,
                        isText: true,
                      },
                    ]
                      .filter(Boolean)
                      .map((stat, i) => (
                        <motion.div
                          key={i}
                          whileHover={{
                            scale: 1.05,
                            x: 5,
                            boxShadow: `0 0 20px rgba(${
                              stat.color === "purple"
                                ? "168,85,247"
                                : stat.color === "orange"
                                  ? "251,146,60"
                                  : stat.color === "blue"
                                    ? "59,130,246"
                                    : "34,197,94"
                            },0.4)`,
                          }}
                          transition={{ type: "spring", stiffness: 300, damping: 18 }}
                          className={`p-3 bg-gradient-to-br from-${stat.color}-500/15 to-transparent rounded-lg border border-${stat.color}-400/20 hover:border-${stat.color}-400/60 hover:bg-${stat.color}-500/20 backdrop-blur-sm transition-colors cursor-pointer`}
                        >
                          <p className="text-[10px] text-slate-400 font-mono uppercase mb-1 flex items-center gap-1">
                            {stat.label}
                            <stat.icon className={`w-3 h-3 text-${stat.color}-400`} />
                          </p>
                          <p
                            className={`${stat.isText ? "text-sm" : "text-2xl"} font-bold text-${stat.color}-400 tracking-tighter font-mono`}
                          >
                            {stat.value}
                          </p>
                        </motion.div>
                      ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* MIDDLE COLUMN */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="flex flex-col gap-6"
          >
            {/* PERFORMANCE TREND */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ scale: 1.01, y: -3 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:border-cyan-400/20 transition-all shrink-0"
            >
              <div className="flex items-center justify-between mb-5">
                <h5 className="text-base font-bold text-white uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>
                  Performance Trend
                </h5>
                <motion.div animate={{ y: [0, -3, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                  <TrendingUp className="w-5 h-5 text-cyan-400" />
                </motion.div>
              </div>

              {scoreTrend.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Activity className="w-10 h-10 text-slate-600" />
                  </motion.div>
                  <p className="text-sm">No score data yet</p>
                </div>
              ) : (
                <>
                  <div className="relative h-28 mt-1 overflow-hidden rounded-lg">
                    <svg className="w-full h-full" viewBox="0 0 500 120" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="trendGradient2" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.35" />
                          <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05" />
                        </linearGradient>
                        <filter id="trendGlow2">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                          <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                          </feMerge>
                        </filter>
                        <clipPath id="trendClip2">
                          <rect x="0" y="0" width="500" height="120" />
                        </clipPath>
                      </defs>

                      {/* Grid lines at 0%, 25%, 50%, 75%, 100% score */}
                      {[0, 25, 50, 75, 100].map((score) => (
                        <line
                          key={score}
                          x1="0"
                          y1={(6 + (108 * (100 - score)) / 100).toString()}
                          x2="500"
                          y2={(6 + (108 * (100 - score)) / 100).toString()}
                          stroke="rgba(255,255,255,0.06)"
                          strokeWidth="1"
                        />
                      ))}

                      <motion.path
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        clipPath="url(#trendClip2)"
                        d={`M 0 ${6 + (108 * (100 - Math.min(scoreTrend[0]?.score || 0, 100))) / 100} ${scoreTrend
                          .map(
                            (p, idx) =>
                              `L ${(idx / Math.max(scoreTrend.length - 1, 1)) * 500} ${6 + (108 * (100 - Math.min(p.score, 100))) / 100}`
                          )
                          .join(" ")} L 500 120 L 0 120 Z`}
                        fill="url(#trendGradient2)"
                      />

                      <motion.path
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.3, ease: "easeOut" }}
                        clipPath="url(#trendClip2)"
                        d={`M 0 ${6 + (108 * (100 - Math.min(scoreTrend[0]?.score || 0, 100))) / 100} ${scoreTrend
                          .map(
                            (p, idx) =>
                              `L ${(idx / Math.max(scoreTrend.length - 1, 1)) * 500} ${6 + (108 * (100 - Math.min(p.score, 100))) / 100}`
                          )
                          .join(" ")}`}
                        stroke="#06B6D4"
                        strokeWidth="3"
                        fill="none"
                        filter="url(#trendGlow2)"
                        className="drop-shadow-[0_0_10px_rgba(6,182,212,0.7)]"
                      />

                      {scoreTrend.map((point, idx) => (
                        <motion.circle
                          key={idx}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: idx * 0.08, type: "spring" }}
                          cx={(idx / Math.max(scoreTrend.length - 1, 1)) * 500}
                          cy={6 + (108 * (100 - Math.min(point.score, 100))) / 100}
                          r="3.25"
                          fill="#06B6D4"
                          className="drop-shadow-[0_0_8px_rgba(6,182,212,0.7)]"
                        />
                      ))}
                    </svg>
                  </div>

                  <div className="flex justify-between text-[9px] font-mono text-slate-600 mt-1 px-0.5">
                    <span>Oldest</span>
                    <span>Latest →</span>
                  </div>

                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {[
                      { label: "Latest", value: scoreTrend[scoreTrend.length - 1]?.score || 0, color: "cyan" },
                      {
                        label: "Average",
                        value: Math.round(scoreTrend.reduce((s, p) => s + p.score, 0) / (scoreTrend.length || 1)),
                        color: "purple",
                      },
                      { label: "Best", value: Math.max(...scoreTrend.map((p) => p.score), 0), color: "orange" },
                    ].map((stat, i) => (
                      <motion.div key={i} whileHover={{ scale: 1.08, y: -2 }} className="text-center cursor-pointer">
                        <p className="text-[10px] text-slate-400 font-mono uppercase mb-1">{stat.label}</p>
                        <p className={`text-lg font-bold text-${stat.color}-400 tracking-tighter`} style={{ fontFamily: "var(--font-mono)" }}>
                          {stat.value}%
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </motion.div>

            {/* RECOMMENDED NEXT STEP (hero-style, kept same as you provided) */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              whileHover={{
                y: -4,
                scale: 1.01,
                boxShadow: "0 0 40px rgba(251,146,60,0.4), 0 20px 40px rgba(0,0,0,0.4)",
              }}
              onMouseMove={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.setProperty("--mouse-x", "50%");
                e.currentTarget.style.setProperty("--mouse-y", "50%");
              }}
              style={{ "--mouse-x": "50%", "--mouse-y": "50%", flex: 1 }}
              onClick={() => weakestSubject && navigate(`/dashboard/subject/${weakestSubject.subject._id}`)}
              className="group cursor-pointer relative overflow-hidden transition-all duration-300 flex flex-col"
            >
              <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                {[...Array(6)].map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      y: [0, -110],
                      x: (i % 2 === 0 ? 1 : -1) * (i * 13 + 10),
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: "easeOut",
                    }}
                    className="absolute w-1 h-1 bg-orange-400 rounded-full"
                    style={{
                      left: `${15 + i * 12}%`,
                      top: `${45 + ((i * 5) % 25)}%`,
                    }}
                  />
                ))}
              </div>

              <div className="absolute inset-0 bg-gradient-to-br from-orange-900/30 to-slate-900/60 rounded-3xl border border-orange-400/20 backdrop-blur-xl" />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-400/15 via-transparent to-amber-400/10 rounded-3xl" />
              </div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(251,146,60,0.2),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-orange-400/30 via-transparent to-amber-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -inset-1" />

              <div className="relative p-6 rounded-3xl border border-orange-400/30 group-hover:border-orange-400/60 transition-all bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md flex-1 flex flex-col">
                <div className="flex flex-col gap-4 flex-1 justify-between">
                  <div>
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-orange-500/10 border border-orange-400/30 cursor-pointer mb-4"
                    >
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                        <Brain className="w-4 h-4 text-orange-400" />
                      </motion.div>
                      <span className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400 font-mono">
                        Recommended Focus
                      </span>
                    </motion.div>

                    <motion.h1
                      whileHover={{ scale: 1.02 }}
                      className="text-3xl font-black text-white tracking-tighter leading-tight uppercase cursor-default"
                      style={{ fontFamily: "var(--font-header)" }}
                    >
                      {weakestSubject ? weakestSubject.subject.name : "Keep Practicing"}{" "}
                      <motion.span
                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                        transition={{ duration: 5, repeat: Infinity }}
                        className="bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(251,146,60,0.5)] block"
                        style={{ backgroundSize: "200% 200%" }}
                      >
                        {weakestSubject ? "needs work" : ""}
                      </motion.span>
                    </motion.h1>

                    <p className="text-sm text-slate-400 leading-relaxed mt-3" style={{ fontFamily: "var(--font-body)" }}>
                      {weakestSubject
                        ? `Your accuracy is at ${weakestSubject.avgScore}%. Boost it to unlock the next level!`
                        : "Start solving problems to get personalised recommendations"}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Accuracy", value: weakestSubject ? `${weakestSubject.avgScore}%` : "—", icon: Target },
                      { label: "Attempts", value: weakestSubject ? weakestSubject.attempts : "—", icon: Zap },
                      { label: "Goal", value: "80%", icon: Rocket },
                    ].map((stat, i) => (
                      <motion.div
                        key={i}
                        whileHover={{ scale: 1.1, y: -5, rotate: [0, -2, 2, 0] }}
                        className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-orange-400/50 transition-all group/stat cursor-pointer text-center"
                      >
                        <stat.icon className="w-4 h-4 text-orange-400 mx-auto mb-2 group-hover/stat:scale-110 transition-transform" />
                        <p className="text-xs font-bold text-white font-mono">{stat.value}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{stat.label}</p>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} className="p-5 rounded-2xl bg-black/40 border border-orange-400/20 backdrop-blur-sm cursor-pointer">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest flex items-center gap-1">
                        Skill Gap
                      </p>
                      <motion.div animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                        <Brain className="w-4 h-4 text-orange-400" />
                      </motion.div>
                    </div>

                    <div className="space-y-2">
                      {[
                        { label: "Current", pct: weakestSubject ? Math.min(weakestSubject.avgScore, 100) : 0, color: "#fb923c" },
                        { label: "Target", pct: 80, color: "#fbbf24" },
                      ].map((bar, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <p className="text-[9px] font-mono text-slate-500 w-16 uppercase tracking-wider shrink-0">{bar.label}</p>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${bar.pct}%` }}
                              transition={{ duration: 1.3, ease: "easeOut", delay: i * 0.15 }}
                              className="h-full rounded-full"
                              style={{ background: bar.color, boxShadow: `0 0 8px ${bar.color}80` }}
                            />
                          </div>
                          <p className="text-[9px] font-mono w-8 text-right" style={{ color: bar.color }}>
                            {bar.pct}%
                          </p>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(251,146,60,0.7)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (weakestSubject) navigate(`/dashboard/subject/${weakestSubject.subject._id}`);
                    }}
                    className="w-full px-6 py-3 bg-gradient-to-r from-orange-400 to-amber-400 text-slate-900 font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,146,60,0.5)] hover:shadow-[0_0_30px_rgba(251,146,60,0.7)] transition-all border border-orange-400/50 font-mono uppercase tracking-widest"
                  >
                    <span>{weakestSubject ? "Start Practice" : "Explore Subjects"}</span>
                    <motion.div animate={{ x: [0, 5, 0] }} transition={{ duration: 1, repeat: Infinity }}>
                      <Rocket className="w-4 h-4" />
                    </motion.div>
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            whileHover={{ scale: 1.01, y: -3 }}
            className="h-full bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/8 hover:border-purple-400/20 transition-all flex flex-col relative overflow-hidden"
          >
            {/* Floating hearts */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: [0, 0.6, 0], y: [50, -50] }}
                  transition={{ duration: 3, repeat: Infinity, delay: i * 1 }}
                  style={{ position: "absolute", left: `${20 + i * 30}%`, bottom: 0 }}
                >
                  <Heart className="w-3 h-3 text-pink-400 fill-pink-400/30" />
                </motion.div>
              ))}
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              {/* IDENTITY */}
              <div className="text-center mb-6 pb-6 border-b border-white/10">
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-20 h-20 rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-purple-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] mx-auto mb-4 cursor-pointer"
                >
                  <Trophy className="w-10 h-10 text-cyan-400" />
                </motion.div>

                <motion.h4 whileHover={{ scale: 1.05 }} className="font-bold text-white text-lg font-mono">
                  {user?.username || "User"}
                </motion.h4>

                <p className="text-xs text-slate-400 mt-1 font-mono flex items-center justify-center gap-1">
                  Level {userLevel}
                  <motion.span animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }}>
                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  </motion.span>
                </p>

                {/* XP BAR */}
                <div className="mt-4 px-1">
                  <div className="flex items-center justify-between mb-2">
                    <motion.span
                      whileHover={{ scale: 1.1 }}
                      className="text-[11px] font-black font-mono text-yellow-400 tracking-wider cursor-default"
                    >
                      {totalXP} XP
                    </motion.span>
                    <span className="text-[10px] font-mono text-slate-500">
                      {userLevel < 100 ? `${xpToNextLevel} to Lv ${userLevel + 1}` : "✦ MAX"}
                    </span>
                  </div>
                  {/* Track */}
                  <div className="relative h-3 bg-white/5 rounded-full overflow-hidden border border-white/10 shadow-inner">
                    {/* Animated shimmer background */}
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      style={{ background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 50%, transparent 100%)" }}
                      animate={{ x: ["-100%", "100%"] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    {/* Fill */}
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpProgress}%` }}
                      transition={{ duration: 1.8, ease: [0.34, 1.56, 0.64, 1] }}
                      className="relative h-full rounded-full bg-gradient-to-r from-yellow-400 via-orange-400 to-pink-400"
                      style={{ boxShadow: "0 0 12px rgba(251,191,36,0.8), 0 0 4px rgba(251,191,36,1)" }}
                    >
                      {/* Glowing tip */}
                      <motion.div
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.9)]"
                      />
                    </motion.div>
                  </div>
                  {/* Tick marks for level milestones */}
                  <div className="flex justify-between mt-1 px-0.5">
                    {[0,25,50,75,100].map((v) => (
                      <div key={v} className={`w-px h-1.5 rounded-full ${xpProgress >= v ? "bg-yellow-400/60" : "bg-white/10"}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* RECENT ACTIVITY */}
              <div className="flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-widest" style={{ fontFamily: "var(--font-header)" }}>
                    Recent Activity
                  </h5>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }}>
                    <Activity className="w-4 h-4 text-cyan-400" />
                  </motion.div>
                </div>

                <div className="space-y-2">
                  {recentAttempts.length === 0 ? (
                    <div className="text-center py-8">
                      <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                        <Sparkles className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                      </motion.div>
                      <p className="text-xs text-slate-500">No activity yet</p>
                    </div>
                  ) : (
                    recentAttempts.map((attempt, idx) => {
                      const subjectName =
                        typeof attempt.subject === "string" ? "Subject" : attempt.subject?.name || "Subject";
                      const minutesAgo = Math.floor((new Date() - new Date(attempt.createdAt)) / 60000);
                      const timeStr =
                        minutesAgo < 1 ? "now" : minutesAgo < 60 ? `${minutesAgo}m` : `${Math.floor(minutesAgo / 60)}h`;
                      const correctCount = attempt.correctCount || 0;
                      const attemptAccuracy = Math.round((correctCount / 50) * 100);
                      const scoreColor =
                        attempt.score >= 40 ? "text-green-400" : attempt.score >= 30 ? "text-yellow-400" : "text-red-400";
                      return (
                        <motion.div
                          key={attempt._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          whileHover={{ scale: 1.03, x: 5, boxShadow: "0 0 15px rgba(6,182,212,0.2)" }}
                          onClick={() => navigate(`/attempt/${attempt._id}`)}
                          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:bg-white/8 transition-all cursor-pointer"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-[11px] text-slate-200 font-mono font-bold leading-tight truncate">{subjectName}</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{timeStr} ago</p>
                            </div>
                            <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
                              <p className="text-[9px] text-slate-400 font-mono">Accuracy</p>
                              <motion.p whileHover={{ scale: 1.2 }} className={`text-sm font-bold font-mono ${scoreColor}`}>
                                {attemptAccuracy}%
                              </motion.p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                            <span className="text-slate-500">{correctCount}/50</span>
                            <span className="text-[9px] text-cyan-400 font-mono uppercase tracking-wider">Review →</span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===================== */}
        {/* CORE SUBJECTS GRID (unchanged) */}
        {/* ===================== */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>
            Core Subjects
          </h3>
          {subjects.length === 0 ? (
            <div className="flex items-center justify-center h-40 rounded-2xl border border-white/10 bg-white/5 text-slate-500 backdrop-blur-md">
              No subjects available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject, idx) => (
                <motion.div key={subject._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <SubjectCard subject={subject} />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

       


        {/* ===================== */}
        {/* DSA + BEHAVIORAL HEROS */}
        {/* ===================== */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* DSA HERO CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            whileHover={{
              y: -12,
              scale: 1.02,
              borderColor: "rgba(6, 182, 212, 0.6)",
              boxShadow: "0 0 40px rgba(6, 182, 212, 0.4), 0 20px 40px rgba(0,0,0,0.4)",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty("--mouse-x", "50%");
              e.currentTarget.style.setProperty("--mouse-y", "50%");
            }}
            style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
            onClick={() => navigate("/dsa")}
            className="group cursor-pointer relative overflow-hidden transition-all duration-300"
          >
            {/* Floating particles on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -120],
                    x: Math.random() * 80 - 40,
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute w-1 h-1 bg-cyan-400 rounded-full"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${40 + Math.random() * 30}%`,
                  }}
                />
              ))}
            </div>

            {/* GLASS BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/30 to-slate-900/60 rounded-3xl border border-cyan-400/20 backdrop-blur-xl" />
            
            {/* HOVER GLOW */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/15 via-transparent to-blue-400/10 rounded-3xl" />
            </div>

            {/* SPOTLIGHT */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.2),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

            {/* CYAN BORDER GLOW */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/30 via-transparent to-blue-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -inset-1" />

            {/* CONTENT */}
            <div className="relative p-10 rounded-3xl border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md">
              <div className="space-y-6">
                {/* TOP: BADGE + ICON + TITLE */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-400/30 cursor-pointer mb-5"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Code2 className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-400 font-mono">
                      Coding Arena
                    </span>
                  </motion.div>

                  <motion.h1
                    whileHover={{ scale: 1.02 }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase cursor-default"
                    style={{ fontFamily: "var(--font-header)" }}
                  >
                    DSA <br />
                    <motion.span
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      Master
                    </motion.span>
                  </motion.h1>

                  <p className="text-lg text-slate-400 leading-relaxed max-w-md mt-4" style={{ fontFamily: "var(--font-body)" }}>
                    Elite training ground for algorithms. Level up your coding skills
                  </p>
                </div>

                {/* STATS CARDS - Compact */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Problems", value: "500+", icon: Code2 },
                    { label: "Topics", value: "20+", icon: Layers },
                    { label: "Active", value: "24/7", icon: Zap },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, y: -5, rotate: [0, -2, 2, 0] }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-cyan-400/50 transition-all group/stat cursor-pointer text-center"
                    >
                      <stat.icon className="w-5 h-5 text-cyan-400 mx-auto mb-2 group-hover/stat:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-white font-mono">{stat.value}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CODE SNIPPET */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-2xl bg-black/40 border border-cyan-400/20 backdrop-blur-sm font-mono text-sm cursor-pointer group/code"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" />
                    <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" />
                    <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-green-500 cursor-pointer" />
                    
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto"
                    >
                      <Code2 className="w-4 h-4 text-cyan-400" />
                    </motion.div>
                  </div>
                  
                  <div className="space-y-1 text-slate-400 text-xs">
                    <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                      <span className="text-purple-400">const</span> <span className="text-cyan-400">skill</span> = <span className="text-green-400">await</span> <span className="text-blue-400">practice</span>();
                    </motion.p>
                    <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                      <span className="text-purple-400">if</span> (skill.<span className="text-yellow-400">level</span> <span className="text-pink-400">{'>'}</span> <span className="text-green-400">100</span>) &#123;
                    </motion.p>
                    <motion.p whileHover={{ x: 10, color: "#22d3ee" }} transition={{ duration: 0.2 }} className="pl-3">
                      success.<span className="text-orange-400">unlock</span>();
                    </motion.p>
                    <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                      &#125;
                    </motion.p>
                  </div>

                  {/* Typing cursor */}
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-3 bg-cyan-400 ml-1"
                  />
                </motion.div>     

                {/* START BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(6, 182, 212, 0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all border border-cyan-400/50 font-mono uppercase tracking-widest"
                >
                  <span>Launch Arena</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Zap className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {/* STAR INTERVIEW HERO CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{
              y: -12,
              scale: 1.02,
              boxShadow: "0 0 40px rgba(168, 85, 247, 0.4), 0 20px 40px rgba(0,0,0,0.4)",
            }}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              e.currentTarget.style.setProperty("--mouse-x", `${x}px`);
              e.currentTarget.style.setProperty("--mouse-y", `${y}px`);
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.setProperty("--mouse-x", "50%");
              e.currentTarget.style.setProperty("--mouse-y", "50%");
            }}
            style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
            onClick={() => navigate("/star-interview")}
            className="group cursor-pointer relative overflow-hidden transition-all duration-300"
          >
            {/* Floating particles on hover */}
            <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: [0, -120],
                    x: Math.random() * 80 - 40,
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    delay: i * 0.4,
                    ease: "easeOut"
                  }}
                  className="absolute w-1 h-1 bg-purple-400 rounded-full"
                  style={{
                    left: `${15 + i * 12}%`,
                    top: `${40 + Math.random() * 30}%`,
                  }}
                />
              ))}
            </div>

            {/* GLASS BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-slate-900/60 rounded-3xl backdrop-blur-xl" />
            
            {/* HOVER GLOW */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/15 via-transparent to-pink-400/10 rounded-3xl" />
            </div>

            {/* SPOTLIGHT */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(168,85,247,0.2),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

            {/* PURPLE BORDER GLOW */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-400/30 via-transparent to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -inset-1" />

            {/* CONTENT */}
            <div className="relative p-10 rounded-3xl border border-purple-400/30 group-hover:border-purple-400/60 transition-all bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md">
              <div className="space-y-6">
                {/* TOP: BADGE + ICON + TITLE */}
                <div>
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/30 cursor-pointer mb-5"
                  >
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                    >
                      <Award className="w-5 h-5 text-purple-400" />
                    </motion.div>
                    <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 font-mono">
                      Interview Prep
                    </span>
                  </motion.div>

                  <motion.h1
                    whileHover={{ scale: 1.02 }}
                    className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase cursor-default"
                    style={{ fontFamily: "var(--font-header)" }}
                  >
                    STAR <br />
                    <motion.span
                      animate={{
                        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                      }}
                      transition={{ duration: 5, repeat: Infinity }}
                      className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                      style={{ backgroundSize: "200% 200%" }}
                    >
                      Interview
                    </motion.span>
                  </motion.h1>

                  <p className="text-lg text-slate-400 leading-relaxed max-w-md mt-4" style={{ fontFamily: "var(--font-body)" }}>
                    Master behavioral questions. Perfect your storytelling
                  </p>
                </div>

                {/* STATS CARDS - Compact */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Questions", value: "150+", icon: BookOpen },
                    { label: "Topics", value: "15+", icon: Layers },
                    { label: "Ready", value: "100%", icon: Trophy },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ scale: 1.1, y: -5, rotate: [0, 2, -2, 0] }}
                      className="p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-400/50 transition-all group/stat cursor-pointer text-center"
                    >
                      <stat.icon className="w-5 h-5 text-purple-400 mx-auto mb-2 group-hover/stat:scale-110 transition-transform" />
                      <p className="text-xs font-bold text-white font-mono">{stat.value}</p>
                      <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">{stat.label}</p>
                    </motion.div>
                  ))}
                </div>

                {/* CODE SNIPPET */}
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  className="p-5 rounded-2xl bg-black/40 border border-purple-400/20 backdrop-blur-sm font-mono text-sm cursor-pointer group/code"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" />
                    <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" />
                    <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-green-500 cursor-pointer" />
                    
                    <motion.div
                      animate={{ opacity: [0, 1, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                      className="ml-auto"
                    >
                      <Award className="w-4 h-4 text-purple-400" />
                    </motion.div>
                  </div>
                  
                  <div className="space-y-1 text-slate-400 text-xs">
                    <motion.p whileHover={{ x: 5, color: "#c084fc" }} transition={{ duration: 0.2 }}>
                      <span className="text-purple-400">const</span> <span className="text-cyan-400">story</span> = <span className="text-green-400">await</span> <span className="text-blue-400">prepare</span>();
                    </motion.p>
                    <motion.p whileHover={{ x: 5, color: "#c084fc" }} transition={{ duration: 0.2 }}>
                      <span className="text-purple-400">if</span> (story.<span className="text-yellow-400">isCompelling</span>) &#123;
                    </motion.p>
                    <motion.p whileHover={{ x: 10, color: "#c084fc" }} transition={{ duration: 0.2 }} className="pl-3">
                      interview.<span className="text-pink-400">ace</span>();
                    </motion.p>
                    <motion.p whileHover={{ x: 5, color: "#c084fc" }} transition={{ duration: 0.2 }}>
                      &#125;
                    </motion.p>
                  </div>

                  {/* Typing cursor */}
                  <motion.div
                    animate={{ opacity: [1, 0] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="inline-block w-1.5 h-3 bg-purple-400 ml-1"
                  />
                </motion.div>

                {/* START BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 30px rgba(168, 85, 247, 0.7)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-400 text-slate-900 font-bold rounded-full text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all border border-purple-400/50 font-mono uppercase tracking-widest"
                >
                  <span>Launch Practice</span>
                  <motion.div
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4" />
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;