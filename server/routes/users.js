import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/authMiddleware.js";
import {
  getFollowers,
  getFollowing,
  getUserPosts,
  getUserProfile,
  searchUsers,
  updateMe,
} from "../controllers/userController.js";
import { followUser, unfollowUser } from "../controllers/followController.js";

const router = express.Router();

// Specific routes first — they must not be swallowed by /:username
router.get("/search", optionalAuth, searchUsers);
router.patch("/me", authMiddleware, updateMe);

router.get("/:username", optionalAuth, getUserProfile);
router.get("/:username/posts", optionalAuth, getUserPosts);
router.get("/:username/followers", optionalAuth, getFollowers);
router.get("/:username/following", optionalAuth, getFollowing);
router.post("/:username/follow", authMiddleware, followUser);
router.delete("/:username/follow", authMiddleware, unfollowUser);

export default router;
