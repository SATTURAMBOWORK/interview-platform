import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MessagesSquare, ArrowRight, Loader, PlayCircle, AlertTriangle, Clock } from "lucide-react";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

const scoreColor = (score) =>
  score >= 70 ? "text-emerald-400" : score >= 40 ? "text-amber-400" : "text-rose-400";

const formatDate = (d) =>
  new Date(d).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });

function InterviewLobby() {
  usePageTitle("Interview Mode");
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [history, setHistory] = useState([]);
  const [progress, setProgress] = useState({});
  const [loading, setLoading] = useState(true);
  const [startingId, setStartingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [subjectsRes, historyRes] = await Promise.all([
          api.get("/subjects"),
          api.get("/interview/history"),
        ]);
        setSubjects(Array.isArray(subjectsRes.data) ? subjectsRes.data : []);
        setHistory(Array.isArray(historyRes.data) ? historyRes.data : []);
      } catch {
        setError("Couldn't load interview data. Please refresh.");
      } finally {
        setLoading(false);
      }
    };
    load();

    // Progress is extra: the lobby works without it
    api
      .get("/interview/mastery")
      .then(({ data }) => {
        if (Array.isArray(data)) setProgress(Object.fromEntries(data.map((p) => [p.subjectId, p])));
      })
      .catch(() => {});
  }, []);

  const active = history.find((h) => h.status === "in_progress");
  const past = history.filter((h) => h.status === "completed");

  const startInterview = async (subject) => {
    if (active && !window.confirm(`You have an unfinished ${active.subject?.name} interview. Starting a new one will discard it. Continue?`)) {
      return;
    }
    setError("");
    setStartingId(subject._id);
    try {
      const { data } = await api.post("/interview/start", { subjectId: subject._id });
      navigate(`/interview/${data.id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't start the interview. Please try again.");
      setStartingId(null);
    }
  };

  return (
    <div className="text-white space-y-10">
      {/* HEADER */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <MessagesSquare className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ fontFamily: "var(--font-header)" }}>
            Interview <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Mode</span>
          </h1>
        </div>
        <p className="text-white/60 max-w-2xl text-sm sm:text-base">
          A live technical interview on a core subject. The interviewer adapts to your answers — digging deeper when
          you're strong, probing gaps when you're not. Like a real interview, you get no scores until it's over.
          Across interviews it skips concepts you've mastered and brings back the ones you struggled with.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {/* RESUME */}
      {active && (
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => navigate(`/interview/${active.id}`)}
          className="w-full flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/30 bg-cyan-500/10 px-5 py-4 text-left hover:border-cyan-400/60 transition-colors"
        >
          <div className="flex items-center gap-3">
            <PlayCircle className="w-6 h-6 text-cyan-400 shrink-0" />
            <div>
              <div className="font-semibold">Resume your {active.subject?.name} interview</div>
              <div className="text-xs text-white/50 font-mono">
                {active.answeredCount} of {active.questionLimit} questions answered
              </div>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 text-cyan-400" />
        </motion.button>
      )}

      {/* SUBJECTS */}
      <section className="space-y-4">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">Choose a subject</h2>
        {loading ? (
          <div className="flex items-center gap-2 text-white/50 text-sm">
            <Loader className="w-4 h-4 animate-spin" /> Loading subjects…
          </div>
        ) : subjects.length === 0 ? (
          <p className="text-white/50 text-sm">No subjects available yet.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {subjects.map((subject, i) => {
              const starting = startingId === subject._id;
              const p = progress[subject._id];
              return (
                <motion.button
                  key={subject._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -3 }}
                  disabled={!!startingId}
                  onClick={() => startInterview(subject)}
                  className="group relative text-left rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-cyan-400/40 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="text-lg font-bold tracking-tight mb-4" style={{ fontFamily: "var(--font-header)" }}>
                    {subject.name}
                  </div>
                  {p && (
                    <div className="mb-5 space-y-2" title={p.weakest.length ? `Weakest: ${p.weakest.map((w) => w.concept).join(", ")}` : undefined}>
                      <div className="h-1.5 rounded-full bg-white/10 overflow-hidden flex">
                        <div className="bg-emerald-400" style={{ width: `${(p.mastered / p.total) * 100}%` }} />
                        <div className="bg-cyan-400/60" style={{ width: `${((p.seen - p.mastered - p.weak) / p.total) * 100}%` }} />
                        <div className="bg-rose-400/70" style={{ width: `${(p.weak / p.total) * 100}%` }} />
                      </div>
                      <div className="text-[11px] font-mono text-white/45">
                        {p.seen}/{p.total} concepts · <span className="text-emerald-400/80">{p.mastered} mastered</span>
                        {p.weak > 0 && <> · <span className="text-rose-400/80">{p.weak} to revisit</span></>}
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-400">
                    {starting ? (
                      <>
                        <Loader className="w-3.5 h-3.5 animate-spin" /> Preparing…
                      </>
                    ) : (
                      <>
                        Start interview
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      {/* HISTORY */}
      {past.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">Past interviews</h2>
          <div className="rounded-2xl border border-white/10 divide-y divide-white/5 overflow-hidden">
            {past.map((h) => (
              <button
                key={h.id}
                onClick={() => navigate(`/interview/${h.id}`)}
                className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left hover:bg-white/[0.04] transition-colors"
              >
                <div className="min-w-0">
                  <div className="font-medium truncate">{h.subject?.name || "Deleted subject"}</div>
                  <div className="flex items-center gap-1.5 text-xs text-white/40 font-mono">
                    <Clock className="w-3 h-3" />
                    {formatDate(h.completedAt || h.createdAt)} · {h.answeredCount} questions
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xl font-black font-mono ${scoreColor(h.overallScore)}`}>
                    {h.overallScore}
                    <span className="text-xs text-white/30">/100</span>
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/30" />
                </div>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default InterviewLobby;
