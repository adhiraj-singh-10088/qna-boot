import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";

import db, { missingDbEnv } from "./utils/db.js";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import uploadsRouter, { UPLOADS_DIR } from "./routes/uploads.js";
import messagesRouter from "./routes/messages.js";
import activityRouter from "./routes/activity.js";
import feedRouter from "./routes/feed.js";
import commentsRouter from "./routes/comments.js";
import bookmarksRouter from "./routes/bookmarks.js";
import usersRouter from "./routes/users.js";
import followRequestsRouter from "./routes/followRequests.js";
import notificationsRouter from "./routes/notifications.js";

/*
 * The Express app lives here (exported) so it can be reused by:
 *  - server/server.js  → local dev (`node server/server.js` / nodemon)
 *  - api/index.mjs     → the Vercel serverless function (see vercel.json)
 */

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.set("trust proxy", 1);

/* CORS is only needed when the SPA is served from a different origin than the
   API. Same-origin deployments (client + API in one Vercel project) never use
   it. Local dev keeps the Vite origin; add more via CORS_ORIGINS (comma list). */
const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
}));

app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

/* Rate limits (env-overridable for tests). Failed auth attempts count;
   successful logins don't, so normal usage never locks anyone out. */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_AUTH_MAX || 30),
  skipSuccessfulRequests: true,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many attempts. Please try again later." },
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.RATE_LIMIT_API_MAX || 1000),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please slow down." },
});

app.use("/auth/login", authLimiter);
app.use("/auth/signup", authLimiter);
app.use("/api", apiLimiter);

app.get("/", (req, res) => res.send("Hey Chat"));

/* Health check — verifies the process is up AND the database answers.
   Open /api/health on a deployment to diagnose DB / environment problems. */
app.get("/api/health", async (req, res) => {
  if (missingDbEnv.length) {
    return res.status(503).json({
      ok: false,
      db: "not-configured",
      missing_env: missingDbEnv,
      hint: "Set these in the hosting dashboard (e.g. Vercel → Project → Settings → Environment Variables) or in server/.env locally.",
    });
  }
  try {
    await db.query("SELECT 1 AS ok");
    return res.json({ ok: true, db: "connected" });
  } catch (err) {
    return res.status(503).json({
      ok: false,
      db: "unreachable",
      code: err.code || null,
      message: String(err.message || "").slice(0, 200),
    });
  }
});

/* Uploaded images (post covers / avatars). On serverless hosts the storage
   directory may be an ephemeral /tmp fallback or unavailable — see uploads.js. */
if (UPLOADS_DIR) {
  app.use("/uploads", express.static(UPLOADS_DIR, { maxAge: "7d", immutable: true }));
}

app.use("/auth", authRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/feed", feedRouter);
app.use("/api/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/users", usersRouter);
app.use("/api/follow-requests", followRequestsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/api/activity", activityRouter);

export default app;
