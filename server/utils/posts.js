import pool from "./db.js";
import { sanitizePostHtml } from "./sanitize.js";

/*
 * Shared post query + mapping helpers.
 * `viewerId` (0 for guests) drives the per-viewer flags isLiked / isSaved.
 */

const POST_FIELDS = `
  p.id, p.title, p.subtitle, p.content, p.category, p.tags,
  p.cover_url, p.status,
  p.created_at, p.updated_at, p.edited,
  u.uid AS author_id, u.username AS author_username, u.full_name AS author_full_name,
  (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,
  (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) AS comment_count,
  EXISTS(SELECT 1 FROM likes l2 WHERE l2.post_id = p.id AND l2.user_id = ?) AS is_liked,
  EXISTS(SELECT 1 FROM bookmarks b WHERE b.post_id = p.id AND b.user_id = ?) AS is_saved
`;

const clampInt = (value, fallback, min, max) => {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, min), max);
};

/** Converts stored HTML into a short plain-text excerpt for cards. */
export function stripHtml(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function parseTags(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function mapPost(row) {
  /* Defense in depth: legacy rows may predate write-side sanitization. */
  const safeContent = sanitizePostHtml(row.content);
  const excerptSource = row.subtitle || stripHtml(safeContent);
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle || null,
    content: safeContent,
    coverUrl: row.cover_url || null,
    isDraft: row.status === "draft",
    excerpt: excerptSource.length > 240 ? `${excerptSource.slice(0, 240).trimEnd()}…` : excerptSource,
    category: row.category || null,
    tags: parseTags(row.tags),
    author: {
      id: row.author_id,
      username: row.author_username,
      name: row.author_full_name || row.author_username,
    },
    publishedAt: row.created_at,
    updatedAt: row.updated_at,
    edited: Boolean(row.edited),
    likes: Number(row.like_count || 0),
    comments: Number(row.comment_count || 0),
    isLiked: Boolean(row.is_liked),
    isSaved: Boolean(row.is_saved),
  };
}

/**
 * Fetches posts with author info, counts and viewer flags.
 * `joins` / `where` are appended after the base "FROM posts p JOIN users u" clause.
 */
export async function fetchPosts({
  viewerId = 0,
  joins = "",
  where = "",
  params = [],
  order = "p.created_at DESC",
  limit = 20,
  offset = 0,
  includeDrafts = false,
} = {}) {
  const safeLimit = clampInt(limit, 20, 1, 50);
  const safeOffset = clampInt(offset, 0, 0, 100000);

  /* Drafts are private: excluded unless the caller opts in (author's own
     profile). `where` callers pass a full "WHERE …" clause — merge carefully. */
  const conditions = [];
  if (where) conditions.push(where.replace(/^WHERE\s+/i, ""));
  if (!includeDrafts) conditions.push("p.status = 'published'");
  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const sql = `
    SELECT ${POST_FIELDS}
    FROM posts p
    JOIN users u ON u.uid = p.author_id
    ${joins}
    ${whereClause}
    ORDER BY ${order}
    LIMIT ${safeLimit} OFFSET ${safeOffset}
  `;

  const [rows] = await pool.execute(sql, [viewerId, viewerId, ...params]);
  return rows.map(mapPost);
}

export async function fetchPostById(id, viewerId = 0) {
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;

  const [rows] = await pool.execute(
    `SELECT ${POST_FIELDS} FROM posts p JOIN users u ON u.uid = p.author_id WHERE p.id = ? LIMIT 1`,
    [viewerId, viewerId, numericId],
  );
  if (!rows.length) return null;
  const row = rows[0];
  /* Drafts are private: only the author may fetch them */
  if (row.status === "draft" && String(viewerId || 0) !== String(row.author_id)) return null;
  return mapPost(row);
}

/** Lightweight row used for ownership checks. */
export async function getPostRow(id) {
  const numericId = Number.parseInt(id, 10);
  if (Number.isNaN(numericId)) return null;

  const [rows] = await pool.execute("SELECT id, author_id, cover_url, status FROM posts WHERE id = ? LIMIT 1", [numericId]);
  return rows[0] || null;
}
