import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import { FullPageLoader } from "../components/PageLoaders";

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

const ROLE_MAP = {
  faculty: { bg: "#dbeafe", color: "#1d4ed8" },
  alumni:  { bg: "#fef3c7", color: "#b45309" },
  student: { bg: "#dcfce7", color: "#15803d" },
};

export default function PendingRequests() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(null);

  /* GET PENDING — GET /api/connections/pending */
  useEffect(() => {
    API.get("/connections/pending")
      .then(r => setRequests(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* ACCEPT — PUT /api/connections/respond/:connectionId */
  const handleAccept = async (connectionId) => {
    setWorking(connectionId);
    try {
      await API.put(`/connections/respond/${connectionId}`, { status: "accepted" });
      setRequests(prev => prev.filter(r => r.id !== connectionId));
    } catch (err) { console.error(err); }
    finally { setWorking(null); }
  };

  /* REJECT — PUT /api/connections/respond/:connectionId */
  const handleReject = async (connectionId) => {
    setWorking(connectionId);
    try {
      await API.put(`/connections/respond/${connectionId}`, { status: "rejected" });
      setRequests(prev => prev.filter(r => r.id !== connectionId));
    } catch (err) { console.error(err); }
    finally { setWorking(null); }
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
        .body { max-width: 620px; margin: 0 auto; padding: 28px 16px; display: flex; flex-direction: column; gap: 14px; }
        .page-title { font-size: 20px; font-weight: 800; color: #1e2a3a; }
        .page-sub { font-size: 13px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .empty { text-align: center; color: #9ca3af; font-weight: 600; padding: 48px 0; font-size: 14px; }
        .req-card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 16px; display: flex; align-items: center; gap: 12px; }
        .req-info { flex: 1; }
        .req-name { font-size: 14px; font-weight: 800; color: #1e2a3a; display: flex; align-items: center; gap: 7px; }
        .req-time { font-size: 11.5px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .role-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }
        .accept-btn { padding: 7px 16px; background: #1e3a5f; color: #fff; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 12.5px; font-weight: 700; cursor: pointer; transition: background 0.15s; }
        .accept-btn:hover { background: #2d4f80; }
        .accept-btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .reject-btn { padding: 7px 14px; background: none; border: 1.5px solid #fecdd3; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 12.5px; font-weight: 700; color: #e11d48; cursor: pointer; transition: all 0.15s; }
        .reject-btn:hover { background: #fff1f2; }
        .reject-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .btn-group { display: flex; gap: 8px; flex-shrink: 0; }
      `}</style>

      <div className="page-root">
        <header className="topbar">
          <div className="topbar-logo" onClick={() => navigate("/feed")}>
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <button className="back-btn" onClick={() => navigate("/feed")}>← Back to Feed</button>
        </header>

        <div className="body">
          <div>
            <div className="page-title">
              Connection Requests
              {requests.length > 0 && (
                <span style={{ marginLeft: 8, background: "#3b5bdb", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>
                  {requests.length}
                </span>
              )}
            </div>
            <div className="page-sub">People who want to connect with you</div>
          </div>

          {loading
            ? <FullPageLoader />
            : requests.length === 0
              ? <p className="empty">No pending connection requests 🎉</p>
              : requests.map(r => {
                  const role = ROLE_MAP[r.sender_role?.toLowerCase()] || ROLE_MAP.student;
                  return (
                    <div key={r.id} className="req-card">
                      <Avatar initials={getInitials(r.sender_name)} size={42} />
                      <div className="req-info">
                        <div className="req-name">
                          {r.sender_name}
                          <span className="role-badge" style={{ background: role.bg, color: role.color }}>
                            {r.sender_role}
                          </span>
                        </div>
                        <div className="req-time">
                          Sent {new Date(r.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                        </div>
                      </div>
                      <div className="btn-group">
                        <button
                          className="accept-btn"
                          onClick={() => handleAccept(r.id)}
                          disabled={working === r.id}
                        >
                          ✓ Accept
                        </button>
                        <button
                          className="reject-btn"
                          onClick={() => handleReject(r.id)}
                          disabled={working === r.id}
                        >
                          ✕ Reject
                        </button>
                      </div>
                    </div>
                  );
                })
          }
        </div>
      </div>
    </>
  );
}