const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  createMcq,
  getRandomMcqsBySubject,
  bulkUploadMcqs,
} = require("../controllers/mcqController");

const router = express.Router();

/**
 * ADMIN: Add MCQ to question bank
 */
router.post("/", protect, isAdmin, createMcq);


/**
 * ADMIN: Bulk upload MCQs
 */
router.post("/bulk", protect, isAdmin, bulkUploadMcqs);

/**
 * USER: Get random MCQs for a subject
 * Example: /api/mcqs/subjectId?limit=25
 */
router.get("/subject/:subjectId", protect, getRandomMcqsBySubject);


module.exports = router;
