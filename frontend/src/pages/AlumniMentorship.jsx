import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import ConnectButton from "../components/Connectbutton";

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

const BG_COLORS = ["#1e3a5f", "#7b8fcf", "#10b981", "#f59e0b", "#8b5cf6", "#ef4444"];

export default function AlumniMentorship() {
  const navigate = useNavigate();
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  /* GET ALUMNI — GET /api/users/alumni */
  useEffect(() => {
    API.get("/users/alumni")
      .then(r => setAlumni(r.data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const filtered = alumni.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );

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
        .body { max-width: 780px; margin: 0 auto; padding: 28px 16px; display: flex; flex-direction: column; gap: 20px; }
        .page-title { font-size: 20px; font-weight: 800; color: #1e2a3a; }
        .page-sub { font-size: 13px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .search-bar { padding: 10px 18px; border: 1.5px solid #e5e7eb; border-radius: 24px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; background: #fff; outline: none; transition: border-color 0.2s; width: 100%; }
        .search-bar:focus { border-color: #7b8fcf; }
        .search-bar::placeholder { color: #9ca3af; }
        .empty { text-align: center; color: #9ca3af; font-weight: 600; padding: 48px 0; font-size: 14px; }
        .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 14px; }
        .alumni-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 20px; display: flex; flex-direction: column; align-items: center; gap: 10px; text-align: center; transition: box-shadow 0.2s; }
        .alumni-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .alumni-name { font-size: 14px; font-weight: 800; color: #1e2a3a; }
        .alumni-email { font-size: 12px; color: #9ca3af; font-weight: 600; word-break: break-all; }
        .alumni-badge { background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 700; padding: "2px 8px"; border-radius: 20px; padding: 2px 10px; }
        .msg-btn { width: 100%; padding: 8px; background: #1e3a5f; color: #fff; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; cursor: pointer; transition: background 0.2s; margin-top: 4px; }
        .msg-btn:hover { background: #2d4f80; }
        .joined { font-size: 11px; color: #d1d5db; font-weight: 600; }
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
            <div className="page-title">Alumni Mentorship</div>
            <div className="page-sub">Connect with {alumni.length} alumni from IIPS</div>
          </div>

          <input
            className="search-bar"
            placeholder="Search alumni by name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {loading
            ? <MentorshipSkeleton />
              : (
                <div className="grid">
                  {filtered.map((a, i) => (
                    <div key={a.id} className="alumni-card">
                      <Avatar initials={getInitials(a.name)} size={52} bg={BG_COLORS[i % BG_COLORS.length]} />
                      <div className="alumni-name">{a.name}</div>
                      <span className="alumni-badge">Alumni</span>
                      <div className="alumni-email">{a.email}</div>
                      <div className="joined">
                        Joined {new Date(a.created_at).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                      </div>
                      {/* Message button — wire to messaging feature when built */}
                      <ConnectButton targetUserId={a.id} currentUserId={currentUser?.id} />
                    </div>
                  ))}
                </div>
              )
          }
        </div>
      </div>
    </>
  );
}