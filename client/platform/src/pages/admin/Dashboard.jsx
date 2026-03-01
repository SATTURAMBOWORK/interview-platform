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
      <div className="flex items-center justify-center py-40">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-white/[0.1] border-t-indigo-400 rounded-full"
        />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center py-40">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-slate-600 mx-auto" />
          <p className="text-slate-500">Failed to load admin analytics</p>
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
    blue: "bg-blue-500/[0.08] text-blue-400 border border-blue-500/20",
    emerald: "bg-emerald-500/[0.08] text-emerald-400 border border-emerald-500/20",
    amber: "bg-amber-500/[0.08] text-amber-400 border border-amber-500/20",
    purple: "bg-purple-500/[0.08] text-purple-400 border border-purple-500/20",
    rose: "bg-rose-500/[0.08] text-rose-400 border border-rose-500/20",
    indigo: "bg-indigo-500/[0.08] text-indigo-400 border border-indigo-500/20",
  };

  return (
    <div className="space-y-10">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <BarChart2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] font-black tracking-widest text-indigo-400 uppercase font-mono mb-2">
                Admin Control Center
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight leading-none">
                Welcome Back
              </h1>
              <p className="text-slate-500 mt-1 text-sm">
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
            className="group relative bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 hover:border-indigo-400/30 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => navigate("/admin/users")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Total Users</p>
                  <p className="text-4xl font-black text-white mt-2">{stats?.totalUsers || 0}</p>
                  <p className="text-xs text-slate-600 mt-1">Registered accounts</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <Eye className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-xs font-semibold text-indigo-400">View all users</span>
              </div>
            </div>
          </motion.div>

          {/* Total Attempts Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group relative bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 hover:border-rose-400/30 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Total Attempts</p>
                  <p className="text-4xl font-black text-white mt-2">{stats?.totalAttempts || 0}</p>
                  <p className="text-xs text-slate-600 mt-1">Test submissions</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                  <Activity className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-xs font-semibold text-rose-400">View analytics</span>
              </div>
            </div>
          </motion.div>

          {/* Average Score Card */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group relative bg-white/[0.03] rounded-2xl border border-white/[0.08] p-6 hover:border-emerald-400/30 hover:bg-white/[0.06] transition-all duration-300 cursor-pointer overflow-hidden"
            onClick={() => navigate("/admin/analytics")}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 font-mono">Average Score</p>
                  <p className="text-4xl font-black text-white mt-2">{stats?.averageScore || 0}%</p>
                  <p className="text-xs text-slate-600 mt-1">User performance</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-white/[0.06]">
                <Flame className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-emerald-400">Performance metrics</span>
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
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-indigo-400" />
            Platform Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {alerts.map((alert, idx) => {
              const AlertIcon = alert.icon;
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  className={`p-4 rounded-xl border border-l-4 ${
                    alert.color === "amber"
                      ? "border-l-amber-500 border-amber-500/10 bg-amber-500/[0.05]"
                      : alert.color === "emerald"
                      ? "border-l-emerald-500 border-emerald-500/10 bg-emerald-500/[0.05]"
                      : "border-l-indigo-500 border-indigo-500/10 bg-indigo-500/[0.05]"
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
                    <p className="font-semibold text-white text-sm">{alert.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{alert.description}</p>
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
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-cyan-400" />
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
                  className={`p-4 rounded-xl text-left transition-all hover:opacity-90 ${colorMap[item.color]}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 font-mono">{item.label}</p>
                    <p className="text-3xl font-black mt-1">{item.value}</p>
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
          <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
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
                  className={`group relative rounded-xl p-4 text-left transition-all overflow-hidden ${colorMap[item.color]} hover:opacity-90`}
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-colors">
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm font-mono">{item.label}</p>
                        {item.badge && (
                          <span className="px-2 py-0.5 bg-indigo-500 text-white text-xs font-bold rounded">
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
          className="bg-emerald-500/[0.05] rounded-2xl border border-emerald-500/20 p-8"
        >
          <div className="flex items-start gap-4">
              <Shield className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-black text-white text-lg uppercase tracking-wide">System Status</h3>
                <p className="text-slate-500 mt-2 text-sm">
                All systems operational and running smoothly. Platform is ready for production use.
              </p>
              <div className="flex flex-wrap gap-8 mt-4">
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-mono">Content Items</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">
                    {(stats?.totalMcqs || 0) + (stats?.totalDsaProblems || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-mono">Active Users</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">{stats?.totalUsers || 0}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black font-mono">System Load</p>
                  <p className="text-lg font-black text-emerald-400 mt-1">Normal</p>
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