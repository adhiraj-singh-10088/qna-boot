/*
 * Shared session-cookie helpers.
 * The browser session lives in an httpOnly cookie so page scripts (and
 * therefore XSS payloads) cannot read the JWT. Bearer headers remain
 * supported for API clients and test scripts.
 */

export const TOKEN_COOKIE = "inkspace_token";

/** Parses JWT_EXPIRES_IN-style strings ("1h", "7d", "30m", "45s") to ms. */
export function expiresToMs(raw) {
  const match = /^(\d+)\s*([smhd])$/i.exec(String(raw || "").trim());
  if (!match) return 60 * 60 * 1000; // fallback: 1 hour
  const multipliers = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 };
  return Number(match[1]) * multipliers[match[2].toLowerCase()];
}

/** Options used when setting the login cookie. */
export function loginCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: expiresToMs(process.env.JWT_EXPIRES_IN || "1h"),
  };
}
