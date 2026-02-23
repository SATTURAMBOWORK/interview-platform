import { motion } from "framer-motion";
import {
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Award,
  ChevronRight,
} from "lucide-react";

function ResponseAnalysis({ question, response, feedback, onNext }) {
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

  const overallScoreColor = getScoreColor(feedback.overallScore);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.1 },
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
      className="space-y-8"
    >
      {/* OVERALL SCORE CARD */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 100, damping: 15 }}
        className={`relative overflow-hidden rounded-3xl p-12 text-white ${
          overallScoreColor === "emerald"
            ? "bg-gradient-to-r from-emerald-600 to-green-600"
            : overallScoreColor === "blue"
            ? "bg-gradient-to-r from-blue-600 to-indigo-600"
            : overallScoreColor === "amber"
            ? "bg-gradient-to-r from-amber-600 to-orange-600"
            : "bg-gradient-to-r from-rose-600 to-red-600"
        }`}
      >
        <div className="relative space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Score */}
            <motion.div variants={itemVariants} className="text-center md:text-left">
              <p className="text-white/80 text-sm uppercase tracking-widest font-semibold">
                Overall Score
              </p>
              <p className="text-6xl md:text-7xl font-bold mt-2">
                {feedback.overallScore}
                <span className="text-3xl ml-2">/100</span>
              </p>
              <p className="text-white/90 text-lg font-medium mt-2">
                {getScoreLabel(feedback.overallScore)}
              </p>
            </motion.div>

            {/* Breakdown */}
            <motion.div variants={itemVariants} className="space-y-4 md:border-l md:border-r border-white/20 md:px-8">
              <div>
                <p className="text-white/80 text-xs uppercase tracking-widest font-semibold">
                  Clarity
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold">{feedback.clarity.score}</p>
                  <p className="text-white/80">/10</p>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-widest font-semibold">
                  Impact
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold">{feedback.impact.score}</p>
                  <p className="text-white/80">/10</p>
                </div>
              </div>
              <div>
                <p className="text-white/80 text-xs uppercase tracking-widest font-semibold">
                  Completeness
                </p>
                <div className="flex items-end gap-2 mt-2">
                  <p className="text-4xl font-bold">{feedback.completeness.score}</p>
                  <p className="text-white/80">/10</p>
                </div>
              </div>
            </motion.div>

            {/* Message */}
            <motion.div variants={itemVariants} className="flex flex-col justify-center">
              <p className="text-lg font-semibold leading-relaxed">
                {feedback.overallFeedback}
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* DETAILED FEEDBACK */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Clarity Feedback */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-blue-100/60 p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-blue-100/60 rounded-lg">
              <AlertCircle className="w-6 h-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Clarity & Expression
                <span className="text-sm font-semibold px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                  {feedback.clarity.score}/10
                </span>
              </h3>
              <p className="text-slate-700 mt-2">{feedback.clarity.comment}</p>
            </div>
          </div>
        </motion.div>

        {/* Impact Feedback */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-purple-100/60 p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-purple-100/60 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Impact & Relevance
                <span className="text-sm font-semibold px-3 py-1 bg-purple-100 text-purple-700 rounded-full">
                  {feedback.impact.score}/10
                </span>
              </h3>
              <p className="text-slate-700 mt-2">{feedback.impact.comment}</p>
            </div>
          </div>
        </motion.div>

        {/* Completeness Feedback */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-emerald-100/60 p-8 shadow-sm">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-emerald-100/60 rounded-lg">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                STAR Completeness
                <span className="text-sm font-semibold px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                  {feedback.completeness.score}/10
                </span>
              </h3>
              <p className="text-slate-700 mt-2">{feedback.completeness.comment}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* STRENGTHS AND IMPROVEMENTS */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Strengths */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-emerald-100/60 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Award className="w-6 h-6 text-emerald-600" />
            Your Strengths
          </h3>
          <ul className="space-y-3">
            {feedback.strengths?.map((strength, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-emerald-600 font-bold mt-1">✓</span>
                <span className="text-slate-700">{strength}</span>
              </li>
            ))}
          </ul>
        </motion.div>

        {/* Areas to Improve */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl border border-amber-100/60 p-8 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
            <Lightbulb className="w-6 h-6 text-amber-600" />
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {feedback.improvements?.map((improvement, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="text-amber-600 font-bold mt-1">→</span>
                <span className="text-slate-700">{improvement}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </motion.div>

      {/* ACTION BUTTONS */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="flex gap-4 pt-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
        >
          <span>Continue to Next Question</span>
          <ChevronRight className="w-5 h-5" />
        </motion.button>
      </motion.div>
    </motion.div>
  );
}

export default ResponseAnalysis;
