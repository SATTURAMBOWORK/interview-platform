const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

const {
  createMcq,
  getAllMcqs,
  getRandomMcqsBySubject,
  bulkUploadMcqs,
  deleteMcq,
  updateMcq,
} = require("../controllers/mcqController");

const router = express.Router();

/**
 * ADMIN: Get all MCQs
 */
router.get("/", protect, isAdmin, getAllMcqs);

/**
 * ADMIN: Create MCQ
 */
router.post("/", protect, isAdmin, createMcq);

/**
 * ADMIN: Bulk upload MCQs
 */
router.post("/bulk", protect, isAdmin, bulkUploadMcqs);

/**
 * USER: Get random MCQs by subject
 */
router.get(
  "/subject/:subjectId",
  protect,
  getRandomMcqsBySubject
);

/**
 * ADMIN: Delete MCQ
 */
router.delete("/:id", protect, isAdmin, deleteMcq);

/**
 * ADMIN: Update MCQ
 */
router.put("/:id", protect, isAdmin, updateMcq);

module.exports = router;
