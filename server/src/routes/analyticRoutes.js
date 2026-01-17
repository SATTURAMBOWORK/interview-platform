const express = require("express");
const router = express.Router();

const {
  getOverallAnalytics,
  getSubjectWiseAnalytics,
} = require("../controllers/analyticsController");

const { protect } = require("../middleware/authMiddleware");

router.get("/overall", protect, getOverallAnalytics);
router.get("/subject", protect, getSubjectWiseAnalytics);

module.exports = router;
