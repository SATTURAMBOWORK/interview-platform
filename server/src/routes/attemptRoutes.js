const express = require("express");
const router = express.Router();

const {
  startTest,
  submitAttempt,
  getMyAttempts,
  getAttemptById,
  getUserAttemptsBySubject,
  getAllAttempts,
  getAttemptStats,
  getAttemptsByDateRange
} = require("../controllers/attemptController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// User routes
router.post("/start", protect, startTest);
router.post("/submit", protect, submitAttempt);
router.get("/my", protect, getMyAttempts);
router.get("/user/subject/:subjectId", protect, getUserAttemptsBySubject);
router.get("/:attemptId", protect, getAttemptById);

// Admin routes
router.get("/", protect, isAdmin, getAllAttempts);
router.get("/stats/all", protect, isAdmin, getAttemptStats);
router.get("/date-range", protect, isAdmin, getAttemptsByDateRange);

module.exports = router;