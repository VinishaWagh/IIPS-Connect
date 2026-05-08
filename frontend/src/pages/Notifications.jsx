import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import { FullPageLoader, TopProgressBar, NotificationsSkeleton } from "../components/PageLoaders";

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

function getNotifMessage(type, actorName) {
  switch (type) {
    case "like":    return `${actorName} liked your post`;
    case "comment": return `${actorName} commented on your post`;
    case "follow":  return `${actorName} connected with you`;
    default:        return `${actorName} interacted with your post`;
  }
}

function getNotifIcon(type) {
  switch (type) {
    case "like":    return "❤️";
    case "comment": return "💬";
    case "follow":  return "🤝";
    default:        return "🔔";
  }
}

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  /* GET NOTIFICATIONS — GET /api/notifications */
  useEffect(() => {
    API.get("/notifications")
      .then(r => setNotifications(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  /* MARK ALL READ — PUT /api/notifications/read-all */
  const handleMarkAllRead = async () => {
    try {
      await API.put("/notifications/read-all");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) { console.error(err); }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

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
        .header-row { display: flex; align-items: center; justify-content: space-between; }
        .page-title { font-size: 20px; font-weight: 800; color: #1e2a3a; }
        .page-sub { font-size: 13px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .mark-read-btn { padding: 7px 16px; background: none; border: 1.5px solid #e5e7eb; border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 12.5px; font-weight: 700; color: #4b5563; cursor: pointer; transition: all 0.15s; }
        .mark-read-btn:hover { border-color: #7b8fcf; color: #3b5bdb; }
        .empty { text-align: center; color: #9ca3af; font-weight: 600; padding: 48px 0; font-size: 14px; }
        .notif-card { background: #fff; border-radius: 12px; border: 1px solid #e5e7eb; padding: 14px 16px; display: flex; align-items: center; gap: 12px; transition: background 0.15s; }
        .notif-card.unread { background: #f0f4ff; border-color: #c7d2fe; }
        .notif-icon { font-size: 20px; flex-shrink: 0; }
        .notif-content { flex: 1; }
        .notif-message { font-size: 13.5px; font-weight: 700; color: #1e2a3a; line-height: 1.4; }
        .notif-time { font-size: 11.5px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .unread-dot { width: 8px; height: 8px; border-radius: 50%; background: #3b5bdb; flex-shrink: 0; }
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
          <div className="header-row">
            <div>
              <div className="page-title">
                Notifications
                {unreadCount > 0 && (
                  <span style={{ marginLeft: 8, background: "#3b5bdb", color: "#fff", fontSize: 11, fontWeight: 800, padding: "2px 8px", borderRadius: 20 }}>
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="page-sub">{notifications.length} total notifications</div>
            </div>
            {unreadCount > 0 && (
              <button className="mark-read-btn" onClick={handleMarkAllRead}>
                ✓ Mark all read
              </button>
            )}
          </div>

          {loading
            ? <FullPageLoader />
            : notifications.length === 0
              ? <p className="empty">No notifications yet. Start engaging with posts!</p>
              : notifications.map(n => (
                  <div key={n.id} className={`notif-card ${!n.is_read ? "unread" : ""}`}>
                    <span className="notif-icon">{getNotifIcon(n.type)}</span>
                    <Avatar initials={getInitials(n.actor_name)} size={34} bg="#4b5563" />
                    <div className="notif-content">
                      <div className="notif-message">{getNotifMessage(n.type, n.actor_name)}</div>
                      <div className="notif-time">
                        {new Date(n.created_at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </div>
                    {!n.is_read && <div className="unread-dot" />}
                  </div>
                ))
          }
        </div>
      </div>
    </>
  );
}