import { useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, CheckCircle2, AlertCircle, Circle, Users, Bookmark, BookmarkCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const difficultyStyles = {
  Easy: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  Medium: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  Hard: "text-rose-300 border-rose-400/30 bg-rose-500/10",
};

const DsaProblemTable = ({
  groupedProblems = {},
  solvedProblemIds = [],
  attemptedProblemIds = [],
}) => {
  const navigate = useNavigate();
  const topics = useMemo(() => Object.keys(groupedProblems), [groupedProblems]);
  const [expandedTopics, setExpandedTopics] = useState({});
  const [bookmarked, setBookmarked] = useState(() => {
    try {
      return new Set(JSON.parse(localStorage.getItem("dsa_bookmarks") || "[]"));
    } catch { return new Set(); }
  });

  const toggleBookmark = (e, id) => {
    e.stopPropagation();
    setBookmarked((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      localStorage.setItem("dsa_bookmarks", JSON.stringify([...next]));
      return next;
    });
  };

  useEffect(() => {
    if (topics.length > 0) {
      const defaultExpanded = {};
      topics.forEach((topic, index) => {
        defaultExpanded[topic] = index === 0;
      });
      setExpandedTopics(defaultExpanded);
    }
  }, [topics]);

  const normalizedGrouped = useMemo(() => {
    const normalized = {};
    topics.forEach((topic) => {
      const topicProblems = groupedProblems[topic] || [];
      normalized[topic] = topicProblems.map((problem) => {
        const id = problem._id?.toString();
        if (solvedProblemIds.includes(id)) return { ...problem, status: "solved" };
        if (attemptedProblemIds.includes(id)) return { ...problem, status: "attempted" };
        return { ...problem, status: "unsolved" };
      });
    });
    return normalized;
  }, [topics, groupedProblems, solvedProblemIds, attemptedProblemIds]);

  const allProblems = useMemo(() => Object.values(normalizedGrouped).flat(), [normalizedGrouped]);
  const solvedCount = allProblems.filter((p) => p.status === "solved").length;
  const attemptedCount = allProblems.filter((p) => p.status === "attempted").length;
  const unsolvedCount = allProblems.length - solvedCount - attemptedCount;

  const toggleTopic = (topic) =>
    setExpandedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));

  const getStatusIcon = (status) => {
    if (status === "solved") return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
    if (status === "attempted") return <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
    return <Circle className="w-4 h-4 text-slate-500 shrink-0" />;
  };

  const getAcceptanceColor = (rate) => {
    if (rate >= 70) return "text-emerald-300";
    if (rate >= 40) return "text-amber-300";
    return "text-rose-300";
  };

  const getAcceptanceBar = (rate) => {
    if (rate >= 70) return "from-emerald-400 to-emerald-500";
    if (rate >= 40) return "from-amber-400 to-amber-500";
    return "from-rose-400 to-rose-500";
  };

  if (!topics.length) {
    return (
      <div className="flex min-h-[260px] items-center justify-center rounded-xl border border-white/10 bg-black/20">
        <div className="text-center">
          <p className="text-base font-medium text-white">No DSA topics available</p>
          <p className="text-sm text-slate-400">Please check back later</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {topics.map((topic, idx) => {
        const topicProblems = normalizedGrouped[topic] || [];
        const topicSolved = topicProblems.filter((p) => p.status === "solved").length;
        const topicTotal = topicProblems.length;
        const topicPercent = topicTotal > 0 ? Math.round((topicSolved / topicTotal) * 100) : 0;
        const isOpen = !!expandedTopics[topic];

        return (
          <motion.div
            key={topic}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            {/* Topic Header */}
            <motion.button
              onClick={() => toggleTopic(topic)}
              whileHover={!isOpen ? {
                y: -3,
                borderColor: "rgba(6,182,212,0.6)",
                boxShadow: "0 0 28px rgba(6,182,212,0.2), 0 12px 28px rgba(0,0,0,0.3)",
              } : {}}
              className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-4 py-2.5 text-left transition-all duration-300"
              style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
              onMouseMove={(e) => {
                if (isOpen) return;
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
              }}
            >
              <div className={`absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.15),transparent_60%)] transition-opacity pointer-events-none ${isOpen ? "opacity-0" : "opacity-0 group-hover:opacity-100"}`} />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <h3 className="text-sm font-semibold capitalize text-white truncate">{topic}</h3>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="w-20 h-1 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                        style={{ width: `${topicPercent}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      <span className={topicSolved > 0 ? "text-emerald-400" : ""}>{topicSolved}</span>
                      /{topicTotal}
                    </span>
                  </div>
                </div>

                <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </motion.div>
              </div>
            </motion.button>

            {/* Problem Rows */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.22 }}
                  className="overflow-hidden"
                >
                  <div className="mt-2 rounded-xl border border-white/10 bg-black/30 backdrop-blur-md divide-y divide-white/5">
                    {/* Column headers */}
                    <div className="grid grid-cols-12 px-4 py-2 text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                      <div className="col-span-1 text-center">Status</div>
                      <div className="col-span-4">Problem</div>
                      <div className="col-span-2 text-center">Difficulty</div>
                      <div className="col-span-2 text-center">Acceptance</div>
                      <div className="col-span-2 text-center">Submissions</div>
                      <div className="col-span-1 text-center">Revision</div>
                    </div>

                    {topicProblems.map((problem, pi) => {
                      const totalSubs = problem.submissions || 0;
                      const acceptedSubs = problem.acceptedSubmissions || 0;
                      const acceptanceRate = totalSubs > 0 ? Math.round((acceptedSubs / totalSubs) * 100) : 0;

                      return (
                        <motion.div
                          key={problem._id}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: pi * 0.025 }}
                          onClick={() => navigate(`/dsa/solve/${problem._id}`)}
                          className="group grid grid-cols-12 items-center gap-2 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5"
                        >
                          <div className="col-span-1 flex justify-center">
                            {getStatusIcon(problem.status)}
                          </div>

                          <div className="col-span-4 min-w-0">
                            <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                              {problem.title}
                            </p>
                          </div>

                          <div className="col-span-2 flex justify-center">
                            <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${difficultyStyles[problem.difficulty] || "text-slate-300 border-slate-400/30 bg-slate-500/10"}`}>
                              {problem.difficulty}
                            </span>
                          </div>

                          <div className="col-span-2">
                            <p className={`text-center text-sm font-semibold ${getAcceptanceColor(acceptanceRate)}`}>
                              {acceptanceRate}%
                            </p>
                            <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-white/10">
                              <div
                                className={`h-full bg-gradient-to-r ${getAcceptanceBar(acceptanceRate)}`}
                                style={{ width: `${acceptanceRate}%` }}
                              />
                            </div>
                          </div>

                          <div className="col-span-2 flex items-center justify-center gap-1 text-slate-300">
                            <Users className="h-3.5 w-3.5" />
                            <span className="text-xs">{totalSubs}</span>
                          </div>

                          <div className="col-span-1 flex justify-center">
                            <button
                              onClick={(e) => toggleBookmark(e, problem._id)}
                              className="p-1 rounded-md transition-colors hover:bg-white/10"
                              title={bookmarked.has(problem._id) ? "Remove from revision" : "Mark for revision"}
                            >
                              {bookmarked.has(problem._id)
                                ? <BookmarkCheck className="w-4 h-4 text-amber-400" />
                                : <Bookmark className="w-4 h-4 text-slate-500 hover:text-amber-300 transition-colors" />
                              }
                            </button>
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

      {/* Summary Footer */}
      <div className="grid grid-cols-3 gap-3 pt-1">
        {[
          { label: "Solved", value: solvedCount, color: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10" },
          { label: "Attempted", value: attemptedCount, color: "text-amber-300 border-amber-400/30 bg-amber-500/10" },
          { label: "Unsolved", value: unsolvedCount, color: "text-slate-300 border-slate-400/30 bg-slate-500/10" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-3 ${item.color}`}>
            <p className="text-[11px] uppercase tracking-wider font-mono">{item.label}</p>
            <p className="mt-1 text-2xl font-bold text-white">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DsaProblemTable;