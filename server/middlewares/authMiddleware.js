import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { TOKEN_COOKIE } from "../utils/authCookie.js";

dotenv.config();

const secret = () => process.env.JWT_SECRET || "change-me";

/**
 * Reads the session token from the httpOnly cookie first, then falls back to
 * a Bearer header (API clients / scripts). Returns the JWT payload or null.
 */
function readToken(req) {
  const cookieToken = req.cookies?.[TOKEN_COOKIE];
  if (cookieToken) {
    try {
      return jwt.verify(cookieToken, secret());
    } catch {
      /* fall through to the Bearer header */
    }
  }

  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return null;

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") return null;

  try {
    return jwt.verify(parts[1], secret());
  } catch {
    return null;
  }
}

/**
 * Strict auth: rejects requests without a valid token (401).
 */
export default function authMiddleware(req, res, next) {
  const hasCookie = Boolean(req.cookies?.[TOKEN_COOKIE]);
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!hasCookie && !authHeader)
    return res.status(401).json({ error: "No token provided" });

  if (!hasCookie && authHeader) {
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer")
      return res.status(401).json({ error: "Invalid token format" });
  }

  const payload = readToken(req);
  if (!payload)
    return res.status(401).json({ error: "Invalid or expired token" });

  req.user = payload;
  return next();
}

/**
 * Lenient auth: attaches req.user when a valid token is present,
 * but never rejects the request. Used by public endpoints that return
 * extra viewer-specific fields (isLiked, isSaved, isFollowing…).
 */
export function optionalAuth(req, res, next) {
  const payload = readToken(req);
  if (payload) req.user = payload;
  return next();
}
