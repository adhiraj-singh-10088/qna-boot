import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../utils/db.js";
import { TOKEN_COOKIE, loginCookieOptions } from "../utils/authCookie.js";

dotenv.config();

function publicUser(row) {
  return {
    id: row.id ?? row.uid,
    email: row.email,
    username: row.username,
    full_name: row.full_name || null,
    bio: row.bio || null,
    is_private: Boolean(row.is_private),
    avatar_url: row.avatar_url || null,
  };
}

export async function signup(req, res) {
  // Validates the registration details, hashes the password, and creates a user record.
  const { email, dob, username, password, full_name } = req.body;
  if (!email || !dob || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const cleanEmail = String(email).toLowerCase().trim();
  const cleanUsername = String(username).toLowerCase().trim();
  const cleanFullName = typeof full_name === "string" && full_name.trim()
    ? full_name.trim().slice(0, 100)
    : null;

  try {
    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (email, dob, username, password, full_name) VALUES (?, ?, ?, ?, ?)",
      [cleanEmail, dob, cleanUsername, hashed, cleanFullName],
    );

    return res.status(201).json({ id: result.insertId, email: cleanEmail, username: cleanUsername, full_name: cleanFullName });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Email or username already exists" });
    }
    console.error("Signup error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function login(req, res) {
  // Verifies the user's credentials and returns a signed JWT for authenticated requests.
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  const identifier = String(email).toLowerCase().trim();

  try {
    const [rows] = await pool.execute(
      "SELECT uid AS id, email, username, password, dob, full_name, bio, is_private, avatar_url, created_at FROM users WHERE LOWER(email) = ? OR LOWER(username) = ? LIMIT 1",
      [identifier, identifier],
    );
    const user = rows && rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const storedHash = user.password;
    if (!storedHash)
      return res.status(500).json({ error: "Password not set for user" });

    const match = await bcrypt.compare(password, storedHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const safeUser = publicUser(user);

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "change-me",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    /* The browser session lives in an httpOnly cookie (XSS can't read it).
       The token is still returned in the body for API clients/scripts
       that authenticate with Bearer headers. */
    res.cookie(TOKEN_COOKIE, token, loginCookieOptions());

    return res.json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ error: err.message || "Server error" });
  }
}

export async function logout(req, res) {
  // Clears the httpOnly session cookie (the JWT itself is stateless).
  res.clearCookie(TOKEN_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  return res.json({ message: "Logged out" });
}

export async function getMe(req, res) {
  // Returns the authenticated user's fresh profile straight from the database.
  try {
    const [rows] = await pool.execute(
      "SELECT uid AS id, email, username, dob, full_name, bio, is_private, avatar_url, created_at FROM users WHERE uid = ? LIMIT 1",
      [req.user.id],
    );
    const user = rows && rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    return res.json({ user: publicUser(user) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
