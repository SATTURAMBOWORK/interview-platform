import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, CheckCircle2, XCircle, Award, Zap, BookOpen, BarChart3 } from "lucide-react";
import api from "../../api/axios";

function Result() {
  const { attemptId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResult = async () => {
      try {
        const res = await api.get(`/attempts/${attemptId}`);
        setResult(res.data);
      } catch (err) {
        console.error("Failed to load result", err);
        navigate("/dashboard");
      } finally {
        setLoading(false);
      }
    };
    fetchResult();
  }, [attemptId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a16] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-400 rounded-full"
        />
      </div>
    );
  }

  if (!result) return null;

  const correctCount = result.correctCount;
  const incorrectCount = result.totalQuestions - result.correctCount;
  const accuracy = ((correctCount / result.totalQuestions) * 100).toFixed(1);

  // Performance tier
  let tier = { label: "Needs Work", color: "rose", glow: "rgba(244,63,94,0.4)", PerformanceIcon: XCircle, msg: "Keep practicing — focus on the fundamentals and review your mistakes." };
  if (result.score >= 45)      tier = { label: "Outstanding", color: "emerald", glow: "rgba(52,211,153,0.4)", PerformanceIcon: Award,        msg: "Exceptional result! You've mastered this subject." };
  else if (result.score >= 30) tier = { label: "Good Work",   color: "cyan",    glow: "rgba(6,182,212,0.4)",  PerformanceIcon: CheckCircle2, msg: "Solid performance! Keep pushing for the top tier." };
  else if (result.score >= 20) tier = { label: "Decent",      color: "amber",   glow: "rgba(251,191,36,0.4)", PerformanceIcon: TrendingUp,   msg: "You're progressing. Review weak areas to level up." };

  const { label: perfLabel, glow, PerformanceIcon, msg } = tier;

  const heroGradient =
    tier.color === "emerald" ? "from-emerald-500/20 to-emerald-900/10 border-emerald-500/30" :
    tier.color === "cyan"    ? "from-cyan-500/20 to-cyan-900/10 border-cyan-500/30" :
    tier.color === "amber"   ? "from-amber-500/20 to-amber-900/10 border-amber-500/30" :
                               "from-rose-500/20 to-rose-900/10 border-rose-500/30";

  const accentColor =
    tier.color === "emerald" ? "text-emerald-400" :
    tier.color === "cyan"    ? "text-cyan-400" :
    tier.color === "amber"   ? "text-amber-400" :
                               "text-rose-400";

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 120, damping: 14 } },
  };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-cyan-500/30">

      {/* BACKGROUND GLOWS */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        {/* NAV */}
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 text-slate-500 hover:text-cyan-400 font-bold text-[10px] uppercase tracking-[0.3em] font-mono transition-colors"
        >
          <ArrowLeft className="w-3 h-3" />
          Back to Dashboard
        </motion.button>

        {/* HERO SCORE CARD */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={`relative rounded-[2rem] border bg-gradient-to-br ${heroGradient} backdrop-blur-xl p-8 md:p-12 overflow-hidden`}
          style={{ boxShadow: `0 0 60px ${glow}` }}
        >
          {/* spotlight shimmer */}
          <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.03)_0%,transparent_60%)] pointer-events-none" />

          <div className="relative grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

            {/* Score */}
            <div className="space-y-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-500 font-mono">Score</p>
              <div className={`text-7xl font-black font-mono tracking-tighter ${accentColor}`} style={{ textShadow: `0 0 30px ${glow}` }}>
                {result.score.toFixed(1)}
                <span className="text-2xl text-slate-500 ml-1">/50</span>
              </div>
              <p className="text-sm text-slate-400 font-mono">{accuracy}% accuracy</p>
            </div>

            {/* Icon + tier */}
            <div className="flex flex-col items-center gap-4 md:border-l md:border-r border-white/10 md:px-8">
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
                style={{ boxShadow: `0 0 30px ${glow}` }}
              >
                <PerformanceIcon className={`w-10 h-10 ${accentColor}`} />
              </motion.div>
              <div className="text-center">
                <p className="text-[9px] uppercase tracking-[0.3em] text-slate-500 font-mono">Performance</p>
                <p className={`text-xl font-black font-mono mt-1 ${accentColor}`}>{perfLabel}</p>
              </div>
            </div>

            {/* Correct / Incorrect */}
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Correct</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">{correctCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono">Incorrect</p>
                  <p className="text-2xl font-black text-rose-400 font-mono">{incorrectCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* message strip */}
          <div className="relative mt-8 pt-6 border-t border-white/10 text-center">
            <p className="text-sm text-slate-300 font-mono">{msg}</p>
          </div>
        </motion.div>

        {/* STATS GRID */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Total Questions", val: result.totalQuestions, color: "text-cyan-400",    glow: "rgba(6,182,212,0.3)",   bar: null },
            { label: "Correct",         val: correctCount,          color: "text-emerald-400", glow: "rgba(52,211,153,0.3)",  bar: (correctCount / result.totalQuestions) * 100 },
            { label: "Incorrect",       val: incorrectCount,        color: "text-rose-400",    glow: "rgba(244,63,94,0.3)",   bar: (incorrectCount / result.totalQuestions) * 100 },
            { label: "Accuracy",        val: `${accuracy}%`,        color: "text-amber-400",   glow: "rgba(251,191,36,0.3)",  bar: parseFloat(accuracy) },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={itemVariants}
              whileHover={{ scale: 1.05, boxShadow: `0 0 20px ${stat.glow}` }}
              transition={{ type: "spring", stiffness: 300, damping: 18 }}
              className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 backdrop-blur-md hover:border-white/20 cursor-default"
            >
              <p className="text-[9px] uppercase tracking-widest text-slate-500 font-mono mb-2">{stat.label}</p>
              <p className={`text-3xl font-black font-mono tracking-tighter ${stat.color}`}>{stat.val}</p>
              {stat.bar !== null && (
                <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${stat.bar}%` }}
                    transition={{ duration: 1, delay: 0.4 + i * 0.1 }}
                    className={`h-full rounded-full ${
                      stat.color === "text-emerald-400" ? "bg-emerald-400" :
                      stat.color === "text-rose-400"    ? "bg-rose-400" : "bg-amber-400"
                    }`}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* TIPS */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/[0.03] border border-white/[0.07] rounded-2xl p-8 backdrop-blur-md"
        >
          <h3 className="text-xs font-bold text-slate-400 mb-5 uppercase tracking-widest font-mono flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Tips for Improvement
          </h3>
          <ul className="space-y-3">
            {[
              "Review the questions you got wrong to understand the concepts better.",
              "Practice similar questions from your weak areas regularly.",
              "Take more tests to improve your accuracy and speed.",
              "Study the theory behind the problems, not just memorize answers.",
            ].map((tip, i) => (
              <li key={i} className="flex gap-3 text-sm text-slate-400 font-mono">
                <span className="text-cyan-500 mt-0.5 flex-shrink-0">→</span>
                {tip}
              </li>
            ))}
          </ul>
        </motion.div>

        {/* ACTION BUTTONS */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(6,182,212,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(`/attempt/${attemptId}`)}
            className="flex items-center justify-center gap-2 px-8 py-4 border border-cyan-500/30 text-cyan-400 font-bold rounded-2xl text-[11px] uppercase tracking-widest font-mono bg-cyan-500/5 hover:bg-cyan-500/10 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Review Answers
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 25px rgba(168,85,247,0.3)" }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-[#0a0a16] font-black rounded-2xl text-[11px] uppercase tracking-widest font-mono shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <BarChart3 className="w-4 h-4" />
            Back to Dashboard
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

export default Result;