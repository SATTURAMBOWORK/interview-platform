import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";

const levels = [
  {
    key: "easy",
    label: "Easy",
    bar: "from-emerald-400 to-emerald-500",
    chip: "text-emerald-300 border-emerald-400/40 bg-emerald-500/10 shadow-[0_0_14px_rgba(16,185,129,0.45)]",
    glow: "hover:border-emerald-400/40 hover:shadow-[0_0_24px_rgba(16,185,129,0.2)]",
    barGlow: "shadow-[0_0_14px_rgba(16,185,129,0.85)]",
  },
  {
    key: "medium",
    label: "Medium",
    bar: "from-amber-400 to-amber-500",
    chip: "text-amber-300 border-amber-400/40 bg-amber-500/10 shadow-[0_0_14px_rgba(251,191,36,0.45)]",
    glow: "hover:border-amber-400/40 hover:shadow-[0_0_24px_rgba(251,191,36,0.2)]",
    barGlow: "shadow-[0_0_14px_rgba(251,191,36,0.85)]",
  },
  {
    key: "hard",
    label: "Hard",
    bar: "from-rose-400 to-rose-500",
    chip: "text-rose-300 border-rose-400/40 bg-rose-500/10 shadow-[0_0_14px_rgba(251,113,133,0.45)]",
    glow: "hover:border-rose-400/40 hover:shadow-[0_0_24px_rgba(251,113,133,0.2)]",
    barGlow: "shadow-[0_0_14px_rgba(251,113,133,0.85)]",
  },
];

const normalizeLevel = (value) => {
  if (typeof value === "number") {
    return { solved: value, total: 0 };
  }
  return {
    solved: value?.solved || 0,
    total: value?.total || 0,
  };
};

const DsaStats = ({ stats }) => {
  const normalized = {
    easy: normalizeLevel(stats?.easy),
    medium: normalizeLevel(stats?.medium),
    hard: normalizeLevel(stats?.hard),
  };

  const totalSolved = normalized.easy.solved + normalized.medium.solved + normalized.hard.solved;
  const totalProblems = normalized.easy.total + normalized.medium.total + normalized.hard.total;

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/15 via-indigo-500/10 to-purple-500/15 p-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-slate-300">Solved Progress</p>
            <p className="text-3xl font-bold text-white mt-1">
              {totalSolved}
              <span className="text-base text-slate-400"> / {totalProblems}</span>
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/5 p-2">
            <TrendingUp className="w-5 h-5 text-cyan-300" />
          </div>
        </div>
      </motion.div>

      <div className="space-y-3">
        {levels.map((level, index) => {
          const solved = normalized[level.key].solved;
          const total = normalized[level.key].total;
          const percent = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
            <motion.div
              key={level.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -1 }}
              className={`rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-white/10 transition-all ${level.glow}`}
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${level.chip}`}>
                  {level.label}
                </span>
                <span className="text-xs text-slate-300">{percent}%</span>
              </div>

              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-xl font-semibold text-white">{solved}</span>
                <span className="text-sm text-slate-400">of {total}</span>
              </div>

              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percent}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={`h-full bg-gradient-to-r ${level.bar} ${level.barGlow}`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DsaStats;
