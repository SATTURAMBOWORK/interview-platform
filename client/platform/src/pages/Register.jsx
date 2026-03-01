import { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import usePageTitle from "../hooks/usePageTitle";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Eye, EyeOff, User, Lock, Mail, UserCircle, AlertCircle, Loader, Terminal, Sparkles, Rocket, Star, Heart, Zap, Shield } from "lucide-react";
import api from "../api/axios";
import { AuthContext } from "../context/AuthContextValue";

function Register() {
  usePageTitle("Register");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    username: "",
    name: "",
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hoveredFeature, setHoveredFeature] = useState(null);

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

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const res = await api.post("/auth/register", formData);

      const token = res.data.token;
      const role = res.data.user?.role?.toLowerCase();

      if (!token || !role) {
        throw new Error("Invalid registration response");
      }

      login(token, role);

      if (role === "admin") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const features = [
    { icon: Zap, label: "Instant Access", color: "cyan", emoji: "⚡" },
    { icon: Shield, label: "Secure Setup", color: "purple", emoji: "🛡️" },
    { icon: Rocket, label: "Start Journey", color: "orange", emoji: "🚀" },
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

      {/* GRID OVERLAY */}
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
        
        {/* LEFT SIDE - INTERACTIVE HERO */}
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

            {/* Floating sparkles */}
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

            {/* Fun floating stars */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={`star-${i}`}
                initial={{ opacity: 0 }}
                animate={{
                  opacity: [0, 0.6, 0],
                  y: [0, -100],
                  scale: [0.8, 1.2, 0.8],
                  rotate: [0, 180, 360]
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
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400/30" />
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
                className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-purple-500/10 border border-purple-400/30 cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                >
                  <UserCircle className="w-5 h-5 text-purple-400" />
                </motion.div>
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-purple-400 font-mono">
                  New User Registration
                </span>
              </motion.div>

              <motion.h1
                whileHover={{ scale: 1.02 }}
                className="text-5xl md:text-6xl font-black text-white tracking-tighter leading-tight uppercase cursor-default"
              >
                Join The <br />
                <motion.span
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity }}
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-500 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]"
                  style={{ backgroundSize: "200% 200%" }}
                >
                  Elite Force
                </motion.span>
              </motion.h1>

              <p className="text-lg text-slate-400 leading-relaxed max-w-md">
                Create your account and unlock access to premium DSA training. Let's build something great! 🎯
              </p>
            </motion.div>

            {/* Interactive Features Grid */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="grid grid-cols-3 gap-3 pt-6"
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
                  className="relative p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm hover:border-purple-400/50 transition-all group cursor-pointer overflow-hidden"
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

                  <div className="flex flex-col items-center gap-2 text-center">
                    <motion.div
                      animate={hoveredFeature === i ? { rotate: [0, -10, 10, 0] } : {}}
                      transition={{ duration: 0.5 }}
                    >
                      <item.icon className={`w-6 h-6 text-${item.color}-400 group-hover:scale-110 transition-transform`} />
                    </motion.div>
                    
                    <p className="text-xs font-bold text-white">{item.label}</p>

                    <motion.span 
                      className="text-lg"
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

            {/* Motivational Code Snippet */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              whileHover={{ scale: 1.02 }}
              className="mt-6 p-5 rounded-2xl bg-black/40 border border-purple-400/20 backdrop-blur-sm font-mono text-sm cursor-pointer group"
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
                  <Rocket className="w-4 h-4 text-purple-400" />
                </motion.div>
              </div>
              
              <div className="space-y-1 text-slate-400 text-xs">
                <motion.p whileHover={{ x: 5, color: "#c084fc" }} transition={{ duration: 0.2 }}>
                  <span className="text-purple-400">const</span> <span className="text-cyan-400">newUser</span> = <span className="text-green-400">await</span> <span className="text-blue-400">register</span>();
                </motion.p>
                <motion.p whileHover={{ x: 5, color: "#c084fc" }} transition={{ duration: 0.2 }}>
                  <span className="text-purple-400">if</span> (newUser.<span className="text-yellow-400">isReady</span>) &#123;
                </motion.p>
                <motion.p whileHover={{ x: 10, color: "#c084fc" }} transition={{ duration: 0.2 }} className="pl-3">
                  journey.<span className="text-pink-400">begin</span>();
                </motion.p>
                <motion.p whileHover={{ x: 10, color: "#c084fc" }} transition={{ duration: 0.2 }} className="pl-3">
                  greatness.<span className="text-orange-400">await</span>();
                </motion.p>
                <motion.p whileHover={{ x: 5, color: "#c084fc" }} transition={{ duration: 0.2 }}>
                  &#125;
                </motion.p>
              </div>

              {/* Typing cursor */}
              <motion.div
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="inline-block w-1.5 h-3 bg-purple-400 ml-1"
              />
            </motion.div>

            {/* Fun stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1 }}
              className="flex items-center justify-center gap-8 pt-6"
            >
              {[
                { count: "FREE", label: "Forever", icon: "🎁" },
                { count: "<1min", label: "Setup", icon: "⏱️" },
                { count: "24/7", label: "Access", icon: "🌟" },
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
                  <span className="text-lg font-black text-white">{stat.count}</span>
                  <span className="text-xs text-slate-400 uppercase tracking-wider">{stat.label}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        {/* RIGHT SIDE - REGISTRATION FORM */}
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
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 rounded-3xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>

              <div className="relative bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-500/20 scrollbar-track-transparent">
                
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
                        "0 0 20px rgba(168, 85, 247, 0.5)",
                        "0 0 30px rgba(168, 85, 247, 0.8)",
                        "0 0 20px rgba(168, 85, 247, 0.5)"
                      ]
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-3xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-500 bg-clip-text text-transparent uppercase tracking-tighter"
                  >
                    Create Account
                  </motion.div>
                  <p className="text-slate-400 text-xs font-mono">[ JOIN THE ELITE FORCE ]</p>
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
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* USERNAME */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 font-mono">
                      Username
                    </label>
                    <div className="relative group/input">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        placeholder="choose_username"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* NAME */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.55 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 font-mono">
                      Full Name
                    </label>
                    <div className="relative group/input">
                      <UserCircle className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="your_full_name"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* EMAIL */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 font-mono">
                      Email
                    </label>
                    <div className="relative group/input">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                  </motion.div>

                  {/* PASSWORD */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.65 }}
                  >
                    <label className="block text-xs font-bold uppercase tracking-wider text-purple-400 mb-2 font-mono">
                      Password
                    </label>
                    <div className="relative group/input">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within/input:text-purple-400 transition-colors" />
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 text-white placeholder:text-slate-500 font-mono text-sm"
                      />
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-purple-400 transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </motion.button>
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-400/0 via-purple-400/5 to-purple-400/0 opacity-0 group-focus-within/input:opacity-100 transition-opacity pointer-events-none"></div>
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
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 group-hover/btn:from-purple-500 group-hover/btn:via-pink-500 group-hover/btn:to-cyan-500 transition-all duration-300"></div>
                    <div className="absolute inset-0 opacity-0 group-hover/btn:opacity-100 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 blur-xl transition-opacity duration-300"></div>
                    
                    <div className="relative flex items-center justify-center gap-2 uppercase tracking-wider font-mono text-sm">
                      {loading ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Loader className="w-4 h-4" />
                          </motion.div>
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <>
                          <Rocket className="w-4 h-4" />
                          <span>Launch Journey</span>
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

                {/* LOGIN LINK */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.9 }}
                  className="text-center"
                >
                  <p className="text-slate-400 font-mono text-xs">
                    Already enlisted?{" "}
                    <Link
                      to="/login"
                      className="font-bold text-purple-400 hover:text-purple-300 transition-colors underline-offset-4 hover:underline"
                    >
                      Login Now →
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

export default Register;