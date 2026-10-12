import db from "./utils/db.js";
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import authRouter from "./routes/auth.js";
import postsRouter from "./routes/posts.js";
import uploadsRouter from "./routes/uploads.js";
import messagesRouter from "./routes/messages.js";
import activityRouter from "./routes/activity.js";
import feedRouter from "./routes/feed.js";
import commentsRouter from "./routes/comments.js";
import bookmarksRouter from "./routes/bookmarks.js";
import usersRouter from "./routes/users.js";
import followRequestsRouter from "./routes/followRequests.js";
import notificationsRouter from "./routes/notifications.js";

dotenv.config();

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.set("trust proxy", 1);

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // allow server-to-server / curl (no origin header)
    if (!origin) return cb(null, true);

    try {
      const url = new URL(origin);
      if (
        allowedOrigins.includes(origin) ||
        url.hostname.endsWith(".vercel.app") ||
        url.hostname === "localhost"
      ) {
        return cb(null, true);
      }
    } catch {
      // ignore URL parsing error
    }

    // Allow requests rather than throwing an unhandled Error that crashes into 500
    return cb(null, true);
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

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/signup", authLimiter);
app.use("/auth/login", authLimiter);
app.use("/auth/signup", authLimiter);
app.use("/login", authLimiter);
app.use("/signup", authLimiter);
app.use("/api", apiLimiter);

app.get("/", (req, res) => res.send("Hey Chat"));

// Auth routes (supports /api/auth, /auth, and direct /* paths)
app.use("/api/auth", authRouter);
app.use("/auth", authRouter);
app.use("/", authRouter);

// API routes (supports both /api/* and direct /* paths)
app.use("/api/uploads", uploadsRouter);
app.use("/uploads", uploadsRouter);
app.use("/api/feed", feedRouter);
app.use("/feed", feedRouter);
app.use("/api/posts", postsRouter);
app.use("/posts", postsRouter);
app.use("/api/comments", commentsRouter);
app.use("/comments", commentsRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/bookmarks", bookmarksRouter);
app.use("/api/users", usersRouter);
app.use("/users", usersRouter);
app.use("/api/follow-requests", followRequestsRouter);
app.use("/follow-requests", followRequestsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/notifications", notificationsRouter);
app.use("/api/messages", messagesRouter);
app.use("/messages", messagesRouter);
app.use("/api/activity", activityRouter);
app.use("/activity", activityRouter);

const healthHandler = async (req, res) => {
  try {
    const [rows] = await db.execute("SELECT 1 + 1 AS result");
    res.json({ status: "healthy", db: "connected", result: rows[0] });
  } catch (err) {
    res.status(500).json({ status: "unhealthy", db: "error", message: err.message, code: err.code });
  }
};

app.get("/api/health", healthHandler);
app.get("/health", healthHandler);

const PORT = process.env.PORT || 3001;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
