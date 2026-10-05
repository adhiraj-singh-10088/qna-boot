import pool from "./db.js";

/**
 * Notification types used across the app:
 *  - like             : someone liked your post
 *  - comment          : someone commented on your post
 *  - follow           : someone started following you
 *  - follow_request   : someone requested to follow you (private account)
 *  - follow_accepted  : your follow request was accepted
 */
export async function notify(userId, actorId, type, { postId = null, commentId = null } = {}) {
  if (!userId || !actorId) return;
  if (String(userId) === String(actorId)) return; // never notify yourself

  try {
    await pool.execute(
      "INSERT INTO notifications (user_id, actor_id, type, post_id, comment_id) VALUES (?, ?, ?, ?, ?)",
      [userId, actorId, type, postId, commentId],
    );
  } catch (err) {
    // Notifications must never break the primary action they describe
    console.error("notify failed:", err.message);
  }
}
