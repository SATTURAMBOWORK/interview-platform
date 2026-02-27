import { useEffect, useState } from "react";
import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import {
  Crown, Trophy, Medal, Star, Zap, Code2, Brain,
  Flame, Award, Loader2, AlertCircle, RefreshCw,
} from "lucide-react";
import api from "../../api/axios";

/* ── Rank medal ── */
const RankBadge = ({ rank }) => {
  if (rank === 1)
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_16px_rgba(245,158,11,0.6)]">
        <Crown className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
    );
  if (rank === 2)
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-slate-300 to-slate-400 shadow-[0_0_12px_rgba(148,163,184,0.4)]">
        <Trophy className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
    );
  if (rank === 3)
    return (
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400 to-amber-600 shadow-[0_0_12px_rgba(251,146,60,0.4)]">
        <Medal className="w-4 h-4 text-white" strokeWidth={2.5} />
      </div>
    );
  return (
    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/5 border border-white/10">
      <span className="text-xs font-black font-mono text-slate-500">#{rank}</span>
    </div>
  );
};

/* ── XP bar ── */
const xpForLevel = (lv) => {
  const n = lv - 1;
  return Math.round((n * (n + 1) * 100) / 2);
};

const XPBar = ({ level, totalXP }) => {
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = level >= 100 ? 100 : Math.min(100, Math.round(((totalXP - current) / (next - current)) * 100));
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
      <div
        className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-400 transition-all duration-700"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myUsername, setMyUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [lbRes, profileRes] = await Promise.all([
        api.get("/leaderboard"),
        api.get("/users/profile"),
      ]);
      setLeaderboard(lbRes.data);
      setMyUsername(profileRes.data?.user?.username || profileRes.data?.username || null);
    } catch (err) {
      console.error("Leaderboard error:", err);
      setError(err.response?.data?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const myEntry = leaderboard.find((u) => u.username === myUsername);

  return (
    <div className="min-h-screen bg-[#0a0a16] text-slate-300 selection:bg-indigo-500/30">

      {/* ── BG ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]" />
      <div className="fixed inset-0 -z-10 opacity-15 pointer-events-none">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-indigo-600 rounded-full filter blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-violet-600 rounded-full filter blur-[120px]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">

        {/* ── HEADER ── */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/25 text-[11px] font-bold tracking-[0.2em] text-indigo-400 uppercase font-mono">
              <Trophy className="w-3.5 h-3.5" /> Global Rankings
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white uppercase leading-none">
              Leader<span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">board</span>
            </h1>
            <p className="text-slate-500 text-sm font-mono">Ranked by Level · MCQ + DSA + STAR + Streak XP</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchAll}
            transition={{ duration: 0.3 }}
            className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-indigo-400/40 hover:text-indigo-400 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </motion.button>
        </div>

        {/* ── MY RANK CARD ── */}
        {myEntry && !loading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl border border-indigo-400/30 bg-indigo-500/[0.07] px-6 py-4"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 to-violet-500/5 pointer-events-none" />
            <div className="relative flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <RankBadge rank={myEntry.rank} />
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-indigo-400 font-mono font-bold mb-0.5">Your Rank</p>
                  <p className="text-white font-black text-lg tracking-tight">{myEntry.name}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-3xl font-black font-mono bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent leading-none">Lv {myEntry.level}</p>
                  <p className="text-[9px] text-slate-500 font-mono mt-1">{myEntry.totalXP} XP</p>
                </div>
                <div className="hidden sm:flex gap-4 text-center">
                  {[
                    { icon: Brain,  val: myEntry.mcqXP,    label: "MCQ XP",    grad: "from-violet-400 to-purple-500" },
                    { icon: Code2,  val: myEntry.dsaXP,    label: "DSA XP",    grad: "from-cyan-400 to-blue-500"     },
                    { icon: Star,   val: myEntry.starXP,   label: "STAR XP",   grad: "from-amber-400 to-orange-500"  },
                    { icon: Flame,  val: myEntry.streakXP, label: "Streak XP", grad: "from-rose-400 to-orange-400"   },
                  ].map(({ icon: Icon, val, label, grad }) => (
                    <div key={label} className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center gap-1">
                        <Icon className="w-3 h-3 text-slate-600" />
                        <span className={`text-sm font-black font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{val}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-slate-600 font-mono">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── XP LEGEND ── */}
        <div className="flex flex-wrap gap-3 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
          {[
            { icon: Brain,  label: "MCQ: high-accuracy test × 100",   color: "text-violet-500" },
            { icon: Code2,  label: "DSA: E×75 / M×150 / H×300",        color: "text-cyan-500"   },
            { icon: Star,   label: "STAR: ≥80→75 / ≥60→40 XP",         color: "text-amber-500"  },
            { icon: Flame,  label: "Streak: day × 25",                  color: "text-rose-500"   },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <Icon className={`w-3 h-3 ${color}`} />
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* ── TABLE ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Loading rankings…</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <Award className="w-12 h-12 text-slate-700" />
            <p className="text-sm font-black text-slate-600 font-mono uppercase tracking-widest">No users yet</p>
          </div>
        ) : (
          <div className="rounded-2xl border border-white/[0.07] overflow-hidden bg-white/[0.02]">

            {/* head */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-3 border-b border-white/[0.07] bg-white/[0.02]">
              <div className="w-9" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono">Player</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono text-right">Level</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 font-mono text-right hidden sm:block">XP Breakdown</span>
            </div>

            {/* rows */}
            <div className="divide-y divide-white/[0.04]">
              {leaderboard.map((user, idx) => {
                const isMe = user.username === myUsername;
                const isTop3 = user.rank <= 3;
                return (
                  <motion.div
                    key={String(user.userId)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.025, type: "spring", stiffness: 240, damping: 26 }}
                    className={`grid grid-cols-[auto_1fr_auto_auto] gap-4 items-center px-5 py-4 transition-colors duration-200 ${
                      isMe ? "bg-indigo-500/[0.10] hover:bg-indigo-500/[0.14]" : "hover:bg-white/[0.03]"
                    }`}
                  >
                    {/* rank */}
                    <RankBadge rank={user.rank} />

                    {/* name + xp bar */}
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black truncate ${isMe ? "text-indigo-200" : isTop3 ? "text-white" : "text-slate-300"}`}>
                          {user.name}
                        </p>
                        {isMe && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-mono border border-indigo-500/30 uppercase tracking-widest shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-600 font-mono">@{user.username}</p>
                      <XPBar level={user.level} totalXP={user.totalXP} />
                    </div>

                    {/* level */}
                    <div className="text-right shrink-0">
                      <p className={`font-black font-mono bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent leading-none ${isTop3 ? "text-3xl" : "text-xl"}`}>
                        {user.level}
                      </p>
                      <p className="text-[9px] text-slate-600 font-mono uppercase tracking-widest mt-0.5">{user.totalXP} xp</p>
                    </div>

                    {/* xp breakdown */}
                    <div className="hidden sm:flex gap-3 shrink-0">
                      {[
                        { icon: Brain,  val: user.mcqXP,    grad: "from-violet-400 to-purple-500" },
                        { icon: Code2,  val: user.dsaXP,    grad: "from-cyan-400 to-blue-500"     },
                        { icon: Star,   val: user.starXP,   grad: "from-amber-400 to-orange-500"  },
                        { icon: Flame,  val: user.streakXP, grad: "from-rose-400 to-orange-400"   },
                      ].map(({ icon: Icon, val, grad }) => (
                        <div key={grad} className="flex flex-col items-center gap-0.5 min-w-[36px]">
                          <Icon className="w-3 h-3 text-slate-700" />
                          <span className={`text-[10px] font-black font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {!loading && !error && leaderboard.length > 0 && (
          <p className="text-center text-[10px] font-mono text-slate-700 uppercase tracking-widest">
            {leaderboard.length} users ranked · same XP formula as your dashboard
          </p>
        )}
      </div>
    </div>
  );
}

export default Leaderboard;
