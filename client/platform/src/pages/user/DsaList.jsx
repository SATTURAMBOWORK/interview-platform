import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { ChevronDown, Code2, Layers } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const difficultyStyles = {
  Easy: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  Medium: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  Hard: "text-rose-300 border-rose-400/30 bg-rose-500/10",
};

const DsaList = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedTopics, setExpandedTopics] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await axios.get("/dsa/problems");
        setProblems(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const grouped = useMemo(() => {
    const map = {};
    problems.forEach((p) => {
      const tags = Array.isArray(p.tags) && p.tags.length > 0 ? p.tags : ["General"];
      tags.forEach((tag) => {
        const key = tag.toLowerCase();
        if (!map[key]) map[key] = [];
        map[key].push(p);
      });
    });
    return map;
  }, [problems]);

  const topics = useMemo(() => Object.keys(grouped).sort(), [grouped]);

  useEffect(() => {
    if (topics.length > 0) {
      const init = {};
      topics.forEach((t, i) => { init[t] = i === 0; });
      setExpandedTopics(init);
    }
  }, [topics]);

  const toggle = (topic) =>
    setExpandedTopics((prev) => ({ ...prev, [topic]: !prev[topic] }));

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a16] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-slate-400 text-sm font-mono">Loading problems...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300">
      {/* Background blobs */}
      <div className="fixed inset-0 -z-10 opacity-20 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[100px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[100px]" />
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-[11px] font-bold tracking-[0.2em] text-cyan-400 uppercase font-mono mb-4">
            <Code2 className="w-3.5 h-3.5" /> Problem Bank
          </div>
          <h1 className="text-4xl font-black text-white tracking-tighter uppercase">
            DSA{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Problems
            </span>
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            {problems.length} problems across {topics.length} topics
          </p>
        </div>

        {/* Topic Cards */}
        <div className="space-y-4">
          {topics.map((topic, idx) => {
            const topicProblems = grouped[topic] || [];
            const isOpen = !!expandedTopics[topic];

            return (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                {/* Topic Header Button */}
                <motion.button
                  onClick={() => toggle(topic)}
                  whileHover={{
                    y: -3,
                    borderColor: "rgba(6,182,212,0.6)",
                    boxShadow: "0 0 28px rgba(6,182,212,0.2), 0 12px 28px rgba(0,0,0,0.3)",
                  }}
                  className="group relative w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 px-5 py-4 text-left transition-all duration-300"
                  style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    e.currentTarget.style.setProperty("--mouse-x", `${e.clientX - r.left}px`);
                    e.currentTarget.style.setProperty("--mouse-y", `${e.clientY - r.top}px`);
                  }}
                >
                  <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.15),transparent_60%)] opacity-0 transition-opacity group-hover:opacity-100 pointer-events-none" />

                  <div className="relative z-10 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-400/20">
                        <Layers className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold capitalize text-white">{topic}</h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{topicProblems.length} problems</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Difficulty pill counts */}
                      {["Easy", "Medium", "Hard"].map((d) => {
                        const count = topicProblems.filter((p) => p.difficulty === d).length;
                        if (!count) return null;
                        return (
                          <span key={d} className={`hidden sm:inline-flex px-2 py-0.5 rounded-full border text-[11px] font-semibold ${difficultyStyles[d]}`}>
                            {count} {d}
                          </span>
                        );
                      })}
                      <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="w-5 h-5 text-slate-400" />
                      </motion.div>
                    </div>
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
                          <div className="col-span-7">Problem</div>
                          <div className="col-span-3 text-center">Difficulty</div>
                          <div className="col-span-2 text-center">Action</div>
                        </div>

                        {topicProblems.map((problem, pi) => (
                          <motion.div
                            key={problem._id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: pi * 0.03 }}
                            onClick={() => navigate(`/dsa/solve/${problem._id}`)}
                            className="group grid grid-cols-12 items-center gap-2 px-4 py-3 cursor-pointer transition-colors hover:bg-white/5"
                          >
                            <div className="col-span-7 min-w-0">
                              <p className="text-sm font-medium text-white truncate group-hover:text-cyan-300 transition-colors">
                                {problem.title}
                              </p>
                            </div>

                            <div className="col-span-3 flex justify-center">
                              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-semibold ${difficultyStyles[problem.difficulty] || "text-slate-300 border-slate-400/30 bg-slate-500/10"}`}>
                                {problem.difficulty}
                              </span>
                            </div>

                            <div className="col-span-2 flex justify-center">
                              <span className="px-3 py-1 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 text-xs font-bold hover:bg-cyan-500/20 transition-colors">
                                Solve
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DsaList;
