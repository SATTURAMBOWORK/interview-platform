import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  TrendingUp,
  BookOpen,
  Code2,
  Award,
  Zap,
  Calendar,
  Trophy,
  Layers,
  Clock,
  Flame,
  Activity,
  Sparkles,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import api from "../../api/axios";
import SubjectCard from "../../components/user/SubjectCard";
import { AuthContext } from "../../context/AuthContextValue";

const clampPercent = (value) => Math.min(Math.max(value, 0), 100);
const formatDateKey = (date) => date.toISOString().slice(0, 10);

function UserDashboard() {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const [subjects, setSubjects] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [subjectsRes, attemptsRes, userRes] = await Promise.all([
          api.get("/subjects"),
          api.get("/attempts/my"),
          api.get("/users/profile"),
        ]);

        setSubjects(subjectsRes.data);
        setAttempts(attemptsRes.data);
        setUser(userRes.data.user);
      } catch (error) {
        console.error("Dashboard load error", error);
        // Fallback: try to get username from localStorage
        const token = localStorage.getItem("token");
        if (token) {
          try {
            const decoded = JSON.parse(atob(token.split('.')[1]));
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
  const totalAttempts = attempts.length;

  const totalQuestions = attempts.reduce(
    (sum, a) => sum + (a.totalQuestions || 0),
    0
  );

  const averageScore =
    totalAttempts === 0
      ? 0
      : Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) /
            totalAttempts
        );

  const accuracy =
    totalAttempts === 0
      ? 0
      : Math.round(
          (attempts.reduce(
            (sum, a) => sum + a.correctCount,
            0
          ) /
            (totalAttempts * 50)) *
            100
        );

  const sortedAttempts = [...attempts].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const last3 = sortedAttempts.slice(0, 3);
  const prev3 = sortedAttempts.slice(3, 6);
  const last3Avg =
    last3.length === 0
      ? 0
      : Math.round(last3.reduce((s, a) => s + a.score, 0) / last3.length);
  const prev3Avg =
    prev3.length === 0
      ? 0
      : Math.round(prev3.reduce((s, a) => s + a.score, 0) / prev3.length);

  const attemptsByDate = attempts.reduce((acc, attempt) => {
    if (!attempt.createdAt) return acc;
    const key = formatDateKey(new Date(attempt.createdAt));
    acc[key] = (acc[key] || 0) + (attempt.totalQuestions || 0);
    return acc;
  }, {});

  const streakDays = (() => {
    if (Object.keys(attemptsByDate).length === 0) return 0;
    let count = 0;
    for (let i = 0; i < 365; i += 1) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const key = formatDateKey(date);
      if (attemptsByDate[key] && attemptsByDate[key] > 0) {
        count += 1;
      } else {
        break;
      }
    }
    return count;
  })();

  const recentAttempts = sortedAttempts.slice(0, 4);

  /* ===================== */
  /* PERFORMANCE ANALYTICS */
  /* ===================== */
  const getWeakestSubject = () => {
    if (subjects.length === 0) return null;
    const subjectsWithStats = subjects.map(subject => {
      const subjectAttempts = attempts.filter((a) => {
        const attemptSubjectId = typeof a.subject === "string" ? a.subject : a.subject?._id;
        return attemptSubjectId === subject._id;
      });
      const avgScore = subjectAttempts.length === 0 ? 0 : Math.round(
        subjectAttempts.reduce((sum, a) => sum + Math.round((a.correctCount / 50) * 100), 0) / subjectAttempts.length
      );
      return { subject, avgScore, attempts: subjectAttempts.length };
    });
    return subjectsWithStats.sort((a, b) => a.avgScore - b.avgScore)[0];
  };

  const weakestSubject = getWeakestSubject();

  const getBestSubject = () => {
    if (subjects.length === 0) return null;
    const subjectsWithStats = subjects.map(subject => {
      const subjectAttempts = attempts.filter((a) => {
        const attemptSubjectId = typeof a.subject === "string" ? a.subject : a.subject?._id;
        return attemptSubjectId === subject._id;
      });
      const avgScore = subjectAttempts.length === 0 ? 0 : Math.round(
        subjectAttempts.reduce((sum, a) => sum + a.score, 0) / subjectAttempts.length
      );
      return { subject, avgScore, attempts: subjectAttempts.length };
    });
    return subjectsWithStats.sort((a, b) => b.avgScore - a.avgScore)[0];
  };

  const bestSubject = getBestSubject();

  const getScoreTrend = () => {
    return sortedAttempts.slice(0, 7).reverse().map((attempt, idx) => ({
      day: idx + 1,
      score: attempt.score
    }));
  };

  const scoreTrend = getScoreTrend();

  /* ===================== */
  /* SUBJECT LEVEL METRICS */
  /* ===================== */
  const getSubjectStats = (subjectId) => {
    const subjectAttempts = attempts.filter((a) => {
      const attemptSubjectId =
        typeof a.subject === "string"
          ? a.subject
          : a.subject?._id;

      return attemptSubjectId === subjectId;
    });

    const attemptsCount = subjectAttempts.length;

    const bestScore =
      attemptsCount === 0
        ? 0
        : Math.max(...subjectAttempts.map((a) => a.score));

    const avgScore =
      attemptsCount === 0
        ? 0
        : Math.round(
            subjectAttempts.reduce(
              (sum, a) => sum + a.score,
              0
            ) / attemptsCount
          );

    return {
      attemptsCount,
      bestScore,
      avgScore,
    };
  };

  const subjectStats = subjects.map((subject) => {
    const stats = getSubjectStats(subject._id);
    return { subject, ...stats };
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100, damping: 15 },
    },
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center" 
      style={{ 
        fontFamily: "var(--font-body)",
        backgroundColor: "#0a0a16",
        backgroundAttachment: "fixed",
      }}
    >
      {/* FALLBACK GRADIENT - Shows if image doesn't load */}
      <div className="fixed inset-0 -z-20 bg-gradient-to-br from-[#0a0a16] via-[#1a0a2e] to-[#0f0a1a]"></div>
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      {/* HEADER - HUD */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a16]/60 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.1)]">
        <div className="max-w-[1600px] mx-auto px-6">
          <div className="h-20 flex items-center justify-between gap-6">
            {/* LOGO + SYSTEM LIVE */}
            <div className="flex items-center gap-4 min-w-0">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-3 group"
              >
                <div className="w-10 h-10 rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/10 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_28px_rgba(6,182,212,0.5)] transition-all">
                  <Layers className="w-5 h-5 text-cyan-300" />
                </div>
                <div className="leading-tight text-left hidden sm:block">
                  <p className="text-[10px] text-cyan-300 font-mono uppercase tracking-[0.35em]">Interview</p>
                  <p
                    className="text-base text-white font-bold uppercase tracking-widest"
                    style={{ fontFamily: "var(--font-header)" }}
                  >
                    Prep
                  </p>
                </div>
              </button>

              {/* STATUS INDICATOR */}
              <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-[11px] text-slate-300 font-mono whitespace-nowrap">
                <span className="relative flex h-2 w-2">
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                </span>
                <span className="text-slate-300">Active</span>
              </div>
            </div>

            {/* CENTER NAV (DESKTOP) */}
            <nav className="hidden lg:flex items-center gap-1 text-[11px] font-mono uppercase tracking-widest">
              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Layers className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => navigate("/dsa")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Code2 className="w-3.5 h-3.5" />
                Arena
              </button>
              <button
                type="button"
                onClick={() => navigate("/star-interview")}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-all"
              >
                <Award className="w-3.5 h-3.5" />
                Behavioral
              </button>
              <button
                type="button"
                className="flex items-center gap-2 px-4 py-2 rounded-full text-slate-500 cursor-not-allowed"
                disabled
                title="Coming soon"
              >
                <Trophy className="w-3.5 h-3.5" />
                Leaderboards
              </button>
            </nav>

            {/* STATS + PROFILE + LOGOUT + HAMBURGER */}
            <div className="flex items-center gap-3 md:gap-4">
              {/* STATS (HIDDEN ON MOBILE) */}
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-400/20 bg-orange-500/10">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-200 font-mono">{streakDays} day</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-xs text-cyan-200 font-mono">
                  Lv {Math.floor(totalAttempts / 5) + 1}
                </div>
              </div>

              {/* PROFILE + LOGOUT (HIDDEN ON MOBILE) */}
              <div className="hidden lg:flex items-center gap-2">
                <div className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-white/10 bg-white/5">
                  <div className="w-9 h-9 rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-cyan-300" style={{ fontFamily: "var(--font-mono)" }}>
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex flex-col items-start leading-tight">
                    <span className="text-sm text-white font-semibold" style={{ fontFamily: "var(--font-header)" }}>
                      {user?.username || "User"}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Level {Math.floor(totalAttempts / 5) + 1}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest">Logout</span>
                </button>
              </div>

              {/* MOBILE HAMBURGER */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-cyan-300" />
                ) : (
                  <Menu className="w-5 h-5 text-cyan-300" />
                )}
              </button>
            </div>
          </div>

          {/* MOBILE MENU */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden pb-6 space-y-3 border-t border-white/10 pt-6"
            >
              {/* MOBILE NAV */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/dashboard");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all font-mono text-sm uppercase tracking-wider"
                >
                  <Layers className="w-4 h-4" />
                  Dashboard
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/dsa");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all font-mono text-sm uppercase tracking-wider"
                >
                  <Code2 className="w-4 h-4" />
                  Arena
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/star-interview");
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all font-mono text-sm uppercase tracking-wider"
                >
                  <Award className="w-4 h-4" />
                  Behavioral
                </button>
              </div>

              {/* MOBILE STATS */}
              <div className="flex items-center gap-3 px-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-400/20 bg-orange-500/10 flex-1 justify-center">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="text-xs text-slate-200 font-mono">{streakDays} day</span>
                </div>
                <div className="px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-xs text-cyan-200 font-mono flex-1 text-center">
                  Lv {Math.floor(totalAttempts / 5) + 1}
                </div>
              </div>

              {/* MOBILE PROFILE + LOGOUT */}
              <div className="px-4 space-y-3">
                <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 bg-white/5">
                  <div className="w-10 h-10 rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/10 flex items-center justify-center">
                    <span className="text-sm font-bold text-cyan-300" style={{ fontFamily: "var(--font-mono)" }}>
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-white font-semibold" style={{ fontFamily: "var(--font-header)" }}>
                      {user?.username || "User"}
                    </p>
                    <p className="text-[10px] text-slate-400 font-mono">Level {Math.floor(totalAttempts / 5) + 1}</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-100 hover:bg-cyan-500/20 transition-all font-mono text-sm uppercase tracking-widest"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="max-w-[1600px] mx-auto px-8 py-12 space-y-12 pt-8">{/* Added pt-8 for breathing room */}
        
        {/* ===================== */}
        {/* 3-COLUMN MAIN GRID */}
        {/* ===================== */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN: YOUR PROGRESS (3/12) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md hover:bg-white/8 transition-all group"
          >
            <h3 className="text-lg font-bold text-white mb-8 uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>Your Progress</h3>

            {/* CIRCULAR PROGRESS GRID */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              {/* Skill Rating */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <defs>
                      <filter id="skillGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="60" cy="60" r="54" stroke="rgba(6,182,212,0.2)" strokeWidth="3" fill="none" />
                    <circle
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
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-cyan-400 font-mono tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{accuracy || 0}%</p>
                    <p className="text-xs text-slate-400 text-center">Accuracy</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center font-mono uppercase tracking-wider">Skill Rating</p>
              </motion.div>

              {/* Streak */}
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="relative w-28 h-28">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                    <defs>
                      <filter id="streakGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <circle cx="60" cy="60" r="54" stroke="rgba(251,147,60,0.2)" strokeWidth="3" fill="none" />
                    <circle
                      cx="60"
                      cy="60"
                      r="54"
                      stroke="#FB923C"
                      strokeWidth="4"
                      fill="none"
                      strokeDasharray={`${339 * (streakDays / 100)} 339`}
                      strokeLinecap="round"
                      filter="url(#streakGlow)"
                      className="drop-shadow-[0_0_15px_rgba(251,147,60,0.8)]"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold text-orange-400 font-mono tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{streakDays}</p>
                    <p className="text-xs text-slate-400">days</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 text-center font-mono uppercase tracking-wider">Streak</p>
              </motion.div>
            </div>

            {/* TOTALS WITH NEON BORDER - DYNAMIC */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div
                whileHover={{ scale: 1.06, boxShadow: "0 0 20px rgba(168,85,247,0.35)" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="p-4 bg-purple-500/10 border border-purple-400/30 rounded-lg backdrop-blur-sm hover:border-purple-400/60 hover:bg-purple-500/20 transition-all cursor-default"
              >
                <p className="text-2xl font-bold text-purple-400 font-mono tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{totalQuestions}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">Questions</p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.06, boxShadow: "0 0 20px rgba(6,182,212,0.35)" }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                className="p-4 bg-cyan-500/10 border border-cyan-400/30 rounded-lg backdrop-blur-sm hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-all cursor-default"
              >
                <p className="text-2xl font-bold text-cyan-400 font-mono tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{totalAttempts}</p>
                <p className="text-[10px] text-slate-400 mt-1 font-mono uppercase">Attempts</p>
              </motion.div>
            </div>

            {/* KEY STATS - NOT SHOWN ELSEWHERE */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 mb-4 uppercase tracking-widest font-mono">Key Stats</h4>
              <div className="space-y-3">
                {/* High Score */}
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(168,85,247,0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="p-3 bg-gradient-to-br from-purple-500/15 to-transparent rounded-lg border border-purple-400/20 hover:border-purple-400/60 hover:bg-purple-500/20 backdrop-blur-sm transition-colors cursor-default"
                >
                  <p className="text-[10px] text-slate-400 font-mono uppercase mb-1">High Score</p>
                  <p className="text-2xl font-bold text-purple-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0}%</p>
                </motion.div>
                {/* Longest Streak */}
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(251,146,60,0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="p-3 bg-gradient-to-br from-orange-500/15 to-transparent rounded-lg border border-orange-400/20 hover:border-orange-400/60 hover:bg-orange-500/20 backdrop-blur-sm transition-colors cursor-default"
                >
                  <p className="text-[10px] text-slate-400 font-mono uppercase mb-1">Longest Streak</p>
                  <p className="text-2xl font-bold text-orange-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{streakDays} days</p>
                </motion.div>
                {/* Problems Solved */}
                <motion.div
                  whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(59,130,246,0.3)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="p-3 bg-gradient-to-br from-blue-500/15 to-transparent rounded-lg border border-blue-400/20 hover:border-blue-400/60 hover:bg-blue-500/20 backdrop-blur-sm transition-colors cursor-default"
                >
                  <p className="text-[10px] text-slate-400 font-mono uppercase mb-1">Questions Solved</p>
                  <p className="text-2xl font-bold text-blue-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{totalQuestions}</p>
                </motion.div>
                {/* Best Subject */}
                {bestSubject && (
                  <motion.div
                    whileHover={{ scale: 1.03, boxShadow: "0 0 18px rgba(34,197,94,0.3)" }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                    className="p-3 bg-gradient-to-br from-green-500/15 to-transparent rounded-lg border border-green-400/20 hover:border-green-400/60 hover:bg-green-500/20 backdrop-blur-sm transition-colors cursor-default"
                  >
                    <p className="text-[10px] text-slate-400 font-mono uppercase mb-1">Best Subject</p>
                    <p className="text-sm font-bold text-green-400 font-mono">{bestSubject.subject.name}</p>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* MIDDLE COLUMN: FOCUS ZONE & ANALYTICS (6/12) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-6 space-y-6"
          >
            {/* RECOMMENDED NEXT STEP */}
            <motion.div
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(6,182,212,0.2)" }}
              className="bg-gradient-to-br from-purple-900/40 to-cyan-900/40 border border-cyan-400/30 rounded-2xl p-8 backdrop-blur-sm"
            >
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest text-slate-400 font-mono mb-2">⚡ Recommended Focus</p>
                <h4 className="text-2xl font-bold text-white font-mono">
                  {weakestSubject ? `${weakestSubject.subject.name}` : "Keep Practicing"}
                </h4>
                <p className="text-sm text-slate-300 mt-2">
                  {weakestSubject 
                    ? `Your ${weakestSubject.subject.name} accuracy is at ${weakestSubject.avgScore}%. Time to level up!`
                    : "Start solving problems to get personalized recommendations"
                  }
                </p>
              </div>

              {weakestSubject && (
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(6,182,212,0.6)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate(`/dashboard/subject/${weakestSubject.subject._id}`)}
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-400 to-purple-500 text-slate-900 font-bold rounded-lg text-sm font-mono uppercase tracking-widest shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all"
                >
                  Start Practice
                </motion.button>
              )}
            </motion.div>

            {/* PERFORMANCE TREND */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md"
            >
              <h5 className="text-lg font-bold text-white mb-6 uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>Performance Trend</h5>
              
              {scoreTrend.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-slate-500">
                  <p>No score data yet</p>
                </div>
              ) : (
                <div className="h-64 relative">
                  <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="trendGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.4"/>
                        <stop offset="100%" stopColor="#06B6D4" stopOpacity="0.05"/>
                      </linearGradient>
                      <filter id="trendGlow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* BACKGROUND GRID */}
                    {[0, 12.5, 25, 37.5, 50].map((y) => (
                      <line
                        key={`grid-${y}`}
                        x1="0"
                        y1={(150 - (150 * y / 50)).toString()}
                        x2="500"
                        y2={(150 - (150 * y / 50)).toString()}
                        stroke="rgba(255,255,255,0.05)"
                        strokeWidth="1"
                      />
                    ))}

                    {/* AREA FILL */}
                    <path
                      d={`M 0 ${150 - (150 * (scoreTrend[0]?.score || 0) / 50)} ${scoreTrend
                        .map((point, idx) => `L ${(idx / (scoreTrend.length - 1)) * 500} ${150 - (150 * point.score / 50)}`)
                        .join(' ')} L 500 150 L 0 150 Z`}
                      fill="url(#trendGradient)"
                    />

                    {/* LINE PATH */}
                    <path
                      d={`M 0 ${150 - (150 * (scoreTrend[0]?.score || 0) / 50)} ${scoreTrend
                        .map((point, idx) => `L ${(idx / (scoreTrend.length - 1)) * 500} ${150 - (150 * point.score / 50)}`)
                        .join(' ')}`}
                      stroke="#06B6D4"
                      strokeWidth="3"
                      fill="none"
                      filter="url(#trendGlow)"
                      className="drop-shadow-[0_0_10px_rgba(6,182,212,0.8)]"
                    />

                    {/* DATA POINTS */}
                    {scoreTrend.map((point, idx) => (
                      <circle
                        key={`point-${idx}`}
                        cx={(idx / (scoreTrend.length - 1)) * 500}
                        cy={150 - (150 * point.score / 50)}
                        r="4"
                        fill="#06B6D4"
                        className="drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]"
                      />
                    ))}
                  </svg>
                </div>
              )}

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-mono uppercase mb-1">Latest</p>
                  <p className="text-xl font-bold text-cyan-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{scoreTrend[scoreTrend.length - 1]?.score || 0}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-mono uppercase mb-1">Average</p>
                  <p className="text-xl font-bold text-purple-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>
                    {Math.round(scoreTrend.reduce((sum, p) => sum + p.score, 0) / (scoreTrend.length || 1))}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400 font-mono uppercase mb-1">Best</p>
                  <p className="text-xl font-bold text-orange-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>
                    {Math.max(...scoreTrend.map(p => p.score))}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* WEEKLY SUMMARY STATS */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
            >
              <h5 className="text-lg font-bold text-white mb-4 uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>Weekly Stats</h5>
              <div className="grid grid-cols-3 gap-3">
                <motion.div
                  whileHover={{ scale: 1.06, boxShadow: "0 0 18px rgba(6,182,212,0.35)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="bg-gradient-to-br from-cyan-500/20 to-transparent border border-cyan-400/30 rounded-lg p-4 text-center hover:border-cyan-400/60 hover:bg-cyan-500/20 transition-colors cursor-default"
                >
                  <p className="text-xs text-slate-400 font-mono uppercase mb-2">Attempts</p>
                  <p className="text-2xl font-bold text-cyan-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{totalAttempts}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.06, boxShadow: "0 0 18px rgba(168,85,247,0.35)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="bg-gradient-to-br from-purple-500/20 to-transparent border border-purple-400/30 rounded-lg p-4 text-center hover:border-purple-400/60 hover:bg-purple-500/20 transition-colors cursor-default"
                >
                  <p className="text-xs text-slate-400 font-mono uppercase mb-2">Questions</p>
                  <p className="text-2xl font-bold text-purple-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{totalQuestions}</p>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.06, boxShadow: "0 0 18px rgba(251,146,60,0.35)" }}
                  transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  className="bg-gradient-to-br from-orange-500/20 to-transparent border border-orange-400/30 rounded-lg p-4 text-center hover:border-orange-400/60 hover:bg-orange-500/20 transition-colors cursor-default"
                >
                  <p className="text-xs text-slate-400 font-mono uppercase mb-2">Streak</p>
                  <p className="text-2xl font-bold text-orange-400 tracking-tighter" style={{ fontFamily: "var(--font-mono)" }}>{streakDays}d</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT COLUMN: USER STATS & ACTIVITY (3/12) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-3 bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md hover:bg-white/8 transition-all flex flex-col"
          >
            {/* IDENTITY SECTION */}
            <div className="text-center mb-6 pb-6 border-b border-white/10">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-20 h-20 rounded-full border-2 border-cyan-400/50 flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-purple-500/30 backdrop-blur-sm shadow-[0_0_20px_rgba(6,182,212,0.4)] mx-auto mb-4"
              >
                <Trophy className="w-10 h-10 text-cyan-400" />
              </motion.div>
              <h4 className="font-bold text-white text-lg font-mono">{user?.username || "User"}</h4>
              <p className="text-xs text-slate-400 mt-1 font-mono">Level {Math.floor(totalAttempts / 5) + 1}</p>
            </div>

            {/* STATUS METRICS */}
            <div className="space-y-3 mb-6 pb-6 border-b border-white/10">
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase mb-1">Interview Ready</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden border border-white/20">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(accuracy, 100)}%` }}
                      transition={{ duration: 1 }}
                      className="h-full bg-gradient-to-r from-cyan-400 to-purple-400 shadow-[0_0_10px_rgba(6,182,212,0.6)]"
                    />
                  </div>
                  <p className="text-sm font-bold text-cyan-400 font-mono w-10">{accuracy}%</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-400 font-mono uppercase mb-1">Avg Score</p>
                <p className="text-lg font-bold text-purple-400 font-mono">{averageScore}<span className="text-sm text-slate-500">/50</span></p>
              </div>
            </div>

            {/* RECENT ACTIVITY */}
            <div className="flex-1 overflow-y-auto">
              <h5 className="text-xs font-bold text-slate-300 mb-3 uppercase tracking-widest" style={{ fontFamily: "var(--font-header)" }}>Recent Activity</h5>
              <div className="space-y-2 max-h-80">
                {recentAttempts.length === 0 ? (
                  <p className="text-xs text-slate-500 text-center py-4">No activity yet</p>
                ) : (
                  recentAttempts.map((attempt, idx) => {
                    const subjectName = typeof attempt.subject === "string" ? "Subject" : attempt.subject?.name || "Subject";
                    const minutesAgo = Math.floor((new Date() - new Date(attempt.createdAt)) / 60000);
                    const timeStr = minutesAgo < 1 ? "now" : minutesAgo < 60 ? `${minutesAgo}m` : `${Math.floor(minutesAgo / 60)}h`;
                    const correctCount = attempt.correctCount || 0;
                    const totalQuest = attempt.totalQuestions || 1;
                    const attemptAccuracy = Math.round((correctCount / 50) * 100);
                    const scoreColor = attempt.score >= 40 ? "text-green-400" : attempt.score >= 30 ? "text-yellow-400" : "text-red-400";
                    
                    return (
                      <motion.div
                        key={attempt._id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-cyan-400/30 hover:bg-white/8 transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] text-slate-200 font-mono font-bold leading-tight truncate">{subjectName}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{timeStr} ago</p>
                          </div>
                          <div className="flex flex-col items-end gap-0.5 ml-2 flex-shrink-0">
                            <p className="text-[9px] text-slate-400 font-mono">Accuracy</p>
                            <p className={`text-sm font-bold font-mono ${scoreColor}`}>{attemptAccuracy}%</p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          
                          <span className="text-slate-500">{correctCount}/50</span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ===================== */}
        {/* CORE SUBJECTS GRID */}
        {/* ===================== */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h3 className="text-xl font-bold text-white mb-6 uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>Core Subjects</h3>
          {subjects.length === 0 ? (
            <div className="flex items-center justify-center h-40 rounded-2xl border border-white/10 bg-white/5 text-slate-500 backdrop-blur-md">
              No subjects available
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {subjects.map((subject, idx) => (
                <motion.div 
                  key={subject._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                >
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
              y: -8,
              borderColor: "rgba(6, 182, 212, 0.6)",
              boxShadow: "0 0 30px rgba(6, 182, 212, 0.3), 0 20px 40px rgba(0,0,0,0.4)",
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
              <div className="space-y-8">
                {/* TOP: ICON + TITLE + LABEL */}
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="inline-block mb-4"
                    >
                      <div className="w-20 h-20 rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/25 to-blue-400/15 flex items-center justify-center shadow-[0_0_25px_rgba(6,182,212,0.5)] group-hover:shadow-[0_0_35px_rgba(6,182,212,0.7)] transition-all">
                        <Code2 className="w-10 h-10 text-cyan-400" />
                      </div>
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white group-hover:text-cyan-300 transition-colors uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>
                      DSA Master
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 group-hover:text-slate-300 transition-colors" style={{ fontFamily: "var(--font-body)" }}>Data Structures & Algorithms</p>
                  </div>
                </div>

                {/* MIDDLE: DESCRIPTION */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-300 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    Master algorithms, optimize your code, and solve real interview problems with our interactive coding platform.
                  </p>
                </div>

                {/* BOTTOM: STATS + BUTTON */}
                <div className="flex items-end justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500 font-mono">Problems</p>
                    <p className="text-2xl font-bold text-cyan-400 font-mono mt-1">500+</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(6, 182, 212, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-cyan-400 to-blue-400 text-slate-900 font-bold rounded-full text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all border border-cyan-400/50 whitespace-nowrap font-mono uppercase tracking-wider"
                  >
                    <span>Start</span>
                    <Zap className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* STAR INTERVIEW HERO CARD */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            whileHover={{
              y: -8,
              borderColor: "rgba(168, 85, 247, 0.6)",
              boxShadow: "0 0 30px rgba(168, 85, 247, 0.3), 0 20px 40px rgba(0,0,0,0.4)",
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
            {/* GLASS BACKGROUND */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-slate-900/60 rounded-3xl border border-purple-400/20 backdrop-blur-xl" />
            
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
              <div className="space-y-8">
                {/* TOP: ICON + TITLE + LABEL */}
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className="inline-block mb-4"
                    >
                      <div className="w-20 h-20 rounded-2xl border border-purple-400/50 bg-gradient-to-br from-purple-500/25 to-pink-400/15 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.5)] group-hover:shadow-[0_0_35px_rgba(168,85,247,0.7)] transition-all">
                        <Award className="w-10 h-10 text-purple-400" />
                      </div>
                    </motion.div>
                    <h3 className="text-3xl font-bold text-white group-hover:text-purple-300 transition-colors uppercase tracking-tight" style={{ fontFamily: "var(--font-header)" }}>
                      STAR Interview
                    </h3>
                    <p className="text-sm text-slate-400 mt-2 group-hover:text-slate-300 transition-colors" style={{ fontFamily: "var(--font-body)" }}>Behavioral & Soft Skills</p>
                  </div>
                </div>

                {/* MIDDLE: DESCRIPTION */}
                <div className="pt-4 border-t border-white/10">
                  <p className="text-sm text-slate-300 leading-relaxed" style={{ fontFamily: "var(--font-body)" }}>
                    Practice behavioral questions with AI feedback, perfect your storytelling, and master the art of impressive interviews.
                  </p>
                </div>

                {/* BOTTOM: STATS + BUTTON */}
                <div className="flex items-end justify-between gap-4 bg-white/5 rounded-xl p-4 border border-white/10 backdrop-blur-sm">
                  <div>
                    <p className="text-xs uppercase tracking-[0.1em] text-slate-500 font-mono">Questions</p>
                    <p className="text-2xl font-bold text-purple-400 font-mono mt-1">150+</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(168, 85, 247, 0.6)" }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-400 to-pink-400 text-slate-900 font-bold rounded-full text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:shadow-[0_0_30px_rgba(168,85,247,0.7)] transition-all border border-purple-400/50 whitespace-nowrap font-mono uppercase tracking-wider"
                  >
                    <span>Start</span>
                    <Sparkles className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default UserDashboard;
