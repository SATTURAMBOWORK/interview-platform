const express = require("express");
const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");
const {
  createSubject,
  getAllSubjects,
} = require("../controllers/subjectController");

const router = express.Router();

// Admin-only: create subject
router.post("/", protect, isAdmin, createSubject);

// Logged-in users: get subjects
router.get("/", protect, getAllSubjects);

module.exports = router;
