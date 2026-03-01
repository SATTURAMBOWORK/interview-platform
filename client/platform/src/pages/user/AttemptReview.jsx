import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, CheckCircle2, XCircle, AlertCircle,
  ChevronDown, ChevronUp, Code2, Terminal, Loader,
} from 'lucide-react';
import { fetchAttemptById } from '../../services/attemptService';
import usePageTitle from '../../hooks/usePageTitle';

const spring = { type: 'spring', stiffness: 300, damping: 18 };

const AttemptReview = () => {
  usePageTitle('Attempt Review');
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [fetchKey, setFetchKey]     = useState(0);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [filterType, setFilterType] = useState('all');

  const loadAttempt = useCallback(() => setFetchKey((k) => k + 1), []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setLoading(true);
    setError(null);
    fetchAttemptById(attemptId)
      .then((res) => setAttempt(res.data))
      .catch((err) => {
        console.error(err);
        setError(err?.response?.data?.message || 'Failed to load attempt.');
      })
      .finally(() => setLoading(false));
  }, [attemptId, fetchKey]);

  const answers        = useMemo(() => attempt?.answers ?? [], [attempt]);
  const correctAnswers = attempt?.correctCount   ?? 0;
  const totalQuestions = 50;
  const incorrectAnswers = answers.length - correctAnswers;
  const subjectName    = attempt?.subject?.name ?? attempt?.subject ?? '';

  const scorePercent = useMemo(
    () => Math.round((correctAnswers / 50) * 100),
    [correctAnswers]
  );

  const scoreColor = useMemo(() => {
    if (scorePercent >= 80) return { text: 'text-emerald-400', glow: 'rgba(52,211,153,0.3)',  bar: 'bg-emerald-400', border: 'border-emerald-500/30', badge: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' };
    if (scorePercent >= 60) return { text: 'text-cyan-400',    glow: 'rgba(34,211,238,0.3)',   bar: 'bg-cyan-400',    border: 'border-cyan-500/30',    badge: 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400'       };
    if (scorePercent >= 40) return { text: 'text-amber-400',   glow: 'rgba(251,191,36,0.3)',   bar: 'bg-amber-400',   border: 'border-amber-500/30',   badge: 'bg-amber-500/15 border-amber-500/40 text-amber-400'    };
    return                         { text: 'text-rose-400',    glow: 'rgba(251,113,133,0.3)',  bar: 'bg-rose-400',    border: 'border-rose-500/30',    badge: 'bg-rose-500/15 border-rose-500/40 text-rose-400'       };
  }, [scorePercent]);

  const filteredAnswers = useMemo(() => {
    if (filterType === 'correct')   return answers.filter((a) =>  a.isCorrect);
    if (filterType === 'incorrect') return answers.filter((a) => !a.isCorrect);
    return answers;
  }, [answers, filterType]);

  const toggleExpand = (id) => setExpandedIndex(expandedIndex === id ? null : id);

  /* ─────────────────────────────── LOADING ─────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a16] text-slate-300 relative overflow-x-hidden">
        {/* Ambient blobs */}
        <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        {/* Grid */}
        <div className="fixed inset-0 -z-10 opacity-[0.15] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={spring}
            className="flex flex-col items-center gap-4"
          >
            <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}>
                <Loader className="w-6 h-6 text-white" />
              </motion.div>
            </div>
            <p className="text-xs font-mono uppercase tracking-[0.35em] text-slate-500">
              Loading attempt...
            </p>
          </motion.div>
        </div>
      </div>
    );
  }

  /* ─────────────────────────────── ERROR / NOT FOUND ─────────────────────────────── */
  if (!attempt) {
    return (
      <div className="min-h-screen bg-[#0a0a16] text-slate-300 relative overflow-x-hidden flex items-center justify-center">
        <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        <div className="fixed inset-0 -z-10 opacity-[0.15] pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid2)" />
          </svg>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-10 text-center space-y-5 max-w-sm w-full mx-4 shadow-2xl"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-rose-600 via-purple-600 to-cyan-600 rounded-3xl opacity-10 blur-xl pointer-events-none" />
          <AlertCircle className="w-12 h-12 text-rose-400/60 mx-auto" />
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.35em] text-white/30 mb-1">Error</p>
            <p className="text-white/60 font-mono text-sm">{error ?? 'Attempt not found'}</p>
          </div>
          <div className="flex items-center justify-center gap-3">
            {error && (
              <motion.button
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring}
                onClick={loadAttempt}
                className="px-5 py-2.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-xs uppercase tracking-widest rounded-xl hover:bg-cyan-500/20 transition-colors"
              >
                Retry
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring}
              onClick={() => navigate('/dashboard')}
              className="px-5 py-2.5 bg-white/5 border border-white/10 text-white/40 font-mono text-xs uppercase tracking-widest rounded-xl hover:bg-white/10 hover:text-white/60 transition-colors"
            >
              Dashboard
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ─────────────────────────────── MAIN ─────────────────────────────── */
  const filterButtons = [
    { key: 'all',       label: 'All',       count: answers.length  },
    { key: 'correct',   label: 'Correct',   count: correctAnswers  },
    { key: 'incorrect', label: 'Incorrect', count: incorrectAnswers },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 relative overflow-x-hidden">

      {/* ── Ambient blobs ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* ── Grid overlay ── */}
      <div className="fixed inset-0 -z-10 opacity-[0.15] pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6,182,212,0.4)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-8">

        {/* ── Back button ── */}
        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          transition={spring}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white/40 hover:text-cyan-400 transition-colors font-mono text-xs uppercase tracking-[0.2em]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back
        </motion.button>

        {/* ── Header card ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-15 blur-xl transition-opacity duration-500 pointer-events-none" />
          <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-7 shadow-2xl">

            {/* Brand row */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_16px_rgba(6,182,212,0.5)]">
                <Code2 className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-black tracking-tight">
                <span className="text-white">Interview</span>
                <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Prep</span>
              </span>
              <span className="ml-auto text-[9px] font-mono uppercase tracking-[0.35em] text-white/25">
                Attempt Review
              </span>
            </div>

            {/* Subject name */}
            <h1 className="text-2xl font-black text-white tracking-tight leading-tight">
              {subjectName}
            </h1>

            {/* Date — only if present */}
            {attempt.createdAt && (
              <p className="text-white/30 font-mono text-xs mt-1">
                {new Date(attempt.createdAt).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}

            {/* Progress bar */}
            <div className="mt-5 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/25">Score Progress</span>
                <span className={`text-[9px] font-mono font-bold ${scoreColor.text}`}>{scorePercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${scorePercent}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                  className={`h-full rounded-full ${scoreColor.bar} shadow-[0_0_8px_currentColor]`}
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats grid ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {/* Score */}
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: `0 0 32px ${scoreColor.glow}` }}
            transition={spring}
            className={`relative group bg-white/[0.03] backdrop-blur-sm border ${scoreColor.border} rounded-2xl p-5 text-center overflow-hidden`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none`} />
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Score</p>
            <p className={`text-3xl font-black font-mono ${scoreColor.text}`}>{scorePercent}%</p>
            {attempt.score !== undefined && (
              <p className="text-white/20 text-xs font-mono mt-1">{attempt.score} pts</p>
            )}
          </motion.div>

          {/* Correct */}
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(52,211,153,0.25)' }}
            transition={spring}
            className="relative group bg-white/[0.03] backdrop-blur-sm border border-emerald-500/20 rounded-2xl p-5 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Correct</p>
            <p className="text-3xl font-black font-mono text-emerald-400">{correctAnswers}</p>
            <p className="text-white/20 text-xs font-mono mt-1">{correctAnswers} of 50</p>
          </motion.div>

          {/* Incorrect */}
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 0 32px rgba(251,113,133,0.25)' }}
            transition={spring}
            className="relative group bg-white/[0.03] backdrop-blur-sm border border-rose-500/20 rounded-2xl p-5 text-center overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
            <p className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2">Incorrect</p>
            <p className="text-3xl font-black font-mono text-rose-400">{incorrectAnswers}</p>
            <p className="text-white/20 text-xs font-mono mt-1">
              {incorrectAnswers} wrong{(50 - correctAnswers - incorrectAnswers) > 0 ? ` + ${50 - correctAnswers - incorrectAnswers} skipped` : ''}
            </p>
          </motion.div>
        </motion.div>

        {/* ── Filter buttons ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          className="flex gap-2"
        >
          {filterButtons.map(({ key, label, count }) => {
            const active = filterType === key;
            const activeCls =
              key === 'correct'   ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400' :
              key === 'incorrect' ? 'bg-rose-500/15 border-rose-500/40 text-rose-400' :
                                    'bg-cyan-500/15 border-cyan-500/40 text-cyan-400';
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring}
                onClick={() => setFilterType(key)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl border font-mono text-xs uppercase tracking-widest transition-colors ${active ? activeCls : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:bg-white/5'}`}
              >
                {label}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-md ${active ? 'bg-white/10' : 'bg-white/5'}`}>{count}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Answer cards ── */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredAnswers.map((answer, idx) => {
              const isCorrect   = answer.isCorrect;
              const answerId    = answer._id || idx;
              const isExpanded  = expandedIndex === answerId;
              const accentBorder = isCorrect ? 'border-l-emerald-500/60' : 'border-l-rose-500/60';
              const accentGlow   = isCorrect ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)';

              return (
                <motion.div
                  key={answerId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ ...spring, delay: idx * 0.04 }}
                  layout="position"
                  whileHover={{ scale: 1.005, boxShadow: `0 0 24px ${accentGlow}` }}
                  className={`bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] border-l-2 ${accentBorder} rounded-2xl overflow-hidden cursor-pointer`}
                  onClick={() => toggleExpand(answerId)}
                  role="button"
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(answerId); } }}
                >
                  {/* Question row */}
                  <div className="flex items-start gap-4 p-5">
                    <div className="flex-shrink-0 mt-0.5">
                      {isCorrect
                        ? <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        : <XCircle className="w-5 h-5 text-rose-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-white/25">Q{idx + 1}</span>
                        <span className={`text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ${isCorrect ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10'}`}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-white/80 text-sm leading-relaxed line-clamp-2 break-words">
                        {answer.mcq?.question}
                      </p>
                    </div>
                    <div className="flex-shrink-0 text-white/25 mt-0.5">
                      {isExpanded
                        ? <ChevronUp className="w-4 h-4" />
                        : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>

                  {/* Expanded options */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 pt-3 space-y-2 border-t border-white/[0.05]">
                          {answer.mcq?.options?.map((option, optIdx) => {
                            const isSelected   = optIdx === answer.selectedOption;
                            const isCorrectOpt = optIdx === answer.correctOption;

                            let cls  = 'bg-white/[0.03] border-white/10 text-white/50';
                            let icon = <div className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0 mt-0.5" />;

                            if (isCorrectOpt) {
                              cls  = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                              icon = (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ duration: 0.35 }} className="flex-shrink-0 mt-0.5">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                                </motion.div>
                              );
                            } else if (isSelected && !isCorrectOpt) {
                              cls  = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                              icon = (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ duration: 0.35 }} className="flex-shrink-0 mt-0.5">
                                  <XCircle className="w-4 h-4 text-rose-400" />
                                </motion.div>
                              );
                            }

                            return (
                              <motion.div
                                key={optIdx}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: optIdx * 0.06, ...spring }}
                                className={`flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors ${cls}`}
                              >
                                {icon}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm leading-relaxed break-words">{option}</p>
                                  {isCorrectOpt && (
                                    <p className="text-[10px] font-mono uppercase tracking-widest mt-1 text-emerald-500/70">
                                      Correct answer
                                    </p>
                                  )}
                                  {isSelected && !isCorrectOpt && (
                                    <p className="text-[10px] font-mono uppercase tracking-widest mt-1 text-rose-500/70">
                                      Your answer
                                    </p>
                                  )}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Empty state */}
          {filteredAnswers.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex items-center justify-center py-24"
            >
              <div className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-white/10 mx-auto" />
                <p className="text-white/25 font-mono text-xs uppercase tracking-[0.3em]">
                  No {filterType} questions
                </p>
                {filterType !== 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} transition={spring}
                    onClick={() => setFilterType('all')}
                    className="px-4 py-1.5 border border-white/10 text-white/35 hover:text-white/60 hover:border-white/20 font-mono text-[10px] uppercase tracking-[0.25em] rounded-lg transition-colors"
                  >
                    Clear filter
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* ── Footer ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="pt-4 border-t border-white/5 flex items-center justify-center gap-2"
        >
          <Terminal className="w-3 h-3 text-slate-600" />
          <p className="text-[10px] text-slate-600 font-mono">
            © {new Date().getFullYear()} InterviewPrep · Secure Terminal v2.0
          </p>
        </motion.div>

      </div>
    </div>
  );
};

export default AttemptReview;