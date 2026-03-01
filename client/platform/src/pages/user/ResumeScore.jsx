import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Clipboard, CheckCircle2, XCircle,
  AlertCircle, Loader2, ChevronDown, ChevronUp,
  Target, Zap, Sparkles, RefreshCw, Brain, ArrowLeft
} from "lucide-react";
import api from "../../api/axios";

/* ─────────────────────────────────── helpers ───── */
const scoreColor = (s) => {
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-yellow-400";
  if (s >= 40) return "text-orange-400";
  return "text-red-400";
};
const scoreGlow = (s) => {
  if (s >= 80) return "rgba(16,185,129,0.5)";
  if (s >= 60) return "rgba(234,179,8,0.5)";
  if (s >= 40) return "rgba(249,115,22,0.5)";
  return "rgba(239,68,68,0.5)";
};
const scoreStroke = (s) => {
  if (s >= 80) return "#10b981";
  if (s >= 60) return "#eab308";
  if (s >= 40) return "#f97316";
  return "#ef4444";
};
const barGradient = (s) => {
  if (s >= 80) return "from-emerald-500 to-emerald-400";
  if (s >= 60) return "from-yellow-500 to-yellow-400";
  if (s >= 40) return "from-orange-500 to-orange-400";
  return "from-red-500 to-red-400";
};
const verdictConfig = (v) => {
  const map = {
    "Strong Match":  { bg: "bg-emerald-500/15", border: "border-emerald-500/40", text: "text-emerald-400", dot: "bg-emerald-400" },
    "Good Match":    { bg: "bg-cyan-500/15",    border: "border-cyan-500/40",    text: "text-cyan-400",    dot: "bg-cyan-400"    },
    "Partial Match": { bg: "bg-yellow-500/15",  border: "border-yellow-500/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
    "Weak Match":    { bg: "bg-red-500/15",      border: "border-red-500/40",     text: "text-red-400",     dot: "bg-red-400"     },
  };
  return map[v] || { bg: "bg-white/10", border: "border-white/20", text: "text-white/60", dot: "bg-white/40" };
};

/* ─────────────────────────────────── ScoreRing ── */
const ScoreRing = ({ score }) => {
  const r = 56;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div
      className="relative flex items-center justify-center w-40 h-40 mx-auto"
      style={{ filter: `drop-shadow(0 0 18px ${scoreGlow(score)})` }}
    >
      <svg className="w-full h-full -rotate-90" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <motion.circle
          cx="66" cy="66" r={r} fill="none"
          stroke={scoreStroke(score)}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.2 }}
        />
      </svg>
      <div className="absolute flex flex-col items-center select-none">
        <motion.span
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.7, type: "spring", stiffness: 200 }}
          className={`text-4xl font-black leading-none ${scoreColor(score)}`}
        >
          {score}
        </motion.span>
        <span className="text-[9px] text-white/30 font-mono uppercase tracking-[0.2em] mt-1">ATS Score</span>
      </div>
    </div>
  );
};

/* ─────────────────────────────────── SectionBar ─ */
const SectionBar = ({ label, score, comment, delay = 0 }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1.5">
      <button type="button" onClick={() => setOpen((p) => !p)} className="w-full flex items-center gap-3 group">
        <span className="text-[11px] text-white/50 font-mono w-24 text-left capitalize shrink-0 group-hover:text-white/80 transition-colors">
          {label}
        </span>
        <div className="flex-1 h-1.5 rounded-full bg-white/8 overflow-hidden">
          <motion.div
            className={`h-full rounded-full bg-gradient-to-r ${barGradient(score)}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut", delay }}
          />
        </div>
        <span className={`text-[11px] font-black font-mono w-8 text-right tabular-nums ${scoreColor(score)}`}>{score}</span>
        <span className="text-white/20 group-hover:text-white/50 transition-colors">
          {open ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-white/40 pl-[108px] leading-relaxed pb-1"
          >
            {comment}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─────────────────────────────────── Main Page ── */
export default function ResumeScore() {
  const [inputMode, setInputMode] = useState("paste");
  const [resumeText, setResumeText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file?.type === "application/pdf") { setPdfFile(file); setError(""); }
    else setError("Please upload a valid PDF file.");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") { setPdfFile(file); setError(""); }
    else setError("Only PDF files are supported.");
  };

  const handleAnalyze = async () => {
    setError("");
    setResult(null);
    if (!jobDescription.trim() || jobDescription.trim().length < 30)
      return setError("Paste a job description (at least 30 characters).");
    if (inputMode === "paste" && resumeText.trim().length < 50)
      return setError("Paste your resume text (at least 50 characters).");
    if (inputMode === "upload" && !pdfFile)
      return setError("Please upload a PDF resume.");

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription.trim());
      if (inputMode === "upload") formData.append("resume", pdfFile);
      else formData.append("resumeText", resumeText.trim());
      const { data } = await api.post("/resume/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setResult(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setResult(null); setResumeText(""); setPdfFile(null);
    setJobDescription(""); setError("");
  };

  const vc = result ? verdictConfig(result.verdict) : null;

  return (
    <div className="min-h-screen bg-[#0a0a16] text-white relative overflow-x-hidden selection:bg-cyan-500/30">

      {/* ── Background Blobs ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-25 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-cyan-600 rounded-full blur-[130px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-700 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: "1.2s" }} />
      </div>

      {/* ── Grid Overlay ── */}
      <div className="fixed inset-0 -z-10 opacity-[0.12] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="rsg" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.5)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#rsg)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* ── Header ── */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/20 text-[10px] font-black tracking-widest text-cyan-400 uppercase font-mono">
            <Brain className="w-3.5 h-3.5" /> AI-Powered ATS Analyzer
          </div>
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                Resume<br />
                <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(6,182,212,0.4)]">
                  Scanner
                </span>
              </h1>
              <p className="mt-3 text-white/30 text-sm max-w-sm">
                Upload or paste your resume + a job description. Get your ATS compatibility score instantly.
              </p>
            </div>
            {result && (
              <motion.button
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button"
                onClick={reset}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 hover:text-cyan-400 text-white/60 text-xs font-mono uppercase tracking-widest transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New Scan
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* ══════════════════════ INPUT SECTION ════════════════════════ */}
        <AnimatePresence mode="wait">
          {!result && (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.35 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {/* ── Left: Resume Panel ── */}
              <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 space-y-4 hover:border-cyan-500/30 transition-all duration-300">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                        <FileText className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70 font-mono">Your Resume</span>
                    </div>
                    {/* Mode Toggle */}
                    <div className="flex gap-0.5 p-1 rounded-lg bg-white/5 border border-white/8">
                      {[{ k: "paste", Icon: Clipboard, label: "Text" }, { k: "upload", Icon: Upload, label: "PDF" }].map(({ k, Icon, label }) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => { setInputMode(k); setError(""); }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-mono font-black uppercase tracking-wider transition-all ${
                            inputMode === k
                              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                              : "text-white/30 hover:text-white/60"
                          }`}
                        >
                          <Icon className="w-3 h-3" /> {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <AnimatePresence mode="wait">
                    {inputMode === "paste" ? (
                      <motion.div key="paste" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <textarea
                          value={resumeText}
                          onChange={(e) => setResumeText(e.target.value)}
                          placeholder="Paste your full resume content here..."
                          rows={13}
                          className="w-full rounded-xl bg-black/20 border border-white/8 px-4 py-3 text-sm text-white/75 placeholder-white/15 font-mono resize-none focus:outline-none focus:border-cyan-500/50 focus:bg-black/30 transition-all"
                        />
                        {resumeText && (
                          <p className="mt-1.5 text-[10px] text-white/20 font-mono text-right">{resumeText.length} chars</p>
                        )}
                      </motion.div>
                    ) : (
                      <motion.div
                        key="upload"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onDrop={handleDrop}
                        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                        onDragLeave={() => setIsDragging(false)}
                        onClick={() => fileRef.current?.click()}
                        className={`flex flex-col items-center justify-center gap-4 h-52 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
                          isDragging
                            ? "border-cyan-400 bg-cyan-500/10 scale-[1.01]"
                            : pdfFile
                            ? "border-emerald-500/50 bg-emerald-500/5"
                            : "border-white/10 bg-black/20 hover:border-cyan-500/40 hover:bg-cyan-500/5"
                        }`}
                      >
                        <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                        {pdfFile ? (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                              <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div className="text-center">
                              <p className="text-sm font-semibold text-emerald-400 font-mono">{pdfFile.name}</p>
                              <p className="text-xs text-white/25 mt-1">{(pdfFile.size / 1024).toFixed(1)} KB · PDF</p>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}
                              className="text-[10px] text-white/30 hover:text-red-400 font-mono transition-colors"
                            >
                              × Remove
                            </button>
                          </>
                        ) : (
                          <>
                            <div className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${isDragging ? "bg-cyan-500/20 border-cyan-400" : "bg-white/5 border-white/10"}`}>
                              <Upload className={`w-6 h-6 transition-colors ${isDragging ? "text-cyan-400" : "text-white/20"}`} />
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-white/40 font-medium">Drop your PDF here</p>
                              <p className="text-xs text-white/20 mt-0.5">or click to browse · max 5 MB</p>
                            </div>
                          </>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* ── Right: JD Panel ── */}
              <div className="group relative rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-5 hover:border-violet-500/30 transition-all duration-300">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-violet-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                <div className="relative">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Zap className="w-4 h-4 text-violet-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em] text-white/70 font-mono">Job Description</span>
                  </div>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the complete job description here..."
                    rows={16}
                    className="w-full rounded-xl bg-black/20 border border-white/8 px-4 py-3 text-sm text-white/75 placeholder-white/15 font-mono resize-none focus:outline-none focus:border-violet-500/50 focus:bg-black/30 transition-all"
                  />
                  {jobDescription && (
                    <p className="mt-1.5 text-[10px] text-white/20 font-mono text-right">{jobDescription.length} chars</p>
                  )}
                </div>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="md:col-span-2 flex items-center gap-3 text-red-400 text-sm bg-red-500/8 border border-red-500/20 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}

              {/* Analyze Button */}
              <div className="md:col-span-2 flex justify-center pt-2">
                <motion.button
                  whileHover={{ scale: loading ? 1 : 1.04, boxShadow: loading ? "none" : "0 0 40px rgba(6,182,212,0.35)" }}
                  whileTap={{ scale: loading ? 1 : 0.97 }}
                  type="button"
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="relative flex items-center gap-3 px-12 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-600 text-white font-black text-sm tracking-wider uppercase disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                >
                  {!loading && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent"
                      animate={{ x: ["-100%", "200%"] }}
                      transition={{ duration: 2, repeat: Infinity, repeatDelay: 1, ease: "easeInOut" }}
                    />
                  )}
                  <span className="relative flex items-center gap-2.5">
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Scanning with AI...</>
                    ) : (
                      <><Target className="w-4 h-4" /> Analyze Resume</>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* ══════════════════════ RESULTS SECTION ══════════════════════ */}
          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-5"
            >
              {/* Score + Verdict + Summary + Section Bars */}
              <div className="grid md:grid-cols-3 gap-5">
                {/* Score Card */}
                <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 flex flex-col items-center justify-center gap-5">
                  <div
                    className="absolute inset-0 opacity-10 pointer-events-none"
                    style={{ background: `radial-gradient(circle at 50% 40%, ${scoreGlow(result.overallScore)}, transparent 70%)` }}
                  />
                  <ScoreRing score={result.overallScore} />
                  {vc && (
                    <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border ${vc.bg} ${vc.border}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${vc.dot} animate-pulse`} />
                      <span className={`text-xs font-black font-mono tracking-wide ${vc.text}`}>{result.verdict}</span>
                    </div>
                  )}
                </div>

                {/* Summary + Section Bars */}
                <div className="md:col-span-2 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-md p-6 space-y-5">
                  <div className="flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-white/55 leading-relaxed">{result.summary}</p>
                  </div>
                  <div className="h-px bg-white/[0.06]" />
                  <div className="space-y-3.5">
                    {Object.entries(result.sections || {}).map(([key, val], i) => (
                      <SectionBar key={key} label={key} score={val.score} comment={val.comment} delay={i * 0.1} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Keywords Row */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-emerald-400">Matched Keywords</span>
                    <span className="ml-auto text-[10px] font-mono text-emerald-400/50">{(result.keywordsMatched || []).length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(result.keywordsMatched || []).map((kw, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-mono"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.04] p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-red-400">Missing Keywords</span>
                    <span className="ml-auto text-[10px] font-mono text-red-400/50">{(result.keywordsMissing || []).length}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(result.keywordsMissing || []).map((kw, i) => (
                      <motion.span
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/25 text-red-300 text-xs font-mono"
                      >
                        {kw}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Strengths + Improvements */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/[0.03] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-cyan-400 to-blue-500" />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-cyan-400">Strengths</span>
                  </div>
                  <ul className="space-y-2.5">
                    {(result.strengths || []).map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-2.5 text-sm text-white/55 leading-relaxed"
                      >
                        <span className="text-cyan-400 font-black shrink-0 mt-0.5">✓</span> {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-orange-500/20 bg-orange-500/[0.03] p-5 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-4 rounded-full bg-gradient-to-b from-orange-400 to-red-500" />
                    <span className="text-[10px] font-black font-mono uppercase tracking-[0.2em] text-orange-400">Action Items</span>
                  </div>
                  <ul className="space-y-2.5">
                    {(result.improvements || []).map((s, i) => (
                      <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.08 }}
                        className="flex gap-2.5 text-sm text-white/55 leading-relaxed"
                      >
                        <span className="text-orange-400 font-black shrink-0 mt-0.5">→</span> {s}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Footer Reset */}
              <div className="flex items-center justify-center pt-4">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={reset}
                  className="mx-6 flex items-center gap-2 px-6 py-2.5 rounded-xl border border-white/10 bg-white/[0.03] hover:border-cyan-400/30 hover:text-cyan-400 text-white/40 text-xs font-mono uppercase tracking-widest transition-all"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Scan Another Resume
                </motion.button>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <div className="flex flex-col items-center gap-3 py-8 opacity-40">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[9px] font-mono tracking-[0.3em] uppercase">
            © 2026 InterviewPrep · Resume Scanner · Powered by Groq AI
          </p>
        </div>
      </div>
    </div>
  );
}
