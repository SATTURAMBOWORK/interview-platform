const express = require("express");
const router = express.Router();

const {
  getDsaTopics,
  getProblemsByTopic,
  getDsaProblemForUser,
} = require("../controllers/dsaProblemController");

const { protect } = require("../middleware/authMiddleware");

// USER browsing routes
router.get("/topics", protect, getDsaTopics);
router.get("/by-topic/:topic", protect, getProblemsByTopic);

// ✅ USER solve page
router.get("/problem/:id", protect, getDsaProblemForUser);

module.exports = router;
