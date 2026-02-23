import { useState, useEffect, useCallback } from "react";
import ProblemStatement from "./ProblemStatement";
import api from "../../api/axios";
import { CheckCircle2, XCircle, AlertTriangle, Clock, RefreshCcw, ChevronDown, ChevronUp } from "lucide-react";

const TABS = ["Description", "Submissions"];

/* ── Status badge ── */
const statusConfig = {
  Accepted: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  "Wrong Answer": {
    icon: <XCircle className="w-3.5 h-3.5" />,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  "Compilation Error": {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  "Time Limit Exceeded": {
    icon: <Clock className="w-3.5 h-3.5" />,
    color: "text-orange-400 bg-orange-500/10 border-orange-500/20",
  },
  "Runtime Error": {
    icon: <AlertTriangle className="w-3.5 h-3.5" />,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
};

const StatusBadge = ({ status }) => {
  const cfg = statusConfig[status] ?? {
    icon: null,
    color: "text-slate-400 bg-white/5 border-white/10",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-semibold ${cfg.color}`}>
      {cfg.icon}
      {status}
    </span>
  );
};

/* ── Relative time ── */
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(dateStr).toLocaleDateString();
};

/* ── Submissions panel ── */
const SubmissionsPanel = ({ problemId }) => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/dsa/submissions?problemId=${problemId}`);
      setSubmissions(res.data.submissions || []);
    } catch {
      setError("Failed to load submissions.");
    } finally {
      setLoading(false);
    }
  }, [problemId]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  // Re-fetch when a new submission is saved
  useEffect(() => {
    const handler = () => fetchSubmissions();
    window.addEventListener("dsaSubmissionMade", handler);
    return () => {
      window.removeEventListener("dsaSubmissionMade", handler);
    };
  }, [fetchSubmissions]);

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-16 rounded-xl bg-white/[0.03] border border-white/[0.06] animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 flex flex-col items-center gap-3 text-slate-500 text-sm">
        <p>{error}</p>
        <button onClick={fetchSubmissions} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors text-xs">
          <RefreshCcw className="w-3.5 h-3.5" /> Retry
        </button>
      </div>
    );
  }

  if (!submissions.length) {
    return (
      <div className="p-6 text-center">
        <p className="text-slate-500 text-sm">No submissions yet.</p>
        <p className="text-slate-600 text-xs mt-1">Run or Submit your code to see results here.</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-2">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] uppercase tracking-widest text-slate-500">
          {submissions.length} submission{submissions.length !== 1 ? "s" : ""}
        </span>
        <button
          onClick={fetchSubmissions}
          className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
        >
          <RefreshCcw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {submissions.map((sub) => {
        const isExpanded = expandedId === sub._id;
        return (
          <div key={sub._id} className="rounded-xl border border-white/[0.06] bg-white/[0.025] overflow-hidden">
            {/* Row */}
            <button
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/[0.03] transition-colors text-left"
              onClick={() => setExpandedId(isExpanded ? null : sub._id)}
            >
              <div className="flex items-center gap-3">
                <StatusBadge status={sub.status} />
                <span className="text-xs text-slate-400 font-mono">
                  {sub.passedTestCases}/{sub.totalTestCases} tests
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-600 font-mono">{timeAgo(sub.createdAt)}</span>
                {isExpanded
                  ? <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
                  : <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                }
              </div>
            </button>

            {/* Expanded code */}
            {isExpanded && (
              <div className="border-t border-white/[0.06]">
                <div className="flex items-center justify-between px-4 py-2 bg-black/20">
                  <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">C++17</span>
                  <button
                    onClick={() => navigator.clipboard.writeText(sub.code)}
                    className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <pre className="px-4 py-3 text-xs font-mono text-slate-300 bg-black/30 overflow-x-auto whitespace-pre leading-relaxed max-h-72 overflow-y-auto">
                  {sub.code}
                </pre>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

/* ── Main component ── */
const ProblemTabs = ({ problem }) => {
  const [activeTab, setActiveTab] = useState("Description");

  return (
    <div className="h-full flex flex-col bg-[#0d0d12]">
      {/* Tab bar */}
      <div className="flex border-b border-white/[0.06] bg-black/30 backdrop-blur sticky top-0 z-10">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-semibold transition-colors ${
              activeTab === tab
                ? "border-b-2 border-cyan-400 text-cyan-300"
                : "text-slate-500 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {activeTab === "Description" && <ProblemStatement problem={problem} />}
        {activeTab === "Submissions" && <SubmissionsPanel problemId={problem._id} />}
      </div>
    </div>
  );
};

export default ProblemTabs;
