import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import { TopProgressBar, PostsPageSkeleton } from "../components/PageLoaders";

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

export default function SavedPosts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  /* GET SAVED POSTS — GET /api/posts/saved */
  useEffect(() => {
    API.get("/posts/saved")
      .then(r => setPosts(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* UNSAVE POST — POST /api/posts/:postId/save (toggle) */
  const handleUnsave = async (postId) => {
    try {
      await API.post(`/posts/${postId}/save`);
      setPosts(prev => prev.filter(p => p.id !== postId));
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
        .post-footer { display: flex; align-items: center; justify-content: space-between; }
        .post-stats { display: flex; gap: 16px; font-size: 12.5px; color: #9ca3af; font-weight: 600; }
        .unsave-btn { display: flex; align-items: center; gap: 5px; padding: 6px 14px; border: 1.5px solid #e5e7eb; border-radius: 8px; background: none; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #6b7280; cursor: pointer; transition: all 0.15s; }
        .unsave-btn:hover { border-color: #fecdd3; color: #e11d48; background: #fff1f2; }
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
            <div className="page-title">Saved Posts</div>
            <div className="page-sub">{posts.length} saved post{posts.length !== 1 ? "s" : ""}</div>
          </div>

          {loading
            ? (
            <PostsPageSkeleton/>
            ) : posts.length === 0
              ? <p className="empty">No saved posts yet. Save posts from the feed!</p>
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

                    <p className="post-content">{post.content}</p>

                    <div className="post-footer">
                      <div className="post-stats">
                        <span>❤️ {post.likes_count} likes</span>
                        <span>💬 {post.comments_count} comments</span>
                      </div>
                      <button className="unsave-btn" onClick={() => handleUnsave(post.id)}>
                        🔖 Unsave
                      </button>
                    </div>
                  </div>
                ))
          }
        </div>
      </div>
    </>
  );
}