import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import pool from "../utils/db.js";

dotenv.config();

export async function signup(req, res) {
  // Validates the registration details, hashes the password, and creates a user record.
  const { email, dob, username, password } = req.body;
  if (!email || !dob || !username || !password) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const hashed = await bcrypt.hash(password, 10);

    const [result] = await pool.execute(
      "INSERT INTO users (email, dob, username, password) VALUES (?, ?, ?, ?)",
      [email, dob, username, hashed],
    );

    return res.status(201).json({ id: result.insertId, email, username });
  } catch (err) {
    if (err && err.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Email or username already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}

export async function login(req, res) {
  // Verifies the user's credentials and returns a signed JWT for authenticated requests.
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Missing email or password" });
  }

  try {
    const [rows] = await pool.execute(
      "SELECT * FROM users WHERE email = ? LIMIT 1",
      [email],
    );
    const user = rows && rows[0];
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const storedHash = user.password || user.password_hash || user.pass;
    if (!storedHash)
      return res.status(500).json({ error: "Password not set for user" });

    const match = await bcrypt.compare(password, storedHash);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const safeUser = {
      id: user.id,
      email: user.email,
      username: user.username,
    };

    const token = jwt.sign(
      { id: user.id, email: user.email, username: user.username },
      process.env.JWT_SECRET || "change-me",
      { expiresIn: process.env.JWT_EXPIRES_IN || "1h" }
    );

    return res.json({ message: "Login successful", token, user: safeUser });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Server error" });
  }
}
