import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, Send, AlertCircle, Lightbulb } from "lucide-react";
import api from "../../api/axios";
import ResponseAnalysis from "./ResponseAnalysis";

function StarQuestion({ question, onResponseSubmitted, onBack, currentIndex, totalQuestions }) {
  const [response, setResponse] = useState({
    situation: "",
    task: "",
    action: "",
    result: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (field, value) => {
    setResponse((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!response.situation || !response.task || !response.action || !response.result) {
      setError("Please fill in all STAR components");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.post("/behavioral/response/submit", {
        questionId: question._id,
        response,
      });

      setFeedback(res.data.response.feedback);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit response");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <ResponseAnalysis
        question={question}
        response={response}
        feedback={feedback}
        onNext={onResponseSubmitted}
      />
    );
  }

  const starComponents = [
    {
      key: "situation",
      title: "Situation",
      description: "Set the context. What was the situation or challenge you faced?",
      placeholder: "Describe the background and context of the situation...",
      color: "blue",
    },
    {
      key: "task",
      title: "Task",
      description: "What was the task or responsibility assigned to you?",
      placeholder: "Explain what you were required to do...",
      color: "purple",
    },
    {
      key: "action",
      title: "Action",
      description: "What actions did you take to address the situation?",
      placeholder: "Describe the specific steps and actions you took...",
      color: "amber",
    },
    {
      key: "result",
      title: "Result",
      description: "What were the outcomes and what did you learn?",
      placeholder: "Share the results, impact, and lessons learned...",
      color: "emerald",
    },
  ];

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
          Back
        </motion.button>

        <div className="text-sm font-semibold text-slate-600">
          Question <span className="text-blue-600">{currentIndex + 1}</span> of{" "}
          <span className="text-slate-900">{totalQuestions}</span>
        </div>

        {/* Progress Bar */}
        <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            transition={{ duration: 0.5 }}
            className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full"
          />
        </div>
      </motion.div>

      {/* QUESTION CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="bg-white rounded-2xl border border-blue-100/60 p-8 shadow-sm"
      >
        <div className="flex items-start gap-4 mb-4">
          <div className="p-3 bg-blue-100/60 rounded-lg">
            <AlertCircle className="w-6 h-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-600 uppercase tracking-wide">
              {question.category}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-2">{question.question}</h2>
            <p className="text-slate-600 mt-3">{question.description}</p>
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 p-4 bg-blue-50/50 border border-blue-200/50 rounded-lg">
          <p className="text-sm font-semibold text-slate-900 flex items-center gap-2">
            <Lightbulb className="w-4 h-4 text-amber-600" />
            Tips for a great response:
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {question.tips?.map((tip, idx) => (
              <li key={idx} className="flex gap-2">
                <span className="text-blue-600 font-bold">•</span>
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>

      {/* STAR RESPONSE FORM */}
      <div className="space-y-6">
        {starComponents.map((component, idx) => {
          const colorClasses = {
            blue: "border-blue-200 focus:border-blue-600 focus:ring-blue-500/10",
            purple: "border-purple-200 focus:border-purple-600 focus:ring-purple-500/10",
            amber: "border-amber-200 focus:border-amber-600 focus:ring-amber-500/10",
            emerald: "border-emerald-200 focus:border-emerald-600 focus:ring-emerald-500/10",
          };

          const borderColor = {
            blue: "border-l-blue-600",
            purple: "border-l-purple-600",
            amber: "border-l-amber-600",
            emerald: "border-l-emerald-600",
          };

          return (
            <motion.div
              key={component.key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              className={`bg-white rounded-2xl border-l-4 ${borderColor[component.color]} border-r border-t border-b border-slate-200 p-8 shadow-sm`}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-full bg-${component.color}-100 flex items-center justify-center font-bold text-${component.color}-600`}>
                  {String.fromCharCode(65 + idx)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{component.title}</h3>
                  <p className="text-sm text-slate-600">{component.description}</p>
                </div>
              </div>

              <textarea
                value={response[component.key]}
                onChange={(e) => handleChange(component.key, e.target.value)}
                placeholder={component.placeholder}
                className={`w-full min-h-[150px] p-4 border-2 rounded-lg focus:outline-none focus:ring-2 ${colorClasses[component.color]} resize-none transition-all duration-300 text-slate-900`}
              />

              <div className="mt-3 text-xs text-slate-500">
                {response[component.key].length} characters
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ERROR MESSAGE */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-rose-50 border border-rose-200 rounded-lg text-rose-700 text-sm"
        >
          {error}
        </motion.div>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex gap-4 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="flex-1 px-8 py-4 border-2 border-slate-300 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-all duration-300"
        >
          Back
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-5 h-5" />
          {loading ? "Analyzing..." : "Submit & Get Feedback"}
        </motion.button>
      </div>
    </motion.div>
  );
}

export default StarQuestion;
