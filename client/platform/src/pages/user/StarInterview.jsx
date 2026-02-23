import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ArrowLeft, Award, TrendingUp, AlertCircle, Loader } from "lucide-react";
import api from "../../api/axios";
import StarQuestion from "./StarQuestion";
import ResponseAnalysis from "./ResponseAnalysis";
import BehavioralProgress from "./BehavioralProgress";

function StarInterview() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [responses, setResponses] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [view, setView] = useState("menu"); // menu, practice, analysis, progress
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = ["Leadership", "Teamwork", "Problem-Solving", "Communication", "Conflict Resolution", "Adaptability", "Customer Focus"];

  useEffect(() => {
    fetchPerformanceSummary();
  }, []);

  const fetchPerformanceSummary = async () => {
    try {
      setError(null);
      const res = await api.get("/behavioral/performance/summary");
      setPerformanceSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch performance summary:", error);
      setPerformanceSummary(null);
    }
  };

  const fetchQuestions = async (category = null) => {
    try {
      setLoading(true);
      setError(null);
      const url = category ? `/behavioral/questions?category=${category}` : "/behavioral/questions";
      const res = await api.get(url);
      console.log("Fetched questions:", res.data);
      setQuestions(res.data);
      if (res.data.length > 0) {
        setCurrentQuestion(res.data[0]);
        setSelectedCategory(category);
        setView("practice");
      } else {
        setError("No questions found for this category");
      }
    } catch (error) {
      console.error("Failed to fetch questions:", error);
      setError(error.response?.data?.message || "Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const handleResponseSubmitted = (response) => {
    setResponses([...responses, response]);
    // Move to next question or show completion
    const nextIdx = questions.findIndex((q) => q._id === currentQuestion._id) + 1;
    if (nextIdx < questions.length) {
      setCurrentQuestion(questions[nextIdx]);
    } else {
      setView("menu");
      fetchPerformanceSummary();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-blue-100/40 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <motion.button
            whileHover={{ x: -4 }}
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </motion.button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100/60 rounded-lg">
              <BookOpen className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                STAR Interview Practice
              </h1>
              <p className="text-slate-600 mt-1">
                Improve your behavioral interview responses with AI feedback
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* MENU VIEW */}
          {view === "menu" && (
            <motion.div
              key="menu"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* PERFORMANCE SUMMARY */}
              {performanceSummary && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
                >
                  {/* Total Responses */}
                  <div className="group relative bg-white rounded-2xl border border-blue-100/60 p-8 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative space-y-4">
                      <div className="p-3 bg-blue-100/60 rounded-lg w-fit">
                        <BookOpen className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Total Responses</p>
                        <p className="text-5xl font-bold text-slate-900 mt-2">
                          {performanceSummary.totalResponses}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Average Score */}
                  <div className="group relative bg-white rounded-2xl border border-emerald-100/60 p-8 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative space-y-4">
                      <div className="p-3 bg-emerald-100/60 rounded-lg w-fit">
                        <Award className="w-6 h-6 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Average Score</p>
                        <p className="text-5xl font-bold text-emerald-600 mt-2">
                          {performanceSummary.averageScore}/100
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Top Strength */}
                  <div className="group relative bg-white rounded-2xl border border-purple-100/60 p-8 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative space-y-4">
                      <div className="p-3 bg-purple-100/60 rounded-lg w-fit">
                        <TrendingUp className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">Top Strength</p>
                        <p className="text-lg font-bold text-purple-600 mt-2 line-clamp-2">
                          {performanceSummary.topStrengths?.[0] || "Start practicing"}
                        </p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* CATEGORY CARDS */}
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-slate-900 mb-6">Choose a Category</h2>
                
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3"
                  >
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </motion.div>
                )}
                
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ staggerChildren: 0.1, delayChildren: 0.2 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {categories.map((category) => {
                    const stats = performanceSummary?.byCategory?.[category];
                    return (
                      <motion.button
                        key={category}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={!loading ? { scale: 1.02, y: -4 } : {}}
                        whileTap={!loading ? { scale: 0.98 } : {}}
                        onClick={() => fetchQuestions(category)}
                        disabled={loading}
                        className={`group relative bg-white rounded-2xl border-2 border-blue-100/60 p-8 shadow-sm hover:shadow-lg transition-all duration-500 overflow-hidden text-left ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                        <div className="relative space-y-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-xl font-bold text-slate-900">{category}</h3>
                              <p className="text-sm text-slate-600 mt-1">
                                {stats ? `${stats.count} attempted` : "Not started"}
                              </p>
                            </div>
                            {stats && (
                              <div className="p-2 bg-blue-100/60 rounded-lg">
                                <p className="text-sm font-bold text-blue-600">{stats.average.toFixed(0)}/100</p>
                              </div>
                            )}
                          </div>

                          {stats && (
                            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${stats.average}%` }}
                                transition={{ duration: 1, delay: 0.2 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                              />
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                            {loading ? (
                              <>
                                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
                                  <Loader className="w-4 h-4" />
                                </motion.div>
                                <span>Loading...</span>
                              </>
                            ) : (
                              <>Start practicing →</>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              </div>

              {/* VIEW PROGRESS */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setView("progress")}
                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                View All Responses
              </motion.button>
            </motion.div>
          )}

          {/* PRACTICE VIEW */}
          {view === "practice" && currentQuestion && (
            <StarQuestion
              key={currentQuestion._id}
              question={currentQuestion}
              onResponseSubmitted={handleResponseSubmitted}
              onBack={() => setView("menu")}
              currentIndex={questions.findIndex((q) => q._id === currentQuestion._id)}
              totalQuestions={questions.length}
            />
          )}

          {/* PROGRESS VIEW */}
          {view === "progress" && (
            <BehavioralProgress
              onBack={() => setView("menu")}
              onRefresh={fetchPerformanceSummary}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default StarInterview;
