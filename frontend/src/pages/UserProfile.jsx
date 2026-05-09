import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import ConnectButton from "../components/Connectbutton";

/* ─── Helpers ─────────────────────────────────── */
function getInitials(name = "") {
  return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2) || "??";
}

const ROLE_COLORS = {
  faculty: { bg: "#dbeafe", color: "#1d4ed8", text: "Faculty" },
  alumni:  { bg: "#fef3c7", color: "#b45309", text: "Alumni"  },
  student: { bg: "#dcfce7", color: "#15803d", text: "Student" },
};

const AVATAR_GRADIENTS = [
  "linear-gradient(135deg,#1e3a5f,#4a90e2)",
  "linear-gradient(135deg,#6d28d9,#a78bfa)",
  "linear-gradient(135deg,#065f46,#34d399)",
  "linear-gradient(135deg,#92400e,#f59e0b)",
  "linear-gradient(135deg,#9f1239,#fb7185)",
  "linear-gradient(135deg,#0c4a6e,#38bdf8)",
];

/* ─── Avatar ──────────────────────────────────── */
function Avatar({ name, size = 80, userId = 0 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%",
      background: AVATAR_GRADIENTS[userId % AVATAR_GRADIENTS.length],
      color: "#fff", display: "flex", alignItems: "center",
      justifyContent: "center", fontWeight: 800,
      fontSize: size * 0.33, flexShrink: 0,
      fontFamily: "'Nunito', sans-serif",
      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
      border: "4px solid #fff",
    }}>
      {getInitials(name)}
    </div>
  );
}

/* ─── Skill Tag ───────────────────────────────── */
function SkillTag({ skill }) {
  const colors = [
    { bg: "#eef2ff", color: "#3b5bdb" },
    { bg: "#f0fdf4", color: "#15803d" },
    { bg: "#fef3c7", color: "#b45309" },
    { bg: "#fdf4ff", color: "#9333ea" },
    { bg: "#fff1f2", color: "#e11d48" },
    { bg: "#f0f9ff", color: "#0369a1" },
  ];
  const c = colors[skill.charCodeAt(0) % colors.length];
  return (
    <span style={{
      background: c.bg, color: c.color,
      fontSize: 12.5, fontWeight: 700,
      padding: "5px 12px", borderRadius: 20,
      fontFamily: "'Nunito', sans-serif",
      border: `1px solid ${c.color}20`,
    }}>
      {skill.trim()}
    </span>
  );
}

/* ─── Mini Post Card ──────────────────────────── */
function MiniPostCard({ post }) {
  return (
    <div style={{
      background: "#fff", borderRadius: 12,
      border: "1px solid #e5e7eb", padding: "16px 18px",
      transition: "box-shadow 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <p style={{
        fontSize: 14, color: "#374151", lineHeight: 1.65,
        fontWeight: 600, fontFamily: "'Nunito', sans-serif",
        marginBottom: 10,
        display: "-webkit-box", WebkitLineClamp: 3,
        WebkitBoxOrient: "vertical", overflow: "hidden",
      }}>
        {post.content}
      </p>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", gap: 14 }}>
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
            {post.likes_count} likes
          </span>
          <span style={{ fontSize: 12, color: "#9ca3af", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            {post.comments_count} comments
          </span>
        </div>
        <span style={{ fontSize: 11, color: "#d1d5db", fontWeight: 600 }}>
          {new Date(post.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      </div>
    </div>
  );
}

/* ─── Edit Profile Modal ──────────────────────── */
function EditModal({ user, onClose, onSave }) {
  const [form, setForm] = useState({
    name: user.name || "",
    email: user.email || "",
    bio: user.bio || "",
    skills: user.skills || "",
    company: user.company || "",
    designation: user.designation || "",
    domain: user.domain || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required.");
      return;
    }
    setLoading(true);
    try {
      const res = await API.put("/users/update/full", form);
      onSave(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #e5e7eb", borderRadius: 10,
    fontFamily: "'Nunito', sans-serif", fontSize: 14,
    fontWeight: 600, color: "#1e2a3a", background: "#f8f9fb",
    outline: "none", transition: "border-color 0.2s",
  };

  const DOMAINS = ["Software Engineering", "Data Science", "Product Management", "Finance", "Research", "Design", "Consulting", "Other"];

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)",
      display: "flex", alignItems: "center", justifyContent: "center", padding: 24,
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: "#fff", borderRadius: 20, padding: 32,
        width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        animation: "modalIn 0.3s cubic-bezier(.23,1,.32,1)",
      }}>
        <style>{`@keyframes modalIn { from{opacity:0;transform:scale(0.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)} }`}</style>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, color: "#1e2a3a", fontFamily: "'Nunito', sans-serif" }}>Edit Profile</div>
            <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>Update your public profile information</div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 22 }}>✕</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Name & Email */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>Full Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#7b8fcf"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>Email *</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#7b8fcf"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>Bio</label>
            <textarea
              style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              placeholder="Tell others a bit about yourself..."
              value={form.bio}
              onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#7b8fcf"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Skills */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>
              Skills <span style={{ color: "#9ca3af", fontWeight: 600 }}>(comma separated)</span>
            </label>
            <input
              style={inputStyle}
              placeholder="React, Node.js, Python, Machine Learning..."
              value={form.skills}
              onChange={e => setForm(p => ({ ...p, skills: e.target.value }))}
              onFocus={e => e.target.style.borderColor = "#7b8fcf"}
              onBlur={e => e.target.style.borderColor = "#e5e7eb"}
            />
          </div>

          {/* Company & Designation */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>Company / Institute</label>
              <input style={inputStyle} placeholder="Google, IIPS, etc." value={form.company}
                onChange={e => setForm(p => ({ ...p, company: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#7b8fcf"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>Designation / Year</label>
              <input style={inputStyle} placeholder="SDE II / 3rd Year" value={form.designation}
                onChange={e => setForm(p => ({ ...p, designation: e.target.value }))}
                onFocus={e => e.target.style.borderColor = "#7b8fcf"} onBlur={e => e.target.style.borderColor = "#e5e7eb"} />
            </div>
          </div>

          {/* Domain */}
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: "#1e2a3a", marginBottom: 6, fontFamily: "'Nunito', sans-serif" }}>Domain / Specialization</label>
            <select
              style={{ ...inputStyle, cursor: "pointer", appearance: "none" }}
              value={form.domain}
              onChange={e => setForm(p => ({ ...p, domain: e.target.value }))}
            >
              <option value="">Select domain...</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          {error && (
            <div style={{ background: "#fff1f2", border: "1px solid #fecdd3", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#e11d48", fontWeight: 700 }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
            <button onClick={onClose} style={{
              flex: 1, padding: 12, border: "1.5px solid #e5e7eb", borderRadius: 10,
              background: "none", fontFamily: "'Nunito', sans-serif", fontSize: 14,
              fontWeight: 700, color: "#6b7280", cursor: "pointer",
            }}>Cancel</button>
            <button onClick={handleSave} disabled={loading} style={{
              flex: 2, padding: 12, border: "none", borderRadius: 10,
              background: "linear-gradient(135deg,#1e3a5f,#2d5f8a)",
              color: "#fff", fontFamily: "'Nunito', sans-serif", fontSize: 14,
              fontWeight: 800, cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(30,58,95,0.3)",
            }}>
              {loading ? "Saving..." : "💾 Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────── */
export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState("posts");
  const [notFound, setNotFound] = useState(false);

  const isOwnProfile = currentUser && profile && Number(currentUser.id) === Number(id);

  useEffect(() => {
    // Fetch current user + profile in parallel
    Promise.all([
      API.get("/users/profile"),
      API.get(`/users/${id}`),
    ])
      .then(([meRes, profileRes]) => {
        setCurrentUser(meRes.data);
        setProfile(profileRes.data);
      })
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
        else console.error(err);
      })
      .finally(() => setLoading(false));

    // Fetch their posts
    setPostsLoading(true);
    API.get(`/users/${id}/posts`)
      .then(r => setPosts(r.data))
      .catch(console.error)
      .finally(() => setPostsLoading(false));
  }, [id]);

  const handleEditSave = (updated) => {
    setProfile(prev => ({ ...prev, ...updated }));
    setCurrentUser(prev => ({ ...prev, ...updated }));
    setShowEditModal(false);
  };

  const skills = profile?.skills
    ? profile.skills.split(",").filter(s => s.trim())
    : [];

  const roleStyle = ROLE_COLORS[profile?.role?.toLowerCase()] || ROLE_COLORS.student;

  if (loading) return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600, fontFamily: "'Nunito', sans-serif" }}>Loading profile...</div>
    </div>
  );

  if (notFound) return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
      <div style={{ fontSize: 48 }}>😕</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#1e2a3a", fontFamily: "'Nunito', sans-serif" }}>User not found</div>
      <button onClick={() => navigate("/feed")} style={{
        padding: "10px 24px", background: "#1e3a5f", color: "#fff",
        border: "none", borderRadius: 10, cursor: "pointer",
        fontFamily: "'Nunito', sans-serif", fontSize: 14, fontWeight: 700,
      }}>← Back to Feed</button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }
        .profile-root { font-family: 'Nunito', sans-serif; min-height: 100vh; background: #f0f2f5; }

        .topbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 24px; height: 56px; gap: 16px; }
        .topbar-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; color: #1e3a5f; cursor: pointer; white-space: nowrap; }
        .topbar-logo img { height: 30px; }
        .back-btn { margin-left: auto; display: flex; align-items: center; gap: 6px; padding: 7px 16px; background: #f0f2f5; border: none; border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #4b5563; cursor: pointer; }
        .back-btn:hover { background: #e5e7eb; }

        /* COVER */
        .cover-banner { height: 180px; background: linear-gradient(135deg, #1e3a5f 0%, #2a5298 40%, #4a90e2 70%, #7b8fcf 100%); position: relative; overflow: hidden; }
        .cover-banner::after { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 70% 50%, rgba(167,139,250,0.3) 0%, transparent 60%); }

        /* PROFILE BODY */
        .profile-body { max-width: 860px; margin: 0 auto; padding: 0 16px 40px; }

        /* PROFILE HEADER CARD */
        .profile-header-card { background: #fff; border-radius: 18px; border: 1px solid #e5e7eb; padding: 0 28px 24px; margin-top: -1px; position: relative; margin-bottom: 20px; }

        /* TABS */
        .tab-row { display: flex; gap: 4; border-bottom: 2px solid #f0f2f5; margin-bottom: 20px; }
        .tab-btn { padding: 10px 20px; border: none; background: none; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; color: #6b7280; cursor: pointer; border-bottom: 2px solid transparent; margin-bottom: -2px; transition: all 0.15s; }
        .tab-btn:hover { color: #1e3a5f; }
        .tab-btn.active { color: #1e3a5f; border-bottom-color: #1e3a5f; }

        /* SECTION CARD */
        .section-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 22px 24px; margin-bottom: 16px; }
        .section-title { font-size: 15px; fontWeight: 800; color: #1e2a3a; margin-bottom: 14px; display: flex; align-items: center; gap: 8px; font-family: 'Nunito', sans-serif; font-weight: 800; }

        .edit-profile-btn { display: flex; align-items: center; gap: 6px; padding: 9px 20px; border: 1.5px solid #1e3a5f; border-radius: 10px; background: none; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #1e3a5f; cursor: pointer; transition: all 0.2s; }
        .edit-profile-btn:hover { background: #1e3a5f; color: #fff; }

        .stat-pill { display: flex; flex-direction: column; align-items: center; padding: 12px 20px; background: #f8f9fb; border-radius: 12px; border: 1px solid #e5e7eb; min-width: 80px; }

        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.4s ease forwards; }

        @media (max-width: 640px) { .cover-banner { height: 120px; } .profile-header-card { padding: 0 16px 20px; } }
      `}</style>

      <div className="profile-root">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-logo" onClick={() => navigate("/feed")}>
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>
        </header>

        {/* COVER BANNER */}
        <div className="cover-banner">
          {/* Decorative circles */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)", zIndex: 1 }} />
          <div style={{ position: "absolute", bottom: -60, left: "30%", width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", zIndex: 1 }} />
        </div>

        <div className="profile-body">

          {/* PROFILE HEADER CARD */}
          <div className="profile-header-card fade-up">

            {/* Avatar overlapping cover */}
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginTop: -44, marginBottom: 20 }}>
              <Avatar name={profile.name} size={88} userId={Number(id)} />

              <div style={{ display: "flex", gap: 10, flexShrink: 0 }}>
                {isOwnProfile ? (
                  <button className="edit-profile-btn" onClick={() => setShowEditModal(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                    Edit Profile
                  </button>
                ) : (
                  <ConnectButton targetUserId={Number(id)} currentUserId={currentUser?.id} />
                )}
              </div>
            </div>

            {/* Name + Role + Details */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 6 }}>
                <h1 style={{ fontSize: 22, fontWeight: 800, color: "#1e2a3a", fontFamily: "'Nunito', sans-serif" }}>
                  {profile.name}
                </h1>
                <span style={{
                  background: roleStyle.bg, color: roleStyle.color,
                  fontSize: 11, fontWeight: 800,
                  padding: "3px 10px", borderRadius: 20,
                  fontFamily: "'Nunito', sans-serif",
                }}>
                  {roleStyle.text}
                </span>
                {profile.domain && (
                  <span style={{
                    background: "#f0f2f5", color: "#4b5563",
                    fontSize: 11, fontWeight: 700,
                    padding: "3px 10px", borderRadius: 20,
                    fontFamily: "'Nunito', sans-serif",
                  }}>
                    🎯 {profile.domain}
                  </span>
                )}
              </div>

              {/* Designation + Company */}
              {(profile.designation || profile.company) && (
                <div style={{ fontSize: 14, color: "#6b7280", fontWeight: 600, marginBottom: 4 }}>
                  {profile.designation}{profile.designation && profile.company && " at "}{profile.company}
                </div>
              )}

              <div style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600 }}>
                {profile.email} · Joined {new Date(profile.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" })}
              </div>
            </div>

            {/* Bio */}
            {profile.bio && (
              <p style={{
                fontSize: 14, color: "#374151", lineHeight: 1.7,
                fontWeight: 600, fontFamily: "'Nunito', sans-serif",
                marginBottom: 18, maxWidth: 600,
              }}>
                {profile.bio}
              </p>
            )}

            {!profile.bio && isOwnProfile && (
              <p style={{
                fontSize: 13, color: "#9ca3af", fontWeight: 600,
                marginBottom: 18, fontStyle: "italic",
              }}>
                No bio yet. Click "Edit Profile" to add one.
              </p>
            )}

            {/* Stats row */}
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { num: profile.post_count ?? 0, label: "Posts" },
                { num: profile.connections_count ?? 0, label: "Connections" },
              ].map((s, i) => (
                <div key={i} className="stat-pill">
                  <span style={{ fontSize: 20, fontWeight: 800, color: "#1e2a3a", fontFamily: "'Nunito', sans-serif" }}>{s.num}</span>
                  <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* TABS */}
          <div className="tab-row">
            {[
              { key: "posts", label: `Posts (${posts.length})` },
              { key: "skills", label: "Skills & Info" },
            ].map(t => (
              <button key={t.key} className={`tab-btn ${activeTab === t.key ? "active" : ""}`} onClick={() => setActiveTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }} className="fade-up">
              {postsLoading
                ? <div style={{ textAlign: "center", padding: 40, color: "#9ca3af", fontWeight: 600 }}>Loading posts...</div>
                : posts.length === 0
                  ? (
                    <div style={{ textAlign: "center", padding: "60px 24px" }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>📝</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a" }}>No posts yet</div>
                      <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
                        {isOwnProfile ? "Share your first post on the feed!" : `${profile.name} hasn't posted yet.`}
                      </div>
                    </div>
                  )
                  : posts.map(post => <MiniPostCard key={post.id} post={post} />)
              }
            </div>
          )}

          {/* SKILLS & INFO TAB */}
          {activeTab === "skills" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }} className="fade-up">

              {/* Skills */}
              <div className="section-card">
                <div className="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Skills
                </div>
                {skills.length > 0 ? (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {skills.map((s, i) => <SkillTag key={i} skill={s} />)}
                  </div>
                ) : (
                  <p style={{ fontSize: 13, color: "#9ca3af", fontWeight: 600, fontStyle: "italic" }}>
                    {isOwnProfile ? "No skills added yet. Edit your profile to add skills." : "No skills listed."}
                  </p>
                )}
              </div>

              {/* About */}
              <div className="section-card">
                <div className="section-title">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  About
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {[
                    { icon: "🎓", label: "Role", value: roleStyle.text },
                    { icon: "🏢", label: "Company / Institute", value: profile.company },
                    { icon: "💼", label: "Designation / Year", value: profile.designation },
                    { icon: "🎯", label: "Domain", value: profile.domain },
                    { icon: "📧", label: "Email", value: profile.email },
                    { icon: "📅", label: "Member Since", value: new Date(profile.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }) },
                  ].map(item => item.value ? (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 18, width: 24, textAlign: "center" }}>{item.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>{item.label}</div>
                        <div style={{ fontSize: 14, color: "#1e2a3a", fontWeight: 700, marginTop: 1 }}>{item.value}</div>
                      </div>
                    </div>
                  ) : null)}
                </div>
              </div>

              {/* Bio section if exists */}
              {profile.bio && (
                <div className="section-card">
                  <div className="section-title">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1e3a5f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                    </svg>
                    Bio
                  </div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75, fontWeight: 600 }}>
                    {profile.bio}
                  </p>
                </div>
              )}

            </div>
          )}

        </div>
      </div>

      {/* EDIT MODAL */}
      {showEditModal && (
        <EditModal
          user={profile}
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}
    </>
  );
}