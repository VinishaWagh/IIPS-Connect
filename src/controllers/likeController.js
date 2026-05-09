const pool = require("../config/db");

// Toggle Likes
exports.toggleLikes = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;

    //Check if post exist
    const post = await pool.query("SELECT * FROM posts WHERE id = $1", [
      postId,
    ]);
    if (post.rows.length === 0) {
      return res.status(404).json({ message: "Post not found." });
    }

    //Check if already liked
    const existingLike = await pool.query(
      "SELECT * FROM likes WHERE post_id = $1 AND user_id = $2",
      [postId, userId],
    );

    if (existingLike.rows.length > 0) {
      //Unlike
      await pool.query(
        "DELETE FROM likes WHERE post_id = $1 AND user_id = $2",
        [postId, userId],
      );

      const likesCountRes = await pool.query(
        "SELECT COUNT(*) AS count FROM likes WHERE post_id = $1",
        [postId],
      );

      return res.json({
        message: "Post unliked.",
        liked: false,
        likes_count: Number(likesCountRes.rows[0].count),
      });
    }

    //Like
    await pool.query(
      `INSERT INTO likes (post_id, user_id)
       VALUES ($1, $2)
       ON CONFLICT (post_id, user_id) DO NOTHING`,
      [postId, userId],
    );

    // get post owner
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
          "like",
          postId,
          "liked your post",
        ],
      );
    }

    const likesCountRes = await pool.query(
      "SELECT COUNT(*) AS count FROM likes WHERE post_id = $1",
      [postId],
    );

    return res.json({
      message: "Post Liked.",
      liked: true,
      likes_count: Number(likesCountRes.rows[0].count),
    });
  } catch (error) {
    console.error("toggleLikes error:", error);
    return res.status(500).json({ error: error.message });
  }
};