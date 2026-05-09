const pool = require("../config/db");

exports.getNotifications = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT notifications.id, notifications.type, notifications.is_read,
       notifications.created_at, notifications.message, notifications.post_id,
       users.name AS actor_name, users.role AS actor_role
       FROM notifications
       JOIN users ON notifications.actor_id = users.id
       WHERE notifications.user_id = $1
       ORDER BY notifications.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAllRead = async (req, res) => {
  try {
    await pool.query(
      "UPDATE notifications SET is_read = TRUE WHERE user_id = $1",
      [req.user.id]
    );
    res.json({ message: "All notifications marked as read." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {

    await pool.query(
      `
      UPDATE notifications
      SET is_read = TRUE
      WHERE id = $1
      AND user_id = $2
      `,
      [req.params.id, req.user.id]
    );

    res.json({
      message: "Notification marked as read."
    });

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
};