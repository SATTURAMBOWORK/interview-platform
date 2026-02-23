const express = require("express");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getUserById,
  getUserStats,
  getProfile,
  updateUser,
  deleteUser,
  searchUsers
} = require("../controllers/userController");

const router = express.Router();

// User routes
router.get("/profile", protect, getProfile);

// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/stats", protect, adminOnly, getUserStats);
router.get("/search", protect, adminOnly, searchUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;