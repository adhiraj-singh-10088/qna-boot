import pool from "../utils/db.js";
import { notify } from "../utils/notify.js";

/*
 * Follow endpoints:
 *  - followUser      POST   /api/users/:username/follow
 *  - unfollowUser    DELETE /api/users/:username/follow
 *  - listRequests    GET    /api/follow-requests
 *  - acceptRequest   POST   /api/follow-requests/:id/accept
 *  - declineRequest  DELETE /api/follow-requests/:id
 *
 * Public accounts: follow is immediate ('accepted').
 * Private accounts: follow creates a pending request the owner can accept/decline.
 */

async function findUserByUsername(username) {
  const [rows] = await pool.execute(
    "SELECT uid, username, is_private FROM users WHERE username = ? LIMIT 1",
    [username],
  );
  return rows[0] || null;
}

export async function followUser(req, res) {
  try {
    const target = await findUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: "User not found" });
    if (String(target.uid) === String(req.user.id)) {
      return res.status(400).json({ error: "You cannot follow yourself" });
    }

    const [existing] = await pool.execute(
      "SELECT status FROM follows WHERE follower_id = ? AND followee_id = ? LIMIT 1",
      [req.user.id, target.uid],
    );
    if (existing[0]) {
      return res.json({ status: existing[0].status === "accepted" ? "following" : "requested" });
    }

    const status = target.is_private ? "pending" : "accepted";
    await pool.execute(
      "INSERT INTO follows (follower_id, followee_id, status) VALUES (?, ?, ?)",
      [req.user.id, target.uid, status],
    );
    await notify(target.uid, req.user.id, status === "pending" ? "follow_request" : "follow");

    return res.status(201).json({ status: status === "accepted" ? "following" : "requested" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to follow user" });
  }
}

export async function unfollowUser(req, res) {
  // Removes an accepted follow or cancels a pending request.
  try {
    const target = await findUserByUsername(req.params.username);
    if (!target) return res.status(404).json({ error: "User not found" });

    await pool.execute(
      "DELETE FROM follows WHERE follower_id = ? AND followee_id = ?",
      [req.user.id, target.uid],
    );
    return res.json({ status: "none" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to unfollow user" });
  }
}

export async function listRequests(req, res) {
  // Pending follow requests addressed to the authenticated user.
  try {
    const [rows] = await pool.execute(
      `SELECT u.uid, u.username, u.full_name, u.bio, f.created_at
       FROM follows f
       JOIN users u ON u.uid = f.follower_id
       WHERE f.followee_id = ? AND f.status = 'pending'
       ORDER BY f.created_at DESC
       LIMIT 100`,
      [req.user.id],
    );

    return res.json({
      requests: rows.map((r) => ({
        id: r.uid,
        username: r.username,
        name: r.full_name || r.username,
        bio: r.bio || "",
        requestedAt: r.created_at,
      })),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load follow requests" });
  }
}

export async function acceptRequest(req, res) {
  const followerId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(followerId)) return res.status(400).json({ error: "Invalid request id" });

  try {
    const [result] = await pool.execute(
      "UPDATE follows SET status = 'accepted' WHERE follower_id = ? AND followee_id = ? AND status = 'pending'",
      [followerId, req.user.id],
    );
    if (!result.affectedRows) return res.status(404).json({ error: "No pending request found" });

    await notify(followerId, req.user.id, "follow_accepted");
    return res.json({ status: "accepted" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to accept request" });
  }
}

export async function declineRequest(req, res) {
  const followerId = Number.parseInt(req.params.id, 10);
  if (Number.isNaN(followerId)) return res.status(400).json({ error: "Invalid request id" });

  try {
    await pool.execute(
      "DELETE FROM follows WHERE follower_id = ? AND followee_id = ? AND status = 'pending'",
      [followerId, req.user.id],
    );
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to decline request" });
  }
}
