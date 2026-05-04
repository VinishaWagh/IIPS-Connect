const pool = require("../config/db");

// Student sends mentorship request
exports.sendRequest = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const senderId = req.user.id;
    const senderRole = req.user.role;

    // Get the target user's role
    const target = await pool.query("SELECT role FROM users WHERE id = $1", [alumniId]);
    if (target.rows.length === 0)
      return res.status(404).json({ message: "User not found." });

    const targetRole = target.rows[0].role;

    // Enforce mentorship rules
    if (senderRole === "student") {
      if (!["alumni", "faculty"].includes(targetRole))
        return res.status(403).json({ message: "Students can only request alumni or faculty mentors." });
    } else if (senderRole === "alumni") {
      if (targetRole !== "faculty")
        return res.status(403).json({ message: "Alumni can only request faculty mentors." });
    } else if (senderRole === "faculty") {
      return res.status(403).json({ message: "Faculty cannot request mentorship." });
    }

    // Check duplicate
    const existing = await pool.query(
      "SELECT * FROM mentorship_requests WHERE student_id = $1 AND alumni_id = $2",
      [senderId, alumniId]
    );
    if (existing.rows.length > 0)
      return res.status(400).json({ message: "Request already sent." });

    const result = await pool.query(
      `INSERT INTO mentorship_requests (student_id, alumni_id, topic, message)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [senderId, alumniId, req.body.topic, req.body.message]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alumni gets their incoming requests
exports.getMyRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mentorship_requests.*, users.name AS student_name, users.email AS student_email
       FROM mentorship_requests
       JOIN users ON mentorship_requests.student_id = users.id
       WHERE mentorship_requests.alumni_id = $1
       ORDER BY mentorship_requests.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Alumni responds to a request
exports.respondRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body; // "accepted" or "rejected"

    const result = await pool.query(
      "UPDATE mentorship_requests SET status = $1 WHERE id = $2 AND alumni_id = $3 RETURNING *",
      [status, requestId, req.user.id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ message: "Request not found." });

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Student gets their sent requests + status
exports.getMySentRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT mentorship_requests.*, users.name AS alumni_name, users.email AS alumni_email
       FROM mentorship_requests
       JOIN users ON mentorship_requests.alumni_id = users.id
       WHERE mentorship_requests.student_id = $1
       ORDER BY mentorship_requests.created_at DESC`,
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get status between student and alumni
exports.getRequestStatus = async (req, res) => {
  try {
    const { alumniId } = req.params;
    const result = await pool.query(
      "SELECT * FROM mentorship_requests WHERE student_id = $1 AND alumni_id = $2",
      [req.user.id, alumniId]
    );
    if (result.rows.length === 0) return res.json({ status: "none" });
    res.json({ status: result.rows[0].status, id: result.rows[0].id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};