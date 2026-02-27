import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  ChevronLeft,
  TrendingUp,
  Award,
  AlertCircle,
  Filter,
  BookOpen,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Calendar,
} from "lucide-react";
import api from "../../api/axios";

/* ── score tier ── */
const TIER = (score) => {
  if (score >= 80) return { label: "Excellent",        grad: "from-emerald-400 to-teal-500",   glow: "rgba(52,211,153,0.4)",   border: "border-l-emerald-500", badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25" };
  if (score >= 60) return { label: "Good",             grad: "from-cyan-400 to-blue-500",      glow: "rgba(34,211,238,0.4)",   border: "border-l-cyan-500",    badge: "bg-cyan-500/15 text-cyan-300 border-cyan-500/25"         };
  if (score >= 40) return { label: "Fair",             grad: "from-amber-400 to-orange-500",   glow: "rgba(251,191,36,0.4)",   border: "border-l-amber-500",   badge: "bg-amber-500/15 text-amber-300 border-amber-500/25"      };
  return              { label: "Needs Work",         grad: "from-rose-400 to-red-500",       glow: "rgba(251,113,133,0.4)",  border: "border-l-rose-500",    badge: "bg-rose-500/15 text-rose-300 border-rose-500/25"         };
};

const STAR_FIELDS = [
  { key: "situation", label: "Situation", grad: "from-sky-400 to-blue-500" },
  { key: "task",      label: "Task",      grad: "from-violet-400 to-purple-500" },
  { key: "action",    label: "Action",    grad: "from-pink-400 to-rose-500" },
  { key: "result",    label: "Result",    grad: "from-emerald-400 to-teal-500" },
];

const CATEGORIES = ["Leadership", "Teamwork", "Problem-Solving", "Communication", "Conflict Resolution", "Adaptability", "Customer Focus"];

function BehavioralProgress({ onBack, onRefresh }) {
  const [responses, setResponses]           = useState([]);
  const [loading, setLoading]               = useState(true);
  const [error, setError]                   = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Leadership");
  const [expandedId, setExpandedId]         = useState(null);

  useEffect(() => { fetchResponses(); }, [selectedCategory]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchResponses = async () => {
    try {
      setLoading(true);
      setError(null);
      const url = `/behavioral/responses?category=${selectedCategory}`;
      const res = await api.get(url);
      setResponses((res.data.responses ?? []).slice(0, 9));
    } catch (err) {
      console.error("Failed to fetch responses:", err);
      setError(err.response?.data?.message || "Failed to load responses");
    } finally {
      setLoading(false);
    }
  };

  const toggle = (id) => setExpandedId(prev => prev === String(id) ? null : String(id));

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-cyan-500/30 overflow-x-hidden">

      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[100px]" />
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">

        {/* ── TOP NAV ── */}
        <div className="flex items-center justify-between">
          <motion.button
            whileHover={{ x: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-slate-500 hover:text-cyan-400 transition-colors font-mono"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </motion.button>

          <h1 className="text-sm font-black uppercase tracking-[0.25em] text-white font-mono">
            Response History
          </h1>

          <div className="w-16" />
        </div>

        {/* ── CATEGORY FILTER ── */}
        <div className="flex items-center gap-3 flex-wrap">
          <Filter className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-widest font-mono transition-all duration-200 border ${
                selectedCategory === cat
                  ? "bg-cyan-500/15 border-cyan-500/40 text-cyan-300"
                  : "bg-white/[0.03] border-white/10 text-slate-500 hover:text-slate-300 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ── STATES ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-64 gap-4">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Loading responses…</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : responses.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-64 gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-12">
            <BookOpen className="w-10 h-10 text-slate-600" />
            <p className="text-sm font-black text-slate-500 font-mono uppercase tracking-widest">No responses yet</p>
            <p className="text-xs text-slate-600 text-center">Start practicing STAR questions to see your history here.</p>
          </div>
        ) : (
          /* ── RESPONSE CARDS ── */
          <div className="space-y-4">
            {responses.slice(0, 9).map((resp, idx) => {
              const tier = TIER(resp.feedback.overallScore);
              const isOpen = expandedId === String(resp._id);

              return (
                <motion.div
                  key={resp._id}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05, type: "spring", stiffness: 220, damping: 24 }}
                  className={`rounded-2xl border-l-4 ${tier.border} bg-white/[0.025] border border-white/[0.07] overflow-hidden transition-all duration-300`}
                  style={isOpen ? { boxShadow: `0 0 30px ${tier.glow}` } : {}}
                >
                  {/* card header — clickable */}
                  <button
                    onClick={() => toggle(resp._id)}
                    className="w-full text-left px-6 py-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1.5">
                        {/* category + date */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-[10px] font-black uppercase tracking-widest font-mono px-2.5 py-1 rounded-full border ${tier.badge}`}>
                            {resp.questionData?.category || resp.category || "General"}
                          </span>
                          <span className="flex items-center gap-1 text-[10px] text-slate-600 font-mono">
                            <Calendar className="w-3 h-3" />
                            {new Date(resp.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </span>
                        </div>
                        {/* question */}
                        <p className="text-sm font-bold text-white leading-snug line-clamp-2">
                          {resp.questionData?.question || resp.questionText || "Question no longer available"}
                        </p>
                        {/* metric pills */}
                        <div className="flex gap-2 flex-wrap pt-0.5">
                          {[
                            { label: "Clarity",      val: resp.feedback.clarity.score,      grad: "from-sky-400 to-blue-500"    },
                            { label: "Impact",       val: resp.feedback.impact.score,       grad: "from-violet-400 to-purple-500"},
                            { label: "Completeness", val: resp.feedback.completeness.score, grad: "from-emerald-400 to-teal-500" },
                          ].map(m => (
                            <span key={m.label} className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                              <span className={`font-black bg-gradient-to-r ${m.grad} bg-clip-text text-transparent`}>{m.val}</span>
                              /10 {m.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* score + toggle */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className={`text-3xl font-black font-mono bg-gradient-to-r ${tier.grad} bg-clip-text text-transparent leading-none`}>
                            {resp.feedback.overallScore}
                          </p>
                          <p className="text-[10px] text-slate-600 font-mono mt-1 uppercase tracking-widest">{tier.label}</p>
                        </div>
                        <div className="text-slate-600">
                          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </button>

                  {/* expanded detail */}
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        key="expanded"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 space-y-6 border-t border-white/[0.06] pt-5">

                          {/* overall feedback */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-2">Overall Feedback</p>
                            <p className="text-sm text-slate-300 leading-relaxed">{resp.feedback.overallFeedback}</p>
                          </div>

                          {/* 3 metric comments */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                              { key: "clarity",      label: "Clarity",      icon: MessageSquare, grad: "from-sky-400 to-blue-500"     },
                              { key: "impact",       label: "Impact",       icon: TrendingUp,    grad: "from-violet-400 to-purple-500" },
                              { key: "completeness", label: "Completeness", icon: CheckCircle2,  grad: "from-emerald-400 to-teal-500"  },
                            ].map(({ key, label, icon: Icon, grad }) => (
                              <div key={key} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-4 space-y-1.5">
                                <div className="flex items-center gap-1.5">
                                  <Icon className="w-3.5 h-3.5 text-slate-600" />
                                  <span className={`text-[10px] font-black uppercase tracking-widest font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{label}</span>
                                  <span className={`ml-auto text-xs font-black font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{resp.feedback[key].score}/10</span>
                                </div>
                                <p className="text-xs text-slate-400 leading-relaxed">{resp.feedback[key].comment}</p>
                              </div>
                            ))}
                          </div>

                          {/* strengths + improvements */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-4 border-l-emerald-500 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <Award className="w-3.5 h-3.5 text-emerald-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 font-mono">Strengths</span>
                              </div>
                              <ul className="space-y-2">
                                {resp.feedback.strengths?.map((s, i) => (
                                  <li key={i} className="flex gap-2 text-xs text-slate-400">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                                    {s}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className="rounded-xl bg-white/[0.03] border border-white/[0.06] border-l-4 border-l-amber-500 p-4">
                              <div className="flex items-center gap-2 mb-3">
                                <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400 font-mono">Improvements</span>
                              </div>
                              <ul className="space-y-2">
                                {resp.feedback.improvements?.map((imp, i) => (
                                  <li key={i} className="flex gap-2 text-xs text-slate-400">
                                    <span className="text-amber-500 font-black shrink-0">›</span>
                                    {imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          {/* your STAR response */}
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono mb-3">Your Response</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {STAR_FIELDS.map(({ key, label, grad }) => (
                                <div key={key} className="rounded-xl bg-black/20 border border-white/[0.05] p-4">
                                  <span className={`text-[10px] font-black uppercase tracking-widest font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{label}</span>
                                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">{resp.response[key]}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default BehavioralProgress;
