import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { Readable } from "stream";
import authMiddleware from "../middlewares/authMiddleware.js";

/*
 * Image uploads (post covers, avatars) — stored on Cloudinary.
 * POST /api/uploads  — multipart field "image" → { url: "<cloudinary_url>" }
 * Cloudinary is configured via env vars:
 *   CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET
 */

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

/* Use memory storage — we stream the buffer to Cloudinary, no local disk needed */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new Error("Only JPEG, PNG, WebP or GIF images are allowed"));
    }
    cb(null, true);
  },
});

/* Magic-byte signatures — validate buffer before uploading to Cloudinary */
function hasValidSignature(buf, mimetype) {
  if (buf.length < 12) return false;
  switch (mimetype) {
    case "image/png":  return buf[0]===0x89 && buf[1]===0x50 && buf[2]===0x4e && buf[3]===0x47;
    case "image/jpeg": return buf[0]===0xff && buf[1]===0xd8 && buf[2]===0xff;
    case "image/gif":  return buf[0]===0x47 && buf[1]===0x49 && buf[2]===0x46 && buf[3]===0x38;
    case "image/webp": return buf[0]===0x52 && buf[1]===0x49 && buf[2]===0x46 && buf[3]===0x46
                           && buf.slice(8,12).toString("ascii") === "WEBP";
    default: return false;
  }
}

/* Upload buffer to Cloudinary via a stream */
function uploadToCloudinary(buffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "inkspace", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    Readable.from(buffer).pipe(stream);
  });
}

const router = express.Router();

router.post("/", authMiddleware, (req, res) => {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      const message =
        err.code === "LIMIT_FILE_SIZE" ? "Image too large (max 5 MB)" : err.message || "Upload failed";
      return res.status(400).json({ error: message });
    }
    if (!req.file) return res.status(400).json({ error: "No image uploaded" });

    /* Magic-byte check */
    if (!hasValidSignature(req.file.buffer, req.file.mimetype)) {
      return res.status(400).json({ error: "File content does not match an allowed image type" });
    }

    try {
      const url = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
      return res.status(201).json({ url });
    } catch (uploadErr) {
      console.error("Cloudinary upload error:", uploadErr);
      return res.status(500).json({ error: "Image upload failed. Please try again." });
    }
  });
});

export default router;
