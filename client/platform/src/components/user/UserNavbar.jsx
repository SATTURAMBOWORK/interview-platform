import { useContext, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers, Code2, Award, LogOut, Menu, X, Flame,
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

  // Smooth spring configuration for fluid movement
  const smoothSpring = {
    type: "spring",
    stiffness: 300,
    damping: 30,
    mass: 1
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userRes, attemptsRes] = await Promise.all([
          api.get("/users/profile"),
          api.get("/attempts/my"),
        ]);

        setUser(userRes.data.user);

        // ── Unified XP-based level (same as Dashboard) ──
        const attemptsData = Array.isArray(attemptsRes.data) ? attemptsRes.data : [];

        // Fetch DSA stats + behavioral responses for full XP calc
        const [dsaRes, starRes] = await Promise.allSettled([
          api.get("/dsa/stats"),
          api.get("/behavioral/responses"),
        ]);
        const dsaStats = dsaRes.status === "fulfilled" ? dsaRes.value.data : null;
        const starResponses = starRes.status === "fulfilled" && Array.isArray(starRes.value.data)
          ? starRes.value.data : [];

        // Compute streak from attempts (same logic as Dashboard)
        const attemptDates = new Set(
          attemptsData.filter((a) => a.createdAt).map((a) => new Date(a.createdAt).toISOString().slice(0, 10))
        );
        let computedStreak = 0;
        const today = new Date();
        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          if (attemptDates.has(key)) computedStreak++;
          else if (i > 0) break;
        }
        setStreak(computedStreak);

        const highAccuracy = attemptsData.filter((a) => a.score >= 40).length;
        const dsaXP = (dsaStats?.easy?.solved || 0) * 75 + (dsaStats?.medium?.solved || 0) * 150 + (dsaStats?.hard?.solved || 0) * 300;
        const starXP = starResponses.reduce((sum, r) => {
          const s = r?.feedback?.overallScore ?? r?.overallScore ?? 0;
          if (s >= 80) return sum + 75;
          if (s >= 60) return sum + 40;
          return sum;
        }, 0);
        const totalXP = highAccuracy * 100 + computedStreak * 25 + dsaXP + starXP;
        const computedLevel = Math.min(Math.floor((1 + Math.sqrt(1 + (8 * totalXP) / 100)) / 2), 100);
        setLevel(computedLevel || 1);
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0a0a16]/80 backdrop-blur-xl">
      <div className="max-w-[1600px] mx-auto px-6">
        <div className="h-16 flex items-center justify-between gap-6">

          {/* LOGO */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            transition={smoothSpring}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-3 shrink-0"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
            >
              <Code2 className="w-5 h-5 text-white" />
            </motion.div>
            <span className="text-lg font-black tracking-tight hidden sm:block">
              <span className="text-white">Interview</span>
              <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Prep</span>
            </span>
          </motion.button>

          {/* CENTER NAV - High Polish Hover */}
          <nav className="hidden lg:flex items-center gap-10">
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
                  initial={false}
                  whileHover={{ 
                    scale: 1.08,
                    color: "#22d3ee"
                  }}
                  transition={smoothSpring}
                  className="relative flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] outline-none text-white/70 hover:text-white"
                >
                  <Icon className="w-4 h-4" /> 
                  {label}
                  {active && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2px] rounded-full bg-white/40" />
                  )}
                </motion.button>
              );
            })}
          </nav>

          {/* RIGHT: STATS + PROFILE + LOGOUT */}
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-xs text-white/90 font-mono">{streak}d</span>
              </div>
              <div className="text-xs text-white/90 font-mono">
                Lv {level}
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center">
                  <span className="text-xs font-bold text-white font-mono">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                </div>
                <span className="text-sm text-white font-semibold tracking-tight">
                  {user?.username || "User"}
                </span>
              </div>
              
              <motion.button
                onClick={handleLogout}
                whileHover={{ 
                  scale: 1.1,
                  color: "#22d3ee"
                }}
                transition={smoothSpring}
                className="flex items-center gap-2 text-white outline-none"
              >
                <LogOut className="w-4 h-4" />
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] font-bold">Exit</span>
              </motion.button>
            </div>

            {/* MOBILE HAMBURGER */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white hover:text-cyan-400 transition-colors duration-200"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden pb-8 space-y-6 border-t border-white/10 pt-6 overflow-hidden"
            >
              <div className="grid gap-6">
                {[
                  { path: "/dashboard", icon: Layers, label: "Dashboard" },
                  { path: "/dsa", icon: Code2, label: "Arena" },
                  { path: "/star-interview", icon: Award, label: "Behavioral" },
                ].map(({ path, icon: Icon, label }) => (
                  <motion.button 
                    key={path}
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ color: "#22d3ee" }}
                    onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                    className={`relative flex items-center gap-4 w-full font-mono text-sm uppercase tracking-widest ${
                      isActive(path) ? "text-white font-bold" : "text-white/60"
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                    {isActive(path) && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />
                    )}
                  </motion.button>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white text-xs font-mono">
                    {user?.username?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <span className="text-white text-sm font-medium">{user?.username || "User"}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-white p-2 hover:text-cyan-400 transition-colors"
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