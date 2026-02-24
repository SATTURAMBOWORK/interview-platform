import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Eye, EyeOff, User, Lock, AlertCircle, Loader, Terminal, Zap, Shield, Code2, Sparkles, Rocket, Star, Heart } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContextValue";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(null);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  // Mouse tracking for 3D effect
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

  const features = [
    { 
      icon: Code2, 
      label: "1000+ Problems", 
      color: "cyan",
      emoji: "💻"
    },
    { 
      icon: Zap, 
      label: "Live Analytics", 
      color: "purple",
      emoji: "⚡"
    },
    { 
      icon: Shield, 
      label: "Secure Platform", 
      color: "green",
      emoji: "🛡️"
    },
    { 
      icon: Rocket, 
      label: "Level Up Fast", 
      color: "orange",
      emoji: "🚀"
    },
  ];

  return (
    <div className="h-screen overflow-hidden bg-[#0a0a16] text-slate-300 relative">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed inset-0 -z-20 bg-[#0a0a16]"></div>
      <div className="fixed inset-0 -z-10 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-600 rounded-full filter blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* GRID OVERLAY - Lighter */}
      <div className="fixed inset-0 -z-10 opacity-[0.15]">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
      </div>

      <div className="h-screen flex flex-col lg:flex-row relative z-10">
        
        {/* LEFT SIDE - INTERACTIVE HERO SECTION */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center p-12"
          onMouseMove={handleMouseMove}
          onMouseLeave={() => {
            mouseX.set(0);
            mouseY.set(0);
          }}
        >
          
          {/* Interactive floating elements */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              style={{ rotateX, rotateY }}
              animate={{ y: [0, -15, 0], rotate: [0, 3, 0] }}
              transition={{ duration: 6, repeat: Infinity }}
              className="absolute top-20 left-20 w-20 h-20 border-2 border-cyan-400/40 rounded-lg backdrop-blur-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-cyan-400/20 rounded-lg"
              />
            </motion.div>
            
            <motion.div
              style={{ rotateX, rotateY }}
              animate={{ y: [0, 15, 0], rotate: [0, -3, 0] }}
              transition={{ duration: 5, repeat: Infinity }}
              className="absolute top-32 right-24 w-24 h-24 border-2 border-purple-400/40 rounded-full backdrop-blur-sm"
            >
              <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute inset-0 bg-purple-400/20 rounded-full"
              />
            </motion.div>
            
            <motion.div
              style={{ rotateX, rotateY }}
              animate={{ x: [0, 15, 0] }}
              transition={{ duration: 5.5, repeat: Infinity }}
              className="absolute bottom-32 left-32 w-16 h-16 border-2 border-pink-400/40 rounded-lg backdrop-blur-sm"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-gradient-to-br from-pink-400/20 to-transparent rounded-lg"
              />
            </motion.div>

            {/* Floating sparkles - More playful */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  y: [0, -120],
                  x: Math.random() * 80 - 40,
                  rotate: [0, 360]
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{
                  left: `${15 + i * 12}%`,
                  top: `${40 + Math.random() * 30}%`,
                }}
              >
                <Sparkles className="w-3 h-3 text-cyan-400" />
              </motion.div>
            ))}

            {/* Fun floating hearts */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`heart-${i}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [0, -100],
                  scale: [0.8, 1.2, 0.8]
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  delay: i * 1.5,
                  ease: "easeOut"
                }}
                className="absolute"
                style={{
                  right: `${20 + i * 20}%`,
                  bottom: `${30 + i * 10}%`,
                }}
              >
                <Heart className="w-4 h-4 text-pink-400 fill-pink-400/30" />
              </motion.div>
            ))}
          </div>

          {/* Content */}
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1000 }}
            className="relative z-10 max-w-xl"
          >
            
            {/* Logo/Brand */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-5"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 cursor-pointer"
              >
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                >
                  <Code2 className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-2xl font-black tracking-tight">
                  <span className="text-white">Interview</span>
                  <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Prep</span>
                </span>
              </motion.div>

              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase cursor-default"
              >
                Initialize <br />
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Your Journey
                </motion.span>
              </motion.h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                Elite training ground for algorithmic mastery. Let's make you interview-ready! 🚀
              </p>
            </motion.div>

            {/* Interactive Features Grid - Compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-2 gap-3 pt-6"
            >
              {features.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 + i * 0.1 }}
                  whileHover={{ scale: 1.1, y: -5, rotate: [0, -2, 2, 0] }}
                  onHoverStart={() => setHoveredFeature(i)}
                  onHoverEnd={() => setHoveredFeature(null)}
                  className="relative p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-cyan-400/50 transition-all group cursor-pointer overflow-hidden"
                >
                  {/* Particle effects on hover */}
                  {hoveredFeature === i && (
                    <>
                      {[...Array(4)].map((_, j) => (
                        <motion.div
                          key={j}
                          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                          animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 2, 0],
                            x: (Math.random() - 0.5) * 80,
                            y: (Math.random() - 0.5) * 80,
                          }}
                          transition={{
                            duration: 0.8,
                            repeat: Infinity,
                            delay: j * 0.15,
                          }}
                          className={`absolute top-1/2 left-1/2 w-2 h-2 rounded-full bg-${item.color}-400`}
                        />
                      ))}
                    </>
                  )}

                  <div className="flex items-center gap-3">
                    <motion.div
                      animate={hoveredFeature === i ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className={`w-6 h-6 text-${item.color}-400 group-hover:scale-110 transition-transform`} />
                    </motion.div>
                    
                    <div className="flex-1">
                      <p className="text-xs font-bold text-white">{item.label}</p>
                    </div>

                    <motion.span 
                      className="text-xl"
                      animate={hoveredFeature === i ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      {item.emoji}
                    </motion.span>
                  </div>

                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br from-${item.color}-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl`}
                  />
                </motion.div>
              ))}
            </motion.div>

            {/* Motivational Code Snippet - Option 2 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="mt-6 p-5 rounded-2xl bg-black/40 border border-cyan-400/20 backdrop-blur-sm font-mono text-sm cursor-pointer group"
            >
              <div className="flex items-center gap-2 mb-3">
                <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-red-500 cursor-pointer" />
                <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-yellow-500 cursor-pointer" />
                <motion.div whileHover={{ scale: 1.2 }} className="w-3 h-3 rounded-full bg-green-500 cursor-pointer" />
                
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="ml-auto"
                >
                  <Rocket className="w-4 h-4 text-cyan-400" />
                </motion.div>
              </div>
              
              <div className="space-y-1 text-slate-400 text-xs">
                <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                  <span className="text-purple-400">const</span> <span className="text-cyan-400">journey</span> = <span className="text-green-400">await</span> <span className="text-blue-400">startLearning</span>();
                </motion.p>
                <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                  <span className="text-purple-400">if</span> (journey.<span className="text-yellow-400">isConsistent</span>) &#123;
                </motion.p>
                <motion.p whileHover={{ x: 10, color: "#22d3ee" }} transition={{ duration: 0.2 }} className="pl-3">
                  dreams.<span className="text-pink-400">become</span>(reality);
                </motion.p>
                <motion.p whileHover={{ x: 10, color: "#22d3ee" }} transition={{ duration: 0.2 }} className="pl-3">
                  success.<span className="text-orange-400">find</span>(you);
                </motion.p>
                <motion.p whileHover={{ x: 5, color: "#22d3ee" }} transition={{ duration: 0.2 }}>
                  &#125;
                </motion.p>
              </div>

              {/* Typing cursor */}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1.5 h-3 bg-cyan-400 ml-1"
              />
            </motion.div>

            {/* Fun stats counter - Compact */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-center gap-8 pt-6"
            >
              {[
                { count: "1K+", label: "Problems", icon: "📚" },
                { count: "50K+", label: "Users", icon: "👥" },
                { count: "99%", label: "Success", icon: "🎯" },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  whileHover={{ y: -5, scale: 1.15 }}
                  className="flex flex-col items-center cursor-pointer"
                >
                  <motion.span
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                    className="text-2xl mb-1"
                  >
                    {stat.icon}
                  </motion.span>
                  <span className="text-xl font-black text-white">{stat.count}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - LOGIN FORM */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-8 lg:py-0">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="w-full max-w-md"
          >
            
            {/* CARD */}
            <motion.div
              whileHover={{ scale: 1.01 }}
              className="relative group"
            >
              {/* Glow effect on hover */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-600 via-purple-600 to-pink-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl">
                
                {/* HEADER */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-2 mb-6"
                >
                  <motion.div
                    animate={{ 
                      textShadow: [
                        "0 0 20px rgba(6, 182, 212, 0.5)",
                        "0 0 30px rgba(6, 182, 212, 0.8)",
                        "0 0 20px rgba(6, 182, 212, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-black bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent tracking-tight"
                  >
                    <span className="flex items-center gap-2 justify-center">
                      <Code2 className="w-7 h-7 text-cyan-400" />
                      <span>Interview<span className="text-white">Prep</span></span>
                    </span>
                  </motion.div>
                  
                </motion.div>

                {/* ERROR MESSAGE */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2 backdrop-blur-sm"
                  >
                    <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-300 font-medium">{error}</p>
                  </motion.div>
                )}

                {/* FORM */}
                <form onSubmit={handleLogin} className="space-y-5">
                  
                  {/* USERNAME */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono">
                      Username
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="enter_username"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* PASSWORD */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2 font-mono">
                      Password
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-cyan-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-cyan-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* SUBMIT BUTTON */}
                  <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="w-full relative group/btn overflow-hidden rounded-xl py-3 font-bold text-white mt-6 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 group-hover/btn:from-cyan-500 group-hover/btn:via-blue-500 group-hover/btn:to-purple-500 transition-all duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 blur-xl transition-opacity duration-300"></div>
                    
                    <div className="relative flex items-center justify-center gap-2 uppercase tracking-wider font-mono text-sm">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader className="w-4 h-4" />
                          </motion.div>
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <Terminal className="w-4 h-4" />
                          <span>Initialize Access</span>
                        </>
                      )}
                    </div>
                  </motion.button>
                </form>

                {/* DIVIDER */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                  className="relative my-6"
                >
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="px-3 bg-[#0a0a16] text-slate-500 uppercase tracking-wider font-mono">or</span>
                  </div>
                </motion.div>

                {/* REGISTER LINK */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <p className="text-slate-400 font-mono text-xs">
                    New recruit?{" "}
                    <Link
                      to="/register"
                      className="font-bold text-cyan-400 hover:text-cyan-300 transition-colors underline-offset-4 hover:underline"
                    >
                      Register Now →
                    </Link>
                  </p>
                </motion.div>

                {/* FOOTER */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="mt-6 pt-5 border-t border-white/5"
                >
                  <p className="text-[10px] text-slate-500 text-center leading-relaxed font-mono">
                    © 2025 InterviewPrep · Secure Terminal v2.0
                  </p>
                </motion.div>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </div>

    </div>
  );
}

export default Login;