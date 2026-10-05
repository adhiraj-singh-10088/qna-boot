import express from "express";
import { optionalAuth } from "../middlewares/authMiddleware.js";
import { listFeed } from "../controllers/postController.js";

const router = express.Router();

// GET /api/feed — public feed of newest posts
router.get("/", optionalAuth, listFeed);

export default router;
