import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Clipboard, CheckCircle, XCircle,
  AlertCircle, Loader2, ChevronDown, ChevronUp, Target, Zap
} from "lucide-react";
import api from "../../api/axios";

/* ─── helpers ─── */
const scoreColor = (s) => {
  if (s >= 80) return "text-emerald-400";
  if (s >= 60) return "text-yellow-400";
  if (s >= 40) return "text-orange-400";
  return "text-red-400";
};
const scoreBar = (s) => {
  if (s >= 80) return "bg-emerald-500";
  if (s >= 60) return "bg-yellow-500";
  if (s >= 40) return "bg-orange-500";
  return "bg-red-500";
};
const verdictStyle = (v) => {
  const map = {
    "Strong Match": "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
    "Good Match": "bg-cyan-500/20 text-cyan-400 border-cyan-500/40",
    "Partial Match": "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",
    "Weak Match": "bg-red-500/20 text-red-400 border-red-500/40",
  };
  return map[v] || "bg-white/10 text-white/70 border-white/20";
};

/* ─── Circular Score Ring ─── */
const ScoreRing = ({ score }) => {
  const r = 54;
  const circumference = 2 * Math.PI * r;
  const dash = (score / 100) * circumference;
  return (
    <div className="relative flex items-center justify-center w-36 h-36 mx-auto">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
        <circle cx="64" cy="64" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
        <motion.circle
          cx="64" cy="64" r={r} fill="none"
          stroke={score >= 80 ? "#10b981" : score >= 60 ? "#eab308" : score >= 40 ? "#f97316" : "#ef4444"}
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference - dash }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className={`text-3xl font-black ${scoreColor(score)}`}
        >
          {score}
        </motion.span>
        <span className="text-[10px] text-white/40 font-mono uppercase tracking-widest">ATS Score</span>
      </div>
    </div>
  );
};

/* ─── Section Score Bar ─── */
const SectionBar = ({ label, score, comment }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center gap-3 group"
      >
        <span className="text-xs text-white/60 font-mono w-24 text-left capitalize shrink-0">{label}</span>
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${scoreBar(score)}`}
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <span className={`text-xs font-bold font-mono w-8 text-right ${scoreColor(score)}`}>{score}</span>
        {open ? <ChevronUp className="w-3 h-3 text-white/30" /> : <ChevronDown className="w-3 h-3 text-white/30" />}
      </button>
      <AnimatePresence>
        {open && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="text-xs text-white/50 pl-28 pb-1"
          >
            {comment}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main Page ─── */
export default function ResumeScore() {
  const [inputMode, setInputMode] = useState("paste"); // "paste" | "upload"
  const [resumeText, setResumeText] = useState("");
  const [pdfFile, setPdfFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === "application/pdf") {
      setPdfFile(file);
      setError("");
    } else {
      setError("Please upload a valid PDF file.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type === "application/pdf") {
      setPdfFile(file);
      setError("");
    } else {
      setError("Only PDF files are supported.");
    }
  };

  const handleAnalyze = async () => {
    setError("");
    setResult(null);

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError("Paste a job description (at least 30 characters).");
      return;
    }
    if (inputMode === "paste" && resumeText.trim().length < 50) {
      setError("Paste your resume text (at least 50 characters).");
      return;
    }
    if (inputMode === "upload" && !pdfFile) {
      setError("Please upload a PDF resume.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("jobDescription", jobDescription.trim());
      if (inputMode === "upload") {
        formData.append("resume", pdfFile);
      } else {
        formData.append("resumeText", resumeText.trim());
      }

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
    setResult(null);
    setResumeText("");
    setPdfFile(null);
    setJobDescription("");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#0a0a16] text-white py-10 px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-mono uppercase tracking-widest mb-2">
            <Target className="w-3 h-3" /> ATS Resume Scorer
          </div>
          <h1 className="text-3xl font-black tracking-tight">
            Resume <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">vs Job Description</span>
          </h1>
          <p className="text-white/40 text-sm max-w-md mx-auto">
            Paste or upload your resume and a job description — get an instant ATS compatibility score powered by AI.
          </p>
        </motion.div>

        {!result ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-2 gap-6">

            {/* ── Left: Resume ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white/80 uppercase tracking-widest font-mono">Your Resume</span>
              </div>

              {/* Toggle */}
              <div className="flex gap-1 p-1 rounded-xl bg-white/5 border border-white/10 w-fit">
                {[{ k: "paste", label: "Paste Text", Icon: Clipboard }, { k: "upload", label: "Upload PDF", Icon: Upload }].map(({ k, label, Icon }) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => { setInputMode(k); setError(""); }}
                    className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${inputMode === k ? "bg-cyan-500 text-white shadow" : "text-white/40 hover:text-white/70"}`}
                  >
                    <Icon className="w-3 h-3" /> {label}
                  </button>
                ))}
              </div>

              {inputMode === "paste" ? (
                <textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your full resume content here..."
                  rows={14}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/80 placeholder-white/20 font-mono resize-none focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                />
              ) : (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  onClick={() => fileRef.current?.click()}
                  className="flex flex-col items-center justify-center gap-3 h-56 rounded-xl border-2 border-dashed border-white/10 hover:border-cyan-500/40 bg-white/5 cursor-pointer transition-all group"
                >
                  <input ref={fileRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
                  <Upload className="w-8 h-8 text-white/20 group-hover:text-cyan-400 transition-colors" />
                  {pdfFile ? (
                    <div className="text-center">
                      <p className="text-sm text-cyan-400 font-mono">{pdfFile.name}</p>
                      <p className="text-xs text-white/30 mt-1">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-white/40">Drag & drop or click to upload</p>
                      <p className="text-xs text-white/20">PDF only · max 5 MB</p>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* ── Right: JD ── */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                <span className="text-sm font-semibold text-white/80 uppercase tracking-widest font-mono">Job Description</span>
              </div>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the complete job description here..."
                rows={17}
                className="w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-sm text-white/80 placeholder-white/20 font-mono resize-none focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="md:col-span-2 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* Submit */}
            <div className="md:col-span-2 flex justify-center">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleAnalyze}
                disabled={loading}
                className="flex items-center gap-3 px-10 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-sm tracking-wide shadow-lg shadow-cyan-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with AI...</>
                ) : (
                  <><Target className="w-4 h-4" /> Analyze Resume</>
                )}
              </motion.button>
            </div>
          </motion.div>
        ) : (
          /* ─── Results ─── */
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Top cards */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Score ring */}
              <div className="md:col-span-1 rounded-2xl bg-white/5 border border-white/10 p-6 flex flex-col items-center justify-center gap-4">
                <ScoreRing score={result.overallScore} />
                <span className={`px-4 py-1 rounded-full border text-xs font-bold font-mono ${verdictStyle(result.verdict)}`}>
                  {result.verdict}
                </span>
              </div>

              {/* Summary + sections */}
              <div className="md:col-span-2 rounded-2xl bg-white/5 border border-white/10 p-6 space-y-5">
                <p className="text-sm text-white/60 leading-relaxed">{result.summary}</p>
                <div className="space-y-3">
                  {Object.entries(result.sections || {}).map(([key, val]) => (
                    <SectionBar key={key} label={key} score={val.score} comment={val.comment} />
                  ))}
                </div>
              </div>
            </div>

            {/* Keywords */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-semibold">Keywords Matched</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.keywordsMatched || []).map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">{kw}</span>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <XCircle className="w-4 h-4" />
                  <span className="text-xs font-mono uppercase tracking-widest font-semibold">Keywords Missing</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(result.keywordsMissing || []).map((kw, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">{kw}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Strengths + Improvements */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest font-semibold text-cyan-400">Strengths</span>
                <ul className="space-y-2">
                  {(result.strengths || []).map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-cyan-400 font-bold mt-0.5">✓</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-3">
                <span className="text-xs font-mono uppercase tracking-widest font-semibold text-orange-400">Improvements</span>
                <ul className="space-y-2">
                  {(result.improvements || []).map((s, i) => (
                    <li key={i} className="flex gap-2 text-sm text-white/60">
                      <span className="text-orange-400 font-bold mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Re-analyze */}
            <div className="flex justify-center pt-2">
              <button
                type="button"
                onClick={reset}
                className="px-8 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/30 text-sm font-mono transition-all"
              >
                ← Analyze Another Resume
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
