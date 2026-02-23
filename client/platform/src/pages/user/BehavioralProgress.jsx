import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  ChevronLeft,
  TrendingUp,
  Award,
  AlertCircle,
  Filter,
  BookOpen,
} from "lucide-react";
import api from "../../api/axios";

function BehavioralProgress({ onBack, onRefresh }) {
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [expandedResponse, setExpandedResponse] = useState(null);

  const categories = ["all", "Leadership", "Teamwork", "Problem-Solving", "Communication", "Conflict Resolution", "Adaptability", "Customer Focus"];

  useEffect(() => {
    fetchResponses();
  }, [selectedCategory]);

  const fetchResponses = async () => {
    try {
      setLoading(true);
      const url = selectedCategory === "all" 
        ? "/behavioral/responses" 
        : `/behavioral/responses?category=${selectedCategory}`;
      const res = await api.get(url);
      setResponses(res.data.responses);
    } catch (error) {
      console.error("Failed to fetch responses:", error);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "emerald";
    if (score >= 60) return "blue";
    if (score >= 40) return "amber";
    return "rose";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Fair";
    return "Needs Improvement";
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-between"
      >
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Menu
        </motion.button>

        <h2 className="text-2xl font-bold text-slate-900">Your Responses</h2>

        <div className="w-32"></div>
      </motion.div>

      {/* FILTER BUTTONS */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex gap-3 flex-wrap items-center"
      >
        <Filter className="w-5 h-5 text-slate-600" />
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedCategory(cat)}
            className={`px-6 py-2 rounded-full font-semibold transition-all duration-300 text-sm ${
              selectedCategory === cat
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-white border-2 border-blue-200 text-slate-700 hover:border-blue-400"
            }`}
          >
            {cat.charAt(0).toUpperCase() + cat.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* RESPONSES LIST */}
      {loading ? (
        <div className="flex items-center justify-center min-h-96">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full"
          />
        </div>
      ) : responses.length === 0 ? (
        <div className="bg-white rounded-2xl border border-blue-100/60 p-12 text-center">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">No responses yet</p>
          <p className="text-slate-500 mt-1">
            Start practicing STAR questions to see your responses here
          </p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-4"
        >
          {responses.map((response, idx) => {
            const color = getScoreColor(response.feedback.overallScore);
            const colorMap = {
              emerald: {
                bg: "bg-emerald-50",
                border: "border-emerald-200",
                badge: "bg-emerald-100 text-emerald-700",
                text: "text-emerald-600",
              },
              blue: {
                bg: "bg-blue-50",
                border: "border-blue-200",
                badge: "bg-blue-100 text-blue-700",
                text: "text-blue-600",
              },
              amber: {
                bg: "bg-amber-50",
                border: "border-amber-200",
                badge: "bg-amber-100 text-amber-700",
                text: "text-amber-600",
              },
              rose: {
                bg: "bg-rose-50",
                border: "border-rose-200",
                badge: "bg-rose-100 text-rose-700",
                text: "text-rose-600",
              },
            };

            const colors = colorMap[color];
            const isExpanded = expandedResponse === response._id;

            return (
              <motion.div
                key={response._id}
                variants={itemVariants}
                className={`rounded-2xl border-2 ${colors.border} ${colors.bg} shadow-sm overflow-hidden transition-all duration-300`}
              >
                {/* Header */}
                <motion.button
                  onClick={() =>
                    setExpandedResponse(isExpanded ? null : response._id)
                  }
                  className="w-full p-6 text-left hover:opacity-90 transition-opacity"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {response.questionData.question}
                        </h3>
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${colors.badge}`}>
                          {response.questionData.category}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600">
                        Submitted {new Date(response.submittedAt).toLocaleDateString()}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className={`text-3xl font-bold ${colors.text}`}>
                        {response.feedback.overallScore}
                      </p>
                      <p className="text-xs font-semibold text-slate-600 mt-1">
                        {getScoreLabel(response.feedback.overallScore)}
                      </p>
                    </div>
                  </div>

                  {/* Score Breakdown */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Clarity</p>
                      <p className={`text-lg font-bold ${colors.text} mt-1`}>
                        {response.feedback.clarity.score}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Impact</p>
                      <p className={`text-lg font-bold ${colors.text} mt-1`}>
                        {response.feedback.impact.score}/10
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-600">Completeness</p>
                      <p className={`text-lg font-bold ${colors.text} mt-1`}>
                        {response.feedback.completeness.score}/10
                      </p>
                    </div>
                  </div>
                </motion.button>

                {/* Expanded Content */}
                {isExpanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t-2 border-current border-opacity-20 p-6 space-y-6"
                  >
                    {/* Feedback */}
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-2">Overall Feedback</p>
                        <p className="text-slate-700">{response.feedback.overallFeedback}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-2">Clarity & Expression</p>
                        <p className="text-sm text-slate-700">{response.feedback.clarity.comment}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-2">Impact & Relevance</p>
                        <p className="text-sm text-slate-700">{response.feedback.impact.comment}</p>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900 mb-2">STAR Completeness</p>
                        <p className="text-sm text-slate-700">{response.feedback.completeness.comment}</p>
                      </div>
                    </div>

                    {/* Strengths and Improvements */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-current border-opacity-20">
                      <div>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                          <Award className="w-4 h-4" />
                          Strengths
                        </p>
                        <ul className="space-y-2">
                          {response.feedback.strengths?.map((strength, i) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-700">
                              <span className="font-bold">✓</span>
                              <span>{strength}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-3">
                          <TrendingUp className="w-4 h-4" />
                          Areas to Improve
                        </p>
                        <ul className="space-y-2">
                          {response.feedback.improvements?.map((improvement, i) => (
                            <li key={i} className="flex gap-2 text-sm text-slate-700">
                              <span className="font-bold">→</span>
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Your Response */}
                    <div className="pt-4 border-t border-current border-opacity-20">
                      <p className="text-sm font-semibold text-slate-900 mb-3">Your Response</p>
                      <div className="space-y-3 bg-white/40 rounded-lg p-4 text-sm text-slate-700">
                        <div>
                          <p className="font-semibold text-slate-900">Situation:</p>
                          <p className="mt-1">{response.response.situation}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Task:</p>
                          <p className="mt-1">{response.response.task}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Action:</p>
                          <p className="mt-1">{response.response.action}</p>
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">Result:</p>
                          <p className="mt-1">{response.response.result}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}

export default BehavioralProgress;
