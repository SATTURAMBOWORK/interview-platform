import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  Code2,
  TrendingUp,
  Activity,
  Award,
  AlertCircle,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Target,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios";

function Analytics() {
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [userData, setUserData] = useState(null);
  const [contentData, setContentData] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [dsaData, setDsaData] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);

        const [summaryRes, userRes, contentRes, activityRes, dsaRes] = await Promise.all([
          api.get("/analytics/admin-summary"),
          api.get("/analytics/users"),
          api.get("/analytics/content"),
          api.get("/analytics/activity"),
          api.get("/analytics/dsa"),
        ]);

        setSummaryData(summaryRes.data);
        setUserData(userRes.data);
        setContentData(contentRes.data);
        setActivityData(activityRes.data);
        setDsaData(dsaRes.data);

        console.log("All analytics loaded:", {
          summary: summaryRes.data,
          users: userRes.data,
          content: contentRes.data,
          activity: activityRes.data,
          dsa: dsaRes.data,
        });
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/[0.1] border-t-indigo-400 rounded-full"
        />
      </div>
    );
  }

  const COLORS = ["#818cf8", "#34d399", "#fbbf24", "#f87171", "#a78bfa", "#fb7185"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono mb-3">
          Platform Analytics
        </div>
        <h1 className="text-4xl font-black text-white uppercase tracking-tight">Analytics</h1>
        <p className="text-slate-500 text-sm mt-1">Comprehensive insights to manage your platform effectively</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {["summary", "users", "content", "activity", "dsa"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest font-mono transition-all capitalize ${
              activeTab === tab
                ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/30 border border-indigo-400"
                : "bg-white/[0.04] text-slate-500 border border-white/[0.08] hover:border-indigo-400/30 hover:text-slate-300"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* SUMMARY TAB */}
      {activeTab === "summary" && summaryData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { label: "Total Users", value: summaryData.totalUsers, icon: Users, color: "blue" },
              { label: "Active Users", value: userData?.activeUsers || 0, icon: Activity, color: "green" },
              { label: "Total Subjects", value: summaryData.totalSubjects, icon: BookOpen, color: "amber" },
              { label: "MCQs", value: summaryData.totalMcqs, icon: Target, color: "rose" },
              { label: "DSA Problems", value: summaryData.totalDsaProblems, icon: Code2, color: "purple" },
              { label: "Avg Score", value: `${summaryData.averageScore}%`, icon: Award, color: "indigo" },
            ].map((stat, idx) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={idx}
                  whileHover={{ translateY: -3 }}
                  className={`p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] hover:border-indigo-400/30 transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-xs font-mono uppercase tracking-widest">{stat.label}</p>
                      <p className={`text-3xl font-black text-${stat.color}-400 mt-2`}>{stat.value}</p>
                    </div>
                    <Icon className={`w-12 h-12 text-${stat.color}-400 opacity-50`} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Engagement Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono flex items-center gap-2">
                <PieChartIcon className="w-4 h-4 text-indigo-400" />
                Users by Role
              </h3>
              {userData?.usersByRole && (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(userData.usersByRole).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value,
                      }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, idx) => (
                        <Cell key={`cell-${idx}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">User Engagement Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1 font-mono">Engagement Rate</p>
                  <div className="w-full bg-white/[0.06] rounded-full h-2.5">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-2.5 rounded-full transition-all"
                      style={{ width: `${userData?.userEngagementRate || 0}%` }}
                    />
                  </div>
                  <p className="text-sm font-black text-white mt-1">{userData?.userEngagementRate || 0}%</p>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-slate-500 mb-2 font-mono">New Users This Week</p>
                  <p className="text-2xl font-black text-emerald-400">{userData?.newUsersThisWeek || 0}</p>
                </div>

                <div className="pt-4 border-t border-white/[0.06]">
                  <p className="text-xs text-slate-500 mb-2 font-mono">Avg Attempts Per User</p>
                  <p className="text-2xl font-black text-purple-400">{userData?.avgAttemptsPerUser || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* USERS TAB */}
      {activeTab === "users" && userData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">User Overview</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                  <span className="text-slate-400 text-sm">Total Users</span>
                  <span className="text-2xl font-black text-indigo-400">{userData.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                  <span className="text-slate-400 text-sm">Active Users</span>
                  <span className="text-2xl font-black text-emerald-400">{userData.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
                  <span className="text-slate-400 text-sm">Engagement Rate</span>
                  <span className="text-2xl font-black text-purple-400">{userData.userEngagementRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-sm">New This Week</span>
                  <span className="text-2xl font-black text-amber-400">{userData.newUsersThisWeek}</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Users by Role</h3>
              {userData.usersByRole && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(userData.usersByRole).map(([role, count]) => ({
                      role: role.charAt(0).toUpperCase() + role.slice(1),
                      count,
                    }))}
                  >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="role" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* CONTENT TAB */}
      {activeTab === "content" && contentData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Subject Performance */}
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-indigo-400" />
              Subject-wise Performance
            </h3>
            {contentData.subjectWiseScores && contentData.subjectWiseScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={contentData.subjectWiseScores.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="avgScore" fill="#10b981" name="Avg Score" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="attemptCount" fill="#60a5fa" name="Attempt Count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-500">No data available</p>
            )}
          </div>

          {/* Difficulty Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Performance by Difficulty</h3>
              {contentData.difficultyPerformance && (
                <div className="space-y-4">
                  {contentData.difficultyPerformance.map((item, idx) => (
                    <div key={idx} className="pb-3 border-b border-white/[0.06] last:border-b-0">
                      <p className="font-black text-white capitalize text-sm">{item._id}</p>
                      <p className="text-xs text-slate-500">
                        Avg Score: {Number.isFinite(item.avgScore) ? item.avgScore.toFixed(2) : "0.00"}%
                      </p>
                      <p className="text-xs text-slate-500">Attempts: {item.totalAttempts}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Lowest Performing MCQs</h3>
              {contentData.lowestPerformingMcqs && (
                <div className="space-y-3">
                  {contentData.lowestPerformingMcqs.map((mcq, idx) => (
                    <div key={idx} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                      <p className="text-sm font-semibold text-white truncate">{mcq.question}</p>
                      <p className="text-xs text-red-400 font-semibold">
                        Success Rate: {Number.isFinite(mcq.successRate) ? mcq.successRate.toFixed(2) : "0.00"}%
                      </p>
                      <p className="text-xs text-slate-500">Attempts: {mcq.attempts}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject MCQ Distribution */}
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">MCQ Distribution by Subject</h3>
            {contentData.subjectWiseMcqs && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentData.subjectWiseMcqs.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#64748b', fontSize: 10 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="mcqCount" fill="#f59e0b" name="MCQ Count" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      )}

      {/* ACTIVITY TAB */}
      {activeTab === "activity" && activityData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* Attempts Trend */}
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono flex items-center gap-2">
              <LineChartIcon className="w-4 h-4 text-indigo-400" />
              Attempts &amp; Score Trend (Last 30 Days)
            </h3>
            {activityData.attemptsLast30Days && activityData.dailyScoreTrend && (
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={activityData.attemptsLast30Days.map((attempt, idx) => ({
                    date: attempt._id,
                    attempts: attempt.count,
                    avgScore:
                      activityData.dailyScoreTrend.find((score) => score._id === attempt._id)?.avgScore || 0,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} tick={{ fill: '#64748b', fontSize: 10 }} />
                  <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fill: '#64748b', fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="attempts"
                    stroke="#3b82f6"
                    name="Attempts"
                    dot={false}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="avgScore"
                    stroke="#10b981"
                    name="Avg Score (%)"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Peak Activity & Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Peak Activity Hour</h3>
              {activityData.peakActivityHour !== null ? (
                <div className="text-center py-8">
                  <p className="text-6xl font-black text-indigo-400">{activityData.peakActivityHour}:00</p>
                  <p className="text-slate-500 mt-2 text-sm">Most tests taken at this hour</p>
                </div>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>

            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Top 5 Performers</h3>
              {activityData.topPerformingUsers && activityData.topPerformingUsers.length > 0 ? (
                <div className="space-y-3">
                  {activityData.topPerformingUsers.slice(0, 5).map((user, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-r from-indigo-500/[0.08] to-transparent rounded-xl border border-indigo-500/10">
                      <p className="font-black text-white text-sm">{idx + 1}. {user.name}</p>
                      <p className="text-xs text-slate-500">{user.email}</p>
                      <p className="text-sm font-black text-indigo-400 mt-1">
                        Avg: {user.avgScore.toFixed(2)}% ({user.attemptCount} attempts)
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* DSA TAB */}
      {activeTab === "dsa" && dsaData && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          {/* DSA Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Total DSA Problems</h3>
              <p className="text-5xl font-black text-purple-400">{dsaData.totalDsaProblems}</p>
            </div>
          </div>

          {/* DSA by Difficulty */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">DSA by Difficulty</h3>
              {dsaData.dsaByDifficulty && dsaData.dsaByDifficulty.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dsaData.dsaByDifficulty.map((item) => ({
                      difficulty: item._id || "Unknown",
                      count: item.count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="difficulty" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>

            {/* DSA by Topic */}
            <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Top Problem Topics</h3>
              {dsaData.dsaByTopic && dsaData.dsaByTopic.length > 0 ? (
                <div className="space-y-2">
                  {dsaData.dsaByTopic.slice(0, 8).map((topic, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-white/[0.03] rounded-lg border border-white/[0.05]">
                      <span className="text-sm font-semibold text-white">{topic._id}</span>
                      <span className="text-sm font-black text-purple-400">{topic.count} problems</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>
          </div>

          {/* Recent DSA Problems */}
          <div className="bg-white/[0.03] p-6 rounded-2xl border border-white/[0.08]">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 font-mono">Sample DSA Problems</h3>
            {dsaData.recentDsaProblems && dsaData.recentDsaProblems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dsaData.recentDsaProblems.slice(0, 6).map((problem, idx) => (
                  <div key={idx} className="p-4 border border-white/[0.08] rounded-xl bg-white/[0.03] hover:border-indigo-400/30 transition-all">
                    <p className="font-semibold text-white text-sm line-clamp-2">{problem.title}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                          problem.difficulty === "Easy"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : problem.difficulty === "Medium"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                      {problem.tags && problem.tags.slice(0, 2).map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-1 rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500">No data available</p>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}

export default Analytics;
