import { useEffect, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import {
  Crown, Trophy, Medal, Star, Zap, Code2, Brain,
  Flame, Award, Loader2, AlertCircle, RefreshCw, Sparkles, Terminal
} from "lucide-react";
import api from "../../api/axios";

/* ── Rank Badge (Matches Login Icon Styles) ── */
const RankBadge = ({ rank }) => {
  const baseClass = "flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300";
  if (rank === 1)
    return (
      <div className={`${baseClass} bg-gradient-to-br from-yellow-400 to-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.5)]`}>
        <Crown className="w-6 h-6 text-white" />
      </div>
    );
  if (rank === 2)
    return (
      <div className={`${baseClass} bg-gradient-to-br from-slate-300 to-slate-400 shadow-[0_0_15px_rgba(148,163,184,0.4)]`}>
        <Trophy className="w-5 h-5 text-white" />
      </div>
    );
  if (rank === 3)
    return (
      <div className={`${baseClass} bg-gradient-to-br from-orange-400 to-amber-600 shadow-[0_0_15px_rgba(251,146,60,0.4)]`}>
        <Medal className="w-5 h-5 text-white" />
      </div>
    );
  return (
    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-indigo-400/50">
      <span className="text-xs font-black font-mono text-slate-500">#{rank}</span>
    </div>
  );
};

/* ── XP Progress Bar ── */
const xpForLevel = (lv) => {
  const n = lv - 1;
  return Math.round((n * (n + 1) * 100) / 2);
};

const XPBar = ({ level, totalXP }) => {
  const current = xpForLevel(level);
  const next = xpForLevel(level + 1);
  const pct = level >= 100 ? 100 : Math.min(100, Math.round(((totalXP - current) / (next - current)) * 100));
  return (
    <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-cyan-400"
      />
    </div>
  );
};

const USERS_PER_PAGE = 20;

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [myUsername, setMyUsername] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // Mouse tracking for the Login-style 3D Hero Effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [5, -5]);
  const rotateY = useTransform(mouseX, [-300, 300], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);
  };

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    try {
      const [lbRes, profileRes] = await Promise.all([
        api.get("/leaderboard"),
        api.get("/users/profile"),
      ]);
      setLeaderboard(lbRes.data);
      setMyUsername(profileRes.data?.user?.username || profileRes.data?.username || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const myEntry = leaderboard.find((u) => u.username === myUsername);

  const totalPages = Math.ceil(leaderboard.length / USERS_PER_PAGE);
  const paginatedUsers = leaderboard.slice(
    (currentPage - 1) * USERS_PER_PAGE,
    currentPage * USERS_PER_PAGE
  );

  // Build page number array with ellipsis
  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div 
      className="min-h-screen bg-[#0a0a16] text-slate-300 relative overflow-x-hidden selection:bg-indigo-500/30"
      onMouseMove={handleMouseMove}
    >
      {/* ── BACKGROUND EFFECTS (Copied from Login) ── */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]"></div>
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      {/* ── GRID OVERLAY (Copied from Login) ── */}
      <div className="fixed inset-0 -z-10 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(99, 102, 241, 0.4)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12 space-y-10">

        {/* ── HERO SECTION (Cohesive Header) ── */}
        <motion.div 
          style={{ rotateX, rotateY, transformPerspective: 1000 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-bold tracking-widest text-indigo-400 uppercase font-mono">
                <Terminal className="w-3.5 h-3.5" /> Ranking Protocol v2.0
              </div>
              <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-white uppercase leading-none">
                Global <br />
                <span className="bg-gradient-to-r from-cyan-400 via-indigo-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                  Leaderboard
                </span>
              </h1>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: 180 }}
              whileTap={{ scale: 0.9 }}
              onClick={fetchAll}
              className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-indigo-400/50 hover:text-indigo-400 shadow-xl backdrop-blur-md transition-all"
            >
              <RefreshCw className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        {/* ── MY RANK CARD (The "Highlighted User" terminal box) ── */}
        {myEntry && !loading && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-indigo-500/5 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10 blur-xl group-hover:opacity-20 transition-opacity" />
            
            <div className="relative flex items-center justify-between gap-6 flex-wrap">
              <div className="flex items-center gap-5">
                <RankBadge rank={myEntry.rank} />
                <div>
                  <p className="text-[10px] uppercase tracking-[0.2em] text-indigo-400 font-mono font-black mb-1">Your Standing</p>
                  <p className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    {myEntry.name} <Sparkles className="w-4 h-4 text-cyan-400" />
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">
                <div className="text-right">
                  <p className="text-4xl font-black font-mono bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">Lv {myEntry.level}</p>
                  <p className="text-xs text-slate-500 font-mono uppercase tracking-tighter">{myEntry.totalXP} Total XP</p>
                </div>
                
                <div className="hidden md:grid grid-cols-4 gap-4 border-l border-white/10 pl-8">
                  {[
                    { icon: Brain, val: myEntry.mcqXP, grad: "from-purple-400 to-indigo-500" },
                    { icon: Code2, val: myEntry.dsaXP, grad: "from-cyan-400 to-blue-500" },
                    { icon: Star,  val: myEntry.starXP, grad: "from-amber-400 to-orange-500" },
                    { icon: Flame, val: myEntry.streakXP, grad: "from-rose-400 to-red-500" },
                  ].map(({ icon: Icon, val, grad }, i) => (
                    <div key={i} className="text-center">
                      <Icon className="w-3.5 h-3.5 text-slate-600 mx-auto mb-1" />
                      <span className={`text-sm font-black font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── RANKINGS TABLE ── */}
        <div className="relative rounded-3xl border border-white/10 bg-white/[0.03] backdrop-blur-md overflow-hidden shadow-2xl">
          {/* Table Head */}
          <div className="grid grid-cols-[64px_1fr_80px_auto] gap-3 items-center px-6 py-4 border-b border-white/10 bg-white/[0.02]">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Rank</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Competitor</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono text-right">Power Level</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono text-right hidden md:block">Stats</span>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-400 animate-spin" />
              <p className="text-xs font-mono text-slate-500 uppercase tracking-widest animate-pulse">Syncing Database...</p>
            </div>
          ) : error ? (
            <div className="m-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-mono flex items-center gap-3">
              <AlertCircle className="w-5 h-5" /> {error}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {paginatedUsers.map((user, idx) => {
                const isMe = user.username === myUsername;
                const isTop3 = user.rank <= 3;
                return (
                  <motion.div
                    key={user.userId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className={`grid grid-cols-[64px_1fr_80px_auto] gap-3 items-center px-6 py-3 group transition-all duration-300 ${
                      isMe ? "bg-indigo-500/10" : "hover:bg-white/[0.05]"
                    }`}
                  >
                    <RankBadge rank={user.rank} />

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm font-black truncate tracking-tight ${isMe ? "text-indigo-300" : "text-white"}`}>
                          {user.name}
                        </p>
                        {isMe && (
                          <span className="text-[7px] px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 font-black border border-indigo-500/30 uppercase tracking-tighter">
                            You
                          </span>
                        )}
                      </div>
                      <XPBar level={user.level} totalXP={user.totalXP} />
                      <p className="text-[9px] text-slate-600 font-mono tracking-tight">{user.username}</p>
                    </div>

                    <div className="text-right">
                      <p className={`font-black font-mono leading-none ${isTop3 ? "text-xl text-white" : "text-base text-slate-400"}`}>
                        {user.level}
                      </p>
                      <p className="text-[8px] text-indigo-500/60 font-mono font-black mt-0.5 uppercase">{user.totalXP} XP</p>
                    </div>

                    <div className="hidden md:flex gap-3 pl-4 border-l border-white/5">
                      {[
                        { icon: Brain, val: user.mcqXP, grad: "from-purple-400 to-indigo-500" },
                        { icon: Code2, val: user.dsaXP, grad: "from-cyan-400 to-blue-500" },
                        { icon: Star,  val: user.starXP, grad: "from-amber-400 to-orange-500" },
                        { icon: Flame, val: user.streakXP, grad: "from-rose-400 to-red-500" },
                      ].map(({ icon: Icon, val, grad }, i) => (
                        <div key={i} className="flex flex-col items-center min-w-[28px]">
                          <Icon className="w-2.5 h-2.5 text-slate-700 group-hover:text-slate-500 transition-colors" />
                          <span className={`text-[9px] font-black font-mono bg-gradient-to-r ${grad} bg-clip-text text-transparent`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── PAGINATION ── */}
        {!loading && !error && totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Showing {(currentPage - 1) * USERS_PER_PAGE + 1}–{Math.min(currentPage * USERS_PER_PAGE, leaderboard.length)} of {leaderboard.length} competitors
            </p>
            <div className="flex items-center gap-1">
              {/* Prev */}
              <button
                onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === 1}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-400 hover:border-indigo-400/50 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                ←
              </button>

              {/* Page numbers */}
              {getPageNumbers().map((pg, i) =>
                pg === "..." ? (
                  <span key={`ellipsis-${i}`} className="px-2 text-slate-600 text-xs font-mono">…</span>
                ) : (
                  <button
                    key={pg}
                    onClick={() => { setCurrentPage(pg); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all ${
                      pg === currentPage
                        ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400"
                        : "bg-white/5 border border-white/10 text-slate-400 hover:border-indigo-400/50 hover:text-indigo-400"
                    }`}
                  >
                    {pg}
                  </button>
                )
              )}

              {/* Next */}
              <button
                onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-slate-400 hover:border-indigo-400/50 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              >
                →
              </button>
            </div>
          </div>
        )}

        {/* ── FOOTER (Terminal Style) ── */}
        <div className="flex flex-col items-center gap-4 py-10 opacity-50">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <p className="text-[10px] font-mono tracking-[0.3em] uppercase">
            © 2026 InterviewPrep · Leaderboard Sync Complete · v2.0
          </p>
        </div>
      </div>
    </div>
  );
}

export default Leaderboard;