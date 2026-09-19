const express = require("express");
const router = express.Router();
const {
  startInterview,
  submitAnswer,
  endInterview,
  getInterview,
  getHistory,
} = require("../controllers/interviewController");
const { protect } = require("../middleware/authMiddleware");

router.post("/start", protect, startInterview);
router.get("/history", protect, getHistory);
router.get("/:id", protect, getInterview);
router.post("/:id/answer", protect, submitAnswer);
router.post("/:id/end", protect, endInterview);

module.exports = router;
