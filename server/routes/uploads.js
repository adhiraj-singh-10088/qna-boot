import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import authMiddleware from "../middlewares/authMiddleware.js";

/*
 * Image uploads (post covers, avatars).
 * POST /api/uploads  — multipart field "image" → { url: "/uploads/<file>" }
 * Files are stored in server/uploads/ and served statically by server.js.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(__dirname, "..", "uploads");
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const ALLOWED = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"],
  ["image/gif", ".gif"],
]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
      const ext = ALLOWED.get(file.mimetype) || ".bin";
      cb(null, `${Date.now().toString(36)}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP or GIF images are allowed"));
    }
    cb(null, true);
  },
});

const router = express.Router();

router.post("/", authMiddleware, (req, res) => {
  upload.single("image")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Image too large (max 5 MB)" : err.message || "Upload failed";
      return res.status(400).json({ error: message });
    }
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });
    return res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
