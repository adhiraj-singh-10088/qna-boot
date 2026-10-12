import mysql from "mysql2/promise";
import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

/*
 * Load server/.env regardless of the current working directory. On hosts like
 * Vercel there is no .env file — configuration comes from the environment
 * (dashboard variables), and this call is simply a no-op.
 */
dotenv.config({
  path: path.join(path.dirname(fileURLToPath(import.meta.url)), "..", ".env"),
});

/*
 * TiDB Cloud (MySQL-compatible) connection pool.
 * Configuration is strictly environment-driven — deliberately NO hardcoded
 * credential fallbacks. A missing/misconfigured environment now fails
 * visibly (see the error below and /api/health) instead of silently
 * connecting somewhere unexpected.
 */
const REQUIRED_ENV = ["DB_HOST", "DB_USER", "DB_PASSWORD", "DB_NAME"];
export const missingDbEnv = REQUIRED_ENV.filter((key) => !process.env[key]);

if (missingDbEnv.length) {
  console.error(
    `[db] Missing environment variables: ${missingDbEnv.join(", ")}. ` +
      "Set them in the hosting dashboard (Vercel → Project → Settings → Environment Variables) " +
      "or in server/.env locally. GET /api/health will report this too.",
  );
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 4000),
  waitForConnections: true,
  /* Keep the pool small — serverless platforms run many short-lived instances. */
  connectionLimit: Number(process.env.DB_CONNECTION_LIMIT || 5),
  queueLimit: 0,
  /* Fail with a clear error instead of hanging until the platform times out. */
  connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT || 20000),
  /* Avoids ECONNRESET on idle sockets (recommended for TiDB Cloud). */
  enableKeepAlive: true,
  timezone: "Z", // interpret DATETIME/TIMESTAMP values as UTC (fixes the 5h30m relative-time offset)
  ssl: {
    minVersion: "TLSv1.2",
    rejectUnauthorized: true,
  },
});

export default pool;
