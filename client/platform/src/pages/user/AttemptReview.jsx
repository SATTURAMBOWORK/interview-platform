import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { fetchAttemptById } from '../../services/attemptService';

const spring = { type: 'spring', stiffness: 300, damping: 18 };

const AttemptReview = () => {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fetchKey, setFetchKey] = useState(0);
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

  // Derived values — computed unconditionally (hooks must not be called conditionally)
  const answers = useMemo(() => attempt?.answers ?? [], [attempt]);
  const correctAnswers = attempt?.correctCount ?? 0;
  const totalQuestions = attempt?.totalQuestions ?? 0;
  const incorrectAnswers = totalQuestions - correctAnswers;
  const subjectName = attempt?.subject?.name ?? attempt?.subject ?? '';

  const scorePercent = useMemo(
    () => (totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0),
    [correctAnswers, totalQuestions]
  );

  const filteredAnswers = useMemo(() => {
    if (filterType === 'correct') return answers.filter((a) => a.isCorrect);
    if (filterType === 'incorrect') return answers.filter((a) => !a.isCorrect);
    return answers;
  }, [answers, filterType]);

  const scoreColor =
    scorePercent >= 80
      ? { text: 'text-emerald-400', glow: 'rgba(52,211,153,0.25)', border: 'border-emerald-500/30' }
      : scorePercent >= 60
      ? { text: 'text-cyan-400', glow: 'rgba(34,211,238,0.2)', border: 'border-cyan-500/30' }
      : scorePercent >= 40
      ? { text: 'text-amber-400', glow: 'rgba(251,191,36,0.2)', border: 'border-amber-500/30' }
      : { text: 'text-rose-400', glow: 'rgba(251,113,133,0.2)', border: 'border-rose-500/30' };

  const toggleExpand = (id) => setExpandedIndex(expandedIndex === id ? null : id);

  if (loading) {
    return (
      <div className='min-h-screen bg-[#0a0a16] relative overflow-x-hidden'>
        <div className='pointer-events-none fixed inset-0 overflow-hidden'>
          <div className='absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-purple-600' />
          <div className='absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl bg-cyan-500' />
        </div>
        <div className='relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-8 animate-pulse'>
          {/* Back button skeleton */}
          <div className='h-3 w-16 bg-white/[0.06] rounded-full' />
          {/* Header skeleton */}
          <div className='space-y-2'>
            <div className='h-2 w-24 bg-white/[0.06] rounded-full' />
            <div className='h-7 w-56 bg-white/[0.08] rounded-xl' />
            <div className='h-2 w-36 bg-white/[0.05] rounded-full' />
          </div>
          {/* Stats cards skeleton */}
          <div className='grid grid-cols-3 gap-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 space-y-3'>
                <div className='h-2 w-12 bg-white/[0.06] rounded-full mx-auto' />
                <div className='h-8 w-16 bg-white/[0.08] rounded-lg mx-auto' />
                <div className='h-2 w-10 bg-white/[0.05] rounded-full mx-auto' />
              </div>
            ))}
          </div>
          {/* Filter buttons skeleton */}
          <div className='flex gap-2'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='h-8 w-20 bg-white/[0.06] rounded-xl' />
            ))}
          </div>
          {/* Question cards skeleton */}
          <div className='space-y-3'>
            {[...Array(5)].map((_, i) => (
              <div key={i} className='bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 flex items-start gap-4'>
                <div className='w-5 h-5 rounded-full bg-white/[0.08] flex-shrink-0 mt-0.5' />
                <div className='flex-1 space-y-2'>
                  <div className='h-2 w-20 bg-white/[0.06] rounded-full' />
                  <div className='h-3 w-full bg-white/[0.08] rounded-lg' />
                  <div className='h-3 w-3/4 bg-white/[0.06] rounded-lg' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className='min-h-screen bg-[#0a0a16] flex items-center justify-center'>
        <div className='text-center space-y-5'>
          <AlertCircle className='w-14 h-14 text-white/20 mx-auto' />
          <p className='text-white/40 font-mono text-sm uppercase tracking-widest'>
            {error ?? 'Attempt not found'}
          </p>
          <div className='flex items-center justify-center gap-3'>
            {error && (
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                transition={spring}
                onClick={loadAttempt}
                className='px-6 py-2.5 bg-cyan-500/10 border border-cyan-500/40 text-cyan-400 font-mono text-sm rounded-xl hover:bg-cyan-500/20 transition-colors'
              >
                Retry
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={spring}
              onClick={() => navigate('/dashboard')}
              className='px-6 py-2.5 border border-white/10 text-white/40 font-mono text-sm rounded-xl hover:bg-white/5 transition-colors'
            >
              Dashboard
            </motion.button>
          </div>
        </div>
      </div>
    );
  }

  const filterButtons = [
    { key: 'all', label: 'All', count: answers.length },
    { key: 'correct', label: 'Correct', count: correctAnswers },
    { key: 'incorrect', label: 'Incorrect', count: incorrectAnswers },
  ];

  return (
    <div className='min-h-screen bg-[#0a0a16] relative overflow-x-hidden'>
      <div className='pointer-events-none fixed inset-0 overflow-hidden'>
        <div className='absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl bg-purple-600' />
        <div className='absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full opacity-8 blur-3xl bg-cyan-500' />
      </div>

      <div className='relative z-10 max-w-3xl mx-auto px-4 py-10 space-y-8'>

        <motion.button
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          transition={spring}
          onClick={() => navigate(-1)}
          className='flex items-center gap-2 text-white/40 hover:text-white/80 transition-colors font-mono text-xs uppercase tracking-[0.2em]'
        >
          <ArrowLeft className='w-3.5 h-3.5' />
          Back
        </motion.button>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.05 }}
        >
          <p className='text-[10px] font-mono uppercase tracking-[0.35em] text-white/30 mb-1'>Attempt Review</p>
          <h1 className='text-2xl font-bold text-white'>{subjectName}</h1>
          {attempt.createdAt && (
            <p className='text-white/30 font-mono text-xs mt-1'>
              {new Date(attempt.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          )}
          {/* Progress bar */}
          <div className='mt-4 space-y-1.5'>
            <div className='flex justify-between items-center'>
              <span className='text-[9px] font-mono uppercase tracking-[0.3em] text-white/25'>Progress</span>
              <span className={'text-[9px] font-mono ' + scoreColor.text}>{scorePercent}%</span>
            </div>
            <div className='h-1 w-full bg-white/[0.06] rounded-full overflow-hidden'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: scorePercent + '%' }}
                transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                className={'h-full rounded-full ' + (scorePercent >= 80 ? 'bg-emerald-400' : scorePercent >= 60 ? 'bg-cyan-400' : scorePercent >= 40 ? 'bg-amber-400' : 'bg-rose-400')}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.1 }}
          className='grid grid-cols-3 gap-3'
        >
          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px ' + scoreColor.glow }}
            transition={spring}
            className={'bg-white/[0.03] border ' + scoreColor.border + ' rounded-2xl p-5 text-center'}
          >
            <p className='text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2'>Score</p>
            <p className={'text-3xl font-bold font-mono ' + scoreColor.text}>{scorePercent}%</p>
            <p className='text-white/20 text-xs font-mono mt-1'>{attempt.score} pts</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(52,211,153,0.2)' }}
            transition={spring}
            className='bg-white/[0.03] border border-emerald-500/20 rounded-2xl p-5 text-center'
          >
            <p className='text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2'>Correct</p>
            <p className='text-3xl font-bold font-mono text-emerald-400'>{correctAnswers}</p>
            <p className='text-white/20 text-xs font-mono mt-1'>of {totalQuestions}</p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.04, boxShadow: '0 0 28px rgba(251,113,133,0.2)' }}
            transition={spring}
            className='bg-white/[0.03] border border-rose-500/20 rounded-2xl p-5 text-center'
          >
            <p className='text-[9px] font-mono uppercase tracking-[0.3em] text-white/30 mb-2'>Incorrect</p>
            <p className='text-3xl font-bold font-mono text-rose-400'>{incorrectAnswers}</p>
            <p className='text-white/20 text-xs font-mono mt-1'>of {totalQuestions}</p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...spring, delay: 0.15 }}
          className='flex gap-2'
        >
          {filterButtons.map(({ key, label, count }) => {
            const active = filterType === key;
            const activeCls = key === 'correct'
              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
              : key === 'incorrect'
              ? 'bg-rose-500/15 border-rose-500/40 text-rose-400'
              : 'bg-cyan-500/15 border-cyan-500/40 text-cyan-400';
            return (
              <motion.button
                key={key}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                transition={spring}
                onClick={() => setFilterType(key)}
                className={'flex items-center gap-1.5 px-4 py-2 rounded-xl border font-mono text-xs uppercase tracking-widest transition-colors ' + (active ? activeCls : 'bg-white/[0.03] border-white/10 text-white/40 hover:text-white/60 hover:bg-white/5')}
              >
                {label}
                <span className={'text-[10px] px-1.5 py-0.5 rounded-md ' + (active ? 'bg-white/10' : 'bg-white/5')}>{count}</span>
              </motion.button>
            );
          })}
        </motion.div>

        <div className='space-y-3'>
          <AnimatePresence mode='popLayout'>
            {filteredAnswers.map((answer, idx) => {
              const isCorrect = answer.isCorrect;
              const answerId = answer._id || idx;
              const isExpanded = expandedIndex === answerId;
              const accentBorder = isCorrect ? 'border-l-emerald-500/60' : 'border-l-rose-500/60';
              const accentGlow = isCorrect ? 'rgba(52,211,153,0.12)' : 'rgba(251,113,133,0.12)';
              return (
                <motion.div
                  key={answerId}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ ...spring, delay: idx * 0.04 }}
                  layout='position'
                  whileHover={{ scale: 1.005, boxShadow: '0 0 20px ' + accentGlow }}
                  className={'bg-white/[0.03] border border-white/[0.07] border-l-2 ' + accentBorder + ' rounded-2xl overflow-hidden cursor-pointer'}
                  onClick={() => toggleExpand(answerId)}
                  role='button'
                  tabIndex={0}
                  aria-expanded={isExpanded}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleExpand(answerId); } }}
                >
                  <div className='flex items-start gap-4 p-5'>
                    <div className='flex-shrink-0 mt-0.5'>
                      {isCorrect ? <CheckCircle2 className='w-5 h-5 text-emerald-400' /> : <XCircle className='w-5 h-5 text-rose-400' />}
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex items-center gap-2 mb-1.5'>
                        <span className='text-[9px] font-mono uppercase tracking-[0.3em] text-white/25'>Q{idx + 1}</span>
                        <span className={'text-[9px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full border ' + (isCorrect ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' : 'text-rose-400 border-rose-500/30 bg-rose-500/10')}>
                          {isCorrect ? 'Correct' : 'Incorrect'}
                        </span>
                      </div>
                      <p className='text-white/80 text-sm leading-relaxed line-clamp-2 break-words'>{answer.mcq?.question}</p>
                    </div>
                    <div className='flex-shrink-0 text-white/20'>
                      {isExpanded ? <ChevronUp className='w-4 h-4' /> : <ChevronDown className='w-4 h-4' />}
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className='overflow-hidden'
                      >
                        <div className='px-5 pb-5 pt-1 space-y-2 border-t border-white/[0.05]'>
                          {answer.mcq?.options?.map((option, optIdx) => {
                            const isSelected = optIdx === answer.selectedOption;
                            const isCorrectOpt = optIdx === answer.correctOption;
                            let cls = 'bg-white/[0.03] border-white/10 text-white/50';
                            let icon = <div className='w-4 h-4 rounded-full border border-white/20 flex-shrink-0 mt-0.5' />;
                            if (isCorrectOpt) {
                              cls = 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300';
                              icon = (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ duration: 0.35, ease: 'easeOut' }} className='flex-shrink-0 mt-0.5'>
                                  <CheckCircle2 className='w-4 h-4 text-emerald-400' />
                                </motion.div>
                              );
                            } else if (isSelected && !isCorrectOpt) {
                              cls = 'bg-rose-500/10 border-rose-500/40 text-rose-300';
                              icon = (
                                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.25, 1] }} transition={{ duration: 0.35, ease: 'easeOut' }} className='flex-shrink-0 mt-0.5'>
                                  <XCircle className='w-4 h-4 text-rose-400' />
                                </motion.div>
                              );
                            }
                            return (
                              <motion.div
                                key={optIdx}
                                initial={{ opacity: 0, x: -12 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: optIdx * 0.06, ...spring }}
                                className={'flex items-start gap-3 px-4 py-3 rounded-xl border transition-colors ' + cls}
                              >
                                {icon}
                                <div className='flex-1 min-w-0'>
                                  <p className='text-sm leading-relaxed break-words'>{option}</p>
                                  {isCorrectOpt && <p className='text-[10px] font-mono uppercase tracking-widest mt-1 text-emerald-500/70'>Correct answer</p>}
                                  {isSelected && !isCorrectOpt && <p className='text-[10px] font-mono uppercase tracking-widest mt-1 text-rose-500/70'>Your answer</p>}
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

          {filteredAnswers.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex items-center justify-center py-24'>
              <div className='text-center space-y-4'>
                <AlertCircle className='w-12 h-12 text-white/10 mx-auto' />
                <p className='text-white/25 font-mono text-xs uppercase tracking-[0.3em]'>No {filterType} questions</p>
                {filterType !== 'all' && (
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    transition={spring}
                    onClick={() => setFilterType('all')}
                    className='px-4 py-1.5 border border-white/10 text-white/35 hover:text-white/60 hover:border-white/20 font-mono text-[10px] uppercase tracking-[0.25em] rounded-lg transition-colors'
                  >
                    Clear filter
                  </motion.button>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className='flex justify-center pt-4 pb-8'>
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            transition={spring}
            onClick={() => navigate(-1)}
            className='px-8 py-2.5 border border-white/10 text-white/40 hover:text-white/70 hover:border-white/20 font-mono text-xs uppercase tracking-[0.25em] rounded-xl transition-colors'
          >
            Back
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default AttemptReview;