import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Sparkles, Terminal, Zap } from "lucide-react";
import { useState } from "react";

const SUBJECT_META = {
  DBMS: { 
    gradient: "from-cyan-400 via-blue-400 to-purple-500",
    glow: "rgba(6, 182, 212, 0.4)",
    
  },
  "Operating Systems": { 
    gradient: "from-blue-400 via-indigo-400 to-cyan-500",
    glow: "rgba(59, 130, 246, 0.4)",
   
  },
  "Computer Networks": { 
    gradient: "from-purple-400 via-pink-400 to-cyan-500",
    glow: "rgba(168, 85, 247, 0.4)",
    
  },
  OOPS: { 
    gradient: "from-orange-400 via-red-400 to-purple-500",
    glow: "rgba(251, 146, 60, 0.4)",
   
  },
  DEFAULT: { 
    gradient: "from-cyan-400 via-blue-400 to-purple-500",
    glow: "rgba(6, 182, 212, 0.4)",
   
  },
};

const getMeta = (name) => SUBJECT_META[name] || SUBJECT_META.DEFAULT;

const SubjectCard = ({ subject }) => {
  const navigate = useNavigate();
  const meta = getMeta(subject.name);
  const [isHovered, setIsHovered] = useState(false);

  // Mouse tracking for spotlight and tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-150, 150], [5, -5]);
  const rotateY = useTransform(mouseX, [-150, 150], [-5, 5]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    mouseX.set(e.clientX - centerX);
    mouseY.set(e.clientY - centerY);

    // Update CSS variables for spotlight
    const xPos = e.clientX - rect.left;
    const yPos = e.clientY - rect.top;
    e.currentTarget.style.setProperty("--mouse-x", `${xPos}px`);
    e.currentTarget.style.setProperty("--mouse-y", `${yPos}px`);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      style={{ rotateX, rotateY, transformPerspective: 1000 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onClick={() => navigate(`/dashboard/subject/${subject._id}`)}
      className="group relative cursor-pointer h-full"
    >
      {/* FLOATING PARTICLES (Same logic as DSA Hero) */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              opacity: [0, 1, 0],
              y: [0, -80],
              x: Math.random() * 40 - 20,
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              delay: i * 0.5,
            }}
            className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white rounded-full blur-[1px]"
          />
        ))}
      </div>

      {/* BACKGROUND GLOW */}
      <div 
        className="absolute -inset-1 opacity-0 group-hover:opacity-100 transition-all duration-500 blur-2xl rounded-3xl"
        style={{ backgroundColor: meta.glow }}
      />

      {/* CARD BODY */}
      <div className="relative h-full bg-[#0a0a16]/90 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden group-hover:border-white/20 transition-colors">
        
        {/* SPOTLIGHT EFFECT */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--mouse-x)_var(--mouse-y),rgba(255,255,255,0.08),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="p-8 space-y-6 relative z-10">
          
          {/* HEADER BADGE */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 font-mono">
                System.Initialize
              </span>
            </div>
            <motion.span 
              animate={isHovered ? { scale: 1.3, rotate: [0, 10, -10, 0] } : {}}
              className="text-2xl"
            >
              {meta.emoji}
            </motion.span>
          </div>

          {/* SUBJECT NAME - BIGGER + FLOATING GRADIENT */}
          <div className="space-y-3">
            <motion.h2 
              className={`text-4xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r ${meta.gradient} bg-clip-text text-transparent`}
              style={{ 
                backgroundSize: "200% 200%",
                fontFamily: "var(--font-header)" 
              }}
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              {subject.name}
            </motion.h2>
           
          </div>

          {/* STATS SECTION */}
          <div className="pt-4 flex items-center justify-between border-t border-white/5">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-mono mb-1">Modules Loaded</p>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-white font-mono">
                  {subject.totalMcqs ?? 0}
                </span>
                <Zap className="w-4 h-4 text-yellow-400 animate-pulse" />
              </div>
            </div>
          </div>

          {/* LAUNCH BUTTON */}
          <motion.div 
            className="relative pt-2"
            whileHover={{ y: -2 }}
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${meta.gradient} blur-lg opacity-0 group-hover:opacity-40 transition-opacity rounded-xl`} />
            <div className="relative w-full h-12 flex items-center justify-center gap-3 bg-white/5 border border-white/10 rounded-xl group-hover:border-white/40 transition-all">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white font-mono">
                Launch Module
              </span>
              <ArrowRight className="w-4 h-4 text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

        </div>

        {/* BOTTOM DECORATIVE SHINE */}
        <div className={`absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r ${meta.gradient}`} />
      </div>
    </motion.div>
  );
};

export default SubjectCard;