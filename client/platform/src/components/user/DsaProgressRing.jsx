import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

const DsaProgressRing = ({
  easy = { solved: 0, total: 0 },
  medium = { solved: 0, total: 0 },
  hard = { solved: 0, total: 0 },
  attemptedCount = 0,
}) => {
  const [displayMode, setDisplayMode] = useState(0);

  const totalSolved = easy.solved + medium.solved + hard.solved;
  const totalProblems = easy.total + medium.total + hard.total;

  const modes = [
    {
      label: "Solved",
      value: totalSolved,
      suffix: `/${totalProblems}`,
      bottomLabel: "Solved",
      bottomValue: attemptedCount,
      bottomText: "Attempting",
    },
    {
      label: "Acceptance",
      value: totalProblems > 0 ? ((totalSolved / totalProblems) * 100).toFixed(2) : "0.00",
      suffix: "%",
      bottomLabel: "submission",
      bottomValue: totalSolved,
      bottomText: "submission",
    },
  ];

  const difficulties = [
    {
      key: "easy",
      label: "Easy",
      color: "#00b8a3", // LeetCode easy green
      dimColor: "rgba(0, 184, 163, 0.4)", // Increased opacity
      solved: easy.solved,
      total: easy.total,
    },
    {
      key: "medium",
      label: "Med.",
      color: "#ffc01e", // LeetCode medium yellow
      dimColor: "rgba(255, 192, 30, 0.4)", // Increased opacity
      solved: medium.solved,
      total: medium.total,
    },
    {
      key: "hard",
      label: "Hard",
      color: "#ef4743", // LeetCode hard red
      dimColor: "rgba(239, 71, 67, 0.5)", // Much higher opacity for visibility
      solved: hard.solved,
      total: hard.total,
    },
  ];

  // Circle configuration
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeWidth = 4; // Increased from 3 to 4 for better visibility
  const strokeDashoffset = 66; // LeetCode's offset to start from bottom

  // Calculate rotation and segment lengths
  let currentRotation = 225; // Start from bottom-left (like LeetCode)
  
  const segmentData = difficulties.map((diff) => {
    // Each segment's size is proportional to its total problems
    const percentage = totalProblems > 0 ? diff.total / totalProblems : 0;
    const solvedPercentage = diff.total > 0 ? diff.solved / diff.total : 0;
    
    // Calculate arc length for this segment
    const segmentLength = percentage * circumference;
    const solvedLength = solvedPercentage * segmentLength;
    const unsolvedLength = segmentLength - solvedLength;
    
    const result = {
      ...diff,
      rotation: currentRotation,
      segmentLength,
      solvedLength,
      unsolvedLength,
      percentage,
      solvedPercentage,
    };
    
    // Calculate next segment's starting rotation
    const segmentDegrees = percentage * 360;
    currentRotation += segmentDegrees;
    
    return result;
  });

  const currentMode = modes[displayMode % modes.length];

  const cycleMode = () => {
    setDisplayMode((prev) => (prev + 1) % modes.length);
  };

  return (
    <div className="min-h-[180px] w-full p-4">
      <div className="flex w-full gap-2 h-[148px]">
        {/* LEFT: PROGRESS RING */}
        <div
          className="rounded-lg relative flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden bg-white/[0.02] dark:bg-white/[0.06] hover:bg-white/[0.04] dark:hover:bg-white/[0.08] transition-colors"
          onClick={cycleMode}
        >
          <div className="relative aspect-[1/1] w-[160px] overflow-hidden">
            <div className="absolute left-1/2 top-1/2 h-[113%] w-[113%] translate-x-[-50%] translate-y-[-44%]">
              <svg
                viewBox="0 0 100 100"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-0 top-0 h-full w-full fill-transparent"
              >
                <defs>
                  {/* Clip path for the ring cutout */}
                  <clipPath id="bar-mask">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M21.3622 21.3622C5.54592 37.1784 5.54592 62.8216 21.3622 78.6378C21.9479 79.2236 21.9479 80.1734 21.3622 80.7591C20.7764 81.3449 19.8266 81.3449 19.2408 80.7591C2.25303 63.7713 2.25303 36.2287 19.2408 19.2409C36.2286 2.25305 63.7713 2.25305 80.7591 19.2409C97.7469 36.2287 97.7469 63.7713 80.7591 80.7591C80.1733 81.3449 79.2236 81.3449 78.6378 80.7591C78.052 80.1734 78.052 79.2236 78.6378 78.6378C94.454 62.8216 94.454 37.1784 78.6378 21.3622C62.8216 5.54594 37.1784 5.54594 21.3622 21.3622Z"
                    />
                  </clipPath>
                </defs>

                <g clipPath="url(#bar-mask)">
                  {segmentData.map((segment, index) => (
                    <g
                      key={segment.key}
                      className="origin-center translate-x-0 transition-all duration-400 ease-[cubic-bezier(.6,1.37,.81,.97)]"
                      style={{ 
                        transform: `rotate(${segment.rotation}deg)`,
                        transformOrigin: '50% 50%'
                      }}
                    >
                      {/* Background dim circle (unsolved) - Shows total capacity */}
                      <circle
                        cx="50"
                        cy="50"
                        r={radius}
                        className="fill-transparent transition-all duration-400 ease-[cubic-bezier(.6,1.37,.81,.97)]"
                        stroke={segment.dimColor}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={`${segment.segmentLength}, ${circumference - segment.segmentLength}`}
                        strokeDashoffset={strokeDashoffset}
                      />
                      
                      {/* Foreground bright circle (solved) - Shows solved portion */}
                      {segment.solved > 0 && (
                        <motion.circle
                          cx="50"
                          cy="50"
                          r={radius}
                          className="fill-transparent transition-all duration-400 ease-[cubic-bezier(.6,1.37,.81,.97)]"
                          stroke={segment.color}
                          strokeWidth={strokeWidth}
                          strokeLinecap="round"
                          strokeDasharray={`${segment.solvedLength}, ${circumference - segment.solvedLength}`}
                          strokeDashoffset={strokeDashoffset}
                          initial={{ strokeDasharray: `0, ${circumference}` }}
                          animate={{
                            strokeDasharray: `${segment.solvedLength}, ${circumference - segment.solvedLength}`,
                          }}
                          transition={{
                            duration: 1.5,
                            ease: "easeOut",
                            delay: index * 0.2,
                          }}
                          style={{
                            filter: `drop-shadow(0 0 8px ${segment.color}) drop-shadow(0 0 4px ${segment.color})`,
                          }}
                        />
                      )}
                    </g>
                  ))}
                </g>
              </svg>
            </div>

            {/* Center content - cycling stats */}
            <div className="absolute inset-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5 text-sm"
                >
                  <div>
                    <span className="text-[30px] font-semibold leading-[32px]">
                      {currentMode.value}
                    </span>
                    <span className="text-slate-400">{currentMode.suffix}</span>
                  </div>
                  <div className="relative">
                    {displayMode === 0 && (
                      <div className="text-[12px] leading-[normal] p-[1px] before:block before:h-3 before:w-3 text-green-500 absolute right-[calc(100%+2px)] top-1/2 -translate-y-1/2">
                        <CheckCircle className="absolute left-1/2 top-1/2 h-[1em] -translate-x-1/2 -translate-y-1/2" />
                      </div>
                    )}
                    <span className="text-[12px]">{currentMode.label}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Bottom label - cycling */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayMode}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="text-slate-400 absolute bottom-[5%] left-1/2 -translate-x-1/2 whitespace-nowrap text-xs"
                >
                  <span className="font-semibold">{currentMode.bottomValue}</span>
                  <span> {currentMode.bottomText}</span>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT: DIFFICULTY STATS */}
        <div className="flex h-full w-[90px] flex-none flex-col gap-2">
          {segmentData.map((segment) => (
            <div
              key={`stat-${segment.key}`}
              className="rounded-lg flex w-full flex-1 flex-col items-center justify-center gap-0.5 bg-white/[0.02] dark:bg-white/[0.06]"
            >
              <div className="text-xs font-medium" style={{ color: segment.color }}>
                {segment.label}
              </div>
              <div className="text-xs font-medium text-slate-200">
                {segment.solved}/{segment.total}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DsaProgressRing;