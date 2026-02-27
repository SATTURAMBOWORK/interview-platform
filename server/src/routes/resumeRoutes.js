const express = require("express");
const multer = require("multer");
const { analyzeResume } = require("../controllers/resumeController");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// Store file in memory (buffer) so pdf-parse can read it directly
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed"), false);
  },
});

// POST /api/resume/analyze
router.post("/analyze", protect, upload.single("resume"), analyzeResume);

module.exports = router;
