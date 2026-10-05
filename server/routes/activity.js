import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getMyActivity } from "../controllers/activityController.js";

const router = express.Router();

// GET /api/activity — likes + comments made by the current user
router.get("/", authMiddleware, getMyActivity);

export default router;
