import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Flag, RotateCcw } from "lucide-react";
import api from "../../api/axios";

function Test() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const [mcqs, setMcqs] = useState([]);
  const [attemptId, setAttemptId] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [flagged, setFlagged] = useState(new Set());
  const [timeLeft, setTimeLeft] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [loading, setLoading] = useState(true);

  const autoSubmittedRef = useRef(false);
  const attemptIdRef  = useRef(null);
  const answersRef    = useRef({});
  const mcqsRef       = useRef([]);
  const timeLeftRef   = useRef(0);

  // Keep refs in sync with state
  useEffect(() => { attemptIdRef.current = attemptId; },  [attemptId]);
  useEffect(() => { answersRef.current   = answers;    },  [answers]);
  useEffect(() => { mcqsRef.current      = mcqs;       },  [mcqs]);
  useEffect(() => { timeLeftRef.current  = timeLeft;   },  [timeLeft]);

  // Storage keys — scoped to subject so multiple subjects don't collide
  const SESSION_KEY      = `testState_${subjectId}`;
  const LOCAL_KEY        = `testPending_${subjectId}`;
  const REFRESH_GUARD    = `testRefreshing_${subjectId}`;
  const BEACON_URL       = "http://localhost:5000/api/attempts/submit-beacon";

  const clearTestStorage = () => {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(REFRESH_GUARD);
    localStorage.removeItem(LOCAL_KEY);
  };

  /* ===================== */
  /* SUBMIT */
  /* ===================== */
  const handleSubmit = async (auto = false) => {
    if (!attemptId || autoSubmittedRef.current) return;

    try {
      autoSubmittedRef.current = true;
      clearTestStorage();

      const formattedAnswers = Object.entries(answers).map(
        ([mcqId, selectedOption]) => ({ mcq: mcqId, selectedOption })
      );

      await api.post("/attempts/submit", { attemptId, answers: formattedAnswers });

      navigate(`/result/${attemptId}`, { replace: true });
    } catch (error) {
      console.error("Submit failed", error);
      autoSubmittedRef.current = false;
    }
  };

  /* ===================== */
  /* START TEST            */
  /* Behaviour:            */
  /*  Refresh  → restore   */
  /*  Close    → submit on */
  /*             next open */
  /*  Nav away → submitted */
  /*             below     */
  /* ===================== */
  useEffect(() => {
    const startTest = async () => {
      // ── REFRESH DETECTION ──────────────────────────────────────────────────
      // sessionStorage survives a refresh but is wiped when the tab is closed.
      // beforeunload always sets the guard, so it will be present after a
      // refresh but absent after a genuine close.
      const isRefresh = !!sessionStorage.getItem(REFRESH_GUARD);

      if (isRefresh) {
        sessionStorage.removeItem(REFRESH_GUARD);
        const saved = sessionStorage.getItem(SESSION_KEY);
        if (saved) {
          try {
            const { savedAttemptId, savedAnswers, savedTimeLeft, savedMcqs, savedCurrentIndex } =
              JSON.parse(saved);
            setAttemptId(savedAttemptId);
            attemptIdRef.current = savedAttemptId;
            setAnswers(savedAnswers);
            answersRef.current = savedAnswers;
            setMcqs(savedMcqs);
            mcqsRef.current = savedMcqs;
            setCurrentIndex(savedCurrentIndex || 0);
            setTimeLeft(savedTimeLeft);
            timeLeftRef.current = savedTimeLeft;
            setLoading(false);
            return; // ← continue from where we left off
          } catch { /* fall through to fresh start */ }
        }
      }

      // ── PENDING CLOSE SUBMISSION ────────────────────────────────────────────
      // localStorage persists across sessions. If the user closed the tab
      // mid-test, answers were saved here. Submit them now before starting fresh.
      const pending = localStorage.getItem(LOCAL_KEY);
      if (pending) {
        try {
          const { pendingAttemptId, pendingAnswers } = JSON.parse(pending);
          localStorage.removeItem(LOCAL_KEY);
          const token = localStorage.getItem("token");
          if (token && pendingAttemptId) {
            navigator.sendBeacon(
              BEACON_URL,
              new Blob(
                [JSON.stringify({ attemptId: pendingAttemptId, answers: pendingAnswers, token })],
                { type: "application/json" }
              )
            );
          }
        } catch { /* ignore */ }
      }

      // ── FRESH START ─────────────────────────────────────────────────────────
      try {
        const res = await api.post("/attempts/start", { subjectId });
        setMcqs(res.data.mcqs);
        setAttemptId(res.data.attemptId);
        const expiresAt = new Date(res.data.expiresAt).getTime();
        const tl = Math.max(Math.floor((expiresAt - Date.now()) / 1000), 0);
        setTimeLeft(tl);
        timeLeftRef.current = tl;
        setLoading(false);
      } catch (error) {
        console.error("Failed to start test", error);
        setLoading(false);
      }
    };

    startTest();
  }, [subjectId]);

  /* ===================== */
  /* PERSIST STATE         */
  /* (sessionStorage + localStorage updated on every change) */
  /* ===================== */
  useEffect(() => {
    if (!attemptId || mcqs.length === 0) return;

    // sessionStorage → for refresh restore (fast, same session)
    sessionStorage.setItem(
      SESSION_KEY,
      JSON.stringify({
        savedAttemptId: attemptId,
        savedAnswers: answers,
        savedTimeLeft: timeLeft,
        savedMcqs: mcqs,
        savedCurrentIndex: currentIndex,
      })
    );

    // localStorage → for close-tab recovery on next open (persists across sessions)
    const pendingAnswers = Object.entries(answers).map(([mcqId, selectedOption]) => ({
      mcq: mcqId,
      selectedOption,
    }));
    localStorage.setItem(
      LOCAL_KEY,
      JSON.stringify({ pendingAttemptId: attemptId, pendingAnswers })
    );
  }, [answers, timeLeft, currentIndex, attemptId, mcqs]);

  /* ===================== */
  /* BEFOREUNLOAD          */
  /* Set refresh guard (persists on refresh, wiped on close) */
  /* ===================== */
  useEffect(() => {
    const onBeforeUnload = () => {
      if (autoSubmittedRef.current) return;
      sessionStorage.setItem(REFRESH_GUARD, "1");
      // Flush latest answers to localStorage synchronously
      const pendingAnswers = Object.entries(answersRef.current).map(
        ([mcqId, selectedOption]) => ({ mcq: mcqId, selectedOption })
      );
      if (attemptIdRef.current) {
        localStorage.setItem(
          LOCAL_KEY,
          JSON.stringify({ pendingAttemptId: attemptIdRef.current, pendingAnswers })
        );
      }
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  /* ===================== */
  /* IN-APP NAVIGATION     */
  /* React unmount → submit immediately via sendBeacon */
  /* ===================== */
  useEffect(() => {
    return () => {
      if (autoSubmittedRef.current || !attemptIdRef.current) return;
      const token = localStorage.getItem("token");
      const pendingAnswers = Object.entries(answersRef.current).map(
        ([mcqId, selectedOption]) => ({ mcq: mcqId, selectedOption })
      );
      navigator.sendBeacon(
        BEACON_URL,
        new Blob(
          [JSON.stringify({ attemptId: attemptIdRef.current, answers: pendingAnswers, token })],
          { type: "application/json" }
        )
      );
      clearTestStorage();
      autoSubmittedRef.current = true;
    };
  }, []);

  /* ===================== */
  /* TIMER */
  /* ===================== */
  useEffect(() => {
    if (timeLeft <= 0) {
      if (attemptId && !autoSubmittedRef.current) {
        handleSubmit(true);
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft, attemptId]);

  const formatTime = (s) =>
    `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

  if (loading) return (
    <div className="min-h-screen bg-[#050510] flex items-center justify-center">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="w-16 h-16 border-4 border-cyan-900/30 border-t-cyan-500 rounded-full"
      />
    </div>
  );

  if (!mcqs.length) return null;

  const currentQuestion = mcqs[currentIndex];
  const isWarning = timeLeft <= 300;
  const answeredCount = Object.keys(answers).length;
  const flaggedCount = flagged.size;

  const handleToggleFlag = () => {
    setFlagged((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion._id)) {
        newSet.delete(currentQuestion._id);
      } else {
        newSet.add(currentQuestion._id);
      }
      return newSet;
    });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 },
  };

  return (
    <div className="min-h-screen bg-[#050510]">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-[#0a0a16]/80 backdrop-blur-xl border-b border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            
            {/* LEFT - PROGRESS */}
            <div className="flex items-center gap-4">
              <div className="text-sm font-semibold text-slate-300">
                Question <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">{currentIndex + 1}</span> of <span className="text-white">{mcqs.length}</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentIndex + 1) / mcqs.length) * 100}%` }}
                  transition={{ duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                />
              </div>
            </div>

            {/* CENTER - TIMER */}
            <motion.div
              animate={isWarning ? { scale: [1, 1.05, 1] } : {}}
              transition={isWarning ? { duration: 1, repeat: Infinity } : {}}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${
                isWarning
                  ? "bg-gradient-to-r from-rose-500 to-red-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.6)]"
                  : "bg-white/5 backdrop-blur-md border-2 border-cyan-500/30 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              }`}
            >
              <Clock className="w-5 h-5" />
              {formatTime(timeLeft)}
            </motion.div>

            {/* RIGHT - ACTIONS */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={async () => {
                  if (!document.fullscreenElement) {
                    await document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                  } else {
                    await document.exitFullscreen();
                    setIsFullscreen(false);
                  }
                }}
                className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg border border-cyan-500/30 hover:bg-white/10 transition-colors text-slate-200 font-medium text-sm backdrop-blur-md"
              >
                {isFullscreen ? "Exit" : "Focus"} Mode
              </motion.button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-full h-[calc(100vh-88px)] overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 h-full">

          {/* MAIN CONTENT */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-8 p-6 lg:p-8 overflow-y-auto"
          >
            
            {/* QUESTION CARD */}
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
              className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.2)] hover:border-cyan-500/30 transition-all duration-500 mb-8"
            >
              
              {/* QUESTION HEADER */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <p className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400 uppercase tracking-wide mb-2">
                    Question {currentIndex + 1} of {mcqs.length}
                  </p>
                  <h3 className="text-2xl font-bold text-white leading-relaxed">
                    {currentQuestion.question}
                  </h3>
                </div>

                {/* FLAG BUTTON */}
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleToggleFlag}
                  className={`flex-shrink-0 p-3 rounded-xl transition-all duration-300 ml-4 backdrop-blur-md ${
                    flagged.has(currentQuestion._id)
                      ? "bg-amber-500/20 border-2 border-amber-400/50 shadow-[0_0_15px_rgba(251,191,36,0.3)]"
                      : "bg-white/5 border-2 border-white/10 hover:bg-white/10 hover:border-cyan-500/30"
                  }`}
                >
                  <Flag className={`w-5 h-5 transition-colors ${
                    flagged.has(currentQuestion._id) ? "text-amber-400 fill-amber-400" : "text-slate-400"
                  }`} />
                </motion.button>
              </div>

              {/* OPTIONS */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                {currentQuestion.options.map((opt, idx) => {
                  const isSelected = answers[currentQuestion._id] === idx;
                  
                  return (
                    <motion.label
                      key={idx}
                      variants={itemVariants}
                      whileHover={{ x: 4 }}
                      className={`group relative flex gap-4 p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 backdrop-blur-md ${
                        isSelected
                          ? "border-cyan-500 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                          : "border-white/10 hover:border-cyan-500/40 hover:bg-white/5"
                      }`}
                    >
                      {/* Radio Button */}
                      <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                        isSelected
                          ? "border-cyan-500 bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]"
                          : "border-slate-500 group-hover:border-cyan-400"
                      }`}>
                        {isSelected && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="w-2 h-2 bg-white rounded-full"
                          />
                        )}
                      </div>

                      {/* Option Text */}
                      <div className="flex-1">
                        <p className={`font-medium transition-colors ${
                          isSelected ? "text-cyan-100" : "text-slate-300"
                        }`}>
                          {opt}
                        </p>
                      </div>

                      {/* Input (hidden) */}
                      <input
                        type="radio"
                        className="hidden"
                        checked={isSelected}
                        onChange={() =>
                          setAnswers((prev) => ({
                            ...prev,
                            [currentQuestion._id]: idx,
                          }))
                        }
                      />

                      {/* Checkmark for selected */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <CheckCircle2 className="w-6 h-6 text-cyan-400" />
                        </motion.div>
                      )}
                    </motion.label>
                  );
                })}
              </motion.div>
            </motion.div>

            {/* NAVIGATION BUTTONS */}
            <div className="flex gap-4 justify-between">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((i) => i - 1)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl border border-white/10 hover:bg-white/5 hover:border-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed font-semibold text-slate-200 transition-all duration-300 backdrop-blur-md"
              >
                <ChevronLeft className="w-5 h-5" />
                Previous
              </motion.button>

              {currentIndex === mcqs.length - 1 ? (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmSubmit(true)}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-[0_8px_30px_rgba(16,185,129,0.3)] hover:shadow-[0_12px_40px_rgba(16,185,129,0.5)] transition-all duration-300"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  Submit Test
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setCurrentIndex((i) => i + 1)}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold rounded-xl shadow-[0_8px_30px_rgba(6,182,212,0.3)] hover:shadow-[0_12px_40px_rgba(6,182,212,0.5)] transition-all duration-300"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              )}
            </div>

          </motion.div>

          {/* SIDEBAR */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-4 p-6 lg:p-8 border-l border-white/10 overflow-y-auto"
          >
            
            {/* STATS CARD */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] mb-6">
              <h4 className="font-bold text-white mb-4">Progress</h4>
              
              <div className="space-y-4">
                {/* Answered */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-medium text-slate-300">Answered</span>
                    </div>
                    <span className="text-lg font-bold text-emerald-400">{answeredCount}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${(answeredCount / mcqs.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                    />
                  </div>
                </div>

                {/* Flagged */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-5 text-amber-400" />
                      <span className="text-sm font-medium text-slate-300">Flagged</span>
                    </div>
                    <span className="text-lg font-bold text-amber-400">{flaggedCount}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${(flaggedCount / mcqs.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full shadow-[0_0_10px_rgba(251,191,36,0.5)]"
                    />
                  </div>
                </div>

                {/* Unanswered */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-slate-500" />
                      <span className="text-sm font-medium text-slate-300">Unanswered</span>
                    </div>
                    <span className="text-lg font-bold text-slate-400">{mcqs.length - answeredCount}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      animate={{ width: `${((mcqs.length - answeredCount) / mcqs.length) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-gradient-to-r from-slate-500 to-slate-600 rounded-full"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* QUESTION NAVIGATOR */}
            <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.3)] sticky top-24">
              <h4 className="font-bold text-white mb-4">All Questions ({mcqs.length})</h4>
              
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-10 gap-1.5 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar"
              >
                {mcqs.map((_, idx) => (
                  <motion.button
                    key={idx}
                    variants={itemVariants}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentIndex(idx)}
                    title={`Question ${idx + 1} ${answers[mcqs[idx]._id] !== undefined ? '(Answered)' : flagged.has(mcqs[idx]._id) ? '(Flagged)' : ''}`}
                    className={`relative w-full aspect-square rounded-lg font-semibold text-xs transition-all duration-300 ${
                      idx === currentIndex
                        ? "bg-gradient-to-br from-cyan-500 to-blue-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.5)] ring-2 ring-cyan-400/50"
                        : answers[mcqs[idx]._id] !== undefined
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30"
                        : flagged.has(mcqs[idx]._id)
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40 hover:bg-amber-500/30"
                        : "bg-white/5 text-slate-400 hover:bg-white/10 border border-white/10"
                    }`}
                  >
                    {idx + 1}
                    
                    {/* Indicator dot */}
                    {flagged.has(mcqs[idx]._id) && idx !== currentIndex && (
                      <div className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_5px_rgba(251,191,36,0.8)]"></div>
                    )}
                  </motion.button>
                ))}
              </motion.div>

              {/* Legend */}
              <div className="mt-6 space-y-2 text-xs border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gradient-to-br from-cyan-500 to-blue-500 rounded"></div>
                  <span className="text-slate-300 font-medium">Current</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-emerald-500/20 border border-emerald-500/40 rounded"></div>
                  <span className="text-slate-300">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-amber-500/20 border border-amber-500/40 rounded"></div>
                  <span className="text-slate-300">Flagged</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-white/5 border border-white/10 rounded"></div>
                  <span className="text-slate-300">Not Answered</span>
                </div>
              </div>
            </div>

          </motion.div>

        </div>
      </div>

      {/* SUBMIT CONFIRMATION MODAL */}
      <AnimatePresence>
        {showConfirmSubmit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0a0a16]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-sm w-full shadow-[0_20px_70px_rgba(0,0,0,0.8)]"
            >
              <h3 className="text-2xl font-bold text-white mb-4">Submit Test?</h3>
              
              <div className="space-y-4 mb-6 text-slate-300">
                <div className="flex items-center gap-3 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg backdrop-blur-md">
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 flex-shrink-0" />
                  <span><span className="font-bold text-cyan-300">{answeredCount}</span> answered</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white/5 border border-white/10 rounded-lg backdrop-blur-md">
                  <AlertCircle className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <span><span className="font-bold text-white">{mcqs.length - answeredCount}</span> unanswered</span>
                </div>
              </div>

              <p className="text-slate-300 mb-6">
                You can't change your answers after submission. Are you sure?
              </p>

              <div className="flex gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowConfirmSubmit(false)}
                  className="flex-1 px-4 py-3 border border-white/20 text-slate-200 font-semibold rounded-xl hover:bg-white/5 backdrop-blur-md transition-all duration-300"
                >
                  Continue Test
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSubmit(false)}
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-green-700 shadow-[0_8px_30px_rgba(16,185,129,0.4)] transition-all duration-300"
                >
                  Submit Now
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default Test;