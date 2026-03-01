import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, ArrowLeft, Code2 } from "lucide-react";
import usePageTitle from "../hooks/usePageTitle";

export default function NotFound() {
  usePageTitle("404 – Page Not Found");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a16] flex flex-col items-center justify-center px-6 text-center">
      {/* Background glow */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-700/20 rounded-full blur-[120px]" />
      </div>

      {/* Logo */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 mb-8 shadow-[0_0_40px_rgba(99,102,241,0.4)]"
      >
        <Code2 className="w-8 h-8 text-white" />
      </motion.div>

      {/* 404 */}
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="text-8xl font-black font-mono text-white mb-4 leading-none"
      >
        <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
          404
        </span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-slate-400 text-lg mb-2"
      >
        Oops – this page doesn't exist.
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-slate-600 text-sm font-mono mb-10"
      >
        The URL you visited is either wrong or no longer available.
      </motion.p>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:border-indigo-400/40 hover:text-white transition-all text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Go back
        </button>

        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all text-sm font-semibold shadow-lg shadow-indigo-500/25"
        >
          <Home className="w-4 h-4" />
          Dashboard
        </button>
      </motion.div>
    </div>
  );
}
