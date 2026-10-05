import pool from "../utils/db.js";
import { reqLang, translateList } from "../utils/translate.js";

/*
 * GET /api/activity — the authenticated user's own activity:
 *  - likes:    published posts they liked, newest first
 *  - comments: comments they wrote on published posts, newest first
 */

export async function getMyActivity(req, res) {
  try {
    const me = req.user.id;

    const [likeRows] = await pool.execute(
      `SELECT l.created_at AS liked_at,
              p.id, p.title, p.cover_url,
              u.username AS author_username, u.full_name AS author_full_name, u.avatar_url AS author_avatar,
              (SELECT COUNT(*) FROM likes l2 WHERE l2.post_id = p.id) AS like_count,
              (SELECT COUNT(*) FROM comments c2 WHERE c2.post_id = p.id) AS comment_count
       FROM likes l
       JOIN posts p ON p.id = l.post_id
       JOIN users u ON u.uid = p.author_id
       WHERE l.user_id = ? AND p.status = 'published'
       ORDER BY l.created_at DESC
       LIMIT 30`,
      [me],
    );

    const [commentRows] = await pool.execute(
      `SELECT c.id, c.content, c.created_at,
              p.id AS post_id, p.title AS post_title
       FROM comments c
       JOIN posts p ON p.id = c.post_id
       WHERE c.user_id = ? AND p.status = 'published'
       ORDER BY c.created_at DESC
       LIMIT 30`,
      [me],
    );

    const lang = reqLang(req);
    const likes = likeRows.map((r) => ({
      likedAt: r.liked_at,
      post: {
        id: r.id,
        title: r.title,
        coverUrl: r.cover_url || null,
        likes: Number(r.like_count || 0),
        comments: Number(r.comment_count || 0),
        author: {
          username: r.author_username,
          name: r.author_full_name || r.author_username,
          avatarUrl: r.author_avatar || null,
        },
      },
    }));
    const comments = commentRows.map((r) => ({
      id: r.id,
      content: r.content,
      createdAt: r.created_at,
      post: { id: r.post_id, title: r.post_title },
    }));

    if (lang) {
      try {
        const likeOut = await translateList(likes.map((l) => ({ title: l.post.title })), ["title"], lang);
        likeOut.forEach((row, i) => { likes[i].post.title = row.title; });
        const commentOut = await translateList(
          comments.map((c) => ({ content: c.content, title: c.post.title })),
          ["content", "title"],
          lang,
        );
        commentOut.forEach((row, i) => { comments[i].content = row.content; comments[i].post.title = row.title; });
      } catch { /* leave untranslated */ }
    }
    return res.json({ likes, comments });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load activity" });
  }
}
