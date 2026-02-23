const express = require("express");
const router = express.Router();

const {
  createDsaProblem,
  bulkUploadDsaProblems,
  getAllDsaProblems,
  getDsaProblemById,
  updateDsaProblem,
  deleteDsaProblem,
} = require("../controllers/dsaProblemController");

const { protect } = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/adminMiddleware");

// ADMIN CRUD ONLY
router.post("/", protect, isAdmin, createDsaProblem);
router.post("/bulk", protect, isAdmin, bulkUploadDsaProblems);
router.get("/", protect, isAdmin, getAllDsaProblems);
router.get("/:id", protect, isAdmin, getDsaProblemById);
router.put("/:id", protect, isAdmin, updateDsaProblem);
router.delete("/:id", protect, isAdmin, deleteDsaProblem);

module.exports = router;
