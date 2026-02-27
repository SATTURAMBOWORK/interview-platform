import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring, useMotionValue, useTransform } from "framer-motion";
import { BookOpen, Award, TrendingUp, AlertCircle, Loader, Activity, Brain, Mic, Target, Crown, Users, Zap, MessageCircle, Shield, RefreshCw, Heart, ArrowRight } from "lucide-react";
import api from "../../api/axios";
import StarQuestion from "./StarQuestion";
import ResponseAnalysis from "./ResponseAnalysis";
import BehavioralProgress from "./BehavioralProgress";

/* ─── Per-card component so each gets its own motion values ─── */
const CategoryCard = ({ category, stats, cfg, loading, onClick, index }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-150, 150], [5, -5]);
  const rotateY = useTransform(mouseX, [-150, 150], [-5, 5]);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - (rect.left + rect.width / 2));
    mouseY.set(e.clientY - (rect.top + rect.height / 2));
    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  const IconComponent = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, type: "spring", stiffness: 200, damping: 22 }}
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onClick={!loading ? onClick : undefined}
      className={`group relative cursor-pointer h-full ${loading ? "opacity-60 pointer-events-none" : ""}`}
    >
      {/* FLOATING PARTICLES */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{ opacity: [0, 1, 0], y: [0, -80], x: [0, (i % 2 === 0 ? 1 : -1) * (i + 1) * 8] }}
            transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
            className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* BACKGROUND GLOW */}
      <div
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl rounded-3xl"
        style={{ backgroundColor: cfg.glow }}
      />

      {/* CARD BODY */}
      <div className="relative h-full bg-[#0a0a16]/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group-hover:border-white/20 transition-colors">

        {/* SPOTLIGHT */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="p-6 space-y-4 relative z-10">

          {/* NAME + ICON ROW */}
          <div className="flex items-center justify-between gap-3">
            <motion.h2
              className={`text-2xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r ${cfg.grad} bg-clip-text text-transparent`}
              style={{ backgroundSize: "200% 200%", fontFamily: "var(--font-header)" }}
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              {category}
            </motion.h2>
            <motion.div
              animate={isHovered ? { scale: 1.2, rotate: [0, 8, -8, 0] } : { scale: 1, rotate: 0 }}
              transition={{ duration: 0.4 }}
              className={`shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br ${cfg.grad} flex items-center justify-center`}
              style={{ boxShadow: isHovered ? `0 0 14px ${cfg.glow}` : "none" }}
            >
              <IconComponent className="w-5 h-5 text-white" strokeWidth={2} />
            </motion.div>
          </div>

          {/* STATS */}
          <div className="pt-3 border-t border-white/5 flex items-baseline gap-2">
            <span className={`text-3xl font-black font-mono bg-gradient-to-r ${cfg.grad} bg-clip-text text-transparent`}>
              {stats && !isNaN(stats.average) ? Math.round(stats.average) : 0}
            </span>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono">Avg Score</span>
          </div>

          {/* LAUNCH BUTTON */}
          <motion.div className="relative pt-2" whileHover={{ y: -2 }}>
            <div className={`absolute inset-0 bg-gradient-to-r ${cfg.grad} blur-lg opacity-0 group-hover:opacity-40 transition-opacity rounded-xl`} />
            <div className="relative w-full h-12 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl group-hover:border-white/40 transition-all">
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                    <Loader className="w-4 h-4 text-white/60" />
                  </motion.div>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-white/60 font-mono">Loading</span>
                </>
              ) : (
                <>
                  <span className="text-xs font-black uppercase tracking-[0.3em] text-white font-mono">Start Practice</span>
                  <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </div>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
};

function StarInterview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState("menu");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 3D Physics for Hero Tilt — identical to DsaDashboard
  const heroRotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const heroRotateY = useSpring(0, { stiffness: 150, damping: 20 });

  const categories = ["Leadership", "Teamwork", "Problem-Solving", "Communication", "Conflict Resolution", "Adaptability", "Customer Focus"];

  const categoryConfig = {
    "Leadership":          { icon: Crown,          grad: "from-amber-500 to-orange-500",    glow: "rgba(245,158,11,0.5)",  ring: "#f59e0b", border: "border-amber-400/30",   hborder: "hover:border-amber-400/60"  },
    "Teamwork":            { icon: Users,          grad: "from-cyan-500 to-sky-500",        glow: "rgba(6,182,212,0.5)",   ring: "#06b6d4", border: "border-cyan-400/30",    hborder: "hover:border-cyan-400/60"   },
    "Problem-Solving":     { icon: Zap,            grad: "from-purple-500 to-violet-600",   glow: "rgba(168,85,247,0.5)",  ring: "#a855f7", border: "border-purple-400/30", hborder: "hover:border-purple-400/60" },
    "Communication":       { icon: MessageCircle,  grad: "from-emerald-500 to-green-600",  glow: "rgba(16,185,129,0.5)",  ring: "#10b981", border: "border-emerald-400/30",hborder: "hover:border-emerald-400/60"},
    "Conflict Resolution": { icon: Shield,         grad: "from-rose-500 to-pink-600",      glow: "rgba(244,63,94,0.5)",   ring: "#f43f5e", border: "border-rose-400/30",    hborder: "hover:border-rose-400/60"   },
    "Adaptability":        { icon: RefreshCw,      grad: "from-sky-500 to-indigo-500",     glow: "rgba(14,165,233,0.5)",  ring: "#0ea5e9", border: "border-sky-400/30",     hborder: "hover:border-sky-400/60"    },
    "Customer Focus":      { icon: Heart,          grad: "from-pink-500 to-fuchsia-600",   glow: "rgba(236,72,153,0.5)",  ring: "#ec4899", border: "border-pink-400/30",    hborder: "hover:border-pink-400/60"   },
  };

  useEffect(() => {
    fetchPerformanceSummary();
  }, []);

  const fetchPerformanceSummary = async () => {
    try {
      setError(null);
      const res = await api.get("/behavioral/performance/summary");
      setPerformanceSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch performance summary:", error);
      setPerformanceSummary(null);
    }
  };

  const fetchQuestions = async (category = null) => {
    try {
      setLoading(true);
      setError(null);
      const url = category ? `/behavioral/questions?category=${category}` : "/behavioral/questions";
      const res = await api.get(url);
      // Shuffle and pick 3 random questions
      const shuffled = [...res.data].sort(() => Math.random() - 0.5).slice(0, 3);
      setQuestions(shuffled);
      if (shuffled.length > 0) {
        setCurrentQuestion(shuffled[0]);
        setSelectedCategory(category);
        setView("practice");
      } else {
        setError("No questions found for this category");
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setError(error.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmitted = (response) => {
    setResponses([...responses, response]);
    // Move to next question or show completion
    const nextIdx = questions.findIndex((q) => q._id === currentQuestion._id) + 1;
    if (nextIdx < questions.length) {
      setCurrentQuestion(questions[nextIdx]);
    } else {
      setView("menu");
      fetchPerformanceSummary();
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-purple-500/30">

      {/* BACKGROUND EFFECTS — same as DsaDashboard */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]"></div>
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600 rounded-full filter blur-[100px]"></div>
      </div>

      <AnimatePresence mode="wait">

        {/* ── MENU VIEW ── */}
        {view === "menu" && (
          <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* HERO — identical structure to DsaDashboard */}
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
                onMouseLeave={() => { heroRotateX.set(0); heroRotateY.set(0); }}
                className="group relative overflow-hidden rounded-[2.5rem] border border-purple-400/20 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-10 md:p-14 transition-all duration-300 hover:border-purple-400/40"
              >
                {/* MOUSE SPOTLIGHT */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(168,85,247,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                <div className="relative z-10 grid lg:grid-cols-5 gap-12 items-center">
                  {/* LEFT — title + tags */}
                  <div className="lg:col-span-3 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-[11px] font-bold tracking-[0.2em] text-purple-400 uppercase font-mono">
                      <Activity className="w-4 h-4 animate-pulse" /> Behavioral Engine Online
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight uppercase">
                      Master Your <br />
                      <span className="bg-gradient-to-r from-purple-400 via-violet-400 to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(168,85,247,0.5)]">
                        STAR Story
                      </span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-md font-medium leading-relaxed">
                      AI-powered behavioral interview coaching. Perfect your storytelling across Situation, Task, Action, and Result.
                    </p>
                    <div className="flex flex-wrap gap-4 pt-4">
                      {[
                        { icon: Brain,  label: "Clarity",     color: "text-purple-400" },
                        { icon: Target, label: "Impact",      color: "text-violet-400" },
                        { icon: Mic,    label: "Completeness",color: "text-pink-400"   },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest ${item.color} font-mono`}>
                          <item.icon className="w-4 h-4" /> {item.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* RIGHT — average score ring */}
                  <div className="lg:col-span-2 flex justify-center lg:justify-end">
                    <div className="relative">
                      {(() => {
                        const avg = performanceSummary?.averageScore ?? 0;
                        const radius = 80;
                        const circumference = 2 * Math.PI * radius;
                        return (
                          <svg className="w-56 h-56 md:w-64 md:h-64 -rotate-90">
                            <circle cx="50%" cy="50%" r={radius} className="stroke-white/5 fill-none" strokeWidth="12" />
                            <motion.circle
                              cx="50%" cy="50%" r={radius}
                              className="stroke-purple-500 fill-none"
                              strokeWidth="12"
                              strokeDasharray={circumference}
                              initial={{ strokeDashoffset: circumference }}
                              animate={{ strokeDashoffset: circumference - (circumference * avg) / 100 }}
                              transition={{ duration: 1.5, ease: "easeOut" }}
                              style={{ strokeLinecap: "round", filter: "drop-shadow(0 0 8px rgba(168,85,247,0.8))" }}
                            />
                          </svg>
                        );
                      })()}
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none font-mono">
                          {Math.round(performanceSummary?.averageScore ?? 0)}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-purple-400 mt-2">Avg Score</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATS ROW — same style as DsaDashboard */}
                <div className="relative z-10 mt-10 pt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Responses",   value: performanceSummary?.totalResponses ?? 0,                       color: "text-purple-400" },
                    { label: "Average Score",      value: `${Math.round(performanceSummary?.averageScore ?? 0)}/100`,                color: "text-violet-400" },
                    { label: "Categories Tried",   value: Object.keys(performanceSummary?.byCategory ?? {}).length,     color: "text-pink-400"   },
                    { label: "Top Strength",       value: performanceSummary?.topStrengths?.[0] ?? "—",                 color: "text-indigo-400", small: true },
                  ].map((stat, i) => (
                    <div key={i}>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">{stat.label}</p>
                      <p className={`${stat.small ? "text-base" : "text-2xl"} font-black font-mono ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            </header>

            {/* CATEGORY CARDS */}
            <main className="max-w-[1600px] mx-auto px-6 py-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold uppercase tracking-widest text-white font-mono">Choose a Category</h2>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setView("progress")}
                  className="px-5 py-2.5 rounded-full border border-purple-400/30 bg-purple-500/10 text-purple-400 text-xs font-bold uppercase tracking-widest font-mono hover:border-purple-400/60 transition-all"
                >
                  View All Responses
                </motion.button>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <p className="text-red-400 text-sm font-mono">{error}</p>
                </motion.div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {categories.map((category, i) => (
                  <CategoryCard
                    key={category}
                    category={category}
                    stats={performanceSummary?.byCategory?.[category]}
                    cfg={categoryConfig[category] ?? categoryConfig["Problem-Solving"]}
                    loading={loading}
                    onClick={() => fetchQuestions(category)}
                    index={i}
                  />
                ))}
              </div>
            </main>
          </motion.div>
        )}

        {/* PRACTICE VIEW */}
        {view === "practice" && currentQuestion && (
          <StarQuestion
            key={currentQuestion._id}
            question={currentQuestion}
            onResponseSubmitted={handleResponseSubmitted}
            onBack={() => setView("menu")}
            currentIndex={questions.findIndex((q) => q._id === currentQuestion._id)}
            totalQuestions={questions.length}
          />
        )}

        {/* PROGRESS VIEW */}
        {view === "progress" && (
          <BehavioralProgress
            onBack={() => setView("menu")}
            onRefresh={fetchPerformanceSummary}
          />
        )}

      </AnimatePresence>
    </div>
  );
}

export default StarInterview;
