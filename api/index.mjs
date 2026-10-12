/*
 * Vercel serverless entry — the entire Express API (server/app.js) served
 * from one Node function. vercel.json rewrites /auth/*, /api/* and /uploads/*
 * here; Express does the actual route matching.
 */
import app from "../server/app.js";

export default function handler(req, res) {
  /*
   * Safety net: depending on how the platform applies the rewrite, `req.url`
   * can arrive as the original request path ("/auth/login" — the normal case)
   * or as the rewrite destination ("/api/index"). Normalise the latter back so
   * Express routes always see public paths. This can only ever trigger for the
   * internal rewrite path — real API routes never start with /api/index.
   */
  if (req.url.startsWith("/api/index")) {
    const rest = req.url.slice("/api/index".length);
    if (rest === "" || rest.startsWith("/") || rest.startsWith("?")) {
      req.url = rest === "" ? "/" : rest;
    }
  }
  return app(req, res);
}
