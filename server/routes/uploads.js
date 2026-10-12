import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import crypto from "crypto";
import { fileURLToPath } from "url";
import authMiddleware from "../middlewares/authMiddleware.js";

/*
 * Image uploads (post covers, avatars).
 * POST /api/uploads  — multipart field "image" → { url: "/uploads/<file>" }
 * Files are stored in server/uploads/ (local dev) and served statically by
 * the app. Serverless hosts (Vercel / AWS Lambda) have a read-only filesystem
 * except /tmp, so there we fall back to an ephemeral per-instance temp dir —
 * uploaded files then do not survive redeploys/instance recycling. Use object
 * storage (e.g. Vercel Blob) for durable uploads in production.
 */

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/* Resolve a writable uploads directory, or null when nothing is writable
   (the API keeps working; uploads answer 503 instead of crashing the app). */
function resolveUploadsDir() {
  const candidates = [
    process.env.UPLOADS_DIR, // explicit override wins
    path.join(__dirname, "..", "uploads"), // default (local dev)
    path.join(os.tmpdir(), "inkspace-uploads"), // serverless fallback (/tmp)
  ].filter(Boolean);

  for (const dir of candidates) {
    try {
      fs.mkdirSync(dir, { recursive: true });
      return dir;
    } catch (err) {
      console.warn(`[uploads] ${dir} is not writable (${err.code || err.message}); trying next location`);
    }
  }
  return null;
}

export const UPLOADS_DIR = resolveUploadsDir();

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

/* Magic-byte signatures — the declared MIME type must match the real bytes. */
function matchesSignature(filePath, ext) {
  const fd = fs.openSync(filePath, "r");
  try {
    const buf = Buffer.alloc(12);
    const read = fs.readSync(fd, buf, 0, 12, 0);
    if (read < 4) return false;
    const startsWith = (sig) => sig.every((b, i) => buf[i] === b);
    switch (ext) {
      case ".png": return startsWith([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
      case ".jpg": return startsWith([0xff, 0xd8, 0xff]);
      case ".gif": return startsWith([0x47, 0x49, 0x46, 0x38]);
      case ".webp": return startsWith([0x52, 0x49, 0x46, 0x46]) && buf.slice(8, 12).toString("ascii") === "WEBP";
      default: return false;
    }
  } finally {
    fs.closeSync(fd);
  }
}

const router = express.Router();

router.post("/", authMiddleware, (req, res) => {
  if (!UPLOADS_DIR) {
    return res.status(503).json({
      error: "Image uploads are not available on this deployment (no writable storage).",
    });
  }
  upload.single("image")(req, res, (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Image too large (max 5 MB)" : err.message || "Upload failed";
      return res.status(400).json({ error: message });
    }
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    /* Magic-byte check: declared MIME type must match the actual file content. */
    const ext = path.extname(req.file.filename).toLowerCase();
    if (!matchesSignature(req.file.path, ext)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "File content does not match an allowed image type" });
    }

    return res.status(201).json({ url: `/uploads/${req.file.filename}` });
  });
});

export default router;
