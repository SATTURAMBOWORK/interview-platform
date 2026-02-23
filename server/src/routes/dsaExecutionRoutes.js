const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware"); // ✅ correct import

const dsaController = require("../controllers/dsaExecutionController");

// Get solved problems
router.get("/solved", protect, dsaController.getSolvedProblems);

// Get user submissions (optionally filtered by problemId)
router.get("/submissions", protect, dsaController.getUserSubmissions);

// Run code (visible test cases)
router.post("/run", protect, dsaController.runCode);

// Submit code (visible + hidden test cases)
router.post("/submit", protect, dsaController.submitCode);

module.exports = router;
