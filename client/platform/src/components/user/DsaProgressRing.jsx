import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle } from "lucide-react";

/*
 * Attempt at an exact LeetCode-style progress ring.
 *
 * Visual spec (from inspecting leetcode.com/profile):
 *   – Open-bottom arc spanning ~270° (from 135° to 405° i.e. 45°)
 *   – Three colored segments: Easy (teal), Medium (yellow), Hard (red)
 *   – Each segment's LENGTH is proportional to its (total / grandTotal)
 *   – The bright (solved) overlay fills a portion of each segment
 *   – Small gaps separate segments
 *   – Center: clickable, cycles between "Solved X/Y" and "Acceptance Z%"
 *   – Right side: 3 small stat boxes for Easy/Med/Hard
 */

// ─── Helper: polar → cartesian ───
function polarToCartesian(cx, cy, r, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

// ─── Helper: SVG arc path from startAngle to endAngle ───
function describeArc(cx, cy, r, startAngle, endAngle) {
  // Clamp to avoid full-circle edge case
  if (Math.abs(endAngle - startAngle) >= 360) {
    endAngle = startAngle + 359.999;
  }
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 0 ${end.x} ${end.y}`;
}

const DsaProgressRing = ({
  easy = { solved: 0, total: 0 },
  medium = { solved: 0, total: 0 },
  hard = { solved: 0, total: 0 },
  attemptedCount = 0,
  acceptanceRate = null,
}) => {
  const [displayMode, setDisplayMode] = useState(0);
  const [animated, setAnimated] = useState(false);
  const ringRef = useRef(null);

  useEffect(() => {
    // Trigger animation after mount
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, []);

  const totalSolved = easy.solved + medium.solved + hard.solved;
  const totalProblems = easy.total + medium.total + hard.total;

  // ─── Display modes (click center to cycle) ───
  const modes = [
    {
      label: "Solved",
      value: totalSolved,
      suffix: `/${totalProblems}`,
      showCheck: true,
      bottomLabel: "",
    },
    {
      label: "Acceptance",
      value:
        acceptanceRate !== null
          ? Number(acceptanceRate).toFixed(1)
          : "0.0",
      suffix: "%",
      showCheck: false,
      bottomLabel: `${totalSolved} / ${attemptedCount} attempted`,
    },
  ];

  const currentMode = modes[displayMode % modes.length];
  const cycleMode = () => setDisplayMode((p) => (p + 1) % modes.length);

  // ─── Difficulty definitions (LeetCode exact colors) ───
  const difficulties = [
    {
      key: "easy",
      label: "Easy",
      color: "#00b8a3",
      bgColor: "rgba(0, 184, 163, 0.25)",
      solved: easy.solved,
      total: easy.total,
    },
    {
      key: "medium",
      label: "Med.",
      color: "#ffc01e",
      bgColor: "rgba(255, 192, 30, 0.25)",
      solved: medium.solved,
      total: medium.total,
    },
    {
      key: "hard",
      label: "Hard",
      color: "#ef4743",
      bgColor: "rgba(239, 71, 67, 0.25)",
      solved: hard.solved,
      total: hard.total,
    },
  ];

  // ─── Arc Geometry ───
  // The ring spans 270° with a gap at the bottom.
  // Start angle: 135° (bottom-left), End angle: 405° (= 45°, bottom-right)
  const ARC_START = 135;
  const ARC_SPAN = 270;
  const ARC_END = ARC_START + ARC_SPAN; // 405°

  const CX = 50;
  const CY = 50;
  const RADIUS = 42;
  const STROKE_WIDTH = 5;

  // Gap between segments in degrees
  const GAP_DEG = totalProblems > 0 ? 4 : 0;
  const activeDiffs = difficulties.filter((d) => d.total > 0);
  const numGaps = Math.max(0, activeDiffs.length - 1);
  const usableSpan = ARC_SPAN - GAP_DEG * numGaps;

  // Build segment angles
  let cursor = ARC_START;
  const segments = difficulties.map((diff) => {
    if (diff.total === 0 || totalProblems === 0) {
      return { ...diff, startAngle: cursor, endAngle: cursor, solvedEndAngle: cursor };
    }

    const proportion = diff.total / totalProblems;
    const segmentSpan = proportion * usableSpan;
    const solvedRatio = diff.total > 0 ? diff.solved / diff.total : 0;
    const solvedSpan = solvedRatio * segmentSpan;

    const startAngle = cursor;
    const endAngle = cursor + segmentSpan;
    const solvedEndAngle = cursor + solvedSpan;

    cursor = endAngle + GAP_DEG;

    return {
      ...diff,
      startAngle,
      endAngle,
      solvedEndAngle,
      segmentSpan,
    };
  });

  // Background track (full 270° arc, dim)
  const trackPath = describeArc(CX, CY, RADIUS, ARC_START, ARC_END);

  return (
    <div className="w-full p-4">
      <div className="flex w-full gap-2" style={{ height: 148 }}>
        {/* ═══════════════════════════════
            LEFT: PROGRESS RING
            ═══════════════════════════════ */}
        <div
          ref={ringRef}
          className="rounded-lg relative flex h-full flex-1 cursor-pointer items-center justify-center overflow-hidden bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          onClick={cycleMode}
          title="Click to toggle stats"
        >
          <div className="relative w-[140px] h-[140px]">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              {/* Track: full 270° dim background */}
              <path
                d={trackPath}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth={STROKE_WIDTH}
                strokeLinecap="round"
              />

              {/* Segment backgrounds (dim color showing total capacity) */}
              {segments.map((seg) => {
                if (!seg.segmentSpan || seg.segmentSpan <= 0) return null;
                const path = describeArc(CX, CY, RADIUS, seg.startAngle, seg.endAngle);
                return (
                  <path
                    key={`bg-${seg.key}`}
                    d={path}
                    fill="none"
                    stroke={seg.bgColor}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                  />
                );
              })}

              {/* Segment foregrounds (bright color showing solved portion) */}
              {segments.map((seg) => {
                if (!seg.segmentSpan || seg.segmentSpan <= 0 || seg.solved === 0) return null;

                const fullPath = describeArc(CX, CY, RADIUS, seg.startAngle, seg.solvedEndAngle);

                // Calculate path length for animation
                const solvedRad = ((seg.solvedEndAngle - seg.startAngle) * Math.PI) / 180;
                const pathLength = Math.abs(solvedRad * RADIUS);

                return (
                  <path
                    key={`fg-${seg.key}`}
                    d={fullPath}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth={STROKE_WIDTH}
                    strokeLinecap="round"
                    strokeDasharray={pathLength}
                    strokeDashoffset={animated ? 0 : pathLength}
                    style={{
                      transition: `stroke-dashoffset 1.4s cubic-bezier(0.4, 0, 0.2, 1)`,
                      filter: `drop-shadow(0 0 6px ${seg.color})`,
                    }}
                  />
                );
              })}
            </svg>

            {/* ── Center Content (cycles on click) ── */}
            <div className="absolute inset-0 flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={displayMode}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-0.5 pointer-events-none select-none"
                >
                  <div className="flex items-baseline">
                    <span className="text-[26px] font-semibold leading-none text-white">
                      {currentMode.value}
                    </span>
                    <span className="text-[13px] text-slate-400 ml-0.5">
                      {currentMode.suffix}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {currentMode.showCheck && (
                      <CheckCircle className="w-3 h-3 text-green-500" />
                    )}
                    <span className="text-[11px] text-slate-400">
                      {currentMode.label}
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── Bottom Label ── */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`bottom-${displayMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, delay: 0.15 }}
                className="absolute bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] text-slate-500"
              >
                {currentMode.bottomLabel}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ═══════════════════════════════
            RIGHT: DIFFICULTY BREAKDOWN
            ═══════════════════════════════ */}
        <div className="flex h-full w-[90px] flex-none flex-col gap-2">
          {difficulties.map((diff) => (
            <div
              key={`stat-${diff.key}`}
              className="rounded-lg flex w-full flex-1 flex-col items-center justify-center gap-0.5 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
            >
              <span
                className="text-[11px] font-medium"
                style={{ color: diff.color }}
              >
                {diff.label}
              </span>
              <span className="text-[13px] font-semibold text-slate-200">
                {diff.solved}
                <span className="text-slate-500 font-normal">
                  /{diff.total}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DsaProgressRing;