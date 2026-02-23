import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Code2, Award, Trophy, Flame, LogOut, Menu, X,
} from "lucide-react";
import api from "../../api/axios";
import { AuthContext } from "../../context/AuthContextValue";

const UserNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useContext(AuthContext);

  const [user, setUser] = useState(null);
  const [streak, setStreak] = useState(0);
  const [level, setLevel] = useState(1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, attemptsRes, calendarRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/attempts/my"),
          api.get("/dsa/calendar"),
        ]);

        setUser(userRes.data.user);
        const totalAttempts = attemptsRes.data?.length || 0;
        setLevel(Math.floor(totalAttempts / 5) + 1);

        const calendarData = Array.isArray(calendarRes.data) ? calendarRes.data : [];
        const activeDates = new Set(calendarData.map((d) => d.date || d._id));
        let currentStreak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          if (activeDates.has(key)) currentStreak++;
          else if (i > 0) break;
        }
        setStreak(currentStreak);
      } catch {
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const decoded = JSON.parse(atob(token.split(".")[1]));
            setUser({ username: decoded.username || "User" });
          }
        } catch { /* silent fallback */ }
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a16]/80 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="h-16 flex items-center justify-between gap-6">

          {/* LOGO - Interactive Movement */}
          <motion.button
            whileHover={{ scale: 1.05, x: 2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-9 h-9 rounded-xl border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/10 flex items-center justify-center shadow-[0_0_16px_rgba(6,182,212,0.3)] group-hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] group-hover:border-cyan-400 transition-all duration-300">
              <Layers className="w-4 h-4 text-cyan-300 group-hover:rotate-12 transition-transform" />
            </div>
            <div className="leading-tight text-left hidden sm:block">
              <p className="text-[10px] text-cyan-400 font-mono uppercase tracking-[0.35em] group-hover:tracking-[0.45em] transition-all">Interview</p>
              <p className="text-sm text-white font-bold uppercase tracking-widest">Prep</p>
            </div>
          </motion.button>

          {/* CENTER NAV - Cyan Hover & Subtle Movement */}
          <nav className="hidden lg:flex items-center gap-2">
            {[
              { path: "/dashboard", icon: Layers, label: "Dashboard" },
              { path: "/dsa", icon: Code2, label: "Arena" },
              { path: "/star-interview", icon: Award, label: "Behavioral" },
            ].map(({ path, icon: Icon, label }) => {
              const active = isActive(path);
              return (
                <motion.button
                  key={path}
                  onClick={() => navigate(path)}
                  whileHover={{ 
                    y: -2, 
                    backgroundColor: "rgba(6, 182, 212, 0.12)",
                    borderColor: "rgba(6, 182, 212, 0.4)",
                    color: "#67e8f9"
                  }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full font-mono text-[11px] uppercase tracking-widest transition-all duration-200 border ${
                    active 
                      ? "text-cyan-300 bg-cyan-500/15 border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.2)]" 
                      : "text-slate-400 bg-transparent border-transparent"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${active ? "animate-pulse" : ""}`} /> 
                  {label}
                </motion.button>
              );
            })}
          </nav>

          {/* RIGHT: STATS + PROFILE + LOGOUT */}
          <div className="flex items-center gap-4">
            {/* STATS */}
            <div className="hidden md:flex items-center gap-2">
              <motion.div whileHover={{ y: -2 }} className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-orange-400/20 bg-orange-500/10">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs text-slate-200 font-mono">{streak}d</span>
              </motion.div>
              <motion.div whileHover={{ y: -2 }} className="px-3 py-1.5 rounded-full border border-cyan-400/20 bg-cyan-500/10 text-xs text-cyan-200 font-mono">
                Lv {level}
              </motion.div>
            </div>

            {/* PROFILE + LOGOUT - Interactive movement */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-3 pl-1 pr-4 py-1 rounded-full border border-white/10 bg-white/5 hover:border-white/20 transition-all">
                <div className="w-8 h-8 rounded-full border border-cyan-400/40 bg-gradient-to-br from-cyan-500/20 to-purple-500/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-cyan-300 font-mono">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm text-slate-200 font-semibold tracking-tight">
                  {user?.username || "User"}
                </span>
              </div>
              
              <motion.button
                onClick={handleLogout}
                whileHover={{ 
                  scale: 1.05, 
                  x: 2,
                  backgroundColor: "rgba(6, 182, 212, 0.25)",
                  borderColor: "rgba(6, 182, 212, 0.5)"
                }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-cyan-400/20 bg-cyan-500/15 text-cyan-100 transition-all shadow-[0_0_10px_rgba(6,182,212,0.1)] hover:shadow-[0_0_20px_rgba(6,182,212,0.3)]"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Exit</span>
              </motion.button>
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-cyan-400" /> : <Menu className="w-5 h-5 text-cyan-400" />}
            </button>
          </div>
        </div>

        {/* MOBILE MENU */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden pb-6 space-y-4 border-t border-white/10 pt-4 overflow-hidden"
            >
              <div className="grid gap-2">
                {[
                  { path: "/dashboard", icon: Layers, label: "Dashboard" },
                  { path: "/dsa", icon: Code2, label: "Arena" },
                  { path: "/star-interview", icon: Award, label: "Behavioral" },
                ].map(({ path, icon: Icon, label }) => (
                  <button 
                    key={path}
                    onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                    className={`flex items-center gap-4 w-full px-5 py-3 rounded-xl font-mono text-sm uppercase tracking-widest transition-all ${
                      isActive(path) ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-slate-400 bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/10 bg-white/5 flex-1">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-400/30">
                    <span className="text-xs text-cyan-300 font-mono font-bold">
                      {user?.username?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <span className="text-sm text-white font-medium">{user?.username || "User"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-3 rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default UserNavbar;