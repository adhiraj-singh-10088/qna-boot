import pool from "../utils/db.js";
import { fetchPostById, fetchPosts, getPostRow, stripHtml } from "../utils/posts.js";
import { sanitizePostHtml } from "../utils/sanitize.js";
import { notify } from "../utils/notify.js";

/*
 * Post endpoints:
 *  - listFeed / listBookmarks          → feed & saved posts
 *  - create/update/delete              → author-only mutations
 *  - getPostById                       → public single post
 *  - like / unlike, bookmark / unbookmark
 *  - comments: list / add / delete
 */

const MAX_TAGS = 5;

function cleanStr(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function parseTags(input) {
  if (!Array.isArray(input)) return [];
  return input.map((t) => cleanStr(t, 30)).filter(Boolean).slice(0, MAX_TAGS);
}

function tagsToJson(tags) {
  return tags.length ? JSON.stringify(tags) : null;
}

function clampLimit(value, fallback) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(Math.max(n, 1), 50);
}

function clampOffset(value) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n) || n < 0) return 0;
  return Math.min(n, 100000);
}

export async function listFeed(req, res) {
  // Public feed: newest posts across the platform (viewer flags when authenticated).
  try {
    const posts = await fetchPosts({
      viewerId: req.user?.id || 0,
      limit: clampLimit(req.query.limit, 20),
      offset: clampOffset(req.query.offset),
    });
    return res.json({ posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load feed" });
  }
}

export async function createPost(req, res) {
  // Validates post data, associates it with the authenticated user, and stores it.
  const { title, content, subtitle, category, tags } = req.body || {};
  const cleanTitle = cleanStr(title, 255);
  const cleanContent = typeof content === "string" ? sanitizePostHtml(content) : "";
  if (!cleanTitle || !stripHtml(cleanContent)) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const [result] = await pool.execute(
      "INSERT INTO posts (author_id, title, subtitle, content, category, tags) VALUES (?, ?, ?, ?, ?, ?)",
      [
        req.user.id,
        cleanTitle,
        cleanStr(subtitle, 500) || null,
        cleanContent,
        cleanStr(category, 50) || null,
        tagsToJson(parseTags(tags)),
      ],
    );

    const post = await fetchPostById(result.insertId, req.user.id);
    return res.status(201).json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to create post" });
  }
}

export async function getPostById(req, res) {
  // Fetches a post by ID; public, with viewer flags when authenticated.
  try {
    const post = await fetchPostById(req.params.id, req.user?.id || 0);
    if (!post) return res.status(404).json({ error: "Post not found" });
    return res.json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to fetch post" });
  }
}

export async function updatePost(req, res) {
  // Confirms ownership, updates the post, and flags it as edited.
  const { title, content, subtitle, category, tags } = req.body || {};
  const cleanTitle = cleanStr(title, 255);
  const cleanContent = typeof content === "string" ? sanitizePostHtml(content) : "";
  if (!cleanTitle || !stripHtml(cleanContent)) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const existing = await getPostRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (String(existing.author_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Only the author can edit this post" });
    }

    await pool.execute(
      "UPDATE posts SET title = ?, subtitle = ?, content = ?, category = ?, tags = ?, edited = 1 WHERE id = ?",
      [
        cleanTitle,
        cleanStr(subtitle, 500) || null,
        cleanContent,
        cleanStr(category, 50) || null,
        tagsToJson(parseTags(tags)),
        existing.id,
      ],
    );

    const post = await fetchPostById(existing.id, req.user.id);
    return res.json({ post });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to edit post" });
  }
}

export async function deletePost(req, res) {
  // Confirms ownership, then removes the post and all related rows.
  try {
    const existing = await getPostRow(req.params.id);
    if (!existing) return res.status(404).json({ error: "Post not found" });
    if (String(existing.author_id) !== String(req.user.id)) {
      return res.status(403).json({ error: "Only the author can delete this post" });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      await conn.execute("DELETE FROM likes WHERE post_id = ?", [existing.id]);
      await conn.execute("DELETE FROM comments WHERE post_id = ?", [existing.id]);
      await conn.execute("DELETE FROM bookmarks WHERE post_id = ?", [existing.id]);
      await conn.execute("DELETE FROM notifications WHERE post_id = ?", [existing.id]);
      await conn.execute("DELETE FROM posts WHERE id = ?", [existing.id]);
      await conn.commit();
    } catch (txErr) {
      await conn.rollback();
      throw txErr;
    } finally {
      conn.release();
    }

    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to delete post" });
  }
}

export async function likePost(req, res) {
  // Idempotent like + notification to the post author.
  try {
    const post = await getPostRow(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const [insert] = await pool.execute("INSERT IGNORE INTO likes (post_id, user_id) VALUES (?, ?)", [post.id, req.user.id]);
    // Only notify on a fresh like (INSERT IGNORE reports 0 affected rows for duplicates)
    if (insert.affectedRows > 0) await notify(post.author_id, req.user.id, "like", { postId: post.id });

    const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM likes WHERE post_id = ?", [post.id]);
    return res.json({ isLiked: true, likes: n });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to like post" });
  }
}

export async function unlikePost(req, res) {
  try {
    const post = await getPostRow(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    await pool.execute("DELETE FROM likes WHERE post_id = ? AND user_id = ?", [post.id, req.user.id]);

    const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM likes WHERE post_id = ?", [post.id]);
    return res.json({ isLiked: false, likes: n });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to unlike post" });
  }
}

export async function bookmarkPost(req, res) {
  try {
    const post = await getPostRow(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    await pool.execute("INSERT IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)", [req.user.id, post.id]);
    return res.json({ isSaved: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to save post" });
  }
}

export async function unbookmarkPost(req, res) {
  try {
    const post = await getPostRow(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    await pool.execute("DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?", [req.user.id, post.id]);
    return res.json({ isSaved: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to unsave post" });
  }
}

export async function listComments(req, res) {
  // Public comment list for a post, oldest first.
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.content, c.created_at, u.uid AS author_id, u.username, u.full_name
       FROM comments c
       JOIN users u ON u.uid = c.user_id
       WHERE c.post_id = ?
       ORDER BY c.created_at ASC`,
      [req.params.id],
    );

    return res.json({
      comments: rows.map((r) => ({
        id: r.id,
        content: r.content,
        createdAt: r.created_at,
        author: { id: r.author_id, username: r.username, name: r.full_name || r.username },
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load comments" });
  }
}

export async function addComment(req, res) {
  // Adds a comment and notifies the post's author.
  const content = cleanStr(req.body?.content, 2000);
  if (!content) return res.status(400).json({ error: "Comment cannot be empty" });

  try {
    const post = await getPostRow(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    const [result] = await pool.execute(
      "INSERT INTO comments (post_id, user_id, content) VALUES (?, ?, ?)",
      [post.id, req.user.id, content],
    );

    await notify(post.author_id, req.user.id, "comment", { postId: post.id, commentId: result.insertId });

    const [rows] = await pool.execute(
      `SELECT c.id, c.content, c.created_at, u.uid AS author_id, u.username, u.full_name
       FROM comments c JOIN users u ON u.uid = c.user_id WHERE c.id = ?`,
      [result.insertId],
    );
    const [[{ n }]] = await pool.query("SELECT COUNT(*) AS n FROM comments WHERE post_id = ?", [post.id]);

    const c = rows[0];
    return res.status(201).json({
      comment: {
        id: c.id,
        content: c.content,
        createdAt: c.created_at,
        author: { id: c.author_id, username: c.username, name: c.full_name || c.username },
      },
      comments: n,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to add comment" });
  }
}

export async function deleteComment(req, res) {
  // A comment can be deleted by its author or by the post's author.
  try {
    const [rows] = await pool.execute(
      `SELECT c.id, c.user_id, c.post_id, p.author_id
       FROM comments c JOIN posts p ON p.id = c.post_id
       WHERE c.id = ? LIMIT 1`,
      [req.params.id],
    );
    const comment = rows[0];
    if (!comment) return res.status(404).json({ error: "Comment not found" });

    const isCommentAuthor = String(comment.user_id) === String(req.user.id);
    const isPostAuthor = String(comment.author_id) === String(req.user.id);
    if (!isCommentAuthor && !isPostAuthor) {
      return res.status(403).json({ error: "Not allowed to delete this comment" });
    }

    await pool.execute("DELETE FROM comments WHERE id = ?", [comment.id]);
    await pool.execute("DELETE FROM notifications WHERE comment_id = ?", [comment.id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to delete comment" });
  }
}

export async function listBookmarks(req, res) {
  // Posts saved by the authenticated user, newest saved first.
  try {
    const posts = await fetchPosts({
      viewerId: req.user.id,
      joins: "JOIN bookmarks bm ON bm.post_id = p.id AND bm.user_id = ?",
      params: [req.user.id],
      order: "bm.created_at DESC",
    });
    return res.json({ posts });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load saved posts" });
  }
}
