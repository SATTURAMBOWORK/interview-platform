const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  createSubject,
  getAllSubjects,
  deleteSubject,getSubjectById
} = require("../controllers/subjectController");

const router = express.Router();

// Admin-only: create subject
router.post("/", protect, isAdmin, createSubject);

// Logged-in users: get subjects
router.get("/", protect, getAllSubjects);

// ✅ NEW ROUTE (IMPORTANT)
router.get("/:id", protect, getSubjectById);

/**
 * DELETE subject (admin)
 */
router.delete("/:id", protect, isAdmin, deleteSubject);

module.exports = router;
