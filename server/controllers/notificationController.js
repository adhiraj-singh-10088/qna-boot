import pool from "../utils/db.js";

/*
 * Notification endpoints:
 *  - listNotifications  GET   /api/notifications
 *  - unreadCount        GET   /api/notifications/unread-count
 *  - markRead           PATCH /api/notifications/:id/read
 *  - markAllRead        POST  /api/notifications/read-all
 *
 * Rows are created by utils/notify.js from likes, comments and follows.
 */

function mapNotification(row) {
  return {
    id: row.id,
    type: row.type,
    isRead: Boolean(row.is_read),
    createdAt: row.created_at,
    actor: {
      id: row.actor_id,
      username: row.actor_username,
      name: row.actor_full_name || row.actor_username,
    },
    post: row.post_id ? { id: row.post_id, title: row.post_title || "Untitled" } : null,
  };
}

export async function listNotifications(req, res) {
  try {
    const [rows] = await pool.execute(
      `SELECT n.id, n.type, n.post_id, n.comment_id, n.is_read, n.created_at,
              u.uid AS actor_id, u.username AS actor_username, u.full_name AS actor_full_name,
              p.title AS post_title
       FROM notifications n
       JOIN users u ON u.uid = n.actor_id
       LEFT JOIN posts p ON p.id = n.post_id
       WHERE n.user_id = ?
       ORDER BY n.created_at DESC
       LIMIT 50`,
      [req.user.id],
    );

    const [[{ unread }]] = await pool.query(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id],
    );

    return res.json({ unreadCount: unread, notifications: rows.map(mapNotification) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load notifications" });
  }
}

export async function unreadCount(req, res) {
  // Lightweight endpoint used by the badge poller.
  try {
    const [[{ unread }]] = await pool.query(
      "SELECT COUNT(*) AS unread FROM notifications WHERE user_id = ? AND is_read = 0",
      [req.user.id],
    );
    return res.json({ unreadCount: unread });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load unread count" });
  }
}

export async function markRead(req, res) {
  try {
    await pool.execute(
      "UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id],
    );
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to mark notification as read" });
  }
}

export async function markAllRead(req, res) {
  try {
    await pool.execute("UPDATE notifications SET is_read = 1 WHERE user_id = ?", [req.user.id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to mark notifications as read" });
  }
}
