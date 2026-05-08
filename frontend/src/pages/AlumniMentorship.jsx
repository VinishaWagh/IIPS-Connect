import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import { FullPageLoader } from "../components/PageLoaders";
import { useMinimumLoading } from "../hooks/useMinimumLoading";

/* ─── Helpers ─────────────────────────────────── */
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

const BG_COLORS = [
  "linear-gradient(135deg,#2a5298,#4a90e2)",
  "linear-gradient(135deg,#6d28d9,#a78bfa)",
  "linear-gradient(135deg,#065f46,#34d399)",
  "linear-gradient(135deg,#92400e,#f59e0b)",
  "linear-gradient(135deg,#9f1239,#fb7185)",
  "linear-gradient(135deg,#1e3a5f,#38bdf8)",
];

const TOPICS = [
  "Career Guidance",
  "Interview Preparation",
  "Project Review",
  "Research Collaboration",
  "Resume Review",
  "Industry Insights",
  "General Advice",
];

const DOMAINS = [
  "All",
  "Software Engineering",
  "Data Science",
  "Product Management",
  "Finance",
  "Research",
  "Design",
  "Consulting",
];

/* ─── Avatar ──────────────────────────────────── */
function Avatar({ name, size = 48, index = 0 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: BG_COLORS[index % BG_COLORS.length],
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 800,
        fontSize: size * 0.33,
        flexShrink: 0,
        fontFamily: "'Nunito', sans-serif",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
      }}
    >
      {getInitials(name)}
    </div>
  );
}

/* ─── Status Button ───────────────────────────── */
function MentorshipStatusBtn({ alumniId, currentUser, onRequest }) {
  const [status, setStatus] = useState("loading");
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    if (!alumniId || !currentUser) return;
    if (currentUser.role === "alumni") {
      setStatus("self");
      return;
    }
    API.get(`/mentorship/status/${alumniId}`)
      .then((r) => {
        setStatus(r.data.status);
        setRequestId(r.data.id);
      })
      .catch(() => setStatus("none"));
  }, [alumniId, currentUser]);

  if (status === "loading")
    return (
      <button
        style={{
          ...btnBase,
          background: "#f0f2f5",
          color: "#9ca3af",
          cursor: "default",
        }}
        disabled
      >
        ...
      </button>
    );
  if (status === "self") return null;

  if (status === "none")
    return (
      <button
        style={{
          ...btnBase,
          background: "linear-gradient(135deg,#2a5298,#4a90e2)",
          color: "#fff",
          boxShadow: "0 4px 14px rgba(74,144,226,0.35)",
        }}
        onClick={() => onRequest(alumniId)}
      >
        🎓 Request Mentorship
      </button>
    );
  if (status === "pending")
    return (
      <button
        style={{
          ...btnBase,
          background: "#fef3c7",
          color: "#b45309",
          border: "1px solid #fde68a",
          cursor: "default",
        }}
        disabled
      >
        ⏳ Request Pending
      </button>
    );
  if (status === "accepted")
    return (
      <button
        style={{
          ...btnBase,
          background: "#dcfce7",
          color: "#15803d",
          border: "1px solid #bbf7d0",
          cursor: "default",
        }}
        disabled
      >
        ✓ Mentorship Active
      </button>
    );
  if (status === "rejected")
    return (
      <button
        style={{
          ...btnBase,
          background: "#fff1f2",
          color: "#e11d48",
          border: "1px solid #fecdd3",
          cursor: "default",
        }}
        disabled
      >
        ✕ Not Available
      </button>
    );
  return null;
}

const btnBase = {
  padding: "9px 18px",
  borderRadius: 10,
  border: "none",
  fontFamily: "'Nunito', sans-serif",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
  transition: "all 0.2s",
  width: "100%",
};

/* ─── Request Modal ───────────────────────────── */
function RequestModal({ alumni, onClose, onSuccess }) {
  const [topic, setTopic] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!topic) {
      setError("Please select a topic.");
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      setError("Please write at least 20 characters introducing yourself.");
      return;
    }
    setLoading(true);
    try {
      await API.post(`/mentorship/request/${alumni.id}`, { topic, message });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 32,
          width: "100%",
          maxWidth: 500,
          boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
          animation: "modalIn 0.3s cubic-bezier(.23,1,.32,1)",
        }}
      >
        <style>{`@keyframes modalIn { from { opacity:0; transform:scale(0.95) translateY(10px); } to { opacity:1; transform:scale(1) translateY(0); } }`}</style>

        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 24,
          }}
        >
          <Avatar
            name={alumni.name}
            size={52}
            index={alumni._colorIndex || 0}
          />
          <div>
            <div
              style={{
                fontSize: 17,
                fontWeight: 800,
                color: "#1e2a3a",
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {alumni.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "#9ca3af",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {alumni.email}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              marginLeft: "auto",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#9ca3af",
              fontSize: 20,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ height: 1, background: "#f0f2f5", marginBottom: 24 }} />

        <div
          style={{
            fontSize: 15,
            fontWeight: 800,
            color: "#1e2a3a",
            fontFamily: "'Nunito', sans-serif",
            marginBottom: 4,
          }}
        >
          Request Mentorship
        </div>
        <div
          style={{
            fontSize: 13,
            color: "#9ca3af",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Tell {alumni.name.split(" ")[0]} what you're looking for
        </div>

        {/* Topic */}
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1e2a3a",
              marginBottom: 8,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            What do you need help with? *
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TOPICS.map((t) => (
              <button
                key={t}
                onClick={() => setTopic(t)}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: `1.5px solid ${topic === t ? "#4a90e2" : "#e5e7eb"}`,
                  background: topic === t ? "#eef2ff" : "#fff",
                  color: topic === t ? "#3b5bdb" : "#6b7280",
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  transition: "all 0.15s",
                }}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div style={{ marginBottom: 20 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 700,
              color: "#1e2a3a",
              marginBottom: 8,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            Introduce yourself *
          </label>
          <textarea
            placeholder={`Hi ${alumni.name.split(" ")[0]}, I'm a 3rd year CS student at IIPS. I'd love your guidance on...`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            style={{
              width: "100%",
              minHeight: 110,
              padding: "12px 14px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 12,
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 600,
              color: "#1e2a3a",
              resize: "vertical",
              outline: "none",
              transition: "border-color 0.2s",
              background: "#f8f9fb",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#7b8fcf")}
            onBlur={(e) => (e.target.style.borderColor = "#e5e7eb")}
          />
          <div
            style={{
              fontSize: 11,
              color: "#9ca3af",
              marginTop: 4,
              textAlign: "right",
            }}
          >
            {message.length}/500 characters
          </div>
        </div>

        {error && (
          <div
            style={{
              background: "#fff1f2",
              border: "1px solid #fecdd3",
              borderRadius: 8,
              padding: "10px 14px",
              fontSize: 13,
              color: "#e11d48",
              fontWeight: 700,
              marginBottom: 16,
            }}
          >
            {error}
          </div>
        )}

        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "12px",
              border: "1.5px solid #e5e7eb",
              borderRadius: 10,
              background: "none",
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 700,
              color: "#6b7280",
              cursor: "pointer",
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              flex: 2,
              padding: "12px",
              border: "none",
              borderRadius: 10,
              background: "linear-gradient(135deg,#2a5298,#4a90e2)",
              color: "#fff",
              fontFamily: "'Nunito', sans-serif",
              fontSize: 14,
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 14px rgba(74,144,226,0.35)",
            }}
          >
            {loading ? "Sending..." : "🚀 Send Request"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Alumni Card ─────────────────────────────── */
function AlumniCard({ alumni, index, currentUser, onRequest }) {
  const [hovered, setHovered] = useState(false);

  const domainColors = {
    "Software Engineering": { bg: "#eef2ff", color: "#3b5bdb" },
    "Data Science": { bg: "#f0fdf4", color: "#15803d" },
    "Product Management": { bg: "#fef3c7", color: "#b45309" },
    Finance: { bg: "#fff1f2", color: "#e11d48" },
    Research: { bg: "#fdf4ff", color: "#9333ea" },
    Design: { bg: "#fff7ed", color: "#ea580c" },
    Consulting: { bg: "#f0f9ff", color: "#0369a1" },
  };
  const dc = domainColors[alumni.domain] || { bg: "#f0f2f5", color: "#4b5563" };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        borderRadius: 18,
        border: `1.5px solid ${hovered ? "#c7d2fe" : "#e5e7eb"}`,
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: 16,
        transition: "all 0.3s cubic-bezier(.23,1,.32,1)",
        transform: hovered ? "translateY(-4px)" : "none",
        boxShadow: hovered
          ? "0 16px 40px rgba(0,0,0,0.1)"
          : "0 2px 8px rgba(0,0,0,0.04)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Top glow on hover */}
      {hovered && (
        <div
          style={{
            position: "absolute",
            top: -30,
            left: "50%",
            transform: "translateX(-50%)",
            width: 120,
            height: 60,
            borderRadius: "50%",
            background: "rgba(74,144,226,0.08)",
            filter: "blur(20px)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
        <Avatar name={alumni.name} size={52} index={index} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 15,
              fontWeight: 800,
              color: "#1e2a3a",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {alumni.name}
          </div>
          {alumni.designation && alumni.company && (
            <div
              style={{
                fontSize: 12.5,
                color: "#6b7280",
                fontWeight: 600,
                marginTop: 2,
              }}
            >
              {alumni.designation} at {alumni.company}
            </div>
          )}
          <div
            style={{
              fontSize: 11.5,
              color: "#9ca3af",
              fontWeight: 600,
              marginTop: 2,
            }}
          >
            {alumni.email}
          </div>
        </div>
        {/* Alumni badge */}
        <span
          style={{
            background: alumni.role === "faculty" ? "#dbeafe" : "#fef3c7",
            color: alumni.role === "faculty" ? "#1d4ed8" : "#b45309",
            fontSize: 10,
            fontWeight: 800,
            padding: "3px 8px",
            borderRadius: 20,
            flexShrink: 0,
            fontFamily: "'Nunito', sans-serif",
          }}
        >
          {alumni.role === "faculty" ? "FACULTY" : "ALUMNI"}
        </span>
      </div>

      {/* Domain tag */}
      {alumni.domain && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          <span
            style={{
              background: dc.bg,
              color: dc.color,
              fontSize: 11.5,
              fontWeight: 700,
              padding: "4px 10px",
              borderRadius: 20,
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            🎯 {alumni.domain}
          </span>
          {alumni.specializations?.slice(0, 2).map((s) => (
            <span
              key={s}
              style={{
                background: "#f0f2f5",
                color: "#4b5563",
                fontSize: 11.5,
                fontWeight: 700,
                padding: "4px 10px",
                borderRadius: 20,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              {s}
            </span>
          ))}
        </div>
      )}

      {/* Bio */}
      {alumni.bio && (
        <p
          style={{
            fontSize: 13,
            color: "#6b7280",
            lineHeight: 1.6,
            fontWeight: 600,
            fontFamily: "'Nunito', sans-serif",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {alumni.bio}
        </p>
      )}

      {/* Stats */}
      <div
        style={{
          display: "flex",
          gap: 16,
          paddingTop: 4,
          borderTop: "1px solid #f0f2f5",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1e2a3a",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {alumni.post_count ?? 0}
          </div>
          <div style={{ fontSize: 10.5, color: "#9ca3af", fontWeight: 600 }}>
            Posts
          </div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1e2a3a",
              fontFamily: "'Nunito', sans-serif",
            }}
          >
            {alumni.mentee_count ?? 0}
          </div>
          <div style={{ fontSize: 10.5, color: "#9ca3af", fontWeight: 600 }}>
            Mentees
          </div>
        </div>
        <div style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontSize: 11, color: "#9ca3af", fontWeight: 600 }}>
            Joined
          </div>
          <div style={{ fontSize: 12, color: "#6b7280", fontWeight: 700 }}>
            {new Date(alumni.created_at).toLocaleDateString("en-IN", {
              month: "short",
              year: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Action Button */}
      <MentorshipStatusBtn
        alumniId={alumni.id}
        currentUser={currentUser}
        onRequest={() => onRequest({ ...alumni, _colorIndex: index })}
      />
    </div>
  );
}

/* ─── My Requests Panel (for alumni) ─────────── */
function IncomingRequests({ currentUser }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null);
  const showLoading = useMinimumLoading(loading, 2500);

  useEffect(() => {
    API.get("/mentorship/my-requests")
      .then((r) => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRespond = async (id, status) => {
    setWorking(id);
    try {
      await API.put(`/mentorship/respond/${id}`, { status });
      setRequests((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status } : r)),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setWorking(null);
    }
  };

  if (showLoading) return <FullPageLoader />;
  if (requests.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a" }}>
          No mentorship requests yet
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
          Students will appear here when they request your mentorship
        </div>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {requests.map((r) => (
        <div
          key={r.id}
          style={{
            background: "#fff",
            borderRadius: 16,
            border: "1.5px solid #e5e7eb",
            padding: "20px 24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 14,
              marginBottom: 14,
            }}
          >
            <Avatar name={r.student_name} size={44} index={r.id % 6} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 800,
                    color: "#1e2a3a",
                    fontFamily: "'Nunito', sans-serif",
                  }}
                >
                  {r.student_name}
                </span>
                <span
                  style={{
                    background: "#dcfce7",
                    color: "#15803d",
                    fontSize: 10,
                    fontWeight: 800,
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  STUDENT
                </span>
                <span
                  style={{
                    background: "#eef2ff",
                    color: "#3b5bdb",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: 20,
                  }}
                >
                  {r.topic}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                {r.student_email}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#9ca3af",
                fontWeight: 600,
                whiteSpace: "nowrap",
              }}
            >
              {new Date(r.created_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
              })}
            </div>
          </div>

          <div
            style={{
              background: "#f8f9fb",
              borderRadius: 10,
              padding: "12px 14px",
              fontSize: 13,
              color: "#374151",
              lineHeight: 1.6,
              fontWeight: 600,
              marginBottom: 16,
              fontStyle: "italic",
              borderLeft: "3px solid #7b8fcf",
            }}
          >
            "{r.message}"
          </div>

          {r.status === "pending" ? (
            <div style={{ display: "flex", gap: 10 }}>
              <button
                disabled={working === r.id}
                onClick={() => handleRespond(r.id, "accepted")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "none",
                  background: "linear-gradient(135deg,#065f46,#34d399)",
                  color: "#fff",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  opacity: working === r.id ? 0.6 : 1,
                }}
              >
                ✓ Accept
              </button>
              <button
                disabled={working === r.id}
                onClick={() => handleRespond(r.id, "rejected")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 10,
                  border: "1.5px solid #fecdd3",
                  background: "none",
                  color: "#e11d48",
                  fontSize: 13,
                  fontWeight: 800,
                  cursor: "pointer",
                  fontFamily: "'Nunito', sans-serif",
                  opacity: working === r.id ? 0.6 : 1,
                }}
              >
                ✕ Decline
              </button>
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "8px",
                borderRadius: 10,
                background: r.status === "accepted" ? "#dcfce7" : "#fff1f2",
                color: r.status === "accepted" ? "#15803d" : "#e11d48",
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              {r.status === "accepted" ? "✓ Accepted" : "✕ Declined"}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

/* ─── Sent Requests Panel (for students) ─────── */
function SentRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const showLoading = useMinimumLoading(loading, 2500);

  useEffect(() => {
    API.get("/mentorship/sent")
      .then((r) => setRequests(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusConfig = {
    pending: { bg: "#fef3c7", color: "#b45309", label: "⏳ Pending" },
    accepted: { bg: "#dcfce7", color: "#15803d", label: "✓ Accepted" },
    rejected: { bg: "#fff1f2", color: "#e11d48", label: "✕ Declined" },
  };

  if (showLoading) return <FullPageLoader />;
  if (requests.length === 0)
    return (
      <div style={{ textAlign: "center", padding: "60px 24px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e2a3a" }}>
          No requests sent yet
        </div>
        <div style={{ fontSize: 13, color: "#9ca3af", marginTop: 6 }}>
          Browse alumni and send your first mentorship request!
        </div>
      </div>
    );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {requests.map((r, i) => {
        const sc = statusConfig[r.status] || statusConfig.pending;
        return (
          <div
            key={r.id}
            style={{
              background: "#fff",
              borderRadius: 14,
              border: "1.5px solid #e5e7eb",
              padding: "18px 20px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <Avatar name={r.alumni_name} size={44} index={i} />
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#1e2a3a",
                  fontFamily: "'Nunito', sans-serif",
                }}
              >
                {r.alumni_name}
              </div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>
                Topic: {r.topic}
              </div>
              <div style={{ fontSize: 11, color: "#d1d5db", marginTop: 2 }}>
                {new Date(r.created_at).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
            </div>
            <span
              style={{
                background: sc.bg,
                color: sc.color,
                fontSize: 12,
                fontWeight: 800,
                padding: "5px 12px",
                borderRadius: 20,
                fontFamily: "'Nunito', sans-serif",
                whiteSpace: "nowrap",
              }}
            >
              {sc.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/* ─── MAIN PAGE ───────────────────────────────── */
export default function AlumniMentorship() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const showPageLoading = useMinimumLoading(loading, 2500);
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [activeTab, setActiveTab] = useState("browse"); // "browse" | "requests" | "sent"
  const [modalAlumni, setModalAlumni] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    API.get("/users/profile")
      .then((r) => {
        setCurrentUser(r.data);
        setActiveTab(r.data.role === "alumni" ? "requests" : "browse");
      })
      .catch(() => navigate("/login"));

    API.get("/users/alumni")
      .then((r) => setAlumni(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = alumni.filter((a) => {
    const matchSearch =
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.email.toLowerCase().includes(search.toLowerCase()) ||
      (a.domain || "").toLowerCase().includes(search.toLowerCase()) ||
      (a.company || "").toLowerCase().includes(search.toLowerCase());
    const matchDomain = domain === "All" || a.domain === domain;
    return matchSearch && matchDomain;
  });

  const handleRequestSuccess = () => {
    setModalAlumni(null);
    setSuccessMsg(
      "Mentorship request sent! We'll notify you when they respond.",
    );
    setTimeout(() => setSuccessMsg(""), 5000);
  };

  const isAlumni = currentUser?.role === "alumni";

  const tabs = isAlumni
    ? [
        { key: "requests", label: "📥 Incoming Requests" },
        { key: "browse", label: "👥 Browse Alumni" },
      ]
    : [
        { key: "browse", label: "🎓 Find a Mentor" },
        { key: "sent", label: "📤 My Requests" },
      ];

  if (showPageLoading || !currentUser) return <FullPageLoader />;

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

        .hero { background: linear-gradient(135deg, #1e3a5f 0%, #2a5298 50%, #1e3a5f 100%); padding: 48px 24px 40px; text-align: center; position: relative; overflow: hidden; }
        .hero::before { content: ''; position: absolute; inset: 0; background: radial-gradient(ellipse at 30% 50%, rgba(74,144,226,0.3) 0%, transparent 60%), radial-gradient(ellipse at 70% 50%, rgba(167,139,250,0.2) 0%, transparent 60%); }
        .hero-content { position: relative; z-index: 1; }

        .search-filter-bar { background: #fff; border-bottom: 1px solid #e5e7eb; padding: 16px 24px; display: flex; align-items: center; gap: 12; flex-wrap: wrap; gap: 12px; position: sticky; top: 56px; z-index: 90; }
        .search-input-wrap { flex: 1; min-width: 200px; position: relative; }
        .search-input { width: 100%; padding: 10px 16px 10px 38px; border: 1.5px solid #e5e7eb; border-radius: 24px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; background: #f8f9fb; outline: none; transition: border-color 0.2s; }
        .search-input:focus { border-color: #7b8fcf; background: #fff; }
        .search-input::placeholder { color: #9ca3af; }
        .search-icon-pos { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #9ca3af; }

        .domain-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 2px; }
        .domain-scroll::-webkit-scrollbar { display: none; }
        .domain-chip { padding: 6px 14px; border-radius: 20px; border: 1.5px solid #e5e7eb; background: #fff; font-family: 'Nunito', sans-serif; font-size: 12.5px; font-weight: 700; color: #6b7280; cursor: pointer; white-space: nowrap; transition: all 0.15s; }
        .domain-chip:hover { border-color: #7b8fcf; color: #3b5bdb; }
        .domain-chip.active { background: #1e3a5f; color: #fff; border-color: #1e3a5f; }

        .body { max-width: 1100px; margin: 0 auto; padding: 28px 16px; }

        .tabs { display: flex; gap: 4; background: #fff; border-radius: 12px; padding: 4px; border: 1px solid #e5e7eb; margin-bottom: 24px; width: fit-content; }
        .tab-btn { padding: 9px 20px; border-radius: 9px; border: none; font-family: 'Nunito', sans-serif; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: all 0.15s; background: none; color: #6b7280; }
        .tab-btn.active { background: #1e3a5f; color: #fff; }
        .tab-btn:hover:not(.active) { background: #f0f2f5; }

        .alumni-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 18px; }

        .success-toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #1e3a5f; color: #fff; padding: 14px 24px; border-radius: 12px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 700; box-shadow: 0 8px 24px rgba(0,0,0,0.2); z-index: 2000; animation: toastIn 0.3s ease; white-space: nowrap; }
        @keyframes toastIn { from { opacity:0; transform: translateX(-50%) translateY(20px); } to { opacity:1; transform: translateX(-50%) translateY(0); } }

        .empty-state { text-align: center; padding: 80px 24px; }

        @media (max-width: 768px) { .alumni-grid { grid-template-columns: 1fr; } .search-filter-bar { padding: 12px 16px; } }
      `}</style>

      <div className="page-root">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-logo" onClick={() => navigate("/feed")}>
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <button className="back-btn" onClick={() => navigate("/feed")}>
            ← Back to Feed
          </button>
        </header>

        {/* HERO */}
        <div className="hero">
          <div className="hero-content">
            <div
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "rgba(255,255,255,0.6)",
                letterSpacing: "2px",
                marginBottom: 12,
                fontFamily: "'Nunito', sans-serif",
              }}
            >
              IIPS CONNECT · MENTORSHIP PROGRAM
            </div>
            <h1
              style={{
                fontFamily: "'Nunito', sans-serif",
                fontWeight: 800,
                fontSize: "clamp(26px, 4vw, 42px)",
                color: "#fff",
                marginBottom: 12,
                lineHeight: 1.2,
              }}
            >
              {isAlumni ? "Your Mentorship Dashboard" : "Find Your Mentor"}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "rgba(255,255,255,0.7)",
                maxWidth: 520,
                margin: "0 auto",
                lineHeight: 1.7,
                fontWeight: 600,
              }}
            >
              {isAlumni
                ? "Manage incoming mentorship requests from students. Your experience shapes their future."
                : "Connect with IIPS alumni who've been in your shoes. Get real guidance from real professionals."}
            </p>

            {/* Stats row */}
            <div
              style={{
                display: "flex",
                gap: 32,
                justifyContent: "center",
                marginTop: 28,
                flexWrap: "wrap",
              }}
            >
              {[
                { num: alumni.length, label: "Alumni Mentors" },
                { num: "Free", label: "Always" },
                { num: "1:1", label: "Guidance" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#fff",
                      fontFamily: "'Nunito', sans-serif",
                    }}
                  >
                    {s.num}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.6)",
                      fontWeight: 600,
                    }}
                  >
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEARCH + FILTER (only on browse tab) */}
        {activeTab === "browse" && (
          <div className="search-filter-bar">
            <div className="search-input-wrap">
              <span className="search-icon-pos">
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
                className="search-input"
                placeholder="Search by name, company, or domain..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="domain-scroll">
              {DOMAINS.map((d) => (
                <button
                  key={d}
                  className={`domain-chip ${domain === d ? "active" : ""}`}
                  onClick={() => setDomain(d)}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="body">
          {/* TABS */}
          <div className="tabs">
            {tabs.map((t) => (
              <button
                key={t.key}
                className={`tab-btn ${activeTab === t.key ? "active" : ""}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* BROWSE TAB */}
          {activeTab === "browse" && (
            <>
              <div
                style={{
                  marginBottom: 16,
                  fontSize: 13,
                  color: "#9ca3af",
                  fontWeight: 600,
                }}
              >
                {loading
                  ? "Loading alumni..."
                  : `${filtered.length} mentor${filtered.length !== 1 ? "s" : ""} found`}
                {search && ` for "${search}"`}
              </div>

              {loading ? (
                <div className="empty-state">
                  <div
                    style={{ fontSize: 14, color: "#9ca3af", fontWeight: 600 }}
                  >
                    Loading alumni...
                  </div>
                </div>
              ) : filtered.length === 0 ? (
                <div className="empty-state">
                  <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color: "#1e2a3a",
                      marginBottom: 8,
                    }}
                  >
                    No alumni found
                  </div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>
                    Try adjusting your search or domain filter
                  </div>
                </div>
              ) : (
                <div className="alumni-grid">
                  {filtered.map((a, i) => (
                    <AlumniCard
                      key={a.id}
                      alumni={a}
                      index={i}
                      currentUser={currentUser}
                      onRequest={setModalAlumni}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* INCOMING REQUESTS TAB (alumni) */}
          {activeTab === "requests" && (
            <IncomingRequests currentUser={currentUser} />
          )}

          {/* SENT REQUESTS TAB (students) */}
          {activeTab === "sent" && <SentRequests />}
        </div>
      </div>

      {/* REQUEST MODAL */}
      {modalAlumni && (
        <RequestModal
          alumni={modalAlumni}
          onClose={() => setModalAlumni(null)}
          onSuccess={handleRequestSuccess}
        />
      )}

      {/* SUCCESS TOAST */}
      {successMsg && <div className="success-toast">✓ {successMsg}</div>}
    </>
  );
}
