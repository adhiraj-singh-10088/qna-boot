import pool from "../utils/db.js";

// The database engineer should replace these placeholders with the agreed
// queries and keep the returned post shape consistent with the controllers.
// Expected MySQL fields: id (primary key), author_id (user foreign key),
// title (post title), content (post body), created_at (creation timestamp),
// and edited (boolean indicating whether the author has edited the post).
const postQueries = {
  create: null,
  findById: null,
  update: null,
  delete: null,
};

async function runPostQuery(operation, params = []) {
  // Executes the database query selected for a post operation once the query is provided.
  if (!postQueries[operation]) {
    throw new Error(`Post query placeholder not implemented: ${operation}`);
  }

  return pool.execute(postQueries[operation], params);
}

function getAuthorId(post) {
  // Reads the author identifier while supporting the column names returned by the database.
  return post.authorId ?? post.author_id ?? post.userId ?? post.user_id;
}

function addEditedState(post) {
  // Ensures every consumer can see whether the post has ever been edited.
  return {
    ...post,
    edited: post.edited === true || post.edited === 1 || post.edited === "1",
  };
}

async function getPostForAuthorCheck(postId) {
  // Retrieves one post so edit and delete operations can verify its author.
  const [rows] = await runPostQuery("findById", [postId]);
  return rows?.[0] || null;
}

export async function createPost(req, res) {
  // Validates post data, associates it with the authenticated user, and stores it.
  const { title, content, createdAt, timestamp } = req.body;
  const creationTimestamp = createdAt || timestamp;

  if (!title || !content || !creationTimestamp) {
    return res
      .status(400)
      .json({ error: "Title, content, and creation timestamp are required" });
  }

  try {
    const [result] = await runPostQuery("create", [
      title,
      content,
      creationTimestamp,
      req.user.id,
    ]);

    return res.status(201).json({
      id: result.insertId,
      title,
      content,
      createdAt: creationTimestamp,
      authorId: req.user.id,
      edited: false,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to create post" });
  }
}

export async function getPostById(req, res) {
  // Fetches and returns a post by ID without requiring authentication.
  try {
    const post = await getPostForAuthorCheck(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });

    return res.json({ post: addEditedState(post) });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to fetch post" });
  }
}

export async function editPost(req, res) {
  // Confirms ownership, updates the post, and marks the response as edited.
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: "Title and content are required" });
  }

  try {
    const post = await getPostForAuthorCheck(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (String(getAuthorId(post)) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Only the author can edit this post" });
    }

    await runPostQuery("update", [title, content, true, req.params.id]);
    return res.json({ id: req.params.id, title, content, edited: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to edit post" });
  }
}

export async function deletePost(req, res) {
  // Confirms ownership before permanently deleting the requested post.
  try {
    const post = await getPostForAuthorCheck(req.params.id);
    if (!post) return res.status(404).json({ error: "Post not found" });
    if (String(getAuthorId(post)) !== String(req.user.id)) {
      return res
        .status(403)
        .json({ error: "Only the author can delete this post" });
    }

    await runPostQuery("delete", [req.params.id]);
    return res.status(204).send();
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unable to delete post" });
  }
}
