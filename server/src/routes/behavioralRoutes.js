const express = require("express");
const router = express.Router();
const {
  getAllQuestions,
  getRandomQuestion,
  submitResponse,
  getUserResponses,
  getResponseById,
  getImprovementSuggestions,
  getPerformanceSummary,
  createQuestion,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/behavioralController");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// User Routes
router.get("/questions", protect, getAllQuestions);
router.get("/question/random", protect, getRandomQuestion);
router.post("/response/submit", protect, submitResponse);
router.get("/responses", protect, getUserResponses);
router.get("/response/:responseId", protect, getResponseById);
router.get("/suggestions/:category", protect, getImprovementSuggestions);
router.get("/performance/summary", protect, getPerformanceSummary);

// Admin Routes
router.post("/question/create", protect, isAdmin, createQuestion);
router.put("/question/:questionId", protect, isAdmin, updateQuestion);
router.delete("/question/:questionId", protect, isAdmin, deleteQuestion);

module.exports = router;
