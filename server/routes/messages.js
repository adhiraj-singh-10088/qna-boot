import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { getThread, listConversations, sendMessage } from "../controllers/messageController.js";

const router = express.Router();

router.get("/conversations", authMiddleware, listConversations);
router.get("/:username", authMiddleware, getThread);
router.post("/:username", authMiddleware, sendMessage);

export default router;
