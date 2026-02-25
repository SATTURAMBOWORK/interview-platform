import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { BookOpen, Award, TrendingUp, AlertCircle, Loader, Activity, Brain, Mic, Target } from "lucide-react";
import api from "../../api/axios";
import StarQuestion from "./StarQuestion";
import ResponseAnalysis from "./ResponseAnalysis";
import BehavioralProgress from "./BehavioralProgress";

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
      console.log("Fetched questions:", res.data);
      setQuestions(res.data);
      if (res.data.length > 0) {
        setCurrentQuestion(res.data[0]);
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
                          {performanceSummary?.averageScore ?? 0}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-purple-400 mt-2">Avg Score</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* STATS ROW — same style as DsaDashboard */}
                <div className="relative z-10 mt-10 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                  {[
                    { label: "Total Responses",   value: performanceSummary?.totalResponses ?? 0,                       color: "text-purple-400" },
                    { label: "Average Score",      value: `${performanceSummary?.averageScore ?? 0}/100`,                color: "text-violet-400" },
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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {categories.map((category, i) => {
                  const stats = performanceSummary?.byCategory?.[category];
                  return (
                    <motion.button
                      key={category}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={!loading ? { scale: 1.03, y: -4 } : {}}
                      whileTap={!loading ? { scale: 0.97 } : {}}
                      onClick={() => fetchQuestions(category)}
                      disabled={loading}
                      style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
                      onMouseMove={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
                        e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
                      }}
                      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-md p-6 text-left transition-all duration-300 hover:border-purple-400/40 ${loading ? "opacity-60 cursor-not-allowed" : ""}`}
                    >
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(168,85,247,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                      <div className="relative space-y-3">
                        <div className="flex items-start justify-between">
                          <h3 className="text-base font-bold text-white font-mono">{category}</h3>
                          {stats && (
                            <span className="text-xs font-bold text-purple-400 font-mono bg-purple-500/10 px-2 py-0.5 rounded-full border border-purple-400/20">
                              {stats.average.toFixed(0)}/100
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 font-mono">
                          {stats ? `${stats.count} attempted` : "Not started"}
                        </p>

                        {stats ? (
                          <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${stats.average}%` }}
                              transition={{ duration: 1, delay: 0.2 + i * 0.05 }}
                              className="h-full rounded-full bg-gradient-to-r from-purple-500 to-violet-500"
                              style={{ boxShadow: "0 0 8px rgba(168,85,247,0.6)" }}
                            />
                          </div>
                        ) : (
                          <div className="w-full h-1.5 bg-white/5 rounded-full border border-white/5" />
                        )}

                        <div className="flex items-center gap-2 text-xs text-slate-500 group-hover:text-purple-400 transition-colors font-mono pt-1">
                          {loading ? (
                            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}><Loader className="w-3.5 h-3.5" /></motion.div> Loading...</>
                          ) : (
                            <>Start practicing →</>
                          )}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
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
