import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { motion } from "framer-motion";
import { LogOut, LayoutDashboard, Shield, Menu, X, Trophy } from "lucide-react";
import { useState } from "react";
import { AuthContext } from "../../context/AuthContextValue";

const Navbar = () => {
  const { token, role, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setIsOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/90 border-b border-white/10 backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <div className="w-full px-6 py-4 flex justify-between items-center">
        
        {/* BRAND */}
        <Link
          to="/"
          className="group"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="text-2xl font-bold bg-gradient-to-r from-indigo-200 via-indigo-100 to-slate-100 bg-clip-text text-transparent hover:from-white hover:via-indigo-100 hover:to-indigo-200 transition-all duration-300"
          >
            InterviewPrep
          </motion.div>
        </Link>

        {/* DESKTOP NAVIGATION */}
        {token && (
          <div className="hidden md:flex items-center gap-8">
            {role === "user" && (
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/dashboard"
                  className="group flex items-center gap-2 text-slate-200 hover:text-indigo-200 font-medium transition-colors duration-300 relative"
                >
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-white/10 group-hover:bg-slate-800 transition-colors">
                    <LayoutDashboard className="w-4 h-4 text-indigo-200" />
                  </div>
                  Dashboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-indigo-200 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            )}

            {role === "user" && (
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/leaderboard"
                  className="group flex items-center gap-2 text-slate-200 hover:text-indigo-200 font-medium transition-colors duration-300 relative"
                >
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-white/10 group-hover:bg-slate-800 transition-colors">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  Leaderboard
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-400 to-indigo-200 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            )}

            {role === "admin" && (
              <motion.div
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <Link
                  to="/admin"
                  className="group flex items-center gap-2 text-slate-200 hover:text-indigo-200 font-medium transition-colors duration-300 relative"
                >
                  <div className="p-2 bg-slate-900/80 rounded-lg border border-white/10 group-hover:bg-slate-800 transition-colors">
                    <Shield className="w-4 h-4 text-indigo-200" />
                  </div>
                  Admin
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-indigo-400 to-indigo-200 group-hover:w-full transition-all duration-300"></span>
                </Link>
              </motion.div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="group relative px-6 py-2.5 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-semibold rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_30px_rgba(0,0,0,0.45)] transition-all duration-300 flex items-center gap-2 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-indigo-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <LogOut className="w-4 h-4 relative z-10" />
              <span className="relative z-10">Logout</span>
            </motion.button>
          </div>
        )}

        {/* MOBILE MENU BUTTON */}
        {token && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 bg-slate-900/80 hover:bg-slate-800 rounded-lg transition-colors border border-white/10"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-indigo-200" />
            ) : (
              <Menu className="w-6 h-6 text-indigo-200" />
            )}
          </motion.button>
        )}
      </div>

      {/* MOBILE NAVIGATION */}
      <motion.div
        initial={false}
        animate={isOpen ? { height: "auto", opacity: 1 } : { height: 0, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden border-t border-white/10"
      >
        <div className="px-6 py-6 space-y-4 bg-slate-950/95">
          
          {role === "user" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to="/dashboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all duration-300 text-slate-100 font-medium"
              >
                <div className="p-2 bg-slate-800 rounded-lg border border-white/10">
                  <LayoutDashboard className="w-5 h-5 text-indigo-200" />
                </div>
                <span>Dashboard</span>
              </Link>
            </motion.div>
          )}

          {role === "user" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <Link
                to="/leaderboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all duration-300 text-slate-100 font-medium"
              >
                <div className="p-2 bg-slate-800 rounded-lg border border-white/10">
                  <Trophy className="w-5 h-5 text-amber-400" />
                </div>
                <span>Leaderboard</span>
              </Link>
            </motion.div>
          )}

          {role === "admin" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Link
                to="/admin"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/80 border border-white/10 hover:border-white/20 transition-all duration-300 text-slate-100 font-medium"
              >
                <div className="p-2 bg-slate-800 rounded-lg border border-white/10">
                  <Shield className="w-5 h-5 text-indigo-200" />
                </div>
                <span>Admin</span>
              </Link>
            </motion.div>
          )}

          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-semibold rounded-xl shadow-[0_12px_24px_rgba(0,0,0,0.35)] hover:shadow-[0_16px_30px_rgba(0,0,0,0.45)] transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;