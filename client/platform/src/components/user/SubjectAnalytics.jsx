import { TrendingUp, Trophy, Target } from "lucide-react";

const SubjectAnalytics = ({ attempts }) => {
  const totalAttempts = attempts.length;
  const bestScore = Math.max(...attempts.map(a => a.score || 0), 0);
  const avgScore =
    totalAttempts === 0
      ? 0
      : Math.round(
          attempts.reduce((sum, a) => sum + a.score, 0) / totalAttempts
        );

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
      <AnalyticsCard label="Total Attempts" value={totalAttempts} icon={Target} />
      <AnalyticsCard label="Best Score" value={`${bestScore}%`} icon={Trophy} />
      <AnalyticsCard label="Average Score" value={`${avgScore}%`} icon={TrendingUp} />
    </div>
  );
};

const AnalyticsCard = ({ label, value, icon: Icon }) => (
  <div className="bg-white/80 backdrop-blur rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-xl transition-all">
    <div className="flex items-center justify-between">
      <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold">{label}</p>
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center">
          <Icon className="w-4 h-4 text-slate-600" />
        </div>
      )}
    </div>
    <p className="text-2xl font-bold text-slate-900 mt-3">{value}</p>
  </div>
);

export default SubjectAnalytics;
