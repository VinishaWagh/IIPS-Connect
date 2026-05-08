const pool = require("../config/db");
const bcrypt = require("bcrypt");

// getting user profile
exports.getProfile = async(req, res)=>{
    try{
        const user = await pool.query(
            "SELECT id, name, email, role, created_at FROM users WHERE id = $1",
            [req.user.id]
        );
        if(user.rows.length == 0){
            return res.status(404).json({message: "User not found"});
        }
        res.json(user.rows[0]);
    } catch(error){
        res.status(500).json({error: error.message});
    }
};

// getting suggestions
exports.getSuggestions = async (req, res) =>{
    try{
        const currentUserId = req.user.id;

        const users = await pool.query(
            `SELECT u.id, u.name, u.role 
             FROM users u
             WHERE u.id != $1
             AND u.id NOT IN (
               SELECT CASE 
                 WHEN connections.sender_id = $1 THEN connections.receiver_id
                 ELSE connections.sender_id 
               END AS connected_user_id
               FROM connections
               WHERE (connections.sender_id = $1 OR connections.receiver_id = $1)
               AND connections.status = 'accepted'
             )
             LIMIT 5`,
            [currentUserId]
        );

        res.json(users.rows);
    } catch(error){
        res.status(500).json({error: error.message});
    }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, email, role } = req.body;
    
    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }
    if (email !== undefined) {
      updates.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }
    if (role !== undefined) {
      updates.push(`role = $${paramCount}`);
      values.push(role.toLowerCase());
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    values.push(req.user.id);
    const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${paramCount} RETURNING id, name, email, role, created_at`;
    
    const updated = await pool.query(query, values);
    res.json(updated.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Password
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [req.user.id]);
    const valid = await bcrypt.compare(currentPassword, user.rows[0].password);
    if (!valid) return res.status(400).json({ message: "Current password is incorrect." });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE users SET password = $1 WHERE id = $2", [hashed, req.user.id]);
    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// get Alumni's
exports.getAlumni = async (req, res) => {
  try {
    const alumni = await pool.query(
      `SELECT id, name, email, role, created_at FROM users WHERE role = 'alumni' AND id != $1`,
      [req.user.id]
    );
    res.json(alumni.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//get Mentor's
exports.getMentors = async (req, res) => {
  try {
    const viewerRole = req.user.role;

    let query;
    // Students see both faculty and alumni as mentors
    // Alumni see only faculty as mentors
    if (viewerRole === "student") {
      query = await pool.query(
        `SELECT id, name, email, role, created_at 
         FROM users 
         WHERE role IN ('alumni', 'faculty') AND id != $1
         ORDER BY role, name`,
        [req.user.id]
      );
    } else if (viewerRole === "alumni") {
      query = await pool.query(
        `SELECT id, name, email, role, created_at 
         FROM users 
         WHERE role = 'faculty' AND id != $1
         ORDER BY name`,
        [req.user.id]
      );
    } else {
      // Faculty viewing — show all other faculty and alumni
      query = await pool.query(
        `SELECT id, name, email, role, created_at 
         FROM users 
         WHERE role IN ('alumni', 'faculty') AND id != $1
         ORDER BY role, name`,
        [req.user.id]
      );
    }

    res.json(query.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

//Get total connection count
exports.getConnectionsCount = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT COUNT(*) FROM connections 
       WHERE (sender_id = $1 OR receiver_id = $1) 
       AND status = 'accepted'`,
      [req.user.id]
    );
    res.json({ count: parseInt(result.rows[0].count) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};