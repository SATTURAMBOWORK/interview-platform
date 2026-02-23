const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");
const { getDsaStats } = require("../controllers/dsaStatsController");
const { getDsaCalendar } = require("../controllers/dsaCalendarController");
const { getUserDsaProblems } = require("../controllers/dsaUserProblemController");

router.get("/stats", protect, getDsaStats);
router.get("/calendar", protect, getDsaCalendar);
router.get("/user-problems", protect, getUserDsaProblems);

module.exports = router;
