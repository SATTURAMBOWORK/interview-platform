import { useEffect, useState, useContext, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ChevronLeft, Share2, Check,
  Columns2, PanelLeft, PanelRight,
  Settings, Type,
} from "lucide-react";
import axios from "../../api/axios";
import { AuthContext } from "../../context/AuthContextValue";

import ResizableSplit from "../../components/dsa/ResizableSplit";
import ProblemTabs from "../../components/dsa/ProblemTabs";
import CodeEditorPanel from "../../components/dsa/CodeEditorPanel";

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    Easy: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    Medium: "text-amber-400 bg-amber-500/10 border-amber-500/20",
    Hard: "text-red-400 bg-red-500/10 border-red-500/20",
  };
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border uppercase tracking-wider ${
        colors[difficulty] ?? "text-slate-400 bg-white/5 border-white/10"
      }`}
    >
      {difficulty}
    </span>
  );
};

const DsaSolve = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);

  // Navbar state
  const [copied, setCopied] = useState(false);
  // layout: 'split' | 'problem' | 'editor'
  const [layout, setLayout] = useState("split");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(14);
  const settingsRef = useRef(null);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const cycleLayout = () => {
    setLayout((prev) =>
      prev === "split" ? "problem" : prev === "problem" ? "editor" : "split"
    );
  };

  const layoutIcon = layout === "problem"
    ? <PanelLeft className="w-4 h-4" />
    : layout === "editor"
    ? <PanelRight className="w-4 h-4" />
    : <Columns2 className="w-4 h-4" />;

  const layoutTitle = layout === "split"
    ? "Switch to Problem view"
    : layout === "problem"
    ? "Switch to Editor view"
    : "Switch to Split view";

  // Close settings dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (settingsRef.current && !settingsRef.current.contains(e.target)) {
        setSettingsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const res = await axios.get(`/dsa/problem/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setProblem(res.data.problem);
      } catch (error) {
        console.error("Failed to load problem:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id, token]);

  if (loading) {
    return (
      <div className="h-screen flex flex-col bg-[#0a0a10] overflow-hidden">
        {/* Skeleton Header */}
        <div className="h-12 border-b border-white/5 bg-black/30 flex items-center px-4 gap-3 animate-pulse">
          <div className="w-7 h-7 rounded-md bg-white/5" />
          <div className="w-px h-4 bg-white/10" />
          <div className="w-48 h-4 rounded bg-white/5" />
          <div className="w-16 h-5 rounded-md bg-white/5 ml-2" />
        </div>
        {/* Skeleton Panels */}
        <div className="flex-1 flex gap-2 p-2">
          <div className="w-1/2 rounded-xl bg-white/[0.025] border border-white/5 animate-pulse" />
          <div className="w-1/2 rounded-xl bg-white/[0.025] border border-white/5 animate-pulse" />
        </div>
        {/* Skeleton Footer */}
        <div className="h-8 border-t border-white/5 bg-black/40 animate-pulse" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="h-screen bg-[#0a0a10] flex flex-col items-center justify-center gap-4">
        <div className="text-red-400 font-mono text-lg tracking-wider">
          404 | Problem Not Found_
        </div>
        <button
          onClick={() => navigate("/dsa")}
          className="flex items-center gap-2 px-4 py-2 text-sm text-slate-300 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Arena
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0a10] text-slate-300 overflow-hidden">
      {/* ── WORKSPACE HEADER ── */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-white/5 bg-black/40 backdrop-blur-md z-10 shrink-0">
        {/* Left: back + title + difficulty */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => navigate("/dsa")}
            className="p-1.5 hover:bg-white/5 rounded-md transition-colors text-slate-400 hover:text-white shrink-0"
            title="Back to Arena"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="w-px h-4 bg-white/10 shrink-0" />
          <h2 className="text-sm font-medium text-white truncate max-w-[260px] sm:max-w-[400px]">
            {problem.title}
          </h2>
          <DifficultyBadge difficulty={problem.difficulty} />
        </div>

        {/* Right: actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Share */}
          <button
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg transition-all ${
              copied
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20 hover:bg-cyan-500/20"
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Share2 className="w-3.5 h-3.5" />}
            {copied ? "Copied!" : "Share"}
          </button>

          {/* Layout toggle */}
          <button
            onClick={cycleLayout}
            className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-white transition-colors"
            title={layoutTitle}
          >
            {layoutIcon}
          </button>

          {/* Settings */}
          <div className="relative" ref={settingsRef}>
            <button
              onClick={() => setSettingsOpen((o) => !o)}
              className={`p-2 rounded-lg transition-colors ${
                settingsOpen
                  ? "bg-white/10 text-white"
                  : "hover:bg-white/5 text-slate-500 hover:text-slate-300"
              }`}
              title="Editor Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 top-10 w-52 bg-[#0f1623] border border-white/10 rounded-xl shadow-2xl z-50 p-3">
                <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-2 flex items-center gap-1.5">
                  <Type className="w-3 h-3" /> Font Size
                </p>
                <div className="flex gap-1.5 flex-wrap">
                  {[12, 13, 14, 15, 16, 18].map((size) => (
                    <button
                      key={size}
                      onClick={() => { setFontSize(size); setSettingsOpen(false); }}
                      className={`px-2.5 py-1 rounded-md text-xs font-mono transition-colors ${
                        fontSize === size
                          ? "bg-indigo-600 text-white"
                          : "bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 relative overflow-hidden bg-[#0d0d12]">
        {/* Ambient depth glow */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-500/5 blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-500/4 blur-[120px] pointer-events-none" />

        {layout === "split" && (
          <ResizableSplit
            left={
              <div className="h-full p-2 pl-2 pr-1">
                <div className="h-full bg-black/20 border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                  <ProblemTabs problem={problem} />
                </div>
              </div>
            }
            right={
              <div className="h-full p-2 pl-1 pr-2">
                <div className="h-full bg-black/20 border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
                  <CodeEditorPanel problemId={problem._id} problem={problem} fontSize={fontSize} />
                </div>
              </div>
            }
          />
        )}

        {layout === "problem" && (
          <div className="h-full p-2">
            <div className="h-full bg-black/20 border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
              <ProblemTabs problem={problem} />
            </div>
          </div>
        )}

        {layout === "editor" && (
          <div className="h-full p-2">
            <div className="h-full bg-black/20 border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl">
              <CodeEditorPanel problemId={problem._id} problem={problem} fontSize={fontSize} />
            </div>
          </div>
        )}
      </main>

      {/* ── STATUS FOOTER ── */}
      <footer className="h-7 border-t border-white/5 bg-black/60 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            System Ready
          </span>
          <span>UTF-8</span>
        </div>
        <div className="text-[10px] font-mono text-slate-500 tracking-wider">
          Ln 1, Col 1
        </div>
      </footer>
    </div>
  );
};

export default DsaSolve;
