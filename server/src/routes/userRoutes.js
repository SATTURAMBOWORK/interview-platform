const express = require("express");
const multer = require("multer");
const { protect, adminOnly } = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getUserById,
  getUserStats,
  getProfile,
  updateProfilePicture,
  removeProfilePicture,
  updateUser,
  deleteUser,
  searchUsers
} = require("../controllers/userController");

const router = express.Router();

const profileImageUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file?.mimetype?.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"), false);
  },
});

// User routes
router.get("/profile", protect, getProfile);
router.post(
  "/profile-picture",
  protect,
  profileImageUpload.single("profilePicture"),
  updateProfilePicture
);
router.delete("/profile-picture", protect, removeProfilePicture);

// Admin routes
router.get("/", protect, adminOnly, getAllUsers);
router.get("/stats", protect, adminOnly, getUserStats);
router.get("/search", protect, adminOnly, searchUsers);
router.get("/:id", protect, adminOnly, getUserById);
router.put("/:id", protect, adminOnly, updateUser);
router.delete("/:id", protect, adminOnly, deleteUser);

module.exports = router;