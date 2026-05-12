const pool = require("../config/db");

const getServerRoot = (req) => {
  const configuredRoot = process.env.SERVER_ROOT_URL;
  if (configuredRoot) {
    return configuredRoot.replace(/\/$/, "");
  }
  return `${req.protocol}://${req.get("host")}`;
};

const buildAttachmentUrl = (attachmentPath, req) => {
  if (!attachmentPath) return "";

  const root = getServerRoot(req);
  if (attachmentPath.startsWith("http://") || attachmentPath.startsWith("https://")) {
    try {
      const parsed = new URL(attachmentPath);
      if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
        return `${root}${parsed.pathname}`;
      }
      return attachmentPath;
    } catch (error) {
      return attachmentPath;
    }
  }

  return `${root}${attachmentPath.startsWith("/") ? "" : "/"}${attachmentPath}`;
};

// Create a Post
exports.createPost = async(req, res)=>{
    try{
        const {content} = req.body;
        
        // Content can be empty if files are attached, but at least one is required
        if(!content?.trim() && (!req.files || req.files.length === 0)){
            return res.status(400).json({message: "Content or attachments are required!"});
        }   

        // Insert the post
        const newPost = await pool.query(
            "INSERT INTO posts (user_id, content) VALUES ($1, $2) RETURNING *",
            [req.user.id, content || ""]
        );

        const postId = newPost.rows[0].id;
        let attachments = [];

        // Save file attachments if any
        if(req.files && req.files.length > 0){
                for(const file of req.files){
                // Save file metadata to attachments table
                const filePath = `/uploads/${file.filename}`;
                const attachmentResult = await pool.query(
                    "INSERT INTO attachments (post_id, filename, original_name, path, mimetype, size) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
                    [postId, file.filename, file.originalname, filePath, file.mimetype, file.size]
                );
                attachments.push({
                    ...attachmentResult.rows[0],
                    url: buildAttachmentUrl(filePath, req),
                });
            }
        }

        res.status(201).json({
            ...newPost.rows[0],
            attachments: attachments
        });
    } catch(error){
        res.status(500).json({error: error.message});
    }
};

// Get posts (Commnuity Feed)
exports.getPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await pool.query(
      `SELECT posts.id, posts.user_id, posts.content, posts.created_at, users.name,
       COUNT(DISTINCT likes.id) AS likes_count,
       COUNT(DISTINCT comments.id) AS comments_count,
       BOOL_OR(likes.user_id = $1) AS is_liked,
       BOOL_OR(saved_posts.user_id = $1) AS is_saved
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON posts.id = likes.post_id
       LEFT JOIN comments ON posts.id = comments.post_id
       LEFT JOIN saved_posts ON posts.id = saved_posts.post_id
       GROUP BY posts.id, users.name
       ORDER BY posts.created_at DESC`,
      [userId]
    );
    
    // Fetch all attachments for these posts in one query
    const postIds = posts.rows.map(p => p.id);
    let attachmentsByPostId = {};
    
    if(postIds.length > 0){
      const attachments = await pool.query(
        "SELECT id, post_id, filename, original_name, path, mimetype, size FROM attachments WHERE post_id = ANY($1) ORDER BY post_id",
        [postIds]
      );
      
      attachments.rows.forEach(att => {
        if(!attachmentsByPostId[att.post_id]){
          attachmentsByPostId[att.post_id] = [];
        }
        attachmentsByPostId[att.post_id].push({
          ...att,
          url: buildAttachmentUrl(att.path, req),
        });
      });
    }
    
    // Add attachments to posts
    const enrichedPosts = posts.rows.map(post => ({
      ...post,
      attachments: attachmentsByPostId[post.id] || [],
    }));
    
    res.json(enrichedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Delete Posts (Only by Owner)
exports.deletePosts = async(req, res)=>{
    try{
        const postId = req.params.id;

        //if post exists
        const post = await pool.query(
            `SELECT * FROM posts WHERE id = $1`,
            [postId]
        );

        if(post.rows.length === 0){
            return res.status(404).json({message: "Post not found."});
        }

        //check ownership
        if(post.rows[0].user_id !== req.user.id){
            return res.status(403).json({message: "You are not authorized to delete this post."});
        }

        await pool.query(
            "DELETE FROM posts WHERE id = $1",
            [postId]
        );

        res.json({message: "Post deleted successfully."});
    } catch(error){
        res.status(500).json({error: error.message});
    }
};

// Update Post (Only By Owner)
exports.updatePosts = async(req, res)=>{
    try{
        const postId = req.params.id;
        const {content} = req.body;

        if(!content){
            return res.status(400).json({message: "Content is required."});
        }

        //check if post exists
        const post = await pool.query(
            `SELECT * FROM posts WHERE id = $1`,
            [postId]
        );

        if(post.rows.length === 0){
            return res.status(404).json({message: "Post not found."});
        }

        //check ownership
        if(post.rows[0].user_id !== req.user.id){
            return res.status(403).json({message: "You are not authorized to delete this post."});
        }

        //update post
        const updatedPost = await pool.query(
            "UPDATE posts SET content = $1 WHERE id = $2 RETURNING *",
            [content, postId]
        );

        res.json(updatedPost.rows[0]);
    } catch(error){
        return res.status(500).json({error: error.message});
    }
};

// get Trending Posts

exports.getTrending = async (req, res) => {
  try {
    const trending = await pool.query(
      `SELECT posts.id, posts.content, users.name,
       COUNT(likes.id) AS likes_count
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON posts.id = likes.post_id
       GROUP BY posts.id, users.name
       ORDER BY likes_count DESC
       LIMIT 5`
    );
    res.json(trending.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get My Posts
exports.getMyPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await pool.query(
      `SELECT posts.id, posts.content, posts.created_at, users.name,
       COUNT(DISTINCT likes.id) AS likes_count,
       COUNT(DISTINCT comments.id) AS comments_count,
       BOOL_OR(likes.user_id = $1) AS is_liked
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON posts.id = likes.post_id
       LEFT JOIN comments ON posts.id = comments.post_id
       WHERE posts.user_id = $1
       GROUP BY posts.id, users.name
       ORDER BY posts.created_at DESC`,
      [userId]
    );
    
    // Fetch all attachments for these posts in one query
    const postIds = posts.rows.map(p => p.id);
    let attachmentsByPostId = {};
    
    if(postIds.length > 0){
      const attachments = await pool.query(
        "SELECT id, post_id, filename, original_name, path, mimetype, size FROM attachments WHERE post_id = ANY($1) ORDER BY post_id",
        [postIds]
      );
      
      attachments.rows.forEach(att => {
        if(!attachmentsByPostId[att.post_id]){
          attachmentsByPostId[att.post_id] = [];
        }
        attachmentsByPostId[att.post_id].push({
          ...att,
          url: buildAttachmentUrl(att.path, req),
        });
      });
    }
    
    // Add attachments to posts
    const enrichedPosts = posts.rows.map(post => ({
      ...post,
      attachments: attachmentsByPostId[post.id] || [],
    }));
    
    res.json(enrichedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get toggle Saved Posts
exports.toggleSavePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.id;
    const existing = await pool.query(
      "SELECT * FROM saved_posts WHERE user_id = $1 AND post_id = $2",
      [userId, postId]
    );
    if (existing.rows.length > 0) {
      await pool.query(
        "DELETE FROM saved_posts WHERE user_id = $1 AND post_id = $2",
        [userId, postId]
      );
      return res.json({ message: "Post unsaved." });
    }
    await pool.query(
      "INSERT INTO saved_posts (user_id, post_id) VALUES ($1, $2)",
      [userId, postId]
    );
    res.json({ message: "Post saved." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// get Saved Posts
exports.getSavedPosts = async (req, res) => {
  try {
    const userId = req.user.id;
    const posts = await pool.query(
      `SELECT posts.id, posts.content, posts.created_at, users.name,
       COUNT(DISTINCT likes.id) AS likes_count,
       COUNT(DISTINCT comments.id) AS comments_count,
       BOOL_OR(likes.user_id = $1) AS is_liked,
       true AS is_saved
       FROM saved_posts
       JOIN posts ON saved_posts.post_id = posts.id
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON posts.id = likes.post_id
       LEFT JOIN comments ON posts.id = comments.post_id
       WHERE saved_posts.user_id = $1
       GROUP BY posts.id, posts.created_at, users.name
       ORDER BY posts.created_at DESC`,
      [userId]
    );
    
    // Fetch all attachments for these posts in one query
    const postIds = posts.rows.map(p => p.id);
    let attachmentsByPostId = {};
    
    if(postIds.length > 0){
      const attachments = await pool.query(
        "SELECT id, post_id, filename, original_name, path, mimetype, size FROM attachments WHERE post_id = ANY($1) ORDER BY post_id",
        [postIds]
      );
      
      attachments.rows.forEach(att => {
        if(!attachmentsByPostId[att.post_id]){
          attachmentsByPostId[att.post_id] = [];
        }
        attachmentsByPostId[att.post_id].push({
          ...att,
          url: buildAttachmentUrl(att.path, req),
        });
      });
    }
    
    // Add attachments to posts
    const enrichedPosts = posts.rows.map(post => ({
      ...post,
      attachments: attachmentsByPostId[post.id] || [],
    }));
    
    res.json(enrichedPosts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// search for posts, users and events
exports.searchAll = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json({ posts: [], users: [], events: [] });

    const search = `%${q}%`;

    const posts = await pool.query(
      `SELECT posts.id, posts.content, posts.created_at, users.name,
       COUNT(DISTINCT likes.id) AS likes_count,
       COUNT(DISTINCT comments.id) AS comments_count
       FROM posts
       JOIN users ON posts.user_id = users.id
       LEFT JOIN likes ON posts.id = likes.post_id
       LEFT JOIN comments ON posts.id = comments.post_id
       WHERE posts.content ILIKE $1
       GROUP BY posts.id, users.name
       ORDER BY posts.created_at DESC
       LIMIT 10`,
      [search]
    );

    const users = await pool.query(
      `SELECT id, name, email, role FROM users
       WHERE name ILIKE $1 OR email ILIKE $1
       LIMIT 8`,
      [search]
    );

    const events = await pool.query(
      `SELECT * FROM events
       WHERE title ILIKE $1
       ORDER BY event_date ASC
       LIMIT 5`,
      [search]
    );

    res.json({
      posts: posts.rows,
      users: users.rows,
      events: events.rows,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};