import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Eye, EyeOff, User, Lock, AlertCircle, Loader } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContextValue";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        username,
        password,
      });

      const token = res.data.token;
      const role = res.data.user?.role?.toLowerCase();

      if (!token || !role) {
        throw new Error("Invalid login response");
      }

      login(token, role);

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      setError(
        err.response?.data?.message ||
          "Invalid username or password. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white relative overflow-hidden">
      
      <div className="min-h-screen flex flex-col md:flex-row">
        
        {/* LEFT SIDE - BACKGROUND WITH ILLUSTRATION */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="hidden md:flex md:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
        >
          
          {/* Animated background elements */}
          <div className="absolute inset-0">
            {/* Grid pattern */}
            <div className="absolute inset-0 opacity-10">
              <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
              </svg>
            </div>

            {/* Floating circles - Network nodes */}
            <motion.div
              animate={{ y: [0, 20, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-20 left-10 w-12 h-12 bg-white/20 rounded-full blur-lg"
            ></motion.div>

            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 7, repeat: Infinity }}
              className="absolute top-1/3 right-20 w-16 h-16 bg-white/10 rounded-full blur-xl"
            ></motion.div>

            <motion.div
              animate={{ x: [0, 30, 0] }}
              transition={{ duration: 8, repeat: Infinity }}
              className="absolute bottom-1/4 left-1/4 w-20 h-20 bg-white/15 rounded-full blur-lg"
            ></motion.div>

            <motion.div
              animate={{ y: [0, -30, 0], x: [0, 20, 0] }}
              transition={{ duration: 9, repeat: Infinity }}
              className="absolute bottom-20 right-10 w-14 h-14 bg-white/20 rounded-full blur-lg"
            ></motion.div>
          </div>

          {/* Content overlay */}
          <div className="relative z-10 w-full h-full flex flex-col justify-center items-center p-12 text-white">
            
            {/* Main illustration */}
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="w-full max-w-sm"
            >
              <svg viewBox="0 0 300 300" className="w-full h-auto drop-shadow-lg" xmlns="http://www.w3.org/2000/svg">
                
                {/* Book/Learning icon */}
                <g>
                  {/* Pages */}
                  <motion.rect
                    x="60" y="80" width="180" height="140"
                    fill="none" stroke="white" strokeWidth="3" rx="8"
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  />
                  
                  {/* Center line */}
                  <line x1="150" y1="80" x2="150" y2="220" stroke="white" strokeWidth="2" opacity="0.5" />
                  
                  {/* Left page lines */}
                  <line x1="80" y1="110" x2="140" y2="110" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="80" y1="130" x2="140" y2="130" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="80" y1="150" x2="140" y2="150" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="80" y1="170" x2="140" y2="170" stroke="white" strokeWidth="2" opacity="0.6" />
                  
                  {/* Right page lines */}
                  <line x1="160" y1="110" x2="220" y2="110" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="160" y1="130" x2="220" y2="130" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="160" y1="150" x2="220" y2="150" stroke="white" strokeWidth="2" opacity="0.6" />
                  <line x1="160" y1="170" x2="220" y2="170" stroke="white" strokeWidth="2" opacity="0.6" />

                  {/* Checkmarks on right */}
                  <motion.g
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                  >
                    <circle cx="235" cy="110" r="6" fill="#10b981" />
                    <path d="M 232 110 L 234 112 L 237 109" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.g>

                  <motion.g
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                  >
                    <circle cx="235" cy="130" r="6" fill="#10b981" />
                    <path d="M 232 130 L 234 132 L 237 129" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.g>

                  <motion.g
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  >
                    <circle cx="235" cy="150" r="6" fill="#10b981" />
                    <path d="M 232 150 L 234 152 L 237 149" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.g>
                </g>

                {/* Connecting lines - Network effect */}
                <g stroke="white" strokeWidth="1" opacity="0.3">
                  <line x1="40" y1="150" x2="90" y2="130" />
                  <line x1="260" y1="140" x2="230" y2="160" />
                  <line x1="90" y1="240" x2="150" y2="200" />
                </g>

                {/* Corner nodes */}
                <circle cx="40" cy="150" r="4" fill="white" opacity="0.5" />
                <circle cx="260" cy="140" r="4" fill="white" opacity="0.5" />
                <circle cx="90" cy="240" r="4" fill="white" opacity="0.5" />
              </svg>
            </motion.div>

            {/* Text content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-center space-y-4 mt-12"
            >
              <h2 className="text-4xl font-bold">Ace Your Interviews</h2>
              <p className="text-xl text-white/80 max-w-sm leading-relaxed">
                Master Data Structures, Algorithms, and Core CS concepts with our comprehensive platform.
              </p>

              {/* Features list */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="space-y-3 pt-8"
              >
                {[
                  "1000+ DSA Problems",
                  "Subject-wise MCQs",
                  "Performance Analytics",
                  "Expert Solutions"
                ].map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + idx * 0.1 }}
                    className="flex items-center justify-center gap-3 text-white/90"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity, delay: idx * 0.1 }}
                      className="w-5 h-5 rounded-full bg-white/30 flex items-center justify-center"
                    >
                      <span className="text-xs font-bold">✓</span>
                    </motion.div>
                    <span className="font-medium">{feature}</span>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="w-full md:w-1/2 flex items-center justify-center px-4 md:px-0 py-12 md:py-0">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="w-full md:max-w-md"
          >
            
            {/* CARD */}
            <motion.div
              variants={itemVariants}
              className="relative group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 -z-10"></div>

              <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-blue-100/40 backdrop-blur-sm">
                
                {/* HEADER */}
                <motion.div variants={itemVariants} className="text-center space-y-2 mb-8">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="inline-block"
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                      InterviewPrep
                    </div>
                  </motion.div>
                  <p className="text-slate-600">Welcome back! Sign in to continue your journey</p>
                </motion.div>

                {/* ERROR MESSAGE */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="mb-6 p-4 bg-gradient-to-r from-rose-50 to-red-50 border border-rose-200 rounded-xl flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-rose-700 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-5">
                  
                  {/* USERNAME */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Username
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="enter your username"
                        required
                        className="w-full pl-12 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-slate-50 hover:bg-white"
                      />
                    </div>
                  </motion.div>

                  {/* PASSWORD */}
                  <motion.div variants={itemVariants}>
                    <label className="block text-sm font-semibold text-slate-800 mb-2">
                      Password
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/input:text-blue-600 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-12 pr-12 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 bg-slate-50 hover:bg-white"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-600 hover:text-slate-800 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </motion.button>
                    </div>
                  </motion.div>

                  {/* SUBMIT BUTTON */}
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full relative group/btn overflow-hidden rounded-xl py-3 font-bold text-white mt-8 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <div className={`absolute inset-0 transition-all duration-300 ${
                      loading ? "bg-gradient-to-r from-blue-500 to-blue-600" : "bg-gradient-to-r from-blue-600 to-indigo-600 group-hover/btn:from-blue-700 group-hover/btn:to-indigo-700"
                    }`}></div>
                    
                    <div className="relative flex items-center justify-center gap-2">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader className="w-5 h-5" />
                          </motion.div>
                          <span>Signing in...</span>
                        </>
                      ) : (
                        <span>Sign In</span>
                      )}
                    </div>
                  </motion.button>
                </form>

                {/* DIVIDER */}
                <motion.div variants={itemVariants} className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-600">Or</span>
                  </div>
                </motion.div>

                {/* REGISTER LINK */}
                <motion.div variants={itemVariants} className="text-center">
                  <p className="text-slate-700">
                    New user?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-blue-600 hover:text-blue-700 transition-colors underline-offset-2 hover:underline"
                    >
                      Create an account
                    </Link>
                  </p>
                </motion.div>

                {/* FOOTER */}
                <motion.p
                  variants={itemVariants}
                  className="text-xs text-slate-500 text-center mt-6 leading-relaxed"
                >
                  By signing in, you agree to our Terms of Service and Privacy Policy.
                </motion.p>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </div>
  );
}

export default Login;