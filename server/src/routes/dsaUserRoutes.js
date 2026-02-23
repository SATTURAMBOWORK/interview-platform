const express = require("express");
const router = express.Router();

const {
  getAllDsaProblems,
  getDsaProblemById,
  
} = require("../controllers/dsaProblemController");

const{getDsaTopics}=require("../controllers/dsaUserProblemController.js");

const { protect } = require("../middleware/authMiddleware");

// USER routes
router.get("/problems", protect, getAllDsaProblems);
router.get("/problems/:id", protect, getDsaProblemById);
router.get("/topics", protect, getDsaTopics);

module.exports = router;
