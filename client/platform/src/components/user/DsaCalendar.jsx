import { useMemo, useState } from "react";
import { ChevronDown, Flame } from "lucide-react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Cyan intensity scale
const getColor = (count) => {
  if (count >= 4) return "bg-cyan-400/90 hover:bg-cyan-300";
  if (count >= 2) return "bg-cyan-500/70 hover:bg-cyan-400/80";
  if (count >= 1) return "bg-cyan-600/50 hover:bg-cyan-500/60";
  return "bg-white/5 hover:bg-white/10";
};

const CELL_SIZE = 16;
const GAP = 4;

const formatLocalDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DsaCalendar = ({ data, startYear }) => {
  const todayStr = formatLocalDate(new Date());

  const currentYear = new Date().getFullYear();
  const firstYear = startYear || currentYear;
  const [year, setYear] = useState(currentYear);

  /**
   * Map API data → { YYYY-MM-DD: count }
   */
  const activityMap = useMemo(() => {
    const map = {};
    data.forEach((d) => {
      map[d.date] = d.count;
    });
    return map;
  }, [data]);

  /**
   * 🔥 Compute current streak
   */
  const streak = useMemo(() => {
    let count = 0;
    const d = new Date();

    if ((activityMap[todayStr] || 0) === 0) return 0;

    while (true) {
      const key = formatLocalDate(d);
      if ((activityMap[key] || 0) > 0) {
        count++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }

    return count;
  }, [activityMap, todayStr]);

  /**
   * Build calendar grid for selected year
   */
  const weeks = useMemo(() => {
    const start = new Date(year, 0, 1);
    const end = new Date(year, 11, 31);

    // Align start to Sunday
    start.setDate(start.getDate() - start.getDay());

    const days = [];
    for (let d = new Date(start); d <= end || d.getDay() !== 0; d.setDate(d.getDate() + 1)) {
      const dateStr = formatLocalDate(d);
      days.push({
        date: dateStr,
        count: activityMap[dateStr] || 0,
        inYear: d.getFullYear() === year,
        isToday: dateStr === todayStr,
      });
    }

    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    return weeks;
  }, [activityMap, year, todayStr]);

  /**
   * Year dropdown options
   */
  const yearOptions = [];
  for (let y = firstYear; y <= currentYear; y++) {
    yearOptions.push(y);
  }

  return (
    <div className="space-y-8">
      
      {/* Header with Streak */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        
        {/* Streak Card */}
        <div className="group inline-flex items-center gap-4 rounded-xl border border-cyan-400/20 bg-black/20 px-5 py-4 transition-all duration-300 hover:border-cyan-400/35 hover:shadow-[0_0_24px_rgba(6,182,212,0.2)]">
          <div className="rounded-lg border border-cyan-400/30 bg-cyan-500/15 p-3 shadow-[0_0_20px_rgba(6,182,212,0.2)] transition-all duration-300 group-hover:shadow-[0_0_26px_rgba(6,182,212,0.35)]">
            <Flame className="w-5 h-5 text-cyan-300" />
          </div>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
              Current Streak
            </p>
            <p className="text-2xl font-bold text-white">
              {streak}
              <span className="ml-2 text-sm font-medium text-cyan-300">
                {streak === 1 ? "day" : "days"}
              </span>
            </p>
          </div>
        </div>

        {/* Year Selector */}
        <div className="relative group">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="appearance-none rounded-xl border border-white/10 bg-black/30 px-4 py-3 pr-10 text-sm font-medium text-slate-200 transition-all duration-300 hover:border-cyan-400/30 focus:border-cyan-400/40 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 cursor-pointer"
          >
            {yearOptions.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        </div>

      </div>

      {/* Calendar Grid */}
      <div className="space-y-6">
        
        <div
          className="grid"
          style={{
            gridTemplateColumns: `50px repeat(${weeks.length}, minmax(0, 1fr))`,
            gap: `${GAP}px`,
          }}
        >
          {/* Day labels */}
          <div className="flex flex-col gap-[4px] text-xs font-semibold uppercase tracking-widest text-slate-500">
            {DAYS.map((d) => (
              <div
                key={d}
                style={{ height: CELL_SIZE }}
                className="flex items-center justify-end pr-2"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Weeks */}
          {weeks.map((week, wi) => (
            <div
              key={wi}
              className="grid"
              style={{
                gridTemplateRows: `repeat(7, ${CELL_SIZE}px)`,
                gap: `${GAP}px`,
              }}
            >
              {week.map((cell, di) => (
                <div
                  key={`${wi}-${di}`}
                  title={
                    cell.inYear
                      ? `${cell.date}: ${cell.count} problem${cell.count !== 1 ? "s" : ""} solved`
                      : ""
                  }
                  className={`relative rounded-md transition-all duration-300 cursor-default ${
                    cell.inYear
                      ? `${getColor(cell.count)} shadow-sm hover:shadow-[0_0_10px_rgba(34,211,238,0.35)]`
                      : "bg-transparent"
                  } ${
                    cell.inYear && cell.count >= 4
                      ? "animate-[pulse_2.2s_ease-in-out_infinite]"
                      : ""
                  } ${
                    cell.isToday
                      ? "ring-2 ring-cyan-300 ring-offset-2 ring-offset-[#030308] shadow-[0_0_12px_rgba(34,211,238,0.55)]"
                      : ""
                  }`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 text-xs">
          <span className="font-medium text-slate-400">Activity</span>
          <div className="flex items-center gap-3">
            <span className="text-slate-500">Less</span>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-md border border-white/10 bg-white/5" />
              <div className="h-4 w-4 rounded-md bg-cyan-600/50 shadow-sm" />
              <div className="h-4 w-4 rounded-md bg-cyan-500/70 shadow-sm" />
              <div className="h-4 w-4 rounded-md bg-cyan-400/90 shadow-sm" />
            </div>
            <span className="text-slate-500">More</span>
          </div>
        </div>

      </div>

    </div>
  );
};

export default DsaCalendar;