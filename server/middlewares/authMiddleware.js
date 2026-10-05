import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = () => process.env.JWT_SECRET || "change-me";

/**
 * Extracts and verifies the Bearer token from the Authorization header.
 * Returns the JWT payload when valid, or null otherwise.
 */
function readToken(req) {
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
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer")
    return res.status(401).json({ error: "Invalid token format" });

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
