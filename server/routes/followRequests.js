import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  acceptRequest,
  declineRequest,
  listRequests,
} from "../controllers/followController.js";

const router = express.Router();

router.get("/", authMiddleware, listRequests);
router.post("/:id/accept", authMiddleware, acceptRequest);
router.delete("/:id", authMiddleware, declineRequest);

export default router;
