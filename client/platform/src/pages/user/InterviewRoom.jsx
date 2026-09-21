import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Loader, Flag, AlertTriangle, ArrowLeft, BookOpen, RotateCcw, CheckCircle2, TrendingUp, UserRound, Bot,
} from "lucide-react";
import api from "../../api/axios";
import usePageTitle from "../../hooks/usePageTitle";

const MAX_ANSWER_CHARS = 4000;
const MAX_AUTO_RETRIES = 2;
const MAX_AUTO_RETRY_WAIT_S = 30;

const scoreColor = (score, max = 100) => {
  const pct = (score / max) * 100;
  return pct >= 70 ? "text-emerald-400" : pct >= 40 ? "text-amber-400" : "text-rose-400";
};
const barColor = (score10) =>
  score10 >= 7 ? "bg-emerald-400" : score10 >= 4 ? "bg-amber-400" : "bg-rose-400";

/* ─── Chat bubbles ─── */
const Bubble = ({ from, children }) => {
  const interviewer = from === "interviewer";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 ${interviewer ? "" : "flex-row-reverse"}`}
    >
      <div
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          interviewer ? "bg-gradient-to-br from-cyan-500 to-blue-600" : "bg-white/10 border border-white/15"
        }`}
      >
        {interviewer ? <Bot className="w-4 h-4 text-white" /> : <UserRound className="w-4 h-4 text-white/80" />}
      </div>
      <div
        className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm sm:text-[15px] leading-relaxed whitespace-pre-wrap break-words ${
          interviewer
            ? "bg-white/[0.06] border border-white/10 text-white/90 rounded-tl-sm"
            : "bg-cyan-500/15 border border-cyan-400/20 text-white rounded-tr-sm"
        }`}
      >
        {children}
      </div>
    </motion.div>
  );
};

const TypingIndicator = ({ label }) => (
  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
    <div className="shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm bg-white/[0.06] border border-white/10 px-4 py-3">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-white/60"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
      {label && <span className="ml-1 text-xs text-white/50">{label}</span>}
    </div>
  </motion.div>
);

/* ─── Report ─── */
const InterviewReport = ({ session }) => {
  const navigate = useNavigate();
  const { report, turns, subject } = session;

  return (
    <div className="text-white space-y-8">
      <button
        onClick={() => navigate("/interview")}
        className="flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-white/50 hover:text-white"
      >
        <ArrowLeft className="w-4 h-4" /> All interviews
      </button>

      {/* SCORE */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center gap-6">
        <div className="shrink-0">
          <div className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50 mb-1">Overall</div>
          <div className={`text-6xl font-black font-mono ${scoreColor(report.overallScore)}`}>
            {report.overallScore}
            <span className="text-xl text-white/30">/100</span>
          </div>
          <div className="mt-1 text-[11px] text-white/35">Harder questions count more</div>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight" style={{ fontFamily: "var(--font-header)" }}>
            {subject?.name} interview report
          </h1>
          <p className="text-white/70 leading-relaxed">{report.summary}</p>
        </div>
      </div>

      {/* TOPICS */}
      {report.topicBreakdown?.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">By topic · weakest first</h2>
          <div className="rounded-2xl border border-white/10 p-5 space-y-4">
            {report.topicBreakdown.map((t) => (
              <div key={t.topic} className="space-y-1.5">
                <div className="flex justify-between gap-4 text-sm">
                  <span className="text-white/85">{t.topic}</span>
                  <span className={`font-mono shrink-0 ${scoreColor(t.avgScore, 10)}`}>
                    {t.avgScore}/10
                    <span className="text-white/30"> · {t.questions}q</span>
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${t.avgScore * 10}%` }}
                    transition={{ duration: 0.6 }}
                    className={`h-full rounded-full ${barColor(t.avgScore)}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STRENGTHS / IMPROVEMENTS */}
      {(report.strengths?.length > 0 || report.improvements?.length > 0) && (
        <div className="grid gap-4 md:grid-cols-2">
          {report.strengths?.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.05] p-5 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
                <CheckCircle2 className="w-4 h-4" /> What went well
              </h3>
              <ul className="space-y-2 text-sm text-white/75 list-disc pl-5">
                {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {report.improvements?.length > 0 && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] p-5 space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-amber-300">
                <TrendingUp className="w-4 h-4" /> What to work on
              </h3>
              <ul className="space-y-2 text-sm text-white/75 list-disc pl-5">
                {report.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TRANSCRIPT */}
      <section className="space-y-3">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.25em] text-white/50">Question by question</h2>
        <div className="space-y-3">
          {turns.map((t, i) => (
            <details key={i} className="group rounded-2xl border border-white/10 bg-white/[0.02] open:bg-white/[0.04]">
              <summary className="cursor-pointer list-none flex items-start gap-4 p-4">
                <span className={`shrink-0 w-12 text-center font-mono font-bold ${scoreColor(t.evaluation.score, 10)}`}>
                  {t.evaluation.score}/10
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm text-white/90">{t.question}</span>
                  <span className="block mt-1 text-[11px] font-mono uppercase tracking-wider text-white/35">
                    {t.concept || t.topic || "General"} · {t.difficulty}
                  </span>
                </span>
              </summary>
              <div className="px-4 pb-4 sm:pl-20 space-y-3 text-sm">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-white/40 mb-1">Your answer</div>
                  <p className="text-white/70 whitespace-pre-wrap break-words">{t.answer}</p>
                </div>
                {t.evaluation.covered?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400/70 mb-1">Covered</div>
                    <ul className="list-disc pl-5 text-white/70 space-y-0.5">
                      {t.evaluation.covered.map((c, j) => <li key={j}>{c}</li>)}
                    </ul>
                  </div>
                )}
                {t.evaluation.missed?.length > 0 && (
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-amber-400/70 mb-1">Missed</div>
                    <ul className="list-disc pl-5 text-white/70 space-y-0.5">
                      {t.evaluation.missed.map((m, j) => <li key={j}>{m}</li>)}
                    </ul>
                  </div>
                )}
                {t.referenceAnswer && (
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-sky-400/70 mb-1">Reference answer</div>
                    <p className="text-white/70 leading-relaxed">{t.referenceAnswer}</p>
                  </div>
                )}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* ACTIONS */}
      <div className="flex flex-col sm:flex-row gap-3">
        {subject?._id && (
          <button
            onClick={() => navigate(`/dashboard/subject/${subject._id}`)}
            className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 px-5 py-3 text-sm font-semibold hover:opacity-90"
          >
            <BookOpen className="w-4 h-4" /> Practice {subject.name} MCQs
          </button>
        )}
        <button
          onClick={() => navigate("/interview")}
          className="flex items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold hover:bg-white/5"
        >
          <RotateCcw className="w-4 h-4" /> New interview
        </button>
      </div>
    </div>
  );
};

/* ─── Page ─── */
function InterviewRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [draft, setDraft] = useState("");
  const [pendingAnswer, setPendingAnswer] = useState(null);
  const [sending, setSending] = useState(false);
  const [ending, setEnding] = useState(false);
  const [error, setError] = useState("");
  const [waitNotice, setWaitNotice] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  usePageTitle(session?.subject?.name ? `${session.subject.name} Interview` : "Interview");

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/interview/${id}`);
        setSession(data);
      } catch (err) {
        setLoadError(err.response?.status === 404 ? "This interview doesn't exist." : "Couldn't load the interview.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [session, pendingAnswer]);

  useEffect(() => {
    if (!sending) inputRef.current?.focus();
  }, [sending, session]);

  const submit = async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setError("");
    setSending(true);
    setPendingAnswer(text);
    setDraft("");
    try {
      // A busy interviewer (rate-limited AI) says how long to wait: wait it out
      // a couple of times behind the typing indicator instead of erroring.
      for (let attempt = 0; ; attempt++) {
        try {
          const { data } = await api.post(`/interview/${id}/answer`, { answer: text });
          setSession(data);
          break;
        } catch (err) {
          const wait = err.response?.status === 503 ? err.response.data?.retryAfter : null;
          if (!wait || wait > MAX_AUTO_RETRY_WAIT_S || attempt >= MAX_AUTO_RETRIES) throw err;
          setWaitNotice("The interviewer is taking a moment…");
          await new Promise((resolve) => setTimeout(resolve, wait * 1000));
          setWaitNotice("");
        }
      }
    } catch (err) {
      setDraft(text); // keep their answer so they can resend it
      setError(err.response?.data?.message || "Couldn't send your answer. Please try again.");
    } finally {
      setPendingAnswer(null);
      setSending(false);
    }
  };

  const endEarly = async () => {
    const msg = session.answeredCount
      ? "End the interview now? You'll get a report on the questions you've answered so far."
      : "End the interview now? You haven't answered any questions, so there won't be a report.";
    if (!window.confirm(msg)) return;
    setEnding(true);
    setError("");
    try {
      const { data } = await api.post(`/interview/${id}/end`);
      if (data.status === "abandoned") navigate("/interview");
      else setSession(data);
    } catch (err) {
      setError(err.response?.data?.message || "Couldn't end the interview. Please try again.");
    } finally {
      setEnding(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-white/50">
        <Loader className="w-5 h-5 animate-spin" /> Loading interview…
      </div>
    );
  }

  if (loadError || !session) {
    return (
      <div className="py-24 text-center text-white space-y-4">
        <p className="text-white/60">{loadError || "Couldn't load the interview."}</p>
        <button onClick={() => navigate("/interview")} className="text-cyan-400 text-sm hover:underline">
          Back to Interview Mode
        </button>
      </div>
    );
  }

  if (session.status === "completed") return <InterviewReport session={session} />;

  if (session.status === "abandoned") {
    return (
      <div className="py-24 text-center text-white space-y-4">
        <p className="text-white/60">This interview was ended before any questions were answered.</p>
        <button onClick={() => navigate("/interview")} className="text-cyan-400 text-sm hover:underline">
          Start a new interview
        </button>
      </div>
    );
  }

  const questionNumber = Math.min(session.answeredCount + 1, session.questionLimit);
  const isLastQuestion = session.answeredCount + 1 >= session.questionLimit;

  return (
    <div className="text-white flex flex-col h-[calc(100vh-4rem-3rem)] sm:h-[calc(100vh-4rem-4rem)]">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="min-w-0">
          <div className="font-bold tracking-tight truncate" style={{ fontFamily: "var(--font-header)" }}>
            {session.subject?.name} interview
          </div>
          <div className="text-xs font-mono text-white/50">
            Question {questionNumber} of {session.questionLimit}
          </div>
        </div>
        <button
          onClick={endEarly}
          disabled={sending || ending}
          className="flex items-center gap-2 shrink-0 rounded-lg border border-white/15 px-3 py-2 text-xs font-mono uppercase tracking-wider text-white/70 hover:text-white hover:border-white/30 disabled:opacity-40"
        >
          {ending ? <Loader className="w-3.5 h-3.5 animate-spin" /> : <Flag className="w-3.5 h-3.5" />}
          End
        </button>
      </div>
      <div className="h-1 bg-white/5">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
          animate={{ width: `${(session.answeredCount / session.questionLimit) * 100}%` }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto py-6 space-y-5 pr-1">
        {session.turns.map((t, i) => (
          <div key={i} className="space-y-5">
            <Bubble from="interviewer">{t.question}</Bubble>
            {t.answer && <Bubble from="candidate">{t.answer}</Bubble>}
          </div>
        ))}
        <AnimatePresence>
          {pendingAnswer && <Bubble from="candidate">{pendingAnswer}</Bubble>}
          {sending && (
            <TypingIndicator label={waitNotice || (isLastQuestion ? "Wrapping up and preparing your report…" : "")} />
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div className="pt-3 border-t border-white/10 space-y-2">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            {error}
          </div>
        )}
        <div className="flex items-end gap-3">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value.slice(0, MAX_ANSWER_CHARS))}
            onKeyDown={onKeyDown}
            disabled={sending || ending}
            rows={3}
            placeholder="Type your answer… (Enter to send, Shift+Enter for a new line)"
            className="flex-1 resize-none rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-400/50 disabled:opacity-50"
          />
          <button
            onClick={submit}
            disabled={!draft.trim() || sending || ending}
            className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center disabled:opacity-30 hover:opacity-90"
            aria-label="Send answer"
          >
            {sending ? <Loader className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
        <div className="text-right text-[10px] font-mono text-white/30">
          {draft.length}/{MAX_ANSWER_CHARS}
        </div>
      </div>
    </div>
  );
}

export default InterviewRoom;
