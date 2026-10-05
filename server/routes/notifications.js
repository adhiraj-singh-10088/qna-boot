import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  listNotifications,
  markAllRead,
  markRead,
  unreadCount,
} from "../controllers/notificationController.js";

const router = express.Router();

router.get("/", authMiddleware, listNotifications);
router.get("/unread-count", authMiddleware, unreadCount);
router.patch("/:id/read", authMiddleware, markRead);
router.post("/read-all", authMiddleware, markAllRead);

export default router;
