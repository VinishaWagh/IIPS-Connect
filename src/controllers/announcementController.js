const pool = require("../config/db");

exports.getLatest = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM announcements ORDER BY created_at DESC LIMIT 1`
    );
    res.json(result.rows[0] || null);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAnnouncement = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text)
      return res.status(400).json({ message: "Text is required." });

    const result = await pool.query(
      `INSERT INTO announcements (text) VALUES ($1) RETURNING *`,
      [text]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAnnouncement = async (req, res) => {
  try {
    await pool.query("DELETE FROM announcements WHERE id = $1", [req.params.id]);
    res.json({ message: "Announcement deleted." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllAnnouncements = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM announcements ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get announcement by Id
exports.getAnnouncementById = async(req, res) => {

  try{

    const { id } = req.params;

    const announcement = await pool.query(
      "SELECT * FROM announcements WHERE id = $1",
      [id]
    );

    if(announcement.rows.length === 0){
      return res.status(404).json({
        message: "Announcement not found"
      });
    }

    res.json(announcement.rows[0]);

  } catch(error){

    res.status(500).json({
      error: error.message
    });

  }
};