const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  getAdminSummary,
  getUserAnalytics,
  getContentAnalytics,
  getActivityAnalytics,
  getDsaAnalytics,
} = require("../controllers/analyticsController");

const router = express.Router();

/**
 * ADMIN analytics summary
 */
router.get("/admin-summary", protect, isAdmin, getAdminSummary);

/**
 * User analytics (engagement, active users, etc)
 */
router.get("/users", protect, isAdmin, getUserAnalytics);

/**
 * Content analytics (subject performance, MCQ difficulty, etc)
 */
router.get("/content", protect, isAdmin, getContentAnalytics);

/**
 * Activity analytics (trends, peak hours, top performers)
 */
router.get("/activity", protect, isAdmin, getActivityAnalytics);

/**
 * DSA analytics
 */
router.get("/dsa", protect, isAdmin, getDsaAnalytics);

module.exports = router;
