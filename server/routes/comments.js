import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { deleteComment } from "../controllers/postController.js";

const router = express.Router();

// DELETE /api/comments/:id — comment author or post author only
router.delete("/:id", authMiddleware, deleteComment);

export default router;
