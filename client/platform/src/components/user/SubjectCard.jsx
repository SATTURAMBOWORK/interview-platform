import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Database,
  Layers,
  Globe,
  Puzzle,
  BookOpen,
  ArrowRight,
} from "lucide-react";

const SUBJECT_META = {
  DBMS: { icon: Database, gradient: "from-cyan-400 to-blue-400" },
  "Operating Systems": { icon: Layers, gradient: "from-cyan-400 to-blue-400" },
  "Computer Networks": { icon: Globe, gradient: "from-cyan-400 to-purple-400" },
  OOPS: { icon: Puzzle, gradient: "from-purple-400 to-cyan-400" },
  DEFAULT: { icon: BookOpen, gradient: "from-cyan-400 to-blue-400" },
};

const getMeta = (name) => SUBJECT_META[name] || SUBJECT_META.DEFAULT;

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const meta = getMeta(subject.name);
  const Icon = meta.icon;

  const handleSpotlightMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    event.currentTarget.style.setProperty("--mouse-x", `${x}px`);
    event.currentTarget.style.setProperty("--mouse-y", `${y}px`);
  };

  const handleSpotlightLeave = (event) => {
    event.currentTarget.style.setProperty("--mouse-x", "50%");
    event.currentTarget.style.setProperty("--mouse-y", "50%");
  };

  return (
    <motion.div
      onClick={() => navigate(`/dashboard/subject/${subject._id}`)}
      whileHover={{
        y: -8,
        borderColor: "rgba(6, 182, 212, 0.6)",
        boxShadow: "0 0 30px rgba(6, 182, 212, 0.3), 0 20px 40px rgba(0,0,0,0.4)",
      }}
      onMouseMove={handleSpotlightMove}
      onMouseLeave={handleSpotlightLeave}
      style={{ "--mouse-x": "50%", "--mouse-y": "50%" }}
      className="group cursor-pointer relative overflow-hidden transition-all duration-300"
    >
      {/* GLASS BACKGROUND WITH CYAN GLOW */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/40 to-slate-900/60 rounded-3xl border border-cyan-400/20 backdrop-blur-xl" />
      
      {/* HOVER GLOW EFFECT */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/10 via-transparent to-purple-400/10 rounded-3xl" />
      </div>

      {/* SPOTLIGHT EFFECT */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(6,182,212,0.15),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl" />

      {/* CYAN BORDER GLOW */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-400/30 via-transparent to-purple-400/30 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -inset-1" />

      {/* CONTENT */}
      <div className="relative p-8 rounded-3xl border border-cyan-400/30 group-hover:border-cyan-400/60 transition-all bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md">
        <div className="space-y-6">
          {/* TOP ROW: ICON + TITLE + FEATURED BADGE */}
          <div className="flex items-start justify-between gap-4">
            {/* ICON */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="flex-shrink-0"
            >
              <div className={`w-16 h-16 rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/20 to-cyan-400/10 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.4)] group-hover:shadow-[0_0_30px_rgba(6,182,212,0.6)] transition-all`}>
                <Icon className="w-8 h-8 text-cyan-400" />
              </div>
            </motion.div>

            {/* TITLE + SUBTITLE */}
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white group-hover:text-cyan-300 transition-colors">
                {subject.name}
              </h2>
              <p className="text-sm text-slate-400 mt-1 group-hover:text-slate-300 transition-colors">MCQ Module</p>
            </div>
          </div>

          {/* BOTTOM ROW: STATS + BUTTON */}
          <div className="flex items-end justify-between gap-4 pt-4 border-t border-white/10">
            {/* MCQ COUNT */}
            <div>
              <p className="text-xs uppercase tracking-[0.15em] text-slate-500 font-mono font-semibold">Total MCQs</p>
              <p className="text-3xl font-bold text-white mt-2 font-mono">
                {subject.totalMcqs ?? 0}
              </p>
            </div>

            {/* START BUTTON */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(6, 182, 212, 0.6)" }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-400 to-cyan-500 text-slate-900 font-bold rounded-full text-sm flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.7)] transition-all border border-cyan-400/50 whitespace-nowrap font-mono uppercase tracking-widest"
            >
              <span>Start</span>
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SubjectCard;
