import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

const Badge = ({ label, color }) => (
  <span className="announcement-badge" style={{ background: color || "#e0f2fe", color: color ? "#0c4a6e" : "#0369a1" }}>
    {label}
  </span>
);

function AnnouncementDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/announcements/${id}`)
      .then((res) => setAnnouncement(res.data))
      .catch((error) => {
        console.error(error);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="detail-page">
        <div className="detail-loading">
          <div className="loading-pulse" />
          <p>Loading announcement…</p>
        </div>
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="detail-page">
        <div className="detail-empty">
          <h2>Announcement missing</h2>
          <p>The announcement could not be found. Please return to the feed and try a different item.</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to feed
          </button>
        </div>
      </div>
    );
  }

  const createdAt = new Date(announcement.created_at);
  const createdAtText = Number.isNaN(createdAt.valueOf())
    ? "Unknown time"
    : createdAt.toLocaleString("en-IN", {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className="detail-page">
      <div className="announcement-hero">
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Back to feed
        </button>

        <div className="hero-copy">
          <span className="hero-subtitle">Community announcement</span>
          <h1>Important update</h1>
          <p className="hero-description">
            Stay informed on the latest announcements from faculty and campus teams.
          </p>
          <div className="hero-meta">
            <Badge label={announcement.type || "General"} />
            <Badge label={`Posted ${createdAtText}`} color="#7dd3fc" />
          </div>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <div>
            <div className="detail-card-title">Announcement details</div>
            <p className="detail-card-subtitle">
              A clear, readable summary for this message.
            </p>
          </div>
          <div className="announcement-chip">📢</div>
        </div>

        <div className="announcement-body">
          {announcement.text || "The announcement content is not available at the moment."}
        </div>

        <div className="detail-grid">
          <div className="detail-row">
            <div className="detail-label">Announcement ID</div>
            <div className="detail-value">{announcement.id || id}</div>
          </div>
          <div className="detail-row">
            <div className="detail-label">Published</div>
            <div className="detail-value">{createdAtText}</div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-page { max-width: 920px; margin: 0 auto; padding: 32px 24px 56px; color: #0f172a; }
        .announcement-hero { border-top: 6px solid #38bdf8; border-radius: 30px; background: linear-gradient(180deg, #eff6ff 0%, #ffffff 100%); box-shadow: 0 28px 70px rgba(15, 23, 42, 0.08); padding: 32px; margin-bottom: 28px; animation: fadeInUp 0.45s ease both; }
        .back-button { border: 1px solid rgba(15, 23, 42, 0.12); color: #0f172a; background: rgba(255, 255, 255, 0.92); border-radius: 999px; padding: 12px 18px; font-size: 0.94rem; cursor: pointer; transition: transform 0.18s ease, background 0.18s ease; margin-bottom: 24px; }
        .back-button:hover { transform: translateY(-1px); background: rgba(255, 255, 255, 1); }
        .hero-copy { max-width: 760px; }
        .hero-subtitle { display: inline-flex; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.78rem; font-weight: 800; color: #0284c7; margin-bottom: 14px; }
        .announcement-hero h1 { font-size: clamp(2rem, 2.1vw, 3rem); line-height: 1.02; margin-bottom: 18px; color: #0f172a; }
        .hero-description { font-size: 1rem; line-height: 1.75; color: #475569; max-width: 700px; margin-bottom: 24px; }
        .hero-meta { display: flex; flex-wrap: wrap; gap: 12px; }
        .announcement-badge { display: inline-flex; align-items: center; padding: 10px 16px; border-radius: 999px; font-size: 0.92rem; font-weight: 700; }
        .detail-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 28px; padding: 28px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); animation: fadeInUp 0.45s ease both; }
        .detail-card-header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
        .detail-card-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .detail-card-subtitle { color: #64748b; line-height: 1.7; }
        .announcement-chip { width: 48px; height: 48px; display: grid; place-items: center; border-radius: 18px; background: #dbeafe; color: #1e3a8a; font-size: 1.2rem; }
        .announcement-body { background: #f8fafc; border-radius: 20px; padding: 24px; color: #334155; line-height: 1.8; border: 1px solid #e2e8f0; margin-bottom: 26px; font-size: 1rem; }
        .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; }
        .detail-row { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 18px; padding: 18px 20px; transition: transform 0.2s ease, border-color 0.2s ease; }
        .detail-row:hover { transform: translateY(-1px); border-color: #cbd5e1; }
        .detail-label { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px; }
        .detail-value { color: #0f172a; font-size: 0.97rem; line-height: 1.75; }
        .detail-loading { display: grid; gap: 16px; justify-items: center; padding: 120px 0; }
        .detail-empty { text-align: center; padding: 120px 0; }
        .detail-empty h2 { font-size: 1.7rem; margin-bottom: 14px; color: #0f172a; }
        .detail-empty p { color: #64748b; margin-bottom: 24px; }
        .loading-pulse { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #dbeafe 0%, #7dd3fc 100%); animation: pulse 1.4s ease-in-out infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.85; } }
        @media (max-width: 780px) { .detail-grid { grid-template-columns: 1fr; } .detail-card-header { flex-direction: column; } .detail-page { padding: 24px 18px 44px; } }
      `}</style>
    </div>
  );
}

export default AnnouncementDetails;