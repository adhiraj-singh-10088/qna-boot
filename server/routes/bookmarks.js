import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { listBookmarks } from "../controllers/postController.js";

const router = express.Router();

// GET /api/bookmarks — posts saved by the authenticated user
router.get("/", authMiddleware, listBookmarks);

export default router;
