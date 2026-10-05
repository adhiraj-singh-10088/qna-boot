import express from "express";
import authMiddleware, { optionalAuth } from "../middlewares/authMiddleware.js";
import {
  addComment,
  bookmarkPost,
  createPost,
  deleteComment,
  deletePost,
  getPostById,
  likePost,
  listBookmarks,
  listComments,
  listFeed,
  unbookmarkPost,
  unlikePost,
  updatePost,
} from "../controllers/postController.js";

const router = express.Router();

router.get("/", optionalAuth, listFeed);
router.post("/", authMiddleware, createPost);

router.get("/:id", optionalAuth, getPostById);
router.put("/:id", authMiddleware, updatePost);
router.delete("/:id", authMiddleware, deletePost);

router.post("/:id/like", authMiddleware, likePost);
router.delete("/:id/like", authMiddleware, unlikePost);

router.post("/:id/bookmark", authMiddleware, bookmarkPost);
router.delete("/:id/bookmark", authMiddleware, unbookmarkPost);

router.get("/:id/comments", optionalAuth, listComments);
router.post("/:id/comments", authMiddleware, addComment);

export default router;
