import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createPost,
  deletePost,
  editPost,
  getPostById,
} from "../controllers/postController.js";

const router = express.Router();

router.post("/", authMiddleware, createPost);
router.get("/:id", getPostById);
router.put("/:id", authMiddleware, editPost);
router.delete("/:id", authMiddleware, deletePost);

export default router;
