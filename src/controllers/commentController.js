const pool = require("../config/db");

// Create Comment
exports.createComment = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ message: "Content is required." });
    }

    //Check if Post exists
    const post = await pool.query(`SELECT * FROM posts WHERE id = $1`, [
      postId,
    ]);
    if (post.rows.length == 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    //create comment
    const newComment = await pool.query(
      "INSERT INTO comments (post_id, user_id, content) VALUES ($1, $2, $3) RETURNING *",
      [postId, req.user.id, content],
    );

    const postOwner = await pool.query(
      "SELECT user_id FROM posts WHERE id = $1",
      [postId],
    );

    if (postOwner.rows[0].user_id !== req.user.id) {
      await pool.query(
        `
    INSERT INTO notifications
    (user_id, actor_id, type, post_id, message)
    VALUES ($1, $2, $3, $4, $5)
    `,
        [
          postOwner.rows[0].user_id,
          req.user.id,
          "comment",
          postId,
          "commented on your post",
        ],
      );
    }

    res.status(201).json(newComment.rows[0]);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Get all Comments
exports.getComments = async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await pool.query(
      `SELECT comments.id, comments.content, comments.created_at, users.name, users.role
            FROM comments
            JOIN users on comments.user_id = users.id
            WHERE comments.post_id = $1
            ORDER BY comments.created_at ASC`,
      [postId],
    );
    res.json(comments.rows);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

//Delete Comment
exports.deleteComments = async (req, res) => {
  try {
    const commentId = req.params.id;

    //check if comment exists
    const comment = await pool.query("SELECT * FROM comments WHERE id = $1", [
      commentId,
    ]);
    if (comment.rows.length === 0) {
      return res.status(404).json({ message: "Comment not found." });
    }

    //check ownership
    if (comment.rows[0].user_id != req.user.id) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment." });
    }

    await pool.query("DELETE FROM comments WHERE id = $1", [commentId]);

    res.json({ message: "Comment deleted successfully." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
