import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api/api";

const DetailPill = ({ label, accent }) => (
  <span
    className="detail-pill"
    style={{
      background: accent ? `${accent}22` : "#eff6ff",
      borderColor: accent ? `${accent}33` : "transparent",
      color: accent ? accent : "#2563eb",
    }}
  >
    {label}
  </span>
);

const MetadataTile = ({ label, value }) => (
  <div className="detail-row">
    <div className="detail-label">{label}</div>
    <div className="detail-value">{value}</div>
  </div>
);

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    API.get(`/events/${id}`)
      .then((res) => setEvent(res.data))
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
          <p>Loading event details…</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="detail-page">
        <div className="detail-empty">
          <h2>Event details not available</h2>
          <p>We could not find the requested event. Please return to the feed and try again.</p>
          <button className="back-button" onClick={() => navigate(-1)}>
            ← Back to feed
          </button>
        </div>
      </div>
    );
  }

  const eventDate = new Date(event.event_date);
  const formattedDate = Number.isNaN(eventDate.valueOf())
    ? "Date not available"
    : eventDate.toLocaleString("en-IN", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  return (
    <div className="detail-page">
      <div className="detail-hero" style={{ borderTopColor: event.color || "#3b82f6" }}>
        <button type="button" className="back-button" onClick={() => navigate(-1)}>
          ← Back to feed
        </button>

        <div className="hero-copy">
          <span className="hero-subtitle">Event overview</span>
          <h1>{event.title || `Event #${id}`}</h1>
          <p className="hero-description">
            {event.description ||
              "A polished event experience for your community. Check back once the organizer adds more details."}
          </p>
          <div className="hero-meta">
            <DetailPill label={event.location || "Campus event"} accent={event.color} />
            <DetailPill label={formattedDate} />
          </div>
        </div>
      </div>

      <div className="detail-card">
        <div className="detail-card-header">
          <div>
            <div className="detail-card-title">Event details</div>
            <p className="detail-card-subtitle">
              A clean summary of the date, place, and event information.
            </p>
          </div>
          <div className="color-chip" style={{ background: event.color || "#3b82f6" }} />
        </div>

        <div className="detail-grid">
          <MetadataTile label="Date & time" value={formattedDate} />
          <MetadataTile label="Location" value={event.location || "Campus auditorium"} />
          <MetadataTile label="Organizer" value={event.organizer || "Community Admin"} />
          <MetadataTile label="Event ID" value={String(event.id || id)} />
        </div>

        <div className="detail-section">
          <div className="detail-section-title">About this event</div>
          <p className="detail-section-copy">
            {event.description ||
              "No description has been provided for this event yet. Stay tuned for the full schedule and location details."}
          </p>
        </div>
      </div>

      <style>{`
        .detail-page { max-width: 980px; margin: 0 auto; padding: 32px 24px 56px; color: #0f172a; }
        .detail-hero { border-top: 6px solid #3b82f6; border-radius: 30px; background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%); box-shadow: 0 28px 70px rgba(15, 23, 42, 0.08); padding: 32px; margin-bottom: 28px; animation: fadeInUp 0.45s ease both; }
        .back-button { border: 1px solid rgba(15, 23, 42, 0.12); color: #0f172a; background: rgba(255, 255, 255, 0.92); border-radius: 999px; padding: 12px 18px; font-size: 0.94rem; cursor: pointer; transition: transform 0.18s ease, background 0.18s ease; margin-bottom: 24px; }
        .back-button:hover { transform: translateY(-1px); background: rgba(255, 255, 255, 1); }
        .hero-copy { max-width: 760px; }
        .hero-subtitle { display: inline-flex; text-transform: uppercase; letter-spacing: 0.18em; font-size: 0.78rem; font-weight: 800; color: #2563eb; margin-bottom: 14px; }
        .detail-hero h1 { font-size: clamp(2rem, 2.2vw, 3rem); line-height: 1.02; margin-bottom: 18px; color: #0f172a; }
        .hero-description { font-size: 1rem; line-height: 1.75; color: #475569; max-width: 700px; margin-bottom: 24px; }
        .hero-meta { display: flex; flex-wrap: wrap; gap: 12px; }
        .detail-pill { display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; border-radius: 999px; font-size: 0.92rem; font-weight: 700; border: 1px solid transparent; }
        .detail-card { background: #ffffff; border: 1px solid #e5e7eb; border-radius: 28px; padding: 28px; box-shadow: 0 18px 40px rgba(15, 23, 42, 0.06); animation: fadeInUp 0.45s ease both; }
        .detail-card-header { display: flex; justify-content: space-between; gap: 20px; align-items: flex-start; margin-bottom: 24px; }
        .detail-card-title { font-size: 1.05rem; font-weight: 800; color: #0f172a; margin-bottom: 6px; }
        .detail-card-subtitle { color: #64748b; line-height: 1.7; }
        .color-chip { width: 48px; height: 48px; border-radius: 16px; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4); }
        .detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px; margin-bottom: 26px; }
        .detail-row { background: #f8fafc; border: 1px solid #f1f5f9; border-radius: 18px; padding: 18px 20px; transition: transform 0.2s ease, border-color 0.2s ease; }
        .detail-row:hover { transform: translateY(-1px); border-color: #cbd5e1; }
        .detail-label { font-size: 0.82rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #64748b; margin-bottom: 8px; }
        .detail-value { color: #0f172a; font-size: 0.97rem; line-height: 1.75; }
        .detail-section { padding-top: 4px; border-top: 1px solid #e2e8f0; }
        .detail-section-title { font-size: 1rem; font-weight: 800; color: #0f172a; margin-bottom: 10px; }
        .detail-section-copy { font-size: 0.98rem; line-height: 1.85; color: #475569; }
        .detail-loading { display: grid; gap: 16px; justify-items: center; padding: 120px 0; }
        .detail-empty { text-align: center; padding: 120px 0; }
        .detail-empty h2 { font-size: 1.7rem; margin-bottom: 14px; color: #0f172a; }
        .detail-empty p { color: #64748b; margin-bottom: 24px; }
        .loading-pulse { width: 80px; height: 80px; border-radius: 20px; background: linear-gradient(135deg, #dbeafe 0%, #93c5fd 100%); animation: pulse 1.4s ease-in-out infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.85; } }
        @media (max-width: 780px) { .detail-grid { grid-template-columns: 1fr; } .detail-card-header { flex-direction: column; } .detail-page { padding: 24px 18px 44px; } }
      `}</style>
    </div>
  );
}

export default EventDetails;