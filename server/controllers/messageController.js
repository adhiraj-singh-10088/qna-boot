import pool from "../utils/db.js";

/*
 * Direct messages between users:
 *  - listConversations  GET  /api/messages/conversations
 *  - getThread          GET  /api/messages/:username   (marks incoming as read)
 *  - sendMessage        POST /api/messages/:username   { content, postId? }
 */

function mapUser(row) {
  return {
    id: row.uid ?? row.id,
    username: row.username,
    name: row.full_name || row.username,
    avatarUrl: row.avatar_url || null,
  };
}

async function findRecipient(username, myId) {
  const [rows] = await pool.execute(
    "SELECT uid, username, full_name, avatar_url FROM users WHERE username = ? LIMIT 1",
    [username],
  );
  const user = rows[0];
  if (!user) return { error: "User not found", code: 404 };
  if (String(user.uid) === String(myId)) return { error: "You cannot message yourself", code: 400 };
  return { user };
}

export async function listConversations(req, res) {
  try {
    const me = req.user.id;
    const [rows] = await pool.execute(
      `SELECT
         CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END AS partner_id,
         u.username, u.full_name, u.avatar_url,
         MAX(m.created_at) AS last_at,
         SUM(CASE WHEN m.recipient_id = ? AND m.read_at IS NULL THEN 1 ELSE 0 END) AS unread
       FROM messages m
       JOIN users u ON u.uid = CASE WHEN m.sender_id = ? THEN m.recipient_id ELSE m.sender_id END
       WHERE m.sender_id = ? OR m.recipient_id = ?
       GROUP BY partner_id, u.username, u.full_name, u.avatar_url
       ORDER BY last_at DESC
       LIMIT 50`,
      [me, me, me, me, me],
    );

    const conversations = [];
    for (const row of rows) {
      const [lastRows] = await pool.execute(
        `SELECT id, sender_id, content, post_id, created_at
         FROM messages
         WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
         ORDER BY created_at DESC, id DESC LIMIT 1`,
        [me, row.partner_id, row.partner_id, me],
      );
      const last = lastRows[0];
      conversations.push({
        user: {
          id: row.partner_id,
          username: row.username,
          name: row.full_name || row.username,
          avatarUrl: row.avatar_url || null,
        },
        unread: Number(row.unread || 0),
        lastMessage: last
          ? {
              id: last.id,
              content: last.content,
              postId: last.post_id || null,
              createdAt: last.created_at,
              mine: String(last.sender_id) === String(me),
            }
          : null,
      });
    }
    return res.json({ conversations });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load conversations" });
  }
}

export async function getThread(req, res) {
  try {
    const me = req.user.id;
    const found = await findRecipient(req.params.username, me);
    if (found.error) return res.status(found.code).json({ error: found.error });
    const partner = found.user;

    const [rows] = await pool.execute(
      `SELECT id, sender_id, content, post_id, created_at
       FROM messages
       WHERE (sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)
       ORDER BY created_at ASC, id ASC
       LIMIT 200`,
      [me, partner.uid, partner.uid, me],
    );

    await pool.execute(
      "UPDATE messages SET read_at = CURRENT_TIMESTAMP WHERE recipient_id = ? AND sender_id = ? AND read_at IS NULL",
      [me, partner.uid],
    );

    return res.json({
      user: mapUser(partner),
      messages: rows.map((m) => ({
        id: m.id,
        content: m.content,
        postId: m.post_id || null,
        createdAt: m.created_at,
        mine: String(m.sender_id) === String(me),
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load conversation" });
  }
}

export async function sendMessage(req, res) {
  try {
    const me = req.user.id;
    const { content, postId } = req.body || {};
    const clean = typeof content === "string" ? content.trim().slice(0, 2000) : "";
    if (!clean) return res.status(400).json({ error: "Message cannot be empty" });

    const found = await findRecipient(req.params.username, me);
    if (found.error) return res.status(found.code).json({ error: found.error });
    const partner = found.user;

    /* Optional: attach a published post to the message (drafts stay unlinkable) */
    let cleanPostId = null;
    if (postId !== undefined && postId !== null) {
      const n = Number(postId);
      if (Number.isInteger(n) && n > 0) {
        const [prows] = await pool.execute("SELECT id FROM posts WHERE id = ? AND status = 'published' LIMIT 1", [n]);
        if (prows[0]) cleanPostId = prows[0].id;
      }
    }

    const [result] = await pool.execute(
      "INSERT INTO messages (sender_id, recipient_id, post_id, content) VALUES (?, ?, ?, ?)",
      [me, partner.uid, cleanPostId, clean],
    );

    const [rows] = await pool.execute(
      "SELECT id, content, post_id, created_at FROM messages WHERE id = ? LIMIT 1",
      [result.insertId],
    );
    const m = rows[0];
    return res.status(201).json({
      message: {
        id: m.id,
        content: m.content,
        postId: m.post_id || null,
        createdAt: m.created_at,
        mine: true,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to send message" });
  }
}
