import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";

function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}

function Avatar({ initials, size = 40, bg = "#1e3a5f" }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: bg, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: size * 0.35, flexShrink: 0, fontFamily: "'Nunito', sans-serif" }}>
      {initials}
    </div>
  );
}

export default function MyPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  useEffect(() => {
    API.get("/users/profile").then(r => setCurrentUser(r.data)).catch(() => navigate("/login"));
    API.get("/posts/my")
      .then(r => setPosts(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* DELETE — DELETE /api/posts/:id */
  const handleDelete = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts(prev => prev.filter(p => p.id !== postId));
    } catch (err) { console.error(err); }
  };

  /* UPDATE — PUT /api/posts/:id */
  const handleEditSave = async (postId) => {
    if (!editContent.trim()) return;
    try {
      await API.put(`/posts/${postId}`, { content: editContent });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: editContent } : p));
      setEditingId(null);
    } catch (err) { console.error(err); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }
        .page-root { font-family: 'Nunito', sans-serif; min-height: 100vh; background: #f0f2f5; }
        .topbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 24px; height: 56px; gap: 16px; }
        .topbar-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; color: #1e3a5f; cursor: pointer; }
        .topbar-logo img { height: 30px; }
        .back-btn { margin-left: auto; display: flex; align-items: center; gap: 6px; padding: 7px 16px; background: #f0f2f5; border: none; border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #4b5563; cursor: pointer; }
        .back-btn:hover { background: #e5e7eb; }
        .body { max-width: 680px; margin: 0 auto; padding: 28px 16px; display: flex; flex-direction: column; gap: 16px; }
        .page-title { font-size: 20px; font-weight: 800; color: #1e2a3a; }
        .page-sub { font-size: 13px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .empty { text-align: center; color: #9ca3af; font-weight: 600; padding: 48px 0; font-size: 14px; }
        .post-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 20px; display: flex; flex-direction: column; gap: 12px; }
        .post-header { display: flex; align-items: center; gap: 10px; }
        .post-author { font-size: 14px; font-weight: 800; color: #1e2a3a; }
        .post-meta { font-size: 12px; color: #9ca3af; font-weight: 600; }
        .post-content { font-size: 14px; color: #374151; font-weight: 600; line-height: 1.65; }
        .post-stats { display: flex; gap: 16px; font-size: 12.5px; color: #9ca3af; font-weight: 600; }
        .post-actions { display: flex; gap: 8px; margin-top: 4px; }
        .edit-btn { padding: 6px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: none; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #4b5563; cursor: pointer; }
        .edit-btn:hover { background: #f0f2f5; }
        .del-btn { padding: 6px 14px; border: 1.5px solid #fecdd3; border-radius: 8px; background: none; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #e11d48; cursor: pointer; }
        .del-btn:hover { background: #fff1f2; }
        .edit-textarea { width: 100%; min-height: 80px; padding: 10px 14px; border: 1.5px solid #7b8fcf; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; color: #1e2a3a; resize: vertical; outline: none; font-weight: 600; }
        .save-btn { padding: 7px 18px; background: #1e3a5f; color: #fff; border: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; }
        .cancel-btn { padding: 7px 18px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: none; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #6b7280; cursor: pointer; }
      `}</style>

      <div className="page-root">
        <header className="topbar">
          <TopProgressBar loading={loading} />
          <div className="topbar-logo" onClick={() => navigate("/feed")}>
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <button className="back-btn" onClick={() => navigate("/feed")}>← Back to Feed</button>
        </header>

        <div className="body">
          <div>
            <div className="page-title">My Posts</div>
            <div className="page-sub">{posts.length} post{posts.length !== 1 ? "s" : ""} by you</div>
          </div>

          {loading
            ? <PostsPageSkeleton />
            : posts.length === 0
              ? <p className="empty">You haven't posted anything yet.</p>
              : posts.map(post => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <Avatar initials={getInitials(post.name)} size={38} />
                      <div>
                        <div className="post-author">{post.name}</div>
                        <div className="post-meta">
                          {new Date(post.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      </div>
                    </div>

                    {editingId === post.id ? (
                      <>
                        <textarea className="edit-textarea" value={editContent} onChange={e => setEditContent(e.target.value)} />
                        <div style={{ display: "flex", gap: 8 }}>
                          <button className="save-btn" onClick={() => handleEditSave(post.id)}>Save</button>
                          <button className="cancel-btn" onClick={() => setEditingId(null)}>Cancel</button>
                        </div>
                      </>
                    ) : (
                      <p className="post-content">{post.content}</p>
                    )}

                    <div className="post-stats">
                      <span>❤️ {post.likes_count} likes</span>
                      <span>💬 {post.comments_count} comments</span>
                    </div>

                    {editingId !== post.id && (
                      <div className="post-actions">
                        <button className="edit-btn" onClick={() => { setEditingId(post.id); setEditContent(post.content); }}>✏️ Edit</button>
                        <button className="del-btn" onClick={() => handleDelete(post.id)}>🗑️ Delete</button>
                      </div>
                    )}
                  </div>
                ))
          }
        </div>
      </div>
    </>
  );
}