import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import ConnectButton from "../components/Connectbutton";
import { FullPageLoader } from "../components/PageLoaders";
import { useMinimumLoading } from "../hooks/useMinimumLoading";

/* ─────────────────────────────────────────────────
   AVATAR & BADGE
───────────────────────────────────────────────── */
function Avatar({ initials, size = 40, bg = "#1e3a5f" }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.35,
        flexShrink: 0,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {initials}
    </div>
  );
}

function Badge({ label }) {
  const map = {
    faculty: { bg: "#dbeafe", color: "#1d4ed8", text: "Faculty" },
    alumni: { bg: "#fef3c7", color: "#b45309", text: "Alumni" },
    student: { bg: "#dcfce7", color: "#15803d", text: "Student" },
  };
  const c = map[label?.toLowerCase()] || map.student;
  return (
    <span
      style={{
        background: c.bg,
        color: c.color,
        fontSize: 11,
        fontWeight: 700,
        padding: "2px 8px",
        borderRadius: 20,
        fontFamily: "'Nunito', sans-serif",
      }}
    >
      {c.text}
    </span>
  );
}

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??"
  );
}

//Logout
const handleLogout = () => {
  localStorage.removeItem("token");
  window.location.href = "/login";
};

// Missing components for loading states
function PageOverlay({ loading }) {
  if (!loading) return null;
  return <FullPageLoader />;
}

function SidebarSkeleton() {
  return (
    <div className="profile-card" style={{ padding: "40px 16px" }}>
      <div
        style={{
          width: 64,
          height: 64,
          borderRadius: "50%",
          background: "#e5e7eb",
          marginBottom: 10,
        }}
      />
      <div
        style={{
          height: 16,
          background: "#e5e7eb",
          borderRadius: 8,
          marginBottom: 8,
          width: "80%",
        }}
      />
      <div
        style={{
          height: 12,
          background: "#e5e7eb",
          borderRadius: 6,
          width: "60%",
        }}
      />
    </div>
  );
}

function FeedSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <div key={i} className="post-card" style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            width: 42,
            height: 42,
            borderRadius: "50%",
            background: "#e5e7eb",
          }}
        />
        <div>
          <div
            style={{
              height: 14,
              background: "#e5e7eb",
              borderRadius: 7,
              width: 120,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              height: 12,
              background: "#e5e7eb",
              borderRadius: 6,
              width: 80,
            }}
          />
        </div>
      </div>
      <div
        style={{
          height: 16,
          background: "#e5e7eb",
          borderRadius: 8,
          marginBottom: 8,
          width: "100%",
        }}
      />
      <div
        style={{
          height: 16,
          background: "#e5e7eb",
          borderRadius: 8,
          width: "70%",
        }}
      />
    </div>
  ));
}

function RightSidebarSkeleton() {
  return (
    <div className="widget-card" style={{ padding: "16px" }}>
      <div
        style={{
          height: 16,
          background: "#e5e7eb",
          borderRadius: 8,
          marginBottom: 14,
          width: "60%",
        }}
      />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div
            style={{
              height: 14,
              background: "#e5e7eb",
              borderRadius: 7,
              width: "80%",
              marginBottom: 4,
            }}
          />
          <div
            style={{
              height: 12,
              background: "#e5e7eb",
              borderRadius: 6,
              width: "50%",
            }}
          />
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   POST CARD
   Schema from getPosts:
     post.id, post.content, post.created_at,
     post.name (author), post.likes_count,
     post.comments_count, post.is_liked
───────────────────────────────────────────────── */
function PostCard({ post, currentUser, onDeletePost }) {
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [loadingCmts, setLoadingCmts] = useState(false);
  const [likesCount, setLikesCount] = useState(Number(post.likes_count));
  const [isLiked, setIsLiked] = useState(post.is_liked);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isSaved, setIsSaved] = useState(Boolean(post.is_saved));

  /* ── GET COMMENTS — GET /api/comments/:postId
     commentController.getComments returns:
     [{ id, content, created_at, name, role }]
  ── */
  const fetchComments = async () => {
    if (showComments) {
      setShowComments(false);
      return;
    }
    setLoadingCmts(true);
    try {
      const res = await API.get(`posts/${post.id}/comments`);
      setComments(res.data);
      setShowComments(true);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoadingCmts(false);
    }
  };

  /* ── ADD COMMENT — POST /api/comments/:postId
     commentController.createComment — body: { content }
     returns: { id, post_id, user_id, content, created_at }
  ── */
  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    try {
      const res = await API.post(`posts/${post.id}/comments`, {
        content: commentText,
      });
      // Backend returns the raw comment row, attach current user's name for display
      setComments((prev) => [
        ...prev,
        { ...res.data, name: currentUser.name, role: currentUser.role },
      ]);
      setCommentText("");
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  /* ── LIKE TOGGLE — POST /api/likes/:postId
     likeController.toggleLikes — no body needed
     returns: { message: "Post liked." | "Post unliked." }
  ── */
  const handleLike = async () => {
    try {
      await API.post(`posts/${post.id}/likes`);
      // Optimistic update
      setIsLiked((prev) => !prev);
      setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1));
    } catch (err) {
      console.error("Failed to toggle like", err);
    }
  };

  /* ── UPDATE POST — PUT /api/posts/:id
     postController.updatePosts — body: { content }
     returns updated post row
  ── */
  const handleEditSave = async () => {
    if (!editContent.trim()) return;
    try {
      await API.put(`/posts/${post.id}`, { content: editContent });
      post.content = editContent; // reflect change without refetch
      setEditing(false);
    } catch (err) {
      console.error("Failed to update post", err);
    }
  };

  // Save Posts

  const handleSave = async () => {
    const newState = !isSaved;
    setIsSaved(newState);
    try {
      await API.post(`/posts/${post.id}/save`);
    } catch (err) {
      setIsSaved(!newState); // revert on failure
      console.error(err);
    }
  };

  const handleShare = async () => {
    const postUrl = `${window.location.origin}/feed?post=${post.id}`;
    const shareData = {
      title: `IIPS Connect post from ${post.name}`,
      text: `Check out this post on IIPS Connect.`,
      url: postUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        return;
      }
    } catch (err) {
      console.warn("Web Share API failed, falling back to clipboard", err);
    }

    try {
      await navigator.clipboard.writeText(postUrl);
      alert("Post link copied to clipboard.");
    } catch (err) {
      console.error("Failed to copy share URL", err);
      alert("Unable to share this post right now. Please try again.");
    }
  };

  const isOwner = Boolean(
    currentUser &&
    post.user_id &&
    Number(currentUser.id) === Number(post.user_id), // ← coerce both to number
  );

  return (
    <div className="post-card">
      {/* Header */}
      <div className="post-header">
        <Avatar initials={getInitials(post.name)} size={42} />
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span className="post-author">{post.name}</span>
            {/* role not returned by getPosts — badge shown only on comments */}
          </div>
          {/* post.created_at from DB */}
          <div className="post-meta">
            {new Date(post.created_at).toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
        </div>

        {/* Owner actions */}
        {isOwner && (
          <div style={{ display: "flex", gap: 6 }}>
            <button
              className="owner-btn"
              onClick={() => setEditing(!editing)}
              title="Edit"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
            </button>
            {/* DELETE POST — DELETE /api/posts/:id
                postController.deletePosts
                returns: { message: "Post deleted successfully." }
            */}
            <button
              className="owner-btn owner-btn-red"
              onClick={() => onDeletePost(post.id)}
              title="Delete"
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
                <path d="M9 6V4h6v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content / Edit mode */}
      {editing ? (
        <div className="edit-wrap">
          <textarea
            className="edit-textarea"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
          />
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button className="edit-cancel" onClick={() => setEditing(false)}>
              Cancel
            </button>
            <button className="edit-save" onClick={handleEditSave}>
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="post-content">{post.content}</p>
      )}

      {/* Attachments */}
      {post.attachments && post.attachments.length > 0 && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            marginBottom: 12,
          }}
        >
          {post.attachments.map((file, i) => {
            const url = `http://localhost:5000${file.path}`;
            if (file.mimetype?.startsWith("image/")) {
              return (
                <img
                  key={i}
                  src={url}
                  alt={file.name}
                  style={{
                    maxWidth: "100%",
                    borderRadius: 10,
                    maxHeight: 400,
                    objectFit: "cover",
                  }}
                />
              );
            }
            if (file.mimetype?.startsWith("video/")) {
              return (
                <video
                  key={i}
                  controls
                  style={{ maxWidth: "100%", borderRadius: 10, maxHeight: 400 }}
                >
                  <source src={url} type={file.mimetype} />
                </video>
              );
            }
            // Documents / other files
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 14px",
                  background: "#f8f9fb",
                  border: "1.5px solid #e5e7eb",
                  borderRadius: 10,
                  textDecoration: "none",
                  color: "#1e2a3a",
                }}
              >
                <span style={{ fontSize: 22 }}>
                  {file.mimetype?.includes("pdf")
                    ? "📄"
                    : file.mimetype?.includes("word")
                      ? "📝"
                      : file.mimetype?.includes("sheet") ||
                          file.mimetype?.includes("excel")
                        ? "📊"
                        : "📎"}
                </span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>
                    {file.name}
                  </div>
                  <div
                    style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}
                  >
                    {(file.size / 1024).toFixed(0)} KB · Click to download
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* Stats — from likes_count, comments_count */}
      <div className="post-stats">
        <span>{likesCount} likes</span>
        <span>{post.comments_count} comments</span>
      </div>

      <div className="post-divider" />

      {/* Actions */}
      <div className="post-actions">
        <button
          className={`action-btn ${isLiked ? "action-liked" : ""}`}
          onClick={handleLike}
        >
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          Like
        </button>

        <button className="action-btn" onClick={fetchComments}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          {loadingCmts ? "Loading..." : "Comment"}
        </button>

        <button className="action-btn" onClick={handleShare}>
          <svg
            width="17"
            height="17"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
          Share
        </button>
        <button
          className={`action-btn ${isSaved ? "action-saved" : ""}`}
          onClick={handleSave}
          style={{ flex: 0, padding: "7px 10px" }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill={isSaved ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      </div>

      {/* Comments — getComments returns: { id, content, created_at, name, role } */}
      {showComments && (
        <div className="comments-section">
          {comments.length === 0 ? (
            <p className="no-comments">No comments yet. Be the first!</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <Avatar initials={getInitials(c.name)} size={28} bg="#4b5563" />
                <div className="comment-body">
                  <span className="comment-author">{c.name}</span>
                  <Badge label={c.role} />
                  <span className="comment-text">{c.content}</span>
                </div>
              </div>
            ))
          )}
          {/* Add comment — body: { content } */}
          <div className="comment-input-row">
            <Avatar initials={getInitials(currentUser?.name)} size={28} />
            <input
              className="comment-input"
              placeholder="Write a comment..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
            />
            <button className="comment-submit" onClick={handleAddComment}>
              Post
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────
   MAIN FEED
───────────────────────────────────────────────── */
export default function Feed() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState("");
  const [loadingPosts, setLoadingPosts] = useState(true);
  const showLoadingPosts = useMinimumLoading(loadingPosts, 2500);
  const [activeNav, setActiveNav] = useState("Home Feed");
  const [connectionsCount, setConnectionsCount] = useState(0);

  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [events, setEvents] = useState([]);
  const [announcement, setAnnouncement] = useState(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  const [attachments, setAttachments] = useState([]);
  const fileInputRef = useRef(null);
  const [activeAttachType, setActiveAttachType] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  /* ── GET POSTS — GET /api/posts
     postController.getPosts
     returns: [{ id, content, created_at, name, likes_count, comments_count, is_liked }]
  ── */
  useEffect(() => {
    setLoadingPosts(true);
    Promise.all([
      API.get("/users/profile"),
      API.get("/posts"),
      API.get("/users/connections-count"),
    ])
      .then(([profileRes, postsRes, connRes]) => {
        setCurrentUser(profileRes.data);
        setPosts(postsRes.data);
        setConnectionsCount(connRes.data.count);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoadingPosts(false));
  }, []);

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files.map((f) => ({
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      preview: f.type.startsWith("image/") ? URL.createObjectURL(f) : null,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = ""; // reset input
  };

  const removeAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── CREATE POST — POST /api/posts
     postController.createPost — body: { content }
     returns: { id, user_id, content, created_at }
  ── */
  const handleCreatePost = async () => {
    if (!newPost.trim() && attachments.length === 0) {
      alert("Please write something or attach a file");
      return;
    }

    if (isPosting) return; // Prevent duplicate submissions
    setIsPosting(true);

    try {
      const formData = new FormData();
      formData.append("content", newPost);
      attachments.forEach((a) => formData.append("files", a.file));

      const res = await API.post("/posts", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const enriched = {
        ...res.data,
        name: currentUser.name,
        likes_count: 0,
        comments_count: 0,
        is_liked: false,
        is_saved: false,
        attachments: res.data.attachments || [],
      };
      setPosts((prev) => [enriched, ...prev]);
      setNewPost("");
      setAttachments([]);
    } catch (err) {
      console.error("Failed to create post", err);
      alert(
        "Failed to create post: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsPosting(false);
    }
  };

  // Right Sidebar get suggestions, trending, upcoming and announcements

  useEffect(() => {
    API.get("/posts/trending")
      .then((r) => setTrending(r.data))
      .catch(console.error);
    API.get("/users/suggestions")
      .then((r) => setSuggestions(r.data))
      .catch(console.error);
    API.get("/events/upcoming")
      .then((r) => setEvents(r.data))
      .catch(console.error);
    API.get("/announcements/latest")
      .then((r) => setAnnouncement(r.data))
      .catch(console.error);
  }, []);

  /* ── DELETE POST — DELETE /api/posts/:id
     postController.deletePosts
     returns: { message: "Post deleted successfully." }
  ── */
  const handleDeletePost = async (postId) => {
    if (!window.confirm("Delete this post?")) return;
    try {
      await API.delete(`/posts/${postId}`);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  // Handles Search

  const handleSearch = async (value) => {
    setSearchQuery(value);

    if (!value.trim()) {
      setSearchResults(null);
      setShowSearchDropdown(false);
      return;
    }

    setSearchLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const res = await API.get(`/search?q=${value}`);

      setSearchResults(res.data);
      setShowSearchDropdown(true);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setSearchLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      handleSearch(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);
  const userInitials = getInitials(currentUser?.name);

  const navItems = [
    {
      label: "Home Feed",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      label: "My Posts",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      ),
    },
    {
      label: "Saved Posts",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      ),
    },
    {
      label: "Alumni Mentorship",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Notifications",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
      ),
    },
    {
      label: "Profile Settings",
      icon: (
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }

        .feed-root { font-family: 'Nunito', sans-serif; min-height: 100vh; background: #f0f2f5; display: flex; flex-direction: column; }

        /* TOPBAR */
        .topbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 24px; height: 56px; gap: 16px; }
        .topbar-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; color: #1e3a5f; white-space: nowrap; min-width: 180px; }
        .topbar-logo img { height: 30px; }
        .topbar-search { flex: 1; max-width: 480px; position: relative; }
        .topbar-search input { width: 100%; padding: 9px 16px 9px 38px; border: 1.5px solid #e5e7eb; border-radius: 24px; font-family: 'Nunito', sans-serif; font-size: 13.5px; font-weight: 600; color: #1e2a3a; background: #f8f9fb; outline: none; transition: border-color 0.2s; }
        .topbar-search input:focus { border-color: #7b8fcf; background: #fff; }
        .topbar-search input::placeholder { color: #9ca3af; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }
        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
        .topbar-icon-btn { width: 36px; height: 36px; border-radius: 50%; border: none; background: #f0f2f5; cursor: pointer; display: flex; align-items: center; justify-content: center; color: #4b5563; transition: background 0.15s; }
        .topbar-icon-btn:hover { background: #e5e7eb; }
        .back-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; background: #f0f2f5; border: none; border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #4b5563; cursor: pointer; transition: background 0.15s; }
        .back-btn:hover { background: #e5e7eb; }

        /* LAYOUT */
        .feed-layout { display: flex; gap: 20px; max-width: 1200px; margin: 0 auto; width: 100%; padding: 20px 16px; align-items: flex-start; }

        /* LEFT SIDEBAR */
        .left-sidebar { width: 240px; flex-shrink: 0; display: flex; flex-direction: column; gap: 12px; position: sticky; top: 76px; }
        .profile-card { background: #fff; border-radius: 14px; padding: 24px 16px 16px; display: flex; flex-direction: column; align-items: center; gap: 6px; border: 1px solid #e5e7eb; }
        .profile-name { font-size: 15px; font-weight: 800; color: #1e2a3a; margin-top: 4px; }
        .profile-dept { font-size: 12px; color: #6b7280; font-weight: 600; text-align: center; }
        .profile-stats { display: flex; gap: 24px; margin-top: 12px; padding-top: 12px; border-top: 1px solid #f0f2f5; width: 100%; justify-content: center; }
        .stat-item { text-align: center; }
        .stat-num { font-size: 16px; font-weight: 800; color: #1e2a3a; display: block; }
        .stat-label { font-size: 11px; color: #9ca3af; font-weight: 600; }
        .nav-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; overflow: hidden; }
        .nav-item { display: flex; align-items: center; gap: 10px; padding: 11px 16px; font-size: 13.5px; font-weight: 700; color: #4b5563; cursor: pointer; transition: background 0.15s, color 0.15s; border: none; background: none; width: 100%; text-align: left; font-family: 'Nunito', sans-serif; }
        .nav-item:hover { background: #f8f9fb; color: #1e3a5f; }
        .nav-item.active { background: #eef1fb; color: #1e3a5f; }
        .nav-item.active svg { stroke: #3b5bdb; }

        /* CENTER */
        .center-feed { flex: 1; min-width: 0; display: flex; flex-direction: column; gap: 14px; }
        .compose-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 16px; display: flex; align-items: center; gap: 12px; }
        .compose-input { flex: 1; border: 1.5px solid #e5e7eb; border-radius: 24px; padding: 10px 18px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; outline: none; transition: border-color 0.2s; background: #f8f9fb; }
        .compose-input:focus { border-color: #7b8fcf; background: #fff; }
        .compose-input::placeholder { color: #9ca3af; }
        .compose-submit { padding: 9px 20px; background: #1e3a5f; color: #fff; border: none; border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 800; cursor: pointer; transition: background 0.2s; white-space: nowrap; }
        .compose-submit:hover:not(:disabled) { background: #2d4f80; }
        .compose-submit:disabled { opacity: 0.6; cursor: not-allowed; }
        .loading-text { text-align: center; color: #9ca3af; font-weight: 600; padding: 40px 0; }
        .attach-btn { display: flex; align-items: center; gap: 5px;
        padding: 6px 12px; border: 1.5px solid #e5e7eb;
        border-radius: 20px; background: none;
        font-family: 'Nunito', sans-serif; font-size: 12px;
        font-weight: 700; color: #6b7280; cursor: pointer;
        transition: all 0.15s; white-space: nowrap;
      }
      .attach-btn:hover { background: #eef1fb; border-color: #7b8fcf; color: #1e3a5f; }

        /* POST CARD */
        .post-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 20px; }
        .post-header { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 14px; }
        .post-author { font-size: 14px; font-weight: 800; color: #1e2a3a; }
        .post-meta { font-size: 12px; color: #9ca3af; font-weight: 600; margin-top: 2px; }
        .post-content { font-size: 14px; color: #374151; line-height: 1.65; font-weight: 600; margin-bottom: 12px; }
        .post-stats { display: flex; justify-content: space-between; font-size: 12.5px; color: #9ca3af; font-weight: 600; margin-bottom: 10px; }
        .post-divider { height: 1px; background: #f0f2f5; margin-bottom: 10px; }
        .post-actions { display: flex; align-items: center; gap: 4px; }
        .action-btn { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border: none; background: none; border-radius: 8px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #6b7280; cursor: pointer; transition: background 0.15s, color 0.15s; flex: 1; justify-content: center; }
        .action-btn:hover { background: #f0f2f5; color: #1e2a3a; }
        .action-liked { color: #e11d48; }
        .action-liked:hover { background: #fff1f2; color: #e11d48; }
        .action-saved { color: #1e3a5f; }

        /* OWNER BUTTONS */
        .owner-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px; cursor: pointer; color: #6b7280; display: flex; align-items: center; transition: background 0.15s, color 0.15s; }
        .owner-btn:hover { background: #f0f2f5; color: #1e2a3a; }
        .owner-btn-red:hover { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }

        /* EDIT */
        .edit-wrap { margin-bottom: 12px; display: flex; flex-direction: column; gap: 8px; }
        .edit-textarea { width: 100%; min-height: 80px; padding: 10px 14px; border: 1.5px solid #7b8fcf; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; resize: vertical; outline: none; }
        .edit-cancel { padding: 6px 14px; border: 1.5px solid #e5e7eb; border-radius: 16px; background: none; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #6b7280; cursor: pointer; }
        .edit-save { padding: 6px 14px; background: #1e3a5f; border: none; border-radius: 16px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #fff; cursor: pointer; }

        /* COMMENTS */
        .comments-section { margin-top: 14px; border-top: 1px solid #f0f2f5; padding-top: 14px; display: flex; flex-direction: column; gap: 10px; }
        .no-comments { font-size: 13px; color: #9ca3af; font-weight: 600; text-align: center; padding: 8px 0; }
        .comment-item { display: flex; align-items: flex-start; gap: 8px; }
        .comment-body { background: #f8f9fb; border-radius: 10px; padding: 8px 12px; flex: 1; display: flex; flex-wrap: wrap; align-items: center; gap: 6px; }
        .comment-author { font-size: 12.5px; font-weight: 800; color: #1e2a3a; }
        .comment-text { font-size: 13px; color: #374151; font-weight: 600; width: 100%; margin-top: 2px; }
        .comment-input-row { display: flex; align-items: center; gap: 8px; margin-top: 4px; }
        .comment-input { flex: 1; border: 1.5px solid #e5e7eb; color: #374151; border-radius: 20px; padding: 7px 14px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 600; outline: none; background: #f8f9fb; transition: border-color 0.2s; }
        .comment-input:focus { border-color: #7b8fcf; background: #fff; }
        .comment-input::placeholder { color: #9ca3af; }
        .comment-submit { padding: 7px 14px; background: #1e3a5f; color: #fff; border: none; border-radius: 16px; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 800; cursor: pointer; }
        .comment-submit:hover { background: #2d4f80; }

        /* RIGHT SIDEBAR */
        .right-sidebar { width: 280px; flex-shrink: 0; display: flex; flex-direction: column; gap: 14px; position: sticky; top: 76px; }
        .widget-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 16px; }
        .widget-title { font-size: 14px; font-weight: 800; color: #1e2a3a; margin-bottom: 14px; display: flex; align-items: center; gap: 7px; }
        .widget-empty { font-size: 12.5px; color: #9ca3af; font-weight: 600; text-align: center; padding: 8px 0; }
        .trend-item { display: flex; justify-content: space-between; align-items: center; padding: 7px 0; border-bottom: 1px solid #f0f2f5; }
        .trend-item:last-child { border-bottom: none; }
        .trend-tag { font-size: 13px; font-weight: 700; color: #1e2a3a; }
        .trend-count { font-size: 11.5px; color: #9ca3af; font-weight: 600; }

        .suggestion-item { display: flex; align-items: center; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f0f2f5; }
        .suggestion-item:last-child { border-bottom: none; }
        .suggestion-info { flex: 1; }
        .suggestion-name { font-size: 13px; font-weight: 700; color: #1e2a3a; }
        .suggestion-sub { margin-top: 2px; }
        .connect-btn { padding: 5px 12px; border: 1.5px solid #1e3a5f; border-radius: 16px; background: none; font-family: 'Nunito', sans-serif; font-size: 12px; font-weight: 700; color: #1e3a5f; cursor: pointer; white-space: nowrap; }
        .connect-btn:hover { background: #1e3a5f; color: #fff; }

        /* Search loading Spinner */
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .event-item { display: flex; align-items: flex-start; gap: 10px; padding: 7px 0; border-bottom: 1px solid #f0f2f5; }
        .event-item:last-child { border-bottom: none; }
        .event-dot { width: 9px; height: 9px; border-radius: 50%; margin-top: 4px; flex-shrink: 0; }
        .event-title { font-size: 13px; font-weight: 700; color: #1e2a3a; }
        .event-date { font-size: 11.5px; color: #9ca3af; font-weight: 600; }

        .announcement-box { background: #f8f9fb; border-radius: 10px; padding: 12px; border-left: 3px solid #3b5bdb; }
        .announcement-text { font-size: 13px; font-weight: 600; color: #374151; line-height: 1.5; }
        .announcement-time { font-size: 11px; color: #9ca3af; font-weight: 600; margin-top: 5px; }

        @media (max-width: 1024px) { .right-sidebar { display: none; } }
        @media (max-width: 768px) { .left-sidebar { display: none; } .feed-layout { padding: 12px; } }
      `}</style>

      <div className="feed-root">
        <PageOverlay loading={showLoadingPosts || !currentUser} />
        {/* TOPBAR */}
        <header className="topbar">
          <div
            className="topbar-logo"
            onClick={() => navigate("/")}
            style={{ cursor: "pointer" }}
          >
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <div className="topbar-search">
            <span className="search-icon">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search posts, people, events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowSearchDropdown(true)}
            />
            {showSearchDropdown && (
              <div
                style={{
                  position: "absolute",
                  top: "45px",
                  width: "100%",
                  background: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                  zIndex: 999,
                  maxHeight: "400px",
                  overflowY: "auto",
                  padding: "10px",
                }}
              >
                {searchLoading && (
                  <div
                    style={{
                      padding: "14px",
                      textAlign: "center",
                      color: "#6b7280",
                      fontWeight: "600",
                    }}
                  >
                    <div
                      style={{
                        padding: "14px",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: "10px",
                        color: "#6b7280",
                        fontWeight: "600",
                      }}
                    >
                      <div
                        style={{
                          width: "16px",
                          height: "16px",
                          border: "2px solid #d1d5db",
                          borderTop: "2px solid #3b82f6",
                          borderRadius: "50%",
                          animation: "spin 0.8s linear infinite",
                        }}
                      />
                      Searching...
                    </div>
                  </div>
                )}
                {!searchLoading && searchResults && (
                  <>
                    {(searchResults.users?.length || 0) === 0 &&
                      (searchResults.posts?.length || 0) === 0 &&
                      (searchResults.events?.length || 0) === 0 &&
                      (searchResults.announcements?.length || 0) === 0 && (
                        <div
                          style={{
                            padding: "18px",
                            textAlign: "center",
                            color: "#9ca3af",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                        >
                          No results found
                        </div>
                      )}

                    {/* USERS */}
                    {searchResults.users?.length > 0 && (
                      <>
                        <p
                          style={{
                            fontWeight: "bold",
                            marginBottom: "8px",
                            color: "#374151",
                          }}
                        >
                          Users
                        </p>

                        {searchResults.users.map((user) => (
                          <div
                            key={user.id}
                            style={{
                              padding: "12px 14px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              transition: "all 0.2s ease",
                              marginBottom: "4px",
                              display: "flex",
                              alignItems: "center",
                              gap: "10px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f3f4f6";
                              e.currentTarget.style.transform =
                                "translateX(4px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.transform =
                                "translateX(0px)";
                            }}
                            onClick={() => navigate(`/profile/${user.id}`)}
                          >
                            <Avatar
                              initials={getInitials(user.name)}
                              size={34}
                            />

                            <div>
                              <div
                                style={{
                                  fontWeight: "700",
                                  color: "#1f2937",
                                  fontSize: "14px",
                                }}
                              >
                                {user.name}
                              </div>

                              <div
                                style={{
                                  fontSize: "12px",
                                  color: "#6b7280",
                                }}
                              >
                                {user.role}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}

                    {/* POSTS */}
                    {searchResults.posts?.length > 0 && (
                      <>
                        <p
                          style={{
                            fontWeight: "bold",
                            marginBottom: "8px",
                            marginTop: "12px",
                            color: "#374151",
                          }}
                        >
                          Posts
                        </p>

                        {searchResults.posts.map((post) => (
                          <div
                            key={post.id}
                            style={{
                              padding: "12px 14px",
                              cursor: "pointer",
                              borderRadius: "10px",
                              transition: "all 0.2s ease",
                              marginBottom: "4px",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "#f3f4f6";
                              e.currentTarget.style.transform =
                                "translateX(4px)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "transparent";
                              e.currentTarget.style.transform =
                                "translateX(0px)";
                            }}
                          >
                            <div
                              style={{
                                fontWeight: "700",
                                color: "#1f2937",
                                fontSize: "13px",
                                marginBottom: "3px",
                              }}
                            >
                              Post
                            </div>

                            <div
                              style={{
                                fontSize: "13px",
                                color: "#6b7280",
                                lineHeight: "1.4",
                              }}
                            >
                              {post.content.slice(0, 70)}...
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    {/* EVENTS */}
                    {searchResults.events?.length > 0 && (
                      <>
                        <p style={{ fontWeight: "bold", marginBottom: "8px" }}>
                          Events
                        </p>

                        {searchResults.events.map((event) => (
                          <div
                            key={event.id}
                            style={{
                              padding: "10px",
                              cursor: "pointer",
                              borderRadius: "8px",
                            }}
                            onClick={() => navigate(`/events/${event.id}`)}
                          >
                            {event.title}
                          </div>
                        ))}
                      </>
                    )}

                    {/* ANNOUNCEMENTS */}
                    {searchResults.announcements?.length > 0 && (
                      <>
                        <p
                          style={{
                            fontWeight: "bold",
                            marginTop: "15px",
                            marginBottom: "8px",
                          }}
                        >
                          Announcements
                        </p>

                        {searchResults.announcements.map((a) => (
                          <div
                            key={a.id}
                            style={{
                              padding: "10px",
                              cursor: "pointer",
                              borderRadius: "8px",
                            }}
                            onClick={() => navigate(`/announcements/${a.id}`)}
                          >
                            {a.text.slice(0, 50)}...
                          </div>
                        ))}
                      </>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="topbar-right">
            <button
              className="topbar-icon-btn"
              onClick={() => navigate("/requests")}
              title="Connection Requests"
            >
              🤝
            </button>
            <button className="topbar-icon-btn" onClick={handleLogout}>
              <Avatar initials={userInitials} size={36} />
            </button>
            {currentUser?.role === "faculty" && (
              <button className="back-btn" onClick={() => navigate("/admin")}>
                ⚙️ Admin Panel
              </button>
            )}
          </div>
        </header>

        <div className="feed-layout">
          {/* LEFT SIDEBAR
              Populated from GET /api/users/profile
              Fields used: name, role, email (shown as dept fallback)
          */}
          <aside className="left-sidebar">
            {!currentUser ? (
              <SidebarSkeleton />
            ) : (
              <>
                <div className="profile-card">
                  <Avatar initials={userInitials} size={64} />
                  <div className="profile-name">
                    {currentUser?.name || "Loading..."}
                  </div>
                  <Badge label={currentUser?.role} />
                  <div className="profile-dept">{currentUser?.email}</div>

                  <div className="profile-stats">
                    <div className="stat-item">
                      <span className="stat-num">
                        {
                          posts.filter((p) => p.name === currentUser?.name)
                            .length
                        }
                      </span>
                      <span className="stat-label">Posts</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-num">{connectionsCount}</span>
                      <span className="stat-label">Connections</span>
                    </div>
                  </div>
                </div>

                <nav className="nav-card">
                  {navItems.map((item) => (
                    <button
                      key={item.label}
                      className={`nav-item ${activeNav === item.label ? "active" : ""}`}
                      onClick={() => {
                        if (item.label === "My Posts") navigate("/my-posts");
                        else if (item.label === "Saved Posts")
                          navigate("/saved-posts");
                        else if (item.label === "Alumni Mentorship")
                          navigate("/mentorship");
                        else if (item.label === "Notifications")
                          navigate("/notifications");
                        else if (item.label === "Profile Settings")
                          navigate("/profile");
                        else setActiveNav(item.label);
                      }}
                    >
                      {item.icon}
                      {item.label}
                    </button>
                  ))}
                </nav>
              </>
            )}
          </aside>

          {/* CENTER FEED */}
          <main className="center-feed">
            {/* Compose — POST /api/posts  body: { content } */}
            <div className="compose-card">
              <Avatar initials={userInitials} size={40} />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 10,
                }}
              >
                <input
                  className="compose-input"
                  type="text"
                  placeholder="Share something with the community..."
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreatePost()}
                />

                {/* Attachment previews */}
                {attachments.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {attachments.map((a, i) => (
                      <div
                        key={i}
                        style={{
                          position: "relative",
                          border: "1.5px solid #e5e7eb",
                          borderRadius: 10,
                          padding: "6px 10px",
                          background: "#f8f9fb",
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          maxWidth: 200,
                        }}
                      >
                        {a.preview ? (
                          <img
                            src={a.preview}
                            alt={a.name}
                            style={{
                              width: 40,
                              height: 40,
                              objectFit: "cover",
                              borderRadius: 6,
                            }}
                          />
                        ) : (
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 6,
                              background: "#eef1fb",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 18,
                            }}
                          >
                            {a.type.startsWith("video/")
                              ? "🎬"
                              : a.type === "application/pdf"
                                ? "📄"
                                : a.type.includes("word")
                                  ? "📝"
                                  : a.type.includes("sheet") ||
                                      a.type.includes("excel")
                                    ? "📊"
                                    : "📎"}
                          </div>
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#1e2a3a",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {a.name}
                          </div>
                          <div
                            style={{
                              fontSize: 10,
                              color: "#9ca3af",
                              fontWeight: 600,
                            }}
                          >
                            {(a.size / 1024).toFixed(0)} KB
                          </div>
                        </div>
                        <button
                          onClick={() => removeAttachment(i)}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 18,
                            height: 18,
                            borderRadius: "50%",
                            background: "#e11d48",
                            border: "none",
                            color: "#fff",
                            fontSize: 10,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 800,
                            lineHeight: 1,
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {/* Hidden file input */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={
                      activeAttachType === "image"
                        ? "image/*"
                        : activeAttachType === "video"
                          ? "video/*"
                          : activeAttachType === "document"
                            ? ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt"
                            : "*/*"
                    }
                    style={{ display: "none" }}
                    onChange={handleFileSelect}
                  />

                  {/* Attach buttons */}
                  {[
                    { type: "image", emoji: "🖼️", label: "Photo" },
                    { type: "video", emoji: "🎬", label: "Video" },
                    { type: "document", emoji: "📄", label: "Document" },
                    { type: "any", emoji: "📎", label: "File" },
                  ].map(({ type, emoji, label }) => (
                    <button
                      key={type}
                      className="attach-btn"
                      onClick={() => {
                        setActiveAttachType(type);
                        setTimeout(() => fileInputRef.current?.click(), 0);
                      }}
                      title={`Attach ${label}`}
                    >
                      <span>{emoji}</span>
                      <span>{label}</span>
                    </button>
                  ))}

                  <button
                    className="compose-submit"
                    style={{ marginLeft: "auto" }}
                    onClick={handleCreatePost}
                    disabled={isPosting}
                  >
                    {isPosting ? "Posting..." : "Post"}
                  </button>
                </div>
              </div>
            </div>

            {/* Posts list — GET /api/posts */}
            {/* Posts list */}
            {showLoadingPosts || !currentUser ? (
              <FeedSkeleton />
            ) : posts.length === 0 ? (
              <p className="loading-text">
                No posts yet. Be the first to post!
              </p>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={`${post.id}-${currentUser?.id}`}
                  post={post}
                  currentUser={currentUser}
                  onDeletePost={handleDeletePost}
                />
              ))
            )}
          </main>

          <aside className="right-sidebar">
            {showLoadingPosts ? (
              <RightSidebarSkeleton />
            ) : (
              <>
                {/* Trending — GET /api/posts/trending */}
                <div className="widget-card">
                  <div className="widget-title">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                      <polyline points="17 6 23 6 23 12" />
                    </svg>
                    Trending
                  </div>
                  {trending.length === 0 ? (
                    <p className="widget-empty">No trending posts yet</p>
                  ) : (
                    trending.map((t) => (
                      <div key={t.id} className="trend-item">
                        <span className="trend-tag">{t.name}</span>
                        <span className="trend-count">
                          {t.likes_count} likes
                        </span>
                      </div>
                    ))
                  )}
                </div>

                {/* Suggested Connections — GET /api/users/suggestions */}
                <div className="widget-card">
                  <div className="widget-title">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                    Suggested Connections
                  </div>
                  {suggestions.length === 0 ? (
                    <p className="widget-empty">No suggestions yet</p>
                  ) : (
                    suggestions.map((s) => (
                      <div key={s.id} className="suggestion-item">
                        <Avatar initials={getInitials(s.name)} size={34} />
                        <div className="suggestion-info">
                          <div className="suggestion-name">{s.name}</div>
                          <div className="suggestion-sub">
                            <Badge label={s.role} />
                          </div>
                        </div>
                        <ConnectButton
                          targetUserId={s.id}
                          currentUserId={currentUser?.id}
                        />
                      </div>
                    ))
                  )}
                </div>

                {/* Upcoming Events — GET /api/events/upcoming */}
                <div className="widget-card">
                  <div className="widget-title">
                    <svg
                      width="15"
                      height="15"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    Upcoming Events
                  </div>
                  {events.length === 0 ? (
                    <p className="widget-empty">No upcoming events</p>
                  ) : (
                    events.map((ev) => (
                      <div
                        key={ev.id}
                        className="event-item"
                        onClick={() => navigate(`/events/${ev.id}`)}
                        style={{ cursor: "pointer" }}
                      >
                        <div
                          className="event-dot"
                          style={{ background: ev.color || "#3b82f6" }}
                        />
                        <div>
                          <div className="event-title">{ev.title}</div>
                          <div className="event-date">
                            {new Date(ev.event_date).toLocaleDateString(
                              "en-IN",
                              {
                                month: "short",
                                day: "numeric",
                              },
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Announcements — GET /api/announcements/latest */}
                {announcement && (
                  <div className="widget-card">
                    <div className="widget-title">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0" />
                      </svg>
                      Announcements
                    </div>
                    <div
                      className="announcement-box"
                      onClick={() =>
                        navigate(`/announcements/${announcement.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      <div className="announcement-text">
                        {announcement.text}
                      </div>
                      <div className="announcement-time">
                        {new Date(announcement.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </div>
    </>
  );
}
