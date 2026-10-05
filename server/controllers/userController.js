import pool from "../utils/db.js";
import { fetchPosts } from "../utils/posts.js";
import { notify } from "../utils/notify.js";

/*
 * User endpoints:
 *  - searchUsers        GET  /api/users/search?q=
 *  - getUserProfile     GET  /api/users/:username
 *  - getUserPosts       GET  /api/users/:username/posts
 *  - getFollowers       GET  /api/users/:username/followers
 *  - getFollowing       GET  /api/users/:username/following
 *  - updateMe           PATCH /api/users/me
 */

const USERNAME_RE = /^[a-z0-9._]{3,50}$/;

function mapSummary(row) {
  return {
    id: row.uid,
    username: row.username,
    name: row.full_name || row.username,
    avatarUrl: row.avatar_url || null,
    bio: row.bio || "",
    isPrivate: Boolean(row.is_private),
    followerCount: Number(row.follower_count ?? 0),
    isFollowing: Boolean(row.is_following),
    followsYou: Boolean(row.follows_you),
    hasPendingRequest: Boolean(row.pending_request),
  };
}

async function findUidByUsername(username) {
  const [rows] = await pool.execute("SELECT uid FROM users WHERE username = ? LIMIT 1", [username]);
  return rows[0]?.uid ?? null;
}

export async function searchUsers(req, res) {
  // Searches by username or display name; empty query returns latest users.
  try {
    const viewerId = req.user?.id || 0;
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 60) : "";
    // Escape LIKE wildcards so '%' / '_' search literally instead of matching everything
    const like = `%${q.replace(/[\\%_]/g, (m) => `\\${m}`)}%`;
    const limit = q ? 30 : 20;

    const sql = `
      SELECT u.uid, u.username, u.full_name, u.avatar_url, u.bio, u.is_private, u.created_at,
        EXISTS(SELECT 1 FROM follows f WHERE f.follower_id = ? AND f.followee_id = u.uid AND f.status = 'accepted') AS is_following,
        EXISTS(SELECT 1 FROM follows f2 WHERE f2.follower_id = u.uid AND f2.followee_id = ? AND f2.status = 'accepted') AS follows_you,
        EXISTS(SELECT 1 FROM follows f3 WHERE f3.follower_id = ? AND f3.followee_id = u.uid AND f3.status = 'pending') AS pending_request,
        (SELECT COUNT(*) FROM follows f4 WHERE f4.followee_id = u.uid AND f4.status = 'accepted') AS follower_count
      FROM users u
      WHERE u.uid <> ?
        ${q ? "AND (u.username LIKE ? OR u.full_name LIKE ?)" : ""}
      ORDER BY u.full_name IS NULL, u.created_at DESC
      LIMIT ${limit}
    `;

    const params = [viewerId, viewerId, viewerId, viewerId];
    if (q) params.push(like, like);

    const [rows] = await pool.execute(sql, params);
    return res.json({ users: rows.map(mapSummary) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to search users" });
  }
}

export async function getUserProfile(req, res) {
  // Public profile payload with counts and viewer relationship flags.
  try {
    const viewerId = req.user?.id || 0;
    const [rows] = await pool.execute(
      `SELECT u.uid, u.username, u.full_name, u.avatar_url, u.bio, u.is_private, u.created_at,
         (SELECT COUNT(*) FROM posts p WHERE p.author_id = u.uid AND (p.status = 'published' OR u.uid = ?)) AS post_count,
         (SELECT COUNT(*) FROM follows f WHERE f.followee_id = u.uid AND f.status = 'accepted') AS follower_count,
         (SELECT COUNT(*) FROM follows f2 WHERE f2.follower_id = u.uid AND f2.status = 'accepted') AS following_count
       FROM users u WHERE u.username = ? LIMIT 1`,
      [viewerId, req.params.username],
    );
    const row = rows[0];
    if (!row) return res.status(404).json({ error: "User not found" });

    const isSelf = viewerId && String(viewerId) === String(row.uid);
    let isFollowing = false;
    let followsYou = false;
    let hasPendingRequest = false;

    if (viewerId && !isSelf) {
      const [flags] = await pool.execute(
        `SELECT
           EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? AND status = 'accepted') AS is_following,
           EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? AND status = 'pending')  AS pending_request,
           EXISTS(SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ? AND status = 'accepted') AS follows_you`,
        [viewerId, row.uid, viewerId, row.uid, row.uid, viewerId],
      );
      isFollowing = Boolean(flags[0]?.is_following);
      hasPendingRequest = Boolean(flags[0]?.pending_request);
      followsYou = Boolean(flags[0]?.follows_you);
    }

    return res.json({
      profile: {
        id: row.uid,
        username: row.username,
        name: row.full_name || row.username,
        avatarUrl: row.avatar_url || null,
        bio: row.bio || "",
        isPrivate: Boolean(row.is_private),
        createdAt: row.created_at,
        postCount: Number(row.post_count || 0),
        followerCount: Number(row.follower_count || 0),
        followingCount: Number(row.following_count || 0),
        isSelf,
        isFollowing,
        followsYou,
        hasPendingRequest,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load profile" });
  }
}

export async function getUserPosts(req, res) {
  // Posts authored by a user; private accounts are locked for non-followers.
  try {
    const viewerId = req.user?.id || 0;
    const [rows] = await pool.execute(
      "SELECT uid, username, is_private FROM users WHERE username = ? LIMIT 1",
      [req.params.username],
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    const isSelf = viewerId && String(viewerId) === String(user.uid);
    let locked = false;

    if (user.is_private && !isSelf) {
      const [flags] = await pool.execute(
        "SELECT COUNT(*) AS n FROM follows WHERE follower_id = ? AND followee_id = ? AND status = 'accepted'",
        [viewerId, user.uid],
      );
      locked = flags[0].n === 0;
    }

    if (locked) {
      return res.json({ posts: [], locked: true });
    }

    const posts = await fetchPosts({
      viewerId,
      where: "WHERE p.author_id = ?",
      params: [user.uid],
      limit: 30,
      includeDrafts: Boolean(isSelf),
    });
    return res.json({ posts, locked: false });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load user posts" });
  }
}

async function listRelations(req, res, direction) {
  try {
    const viewerId = req.user?.id || 0;
    const uid = await findUidByUsername(req.params.username);
    if (!uid) return res.status(404).json({ error: "User not found" });

    const joinColumn = direction === "followers" ? "f.follower_id" : "f.followee_id";
    const filterColumn = direction === "followers" ? "f.followee_id" : "f.follower_id";

    const [rows] = await pool.execute(
      `SELECT u.uid, u.username, u.full_name, u.avatar_url, u.bio, u.is_private,
         EXISTS(SELECT 1 FROM follows fx WHERE fx.follower_id = ? AND fx.followee_id = u.uid AND fx.status = 'accepted') AS is_following
       FROM follows f
       JOIN users u ON u.uid = ${joinColumn}
       WHERE ${filterColumn} = ? AND f.status = 'accepted'
       ORDER BY f.created_at DESC
       LIMIT 100`,
      [viewerId, uid],
    );

    return res.json({ users: rows.map(mapSummary) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to load user list" });
  }
}

export async function getFollowers(req, res) {
  return listRelations(req, res, "followers");
}

export async function getFollowing(req, res) {
  return listRelations(req, res, "following");
}

export async function updateMe(req, res) {
  // Updates the authenticated user's profile. Turns public → auto-accepts
  // any pending follow requests and notifies those followers.
  const { full_name, bio, username, is_private, avatar_url } = req.body || {};
  const updates = [];
  const params = [];

  try {
    if (full_name !== undefined) {
      const clean = typeof full_name === "string" ? full_name.trim().slice(0, 100) : "";
      updates.push("full_name = ?");
      params.push(clean || null);
    }

    if (bio !== undefined) {
      const clean = typeof bio === "string" ? bio.trim().slice(0, 500) : "";
      updates.push("bio = ?");
      params.push(clean || null);
    }

    if (username !== undefined) {
      const clean = String(username).toLowerCase().trim();
      if (!USERNAME_RE.test(clean)) {
        return res.status(400).json({ error: "Username must be 3–50 characters (letters, numbers, dots, underscores)" });
      }
      const [taken] = await pool.execute("SELECT uid FROM users WHERE username = ? AND uid <> ? LIMIT 1", [clean, req.user.id]);
      if (taken[0]) return res.status(409).json({ error: "Username is already taken" });
      updates.push("username = ?");
      params.push(clean);
    }

    if (avatar_url !== undefined) {
      const clean = typeof avatar_url === "string" ? avatar_url.trim().slice(0, 500) : "";
      const valid = clean && (/^\/uploads\/[A-Za-z0-9._-]+$/.test(clean) || /^https?:\/\//i.test(clean));
      updates.push("avatar_url = ?");
      params.push(valid ? clean : null);
    }

    if (is_private !== undefined) {
      updates.push("is_private = ?");
      params.push(is_private ? 1 : 0);
    }

    if (!updates.length) {
      return res.status(400).json({ error: "Nothing to update" });
    }

    params.push(req.user.id);
    await pool.execute(`UPDATE users SET ${updates.join(", ")} WHERE uid = ?`, params);

    // Turning an account public accepts any pending follow requests.
    if (is_private === false) {
      const [pending] = await pool.execute(
        "SELECT follower_id FROM follows WHERE followee_id = ? AND status = 'pending'",
        [req.user.id],
      );
      if (pending.length) {
        await pool.execute(
          "UPDATE follows SET status = 'accepted' WHERE followee_id = ? AND status = 'pending'",
          [req.user.id],
        );
        for (const row of pending) {
          await notify(row.follower_id, req.user.id, "follow_accepted");
        }
      }
    }

    const [rows] = await pool.execute(
      "SELECT uid AS id, email, username, full_name, bio, is_private, avatar_url FROM users WHERE uid = ? LIMIT 1",
      [req.user.id],
    );
    const user = rows[0];

    return res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        full_name: user.full_name || null,
        bio: user.bio || null,
        is_private: Boolean(user.is_private),
        avatar_url: user.avatar_url || null,
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to update profile" });
  }
}
