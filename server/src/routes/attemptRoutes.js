const express = require("express");
const router = express.Router();

const { submitAttempt, getMyAttempts, getAttemptById } = require("../controllers/attemptController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, submitAttempt);
router.get("/my", protect, getMyAttempts);
router.get("/:attemptId", protect, getAttemptById);



module.exports = router;
