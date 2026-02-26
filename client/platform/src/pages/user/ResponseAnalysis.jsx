import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  CheckCircle2,
  TrendingUp,
  Lightbulb,
  Award,
  ChevronRight,
  MessageSquare,
  Activity,
} from "lucide-react";

/* ── score tier config ── */
const TIER = (score) => {
  if (score >= 80) return { label: "Excellent",          grad: "from-emerald-400 to-teal-500",    glow: "rgba(52,211,153,0.45)",  ring: "#34d399" };
  if (score >= 60) return { label: "Good",               grad: "from-cyan-400 to-blue-500",       glow: "rgba(34,211,238,0.45)",  ring: "#22d3ee" };
  if (score >= 40) return { label: "Fair",               grad: "from-amber-400 to-orange-500",    glow: "rgba(251,191,36,0.45)",  ring: "#fbbf24" };
  return              { label: "Needs Improvement",   grad: "from-rose-400 to-red-500",        glow: "rgba(251,113,133,0.45)", ring: "#fb7185" };
};

const METRIC_CFG = [
  { key: "clarity",      label: "Clarity",      icon: MessageSquare, grad: "from-sky-400 to-blue-500",     glow: "rgba(56,189,248,0.35)",  border: "border-l-sky-500"    },
  { key: "impact",       label: "Impact",       icon: TrendingUp,    grad: "from-violet-400 to-purple-500", glow: "rgba(167,139,250,0.35)", border: "border-l-violet-500" },
  { key: "completeness", label: "Completeness", icon: CheckCircle2,  grad: "from-emerald-400 to-teal-500",  glow: "rgba(52,211,153,0.35)",  border: "border-l-emerald-500"},
];

function ResponseAnalysis({ question, response, feedback, onNext }) {
  const tier = TIER(feedback.overallScore);

  // SVG ring
  const radius = 80;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-cyan-500/30 overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-10 space-y-6">

        {/* ── HERO SCORE CARD ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", stiffness: 180, damping: 22 }}
          className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] backdrop-blur-xl p-10 md:p-14"
        >
          {/* animated top-line accent */}
          <div className={`absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r ${tier.grad}`} />

          <div className="relative z-10 grid lg:grid-cols-5 gap-10 items-center">

            {/* LEFT — badge + label + overall feedback */}
            <div className="lg:col-span-3 space-y-5">
              <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold tracking-[0.2em] uppercase font-mono bg-gradient-to-r ${tier.grad} bg-clip-text text-transparent`}>
                <Activity className="w-4 h-4 animate-pulse" style={{ color: tier.ring }} />
                Analysis Complete
              </div>

              <div>
                <h1 className={`text-6xl md:text-8xl font-black tracking-tighter leading-none font-mono bg-gradient-to-r ${tier.grad} bg-clip-text text-transparent`}
                  style={{ filter: `drop-shadow(0 0 20px ${tier.glow})` }}
                >
                  {feedback.overallScore}
                </h1>
                <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-slate-500 font-mono mt-2">
                  Out of 100 &nbsp;·&nbsp; {tier.label}
                </p>
              </div>

              <p className="text-slate-300 text-base leading-relaxed max-w-lg">
                {feedback.overallFeedback}
              </p>

              {/* mini metric pills */}
              <div className="flex flex-wrap gap-3 pt-1">
                {METRIC_CFG.map(({ key, label, grad }) => (
                  <span key={key} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold font-mono">
                    <span className={`bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{feedback[key].score}</span>
                    <span className="text-slate-500">/ 10 {label}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* RIGHT — ring */}
            <div className="lg:col-span-2 flex justify-center lg:justify-end">
              <div className="relative">
                <svg className="w-56 h-56 md:w-64 md:h-64 -rotate-90">
                  <circle cx="50%" cy="50%" r={radius} className="stroke-white/5 fill-none" strokeWidth="12" />
                  <motion.circle
                    cx="50%" cy="50%" r={radius}
                    fill="none"
                    strokeWidth="12"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (circumference * feedback.overallScore) / 100 }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
                    style={{ stroke: tier.ring, strokeLinecap: "round", filter: `drop-shadow(0 0 8px ${tier.glow})` }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className={`text-5xl md:text-6xl font-black tracking-tighter font-mono bg-gradient-to-r ${tier.grad} bg-clip-text text-transparent`}>
                    {feedback.overallScore}
                  </span>
                  <span className="text-[11px] font-bold uppercase tracking-[0.3em] mt-2 font-mono" style={{ color: tier.ring }}>
                    {tier.label}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* bottom stats */}
          <div className="relative z-10 mt-10 pt-8 border-t border-white/5 grid grid-cols-3 gap-6">
            {METRIC_CFG.map(({ key, label }) => (
              <div key={key}>
                <p className="text-[10px] uppercase tracking-widest text-slate-500 font-mono mb-1">{label}</p>
                <p className="text-2xl font-black font-mono text-white">{feedback[key].score}<span className="text-slate-600 text-sm">/10</span></p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── METRIC DETAIL CARDS ── */}
        <div className="space-y-4">
          {METRIC_CFG.map(({ key, label, icon: Icon, grad, glow, border }, idx) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.08, type: "spring", stiffness: 200, damping: 24 }}
              className={`relative rounded-2xl border-l-4 ${border} bg-white/[0.025] border border-white/[0.07] overflow-hidden`}
            >
              <div className="p-6 flex items-start gap-5">
                {/* score badge */}
                <div
                  className={`shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center bg-gradient-to-br ${grad} font-mono`}
                  style={{ boxShadow: `0 0 16px ${glow}` }}
                >
                  <span className="text-xl font-black text-white leading-none">{feedback[key].score}</span>
                  <span className="text-[9px] text-white/70 font-bold">/ 10</span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className="w-4 h-4" style={{ color: glow.replace("0.35", "0.9") }} />
                    <h3 className={`text-sm font-black uppercase tracking-wider font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>
                      {label}
                    </h3>
                  </div>
                  <p className="text-sm text-slate-400 leading-relaxed">{feedback[key].comment}</p>

                  {/* score bar */}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(feedback[key].score / 10) * 100}%` }}
                        transition={{ duration: 0.8, delay: 0.3 + idx * 0.1, ease: "easeOut" }}
                        className={`h-full rounded-full bg-gradient-to-r ${grad}`}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-slate-600 shrink-0">{feedback[key].score}/10</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── STRENGTHS + IMPROVEMENTS ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200, damping: 24 }}
            className="rounded-2xl border-l-4 border-l-emerald-500 bg-white/[0.025] border border-white/[0.07] p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Award className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-emerald-400">Strengths</h3>
            </div>
            <ul className="space-y-3">
              {feedback.strengths?.map((s, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.45 + i * 0.06 }}
                  className="flex gap-3 items-start"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="text-sm text-slate-300 leading-relaxed">{s}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Improvements */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.46, type: "spring", stiffness: 200, damping: 24 }}
            className="rounded-2xl border-l-4 border-l-amber-500 bg-white/[0.025] border border-white/[0.07] p-6"
          >
            <div className="flex items-center gap-2 mb-5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <h3 className="text-sm font-black uppercase tracking-wider font-mono text-amber-400">Improvements</h3>
            </div>
            <ul className="space-y-3">
              {feedback.improvements?.map((imp, i) => (
                <motion.li
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.06 }}
                  className="flex gap-3 items-start"
                >
                  <span className="text-amber-500 font-black mt-0.5 shrink-0">›</span>
                  <span className="text-sm text-slate-300 leading-relaxed">{imp}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* ── CONTINUE BUTTON ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="pb-12"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={onNext}
            className="w-full h-14 rounded-xl font-black text-sm uppercase tracking-widest font-mono text-white flex items-center justify-center gap-3 transition-all duration-200"
            style={{
              background: "linear-gradient(135deg, #0891b2, #2563eb, #7c3aed)",
              boxShadow: "0 0 24px rgba(6,182,212,0.35)",
            }}
          >
            Next Question
            <ChevronRight className="w-5 h-5" />
          </motion.button>
        </motion.div>

      </div>
    </div>
  );
}

export default ResponseAnalysis;
