import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  FileQuestion,
  BarChart2,
  PlusCircle,
  Code2,
  Activity,
  Award,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Shield,
  Flame,
  Eye,
} from "lucide-react";
import api from "../../api/axios";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch admin summary stats
        const summaryRes = await api.get("/analytics/admin-summary");
        const summaryData = summaryRes.data;

        setStats({
          totalUsers: summaryData.totalUsers || 0,
          totalSubjects: summaryData.totalSubjects || 0,
          totalMcqs: summaryData.totalMcqs || 0,
          totalDsaProblems: summaryData.totalDsaProblems || 0,
          totalAttempts: summaryData.totalAttempts || 0,
          averageScore: summaryData.averageScore || 0,
        });

        console.log("Admin Summary Stats:", summaryData);
      } catch (err) {
        console.error("ADMIN DASHBOARD ERROR:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-slate-400 mx-auto" />
          <p className="text-slate-600 text-lg">Failed to load admin analytics</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 12 } },
  };

  /* ===================== */
  /* STAT CARDS */
  /* ===================== */
  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers || 0,
      icon: Users,
      color: "blue",
      description: "Active users",
    },
    {
      label: "Total Subjects",
      value: stats.totalSubjects || 0,
      icon: BookOpen,
      color: "emerald",
      description: "Course topics",
    },
    {
      label: "Total MCQs",
      value: stats.totalMcqs || 0,
      icon: FileQuestion,
      color: "amber",
      description: "Questions",
    },
    {
      label: "DSA Problems",
      value: stats.totalDsaProblems || 0,
      icon: Code2,
      color: "purple",
      description: "Coding problems",
    },
    {
      label: "Total Attempts",
      value: stats.totalAttempts || 0,
      icon: BarChart2,
      color: "rose",
      description: "User submissions",
    },
    {
      label: "Avg Score",
      value: `${stats.averageScore || 0}%`,
      icon: Award,
      color: "indigo",
      description: "User performance",
    },
  ];

  /* ===================== */
  /* QUICK ACTIONS */
  /* ===================== */
  const quickActions = [
    {
      label: "View Analytics",
      description: "Detailed platform analytics",
      icon: BarChart2,
      action: () => navigate("/admin/analytics"),
      color: "blue",
      badge: "New",
    },
    {
      label: "Manage Subjects",
      description: "Create, edit or delete subjects",
      icon: BookOpen,
      action: () => navigate("/admin/subjects"),
      color: "emerald",
    },
    {
      label: "Manage MCQs",
      description: "Add, edit or bulk upload questions",
      icon: FileQuestion,
      action: () => navigate("/admin/mcqs"),
      color: "amber",
    },
    {
      label: "DSA Problems",
      description: "View and manage coding problems",
      icon: Code2,
      action: () => navigate("/admin/dsa"),
      color: "purple",
    },
    {
      label: "Add DSA Problem",
      description: "Create a new problem",
      icon: PlusCircle,
      action: () => navigate("/admin/dsa/add"),
      color: "rose",
    },
    {
      label: "Manage Users",
      description: "View and manage user accounts",
      icon: Users,
      action: () => navigate("/admin/users"),
      color: "indigo",
    },
  ];

  /* ===================== */
  /* ALERTS & INSIGHTS */
  /* ===================== */
  const alerts = [
    {
      type: "info",
      icon: Flame,
      title: "High Engagement",
      description: `${Math.round(stats?.totalAttempts || 0)} total attempts recorded`,
      color: "amber",
    },
    {
      type: "success",
      icon: CheckCircle2,
      title: "Platform Health",
      description: "All systems operational",
      color: "emerald",
    },
    {
      type: "info",
      icon: Award,
      title: "Average Performance",
      description: `Users averaging ${stats?.averageScore || 0}% score`,
      color: "blue",
    },
  ];

  /* ===================== */
  /* CONTENT SUMMARY */
  /* ===================== */
  const contentSummary = [
    {
      label: "MCQs",
      value: stats?.totalMcqs || 0,
      icon: FileQuestion,
      action: () => navigate("/admin/mcqs"),
      color: "amber",
    },
    {
      label: "DSA Problems",
      value: stats?.totalDsaProblems || 0,
      icon: Code2,
      action: () => navigate("/admin/dsa"),
      color: "purple",
    },
    {
      label: "Subjects",
      value: stats?.totalSubjects || 0,
      icon: BookOpen,
      action: () => navigate("/admin/subjects"),
      color: "blue",
    },
  ];

  const colorMap = {
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    emerald: "bg-emerald-100 text-emerald-700 border-emerald-200",
    amber: "bg-amber-100 text-amber-700 border-amber-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    rose: "bg-rose-100 text-rose-700 border-rose-200",
    indigo: "bg-indigo-100 text-indigo-700 border-indigo-200",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* ANIMATED BACKGROUND */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-20 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-40 -left-40 w-80 h-80 bg-blue-300/10 rounded-full blur-3xl animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12 space-y-12">
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
              <BarChart2 className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-slate-900">
                Welcome Back, Admin
              </h1>
              <p className="text-slate-600 mt-1">
                Manage platform content, users, and monitor performance
              </p>
            </div>
          </div>
        </motion.div>

        {/* KEY STATISTICS */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Total Users Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group relative bg-white rounded-2xl border border-blue-100/60 p-6 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden cursor-pointer"
            onClick={() => navigate("/admin/users")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Users</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Registered accounts</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-100 text-blue-700">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Eye className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-600">View all users</span>
              </div>
            </div>
          </motion.div>

          {/* Total Attempts Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group relative bg-white rounded-2xl border border-rose-100/60 p-6 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden cursor-pointer"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Attempts</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.totalAttempts || 0}</p>
                  <p className="text-xs text-slate-500 mt-1">Test submissions</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-100 text-rose-700">
                  <Activity className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <TrendingUp className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-semibold text-rose-600">View analytics</span>
              </div>
            </div>
          </motion.div>

          {/* Average Score Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group relative bg-white rounded-2xl border border-emerald-100/60 p-6 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden cursor-pointer"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Average Score</p>
                  <p className="text-4xl font-bold text-slate-900 mt-2">{stats?.averageScore || 0}%</p>
                  <p className="text-xs text-slate-500 mt-1">User performance</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-100 text-emerald-700">
                  <Award className="w-6 h-6" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <Flame className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-600">Performance metrics</span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* ALERTS & INSIGHTS */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.1 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-6 h-6 text-blue-600" />
            Platform Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, idx) => {
              const AlertIcon = alert.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-4 rounded-xl border-l-4 ${
                    alert.color === "amber"
                      ? "border-l-amber-500 bg-amber-50"
                      : alert.color === "emerald"
                      ? "border-l-emerald-500 bg-emerald-50"
                      : "border-l-blue-500 bg-blue-50"
                  }`}
                >
                  <div className="flex gap-3">
                    <AlertIcon
                      className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        alert.color === "amber"
                          ? "text-amber-600"
                          : alert.color === "emerald"
                          ? "text-emerald-600"
                          : "text-blue-600"
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{alert.title}</p>
                      <p className="text-xs text-slate-600 mt-1">{alert.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* CONTENT SUMMARY */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-blue-600" />
            Content Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {contentSummary.map((item, idx) => {
              const ItemIcon = item.icon;
              return (
                <motion.button
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
                  onClick={item.action}
                  className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-md ${colorMap[item.color]}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium opacity-75">{item.label}</p>
                      <p className="text-3xl font-bold mt-1">{item.value}</p>
                    </div>
                    <ItemIcon className="w-8 h-8 opacity-40" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-6 h-6 text-blue-600" />
            Quick Actions
          </h2>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {quickActions.map((item) => {
              const IconComponent = item.icon;
              return (
                <motion.button
                  key={item.label}
                  variants={itemVariants}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={item.action}
                  className={`group relative rounded-xl border-2 p-4 text-left shadow-sm hover:shadow-md transition-all overflow-hidden ${colorMap[item.color]}`}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="relative flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/50 group-hover:bg-white transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm">{item.label}</p>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-xs opacity-75 mt-1">{item.description}</p>
                    </div>
                    <ArrowUpRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </motion.button>
              );
            })}
          </motion.div>
        </motion.div>

        {/* SYSTEM STATUS */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 p-8"
        >
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <h3 className="font-bold text-slate-900 text-lg">System Status</h3>
              <p className="text-slate-600 mt-2">
                All systems operational and running smoothly. Platform is ready for production use.
              </p>
              <div className="flex flex-wrap gap-8 mt-4">
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Content Items</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">
                    {(stats?.totalMcqs || 0) + (stats?.totalDsaProblems || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">Active Users</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">{stats?.totalUsers || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-600 uppercase tracking-wide font-semibold">System Load</p>
                  <p className="text-lg font-bold text-emerald-600 mt-1">Normal</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default AdminDashboard;