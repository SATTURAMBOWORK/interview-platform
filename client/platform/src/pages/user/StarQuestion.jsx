import { useState } from "react";
import { motion, AnimatePresence, useSpring } from "framer-motion"; // eslint-disable-line no-unused-vars
import { 
  ChevronLeft, Send, AlertCircle, Loader2, 
  CheckCircle2, Activity, Zap
} from "lucide-react";
import api from "../../api/axios";
import ResponseAnalysis from "./ResponseAnalysis";

/* ── Cyber-STAR Configuration ── */
const FIELD_CFG = {
  situation: {
    label: "S",
    title: "SITUATION",
    description: "Initialize context. What was the background challenge?",
    placeholder: ">> [SYSTEM]: Define the environmental parameters and constraints...",
    color: "cyan",
    grad: "from-cyan-400 to-blue-600",
    glow: "rgba(6, 182, 212, 0.3)",
  },
  task: {
    label: "T",
    title: "TASK",
    description: "Define objectives. What was your specific role?",
    placeholder: ">> [SYSTEM]: Identify primary mission objectives and responsibilities...",
    color: "purple",
    grad: "from-purple-400 to-violet-600",
    glow: "rgba(168, 85, 247, 0.3)",
  },
  action: {
    label: "A",
    title: "ACTION",
    description: "Execution phase. What concrete steps did you take?",
    placeholder: ">> [SYSTEM]: Document procedural execution and logic applied...",
    color: "pink",
    grad: "from-pink-400 to-rose-600",
    glow: "rgba(244, 63, 94, 0.3)",
  },
  result: {
    label: "R",
    title: "RESULT",
    description: "Verify outcome. What was the measurable impact?",
    placeholder: ">> [SYSTEM]: Analyze post-execution data and key takeaways...",
    color: "emerald",
    grad: "from-emerald-400 to-teal-600",
    glow: "rgba(16, 185, 129, 0.3)",
  },
};

const FIELDS = ["situation", "task", "action", "result"];
const MIN_CHARS = 150;
const MAX_CHARS = 1200;

function StarQuestion({ question, onResponseSubmitted, onBack, currentIndex, totalQuestions }) {
  const [response, setResponse] = useState({ situation: "", task: "", action: "", result: "" });
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focused, setFocused] = useState(null);

  // 3D Physics for Hero Tilt — must be declared before any early returns
  const heroRotateX = useSpring(0, { stiffness: 150, damping: 20 });
  const heroRotateY = useSpring(0, { stiffness: 150, damping: 20 });

  const handleChange = (field, value) => {
    setResponse(prev => ({ ...prev, [field]: value }));
    if (error) setError("");
  };

  const handleSubmit = async () => {
    const tooShort = FIELDS.filter(f => charCounts[f] < MIN_CHARS);
    const tooLong  = FIELDS.filter(f => charCounts[f] > MAX_CHARS);
    if (tooShort.length) {
      setError(`Each segment needs at least ${MIN_CHARS} characters. Too short: ${tooShort.map(f => FIELD_CFG[f].title).join(", ")}`);
      return;
    }
    if (tooLong.length) {
      setError(`Each segment must be under ${MAX_CHARS} characters. Too long: ${tooLong.map(f => FIELD_CFG[f].title).join(", ")}`);
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/behavioral/response/submit", {
        questionId: question._id,
        response,
      });
      setFeedback(res.data.response.feedback);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Transmission failed. Retry connection.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ResponseAnalysis
        question={question}
        response={response}
        feedback={feedback}
        onNext={onResponseSubmitted}
      />
    );
  }

  const progress = ((currentIndex + 1) / totalQuestions) * 100;
  const charCounts = Object.fromEntries(FIELDS.map(f => [f, response[f].length]));
  const allFilled = FIELDS.every(f => charCounts[f] >= MIN_CHARS && charCounts[f] <= MAX_CHARS);
  const filledCount = FIELDS.filter(f => charCounts[f] >= MIN_CHARS && charCounts[f] <= MAX_CHARS).length;

  // SVG ring
  const ringRadius = 80;
  const ringCircumference = 2 * Math.PI * ringRadius;

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-cyan-500/30 overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[100px]" />
      </div>

      {/* ── TOP NAV ── */}
      <div className="relative pt-6 pb-0 px-6 max-w-[1400px] mx-auto flex items-center justify-between">
        <motion.button
          whileHover={{ x: -4 }}
          whileTap={{ scale: 0.95 }}
          onClick={onBack}
          className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors font-mono"
        >
          <ChevronLeft className="w-4 h-4" />
          Dashboard
        </motion.button>

        <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2 rounded-2xl backdrop-blur-md">
          <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-widest">
            Q {currentIndex + 1} / {totalQuestions}
          </span>
          <div className="w-28 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
              style={{ boxShadow: "0 0 8px rgba(6,182,212,0.6)" }}
            />
          </div>
          <div className="flex gap-1">
            {FIELDS.map(f => (
              <div
                key={f}
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  charCounts[f] > MAX_CHARS ? "bg-rose-400" :
                  charCounts[f] >= MIN_CHARS ? "bg-cyan-400" : "bg-white/10"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── HERO — identical structure to DsaDashboard ── */}
      <header className="relative pt-6 pb-4 px-6 max-w-[1400px] mx-auto">
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
          className="group relative overflow-hidden rounded-[2.5rem] border border-cyan-400/20 bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-xl p-10 md:p-14 transition-all duration-300 hover:border-cyan-400/40"
        >
          {/* MOUSE SPOTLIGHT */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <div className="relative z-10 grid lg:grid-cols-5 gap-12 items-center">

            {/* LEFT — category badge + question + tips */}
            <div className="lg:col-span-3 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase font-mono">
                <Activity className="w-4 h-4 animate-pulse" />
                {question.category}
              </div>

              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter leading-tight uppercase">
                {question.question}
              </h1>

              {question.description && (
                <p className="text-slate-400 text-base max-w-lg leading-relaxed">
                  {question.description}
                </p>
              )}

              {/* TIPS — 4 pill chips, nothing else */}
              {question.tips?.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {question.tips.slice(0, 4).map((tip, i) => (
                    <span
                      key={i}
                      className="flex items-center gap-1.5 text-[11px] font-bold text-slate-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-full font-mono"
                    >
                      <Zap className="w-3 h-3 text-cyan-400 shrink-0" />
                      {tip}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT — STAR completion ring */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative">
                <svg className="w-56 h-56 md:w-64 md:h-64 -rotate-90">
                  <circle
                    cx="50%" cy="50%"
                    r={ringRadius}
                    className="stroke-white/5 fill-none"
                    strokeWidth="12"
                  />
                  <motion.circle
                    cx="50%" cy="50%"
                    r={ringRadius}
                    className="stroke-cyan-500 fill-none"
                    strokeWidth="12"
                    strokeDasharray={ringCircumference}
                    initial={{ strokeDashoffset: ringCircumference }}
                    animate={{ strokeDashoffset: ringCircumference - (ringCircumference * filledCount) / 4 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    style={{ strokeLinecap: "round", filter: "drop-shadow(0 0 8px rgba(6,182,212,0.8))" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-none font-mono">
                    {filledCount}<span className="text-3xl text-slate-600">/4</span>
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-cyan-400 mt-2 font-mono">Segments</span>
                </div>
              </div>
            </div>
          </div>

          {/* BOTTOM STATS ROW */}
          <div className="relative z-10 mt-10 pt-8 border-t border-white/5 grid grid-cols-4 gap-6">
            {FIELDS.map(f => {
              const cfg = FIELD_CFG[f];
              const cc = charCounts[f];
              const over = cc > MAX_CHARS;
              const done = cc >= MIN_CHARS && !over;
              return (
                <div key={f}>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">{cfg.title}</p>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 bg-gradient-to-r ${done ? cfg.grad : ""} ${over ? "bg-rose-400" : ""} ${!done && !over ? "bg-white/10" : ""}`} />
                    <p className={`text-xs font-black font-mono ${done ? "text-cyan-400" : over ? "text-rose-400" : "text-slate-600"}`}>
                      {done ? "READY" : over ? `${cc} / ${MAX_CHARS}` : `${cc} CHR`}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </header>

      {/* ── STAR ANSWER FIELDS ── */}
      <main className="max-w-[1400px] mx-auto px-6 py-8 space-y-5">

        {FIELDS.map((key, idx) => {
          const cfg = FIELD_CFG[key];
          const isFoc = focused === key;
          const cc = charCounts[key];
          const isOver = cc > MAX_CHARS;
          const isDone = cc >= MIN_CHARS && !isOver;

          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 + idx * 0.07, type: "spring", stiffness: 200, damping: 24 }}
              className={`relative rounded-2xl border-l-4 overflow-hidden transition-all duration-300 ${
                isFoc ? "border-white/15" : "border-transparent"
              }`}
              style={{
                borderLeftColor: isFoc ? cfg.glow.replace("0.3", "0.8") : cfg.glow.replace("0.3", "0.5"),
                background: isFoc ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.02)",
                border: `1px solid ${isFoc ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.05)"}`,
                borderLeft: `4px solid ${cfg.glow.replace("0.3", isFoc ? "0.9" : "0.6")}`,
                boxShadow: isFoc ? `0 0 32px ${cfg.glow.replace("0.3", "0.25")}, inset 0 0 32px ${cfg.glow.replace("0.3", "0.04")}` : "none",
              }}
            >
              {/* header row */}
              <div className="flex items-center justify-between px-6 pt-5 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm bg-gradient-to-br ${cfg.grad} font-mono shrink-0`}
                    style={{ boxShadow: `0 0 12px ${cfg.glow}` }}
                  >
                    {cfg.label}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-white uppercase tracking-wider font-mono leading-none">{cfg.title}</h3>
                    <p className="text-[11px] text-slate-500 font-mono mt-0.5">{cfg.description}</p>
                  </div>
                </div>
                <AnimatePresence>
                  {isDone && (
                    <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}>
                      <CheckCircle2 className="w-5 h-5 text-cyan-400" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* textarea */}
              <div className="px-6 pb-5">
                <textarea
                  onFocus={() => setFocused(key)}
                  onBlur={() => setFocused(null)}
                  value={response[key]}
                  onChange={e => handleChange(key, e.target.value)}
                  placeholder={cfg.placeholder}
                  rows={isFoc ? 6 : 4}
                  className="w-full bg-black/20 border border-white/[0.06] rounded-xl px-5 py-4 text-slate-200 placeholder:text-slate-700 text-sm font-sans leading-relaxed outline-none transition-all duration-200 resize-none focus:border-white/10 focus:bg-black/30"
                />
                {/* char count bar */}
                <div className="mt-2.5 flex items-center gap-3">
                  <div className="flex-1 h-0.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${Math.min(100, (cc / MAX_CHARS) * 100)}%` }}
                      transition={{ duration: 0.25 }}
                      className={`h-full bg-gradient-to-r ${isOver ? "from-rose-500 to-rose-400" : cfg.grad}`}
                    />
                  </div>
                  <span className={`text-[10px] font-mono shrink-0 ${
                    isOver ? "text-rose-400" : isDone ? "text-cyan-400" : "text-slate-600"
                  }`}>
                    {cc} / {MAX_CHARS}{cc < MIN_CHARS ? ` (min ${MIN_CHARS})` : ""}
                  </span>
                </div>
              </div>
            </motion.div>
          );
        })}

        {/* ── ERROR ── */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── SUBMIT ── */}
        <div className="flex gap-4 pt-4 pb-12">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.97 }}
            onClick={onBack}
            className="px-8 py-4 rounded-xl border border-white/10 bg-white/[0.03] text-slate-400 text-sm font-black uppercase tracking-widest font-mono hover:bg-white/[0.07] hover:text-white transition-all duration-200"
          >
            Back
          </motion.button>

          <motion.button
            whileHover={allFilled && !loading ? { scale: 1.02 } : {}}
            whileTap={allFilled && !loading ? { scale: 0.97 } : {}}
            disabled={loading}
            onClick={handleSubmit}
            className="flex-1 relative h-14 rounded-xl overflow-hidden font-black text-sm uppercase tracking-widest font-mono text-white flex items-center justify-center gap-3 transition-all duration-200 disabled:opacity-60"
            style={{
              background: "linear-gradient(135deg, #0891b2, #2563eb, #7c3aed)",
              boxShadow: loading ? "none" : "0 0 24px rgba(6,182,212,0.35)",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 pointer-events-none" />
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing…</>
            ) : (
              <><Send className="w-4 h-4" /> Submit &amp; Get AI Feedback</>
            )}
          </motion.button>
        </div>
      </main>
    </div>
  );
}

export default StarQuestion;
