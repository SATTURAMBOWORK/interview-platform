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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"
        />
      </div>
    );
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-slate-900 mb-2">Platform Analytics</h1>
        <p className="text-slate-600">Comprehensive insights to manage your platform effectively</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 flex-wrap">
        {["summary", "users", "content", "activity", "dsa"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-3 rounded-lg font-semibold transition-all capitalize ${
              activeTab === tab
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white text-slate-600 border border-slate-200 hover:border-blue-300"
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
                  whileHover={{ translateY: -5 }}
                  className={`p-6 rounded-xl bg-white border-2 border-${stat.color}-100 shadow-sm hover:shadow-lg transition-all`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                      <p className={`text-3xl font-bold text-${stat.color}-600 mt-2`}>{stat.value}</p>
                    </div>
                    <Icon className={`w-12 h-12 text-${stat.color}-400 opacity-50`} />
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Engagement Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <PieChartIcon className="w-5 h-5 text-blue-600" />
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

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">User Engagement Metrics</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-slate-600 mb-1">Engagement Rate</p>
                  <div className="w-full bg-slate-100 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all"
                      style={{ width: `${userData?.userEngagementRate || 0}%` }}
                    />
                  </div>
                  <p className="text-sm font-semibold text-slate-900 mt-1">{userData?.userEngagementRate || 0}%</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-2">New Users This Week</p>
                  <p className="text-2xl font-bold text-green-600">{userData?.newUsersThisWeek || 0}</p>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-sm text-slate-600 mb-2">Avg Attempts Per User</p>
                  <p className="text-2xl font-bold text-purple-600">{userData?.avgAttemptsPerUser || 0}</p>
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
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">User Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-slate-600">Total Users</span>
                  <span className="text-2xl font-bold text-blue-600">{userData.totalUsers}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-slate-600">Active Users</span>
                  <span className="text-2xl font-bold text-green-600">{userData.activeUsers}</span>
                </div>
                <div className="flex justify-between items-center pb-3 border-b">
                  <span className="text-slate-600">Engagement Rate</span>
                  <span className="text-2xl font-bold text-purple-600">{userData.userEngagementRate}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-600">New This Week</span>
                  <span className="text-2xl font-bold text-amber-600">{userData.newUsersThisWeek}</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Users by Role</h3>
              {userData.usersByRole && (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={Object.entries(userData.usersByRole).map(([role, count]) => ({
                      role: role.charAt(0).toUpperCase() + role.slice(1),
                      count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="role" />
                    <YAxis />
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Subject-wise Performance
            </h3>
            {contentData.subjectWiseScores && contentData.subjectWiseScores.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={contentData.subjectWiseScores.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="_id" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
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
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance by Difficulty</h3>
              {contentData.difficultyPerformance && (
                <div className="space-y-4">
                  {contentData.difficultyPerformance.map((item, idx) => (
                    <div key={idx} className="pb-3 border-b last:border-b-0">
                      <p className="font-semibold text-slate-900 capitalize">{item._id}</p>
                      <p className="text-sm text-slate-600">
                        Avg Score: {Number.isFinite(item.avgScore) ? item.avgScore.toFixed(2) : "0.00"}%
                      </p>
                      <p className="text-sm text-slate-600">Attempts: {item.totalAttempts}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Lowest Performing MCQs</h3>
              {contentData.lowestPerformingMcqs && (
                <div className="space-y-3">
                  {contentData.lowestPerformingMcqs.map((mcq, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-sm font-semibold text-slate-900 truncate">{mcq.question}</p>
                      <p className="text-xs text-red-600 font-semibold">
                        Success Rate: {Number.isFinite(mcq.successRate) ? mcq.successRate.toFixed(2) : "0.00"}%
                      </p>
                      <p className="text-xs text-slate-600">Attempts: {mcq.attempts}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Subject MCQ Distribution */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">MCQ Distribution by Subject</h3>
            {contentData.subjectWiseMcqs && (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={contentData.subjectWiseMcqs.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
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
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <LineChartIcon className="w-5 h-5 text-blue-600" />
              Attempts & Score Trend (Last 30 Days)
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
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" angle={-45} textAnchor="end" height={100} />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
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
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Peak Activity Hour</h3>
              {activityData.peakActivityHour !== null ? (
                <div className="text-center py-8">
                  <p className="text-6xl font-bold text-blue-600">{activityData.peakActivityHour}:00</p>
                  <p className="text-slate-600 mt-2">Most tests taken at this hour</p>
                </div>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top 5 Performers</h3>
              {activityData.topPerformingUsers && activityData.topPerformingUsers.length > 0 ? (
                <div className="space-y-3">
                  {activityData.topPerformingUsers.slice(0, 5).map((user, idx) => (
                    <div key={idx} className="p-3 bg-gradient-to-r from-blue-50 to-transparent rounded-lg">
                      <p className="font-semibold text-slate-900 text-sm">{idx + 1}. {user.name}</p>
                      <p className="text-xs text-slate-600">{user.email}</p>
                      <p className="text-sm font-bold text-blue-600 mt-1">
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
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Total DSA Problems</h3>
              <p className="text-4xl font-bold text-purple-600">{dsaData.totalDsaProblems}</p>
            </div>
          </div>

          {/* DSA by Difficulty */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">DSA by Difficulty</h3>
              {dsaData.dsaByDifficulty && dsaData.dsaByDifficulty.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={dsaData.dsaByDifficulty.map((item) => ({
                      difficulty: item._id || "Unknown",
                      count: item.count,
                    }))}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="difficulty" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#a855f7" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>

            {/* DSA by Topic */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Problem Topics</h3>
              {dsaData.dsaByTopic && dsaData.dsaByTopic.length > 0 ? (
                <div className="space-y-2">
                  {dsaData.dsaByTopic.slice(0, 8).map((topic, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                      <span className="text-sm font-semibold text-slate-900">{topic._id}</span>
                      <span className="text-sm font-bold text-purple-600">{topic.count} problems</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">No data available</p>
              )}
            </div>
          </div>

          {/* Recent DSA Problems */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Sample DSA Problems</h3>
            {dsaData.recentDsaProblems && dsaData.recentDsaProblems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dsaData.recentDsaProblems.slice(0, 6).map((problem, idx) => (
                  <div key={idx} className="p-4 border border-slate-200 rounded-lg hover:shadow-md transition-all">
                    <p className="font-semibold text-slate-900 text-sm line-clamp-2">{problem.title}</p>
                    <div className="flex gap-2 mt-3 flex-wrap">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          problem.difficulty === "Easy"
                            ? "bg-green-100 text-green-700"
                            : problem.difficulty === "Medium"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                      {problem.tags && problem.tags.slice(0, 2).map((tag, tagIdx) => (
                        <span key={tagIdx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
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
