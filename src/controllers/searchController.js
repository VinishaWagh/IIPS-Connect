const pool = require("../config/db");

exports.globalSearch = async (req, res) => {

  try {

    const query = req.query.q;

    if(!query){
      return res.status(400).json({
        message: "Search query is required"
      });
    }

    /* SEARCH USERS */
    const users = await pool.query(
      `
      SELECT id, name, role
      FROM users
      WHERE name ILIKE $1
      LIMIT 5
      `,
      [`%${query}%`]
    );

    /* SEARCH POSTS */
    const posts = await pool.query(
      `
      SELECT id, content
      FROM posts
      WHERE content ILIKE $1
      LIMIT 5
      `,
      [`%${query}%`]
    );

    /* SEARCH EVENTS */
    const events = await pool.query(
      `
      SELECT id, title
      FROM events
      WHERE title ILIKE $1
      LIMIT 5
      `,
      [`%${query}%`]
    );

    /* SEARCH ANNOUNCEMENTS */
    const announcements = await pool.query(
      `
      SELECT id, text
      FROM announcements
      WHERE text ILIKE $1
      LIMIT 5
      `,
      [`%${query}%`]
    );

    res.json({
      users: users.rows,
      posts: posts.rows,
      events: events.rows,
      announcements: announcements.rows
    });

  } catch(error){

    res.status(500).json({
      error: error.message
    });

  }
};