import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

export default function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const parts = authHeader.split(" ");
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer")
    return res.status(401).json({ error: "Invalid token format" });

  const token = parts[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET || "change-me");
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
