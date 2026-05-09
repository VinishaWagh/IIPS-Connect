import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";

export default function AdminPanel() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState("events");

  // Events state
  const [events, setEvents] = useState([]);
  const [eventForm, setEventForm] = useState({ title: "", event_date: "", color: "#3b82f6" });
  const [eventLoading, setEventLoading] = useState(false);
  const [eventError, setEventError] = useState("");

  // Announcements state
  const [announcements, setAnnouncements] = useState([]);
  const [annText, setAnnText] = useState("");
  const [annLoading, setAnnLoading] = useState(false);
  const [annError, setAnnError] = useState("");

  /* ── Fetch current user — GET /api/users/profile ── */
  useEffect(() => {
    API.get("/users/profile")
      .then(res => {
        setCurrentUser(res.data);
        // Redirect if not faculty
        if (res.data.role !== "faculty") {
          alert("Access denied. Only faculty can access this page.");
          navigate("/feed");
        }
      })
      .catch(() => navigate("/login"));
  }, []);

  /* ── Fetch all events — GET /api/events/upcoming ── */
  useEffect(() => {
    API.get("/events/upcoming")
      .then(res => setEvents(res.data))
      .catch(err => console.error(err));
  }, []);

  /* ── Fetch all announcements — GET /api/announcements ── */
  useEffect(() => {
    API.get("/announcements")
      .then(res => setAnnouncements(res.data))
      .catch(err => console.error(err));
  }, []);

  /* ── Create Event — POST /api/events ── */
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setEventError("");
    if (!eventForm.title || !eventForm.event_date) {
      setEventError("Title and date are required.");
      return;
    }
    setEventLoading(true);
    try {
      const res = await API.post("/events", eventForm);
      setEvents(prev => [...prev, res.data]);
      setEventForm({ title: "", event_date: "", color: "#3b82f6" });
    } catch (err) {
      setEventError(err.response?.data?.message || "Failed to create event.");
    } finally {
      setEventLoading(false);
    }
  };

  /* ── Delete Event — DELETE /api/events/:id ── */
  const handleDeleteEvent = async (id) => {
    if (!window.confirm("Delete this event?")) return;
    try {
      await API.delete(`/events/${id}`);
      setEvents(prev => prev.filter(e => e.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  /* ── Create Announcement — POST /api/announcements ── */
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    setAnnError("");
    if (!annText.trim()) {
      setAnnError("Announcement text is required.");
      return;
    }
    setAnnLoading(true);
    try {
      const res = await API.post("/announcements", { text: annText });
      setAnnouncements(prev => [res.data, ...prev]);
      setAnnText("");
    } catch (err) {
      setAnnError(err.response?.data?.message || "Failed to create announcement.");
    } finally {
      setAnnLoading(false);
    }
  };

  /* ── Delete Announcement — DELETE /api/announcements/:id ── */
  const handleDeleteAnnouncement = async (id) => {
    if (!window.confirm("Delete this announcement?")) return;
    try {
      await API.delete(`/announcements/${id}`);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const COLOR_OPTIONS = [
    { label: "Blue", value: "#3b82f6" },
    { label: "Green", value: "#10b981" },
    { label: "Amber", value: "#f59e0b" },
    { label: "Red", value: "#ef4444" },
    { label: "Purple", value: "#8b5cf6" },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }

        .admin-root { font-family: 'Nunito', sans-serif; min-height: 100vh; background: #f0f2f5; display: flex; flex-direction: column; }

        /* TOPBAR */
        .topbar { position: sticky; top: 0; z-index: 100; background: #fff; border-bottom: 1px solid #e5e7eb; display: flex; align-items: center; padding: 0 24px; height: 56px; gap: 16px; }
        .topbar-logo { display: flex; align-items: center; gap: 10px; font-weight: 800; font-size: 16px; color: #1e3a5f; white-space: nowrap; cursor: pointer; }
        .topbar-logo img { height: 30px; }
        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
        .back-btn { display: flex; align-items: center; gap: 6px; padding: 7px 16px; background: #f0f2f5; border: none; border-radius: 20px; font-family: 'Nunito', sans-serif; font-size: 13px; font-weight: 700; color: #4b5563; cursor: pointer; transition: background 0.15s; }
        .back-btn:hover { background: #e5e7eb; }
        .user-badge { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 700; color: #1e3a5f; }
        .role-chip { background: #dbeafe; color: #1d4ed8; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 20px; }

        /* BODY */
        .admin-body { max-width: 800px; margin: 0 auto; width: 100%; padding: 28px 16px; display: flex; flex-direction: column; gap: 20px; }

        .page-title { font-size: 22px; font-weight: 800; color: #1e2a3a; }
        .page-sub { font-size: 13px; color: #9ca3af; font-weight: 600; margin-top: 4px; }

        /* TABS */
        .tabs { display: flex; gap: 8px; background: #fff; border-radius: 12px; padding: 6px; border: 1px solid #e5e7eb; width: fit-content; }
        .tab-btn { padding: 8px 20px; border-radius: 8px; border: none; font-family: 'Nunito', sans-serif; font-size: 13.5px; font-weight: 700; cursor: pointer; transition: background 0.15s, color 0.15s; background: none; color: #6b7280; }
        .tab-btn.active { background: #1e3a5f; color: #fff; }
        .tab-btn:hover:not(.active) { background: #f0f2f5; }

        /* CARD */
        .admin-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 24px; display: flex; flex-direction: column; gap: 20px; }
        .card-section-title { font-size: 15px; font-weight: 800; color: #1e2a3a; margin-bottom: 2px; }
        .card-section-sub { font-size: 12.5px; color: #9ca3af; font-weight: 600; }

        /* FORM */
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-group.full { grid-column: 1 / -1; }
        .form-label { font-size: 13px; font-weight: 700; color: #1e2a3a; }
        .form-input { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; background: #f8f9fb; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: #7b8fcf; background: #fff; }
        .form-input::placeholder { color: #9ca3af; }
        .form-textarea { padding: 10px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; background: #f8f9fb; outline: none; transition: border-color 0.2s; resize: vertical; min-height: 90px; }
        .form-textarea:focus { border-color: #7b8fcf; background: #fff; }
        .form-textarea::placeholder { color: #9ca3af; }

        /* COLOR PICKER */
        .color-options { display: flex; gap: 8px; flex-wrap: wrap; }
        .color-option { width: 28px; height: 28px; border-radius: 50%; cursor: pointer; border: 3px solid transparent; transition: border-color 0.15s, transform 0.15s; }
        .color-option:hover { transform: scale(1.1); }
        .color-option.selected { border-color: #1e2a3a; }

        /* ERROR */
        .form-error { font-size: 12.5px; font-weight: 700; color: #e11d48; background: #fff1f2; padding: 8px 12px; border-radius: 8px; border: 1px solid #fecdd3; }

        /* SUBMIT */
        .submit-btn { padding: 11px 24px; background: #1e3a5f; color: #fff; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.2s; align-self: flex-start; }
        .submit-btn:hover { background: #2d4f80; }
        .submit-btn:disabled { background: #9ca3af; cursor: not-allowed; }

        /* DIVIDER */
        .section-divider { height: 1px; background: #f0f2f5; }

        /* LIST */
        .items-list { display: flex; flex-direction: column; gap: 10px; }
        .list-empty { font-size: 13px; color: #9ca3af; font-weight: 600; text-align: center; padding: 16px 0; }

        .event-row { display: flex; align-items: center; gap: 12px; padding: 12px 14px; background: #f8f9fb; border-radius: 10px; border: 1px solid #e5e7eb; }
        .event-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
        .event-info { flex: 1; }
        .event-row-title { font-size: 13.5px; font-weight: 700; color: #1e2a3a; }
        .event-row-date { font-size: 12px; color: #9ca3af; font-weight: 600; margin-top: 2px; }

        .ann-row { display: flex; align-items: flex-start; gap: 12px; padding: 12px 14px; background: #f8f9fb; border-radius: 10px; border: 1px solid #e5e7eb; border-left: 3px solid #3b5bdb; }
        .ann-info { flex: 1; }
        .ann-row-text { font-size: 13.5px; font-weight: 600; color: #374151; line-height: 1.5; }
        .ann-row-time { font-size: 11.5px; color: #9ca3af; font-weight: 600; margin-top: 4px; }

        .delete-btn { background: none; border: 1px solid #e5e7eb; border-radius: 6px; padding: 5px 7px; cursor: pointer; color: #9ca3af; display: flex; align-items: center; transition: background 0.15s, color 0.15s, border-color 0.15s; flex-shrink: 0; }
        .delete-btn:hover { background: #fff1f2; color: #e11d48; border-color: #fecdd3; }

        @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } }
      `}</style>

      <div className="admin-root">

        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-logo" onClick={() => navigate("/feed")}>
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <div className="topbar-right">
            <button className="back-btn" onClick={() => navigate("/feed")}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Back to Feed
            </button>
            <div className="user-badge">
              {currentUser?.name}
              <span className="role-chip">Faculty</span>
            </div>
          </div>
        </header>

        <div className="admin-body">
          <div>
            <div className="page-title">Admin Panel</div>
            <div className="page-sub">Manage events and announcements for the community</div>
          </div>

          {/* TABS */}
          <div className="tabs">
            <button
              className={`tab-btn ${activeTab === "events" ? "active" : ""}`}
              onClick={() => setActiveTab("events")}
            >
              📅 Events
            </button>
            <button
              className={`tab-btn ${activeTab === "announcements" ? "active" : ""}`}
              onClick={() => setActiveTab("announcements")}
            >
              📢 Announcements
            </button>
          </div>

          {/* ── EVENTS TAB ── */}
          {activeTab === "events" && (
            <div className="admin-card">

              {/* Add Event Form */}
              <div>
                <div className="card-section-title">Add New Event</div>
                <div className="card-section-sub">This will appear in the Upcoming Events widget on the feed</div>
              </div>

              <form onSubmit={handleCreateEvent} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-grid">
                  <div className="form-group full">
                    <label className="form-label">Event Title</label>
                    <input
                      className="form-input"
                      type="text"
                      placeholder="e.g. Tech Talk: AI in Education"
                      value={eventForm.title}
                      onChange={e => setEventForm(p => ({ ...p, title: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Event Date</label>
                    <input
                      className="form-input"
                      type="date"
                      value={eventForm.event_date}
                      onChange={e => setEventForm(p => ({ ...p, event_date: e.target.value }))}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Color Tag</label>
                    <div className="color-options">
                      {COLOR_OPTIONS.map(c => (
                        <div
                          key={c.value}
                          className={`color-option ${eventForm.color === c.value ? "selected" : ""}`}
                          style={{ background: c.value }}
                          onClick={() => setEventForm(p => ({ ...p, color: c.value }))}
                          title={c.label}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {eventError && <div className="form-error">{eventError}</div>}

                <button className="submit-btn" type="submit" disabled={eventLoading}>
                  {eventLoading ? "Adding..." : "Add Event"}
                </button>
              </form>

              <div className="section-divider" />

              {/* Events List */}
              <div>
                <div className="card-section-title">Existing Events ({events.length})</div>
              </div>
              <div className="items-list">
                {events.length === 0
                  ? <p className="list-empty">No events yet. Add one above.</p>
                  : events.map(ev => (
                      <div key={ev.id} className="event-row">
                        <div className="event-dot" style={{ background: ev.color || "#3b82f6" }} />
                        <div className="event-info">
                          <div className="event-row-title">{ev.title}</div>
                          <div className="event-row-date">
                            {new Date(ev.event_date).toLocaleDateString("en-IN", {
                              weekday: "short", day: "numeric", month: "long", year: "numeric"
                            })}
                          </div>
                        </div>
                        <button className="delete-btn" onClick={() => handleDeleteEvent(ev.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    ))
                }
              </div>
            </div>
          )}

          {/* ── ANNOUNCEMENTS TAB ── */}
          {activeTab === "announcements" && (
            <div className="admin-card">

              {/* Add Announcement Form */}
              <div>
                <div className="card-section-title">Post New Announcement</div>
                <div className="card-section-sub">The latest announcement will show on every user's feed</div>
              </div>

              <form onSubmit={handleCreateAnnouncement} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Announcement Text</label>
                  <textarea
                    className="form-textarea"
                    placeholder="e.g. Semester exams start April 15. Check portal for schedule."
                    value={annText}
                    onChange={e => setAnnText(e.target.value)}
                  />
                </div>

                {annError && <div className="form-error">{annError}</div>}

                <button className="submit-btn" type="submit" disabled={annLoading}>
                  {annLoading ? "Posting..." : "Post Announcement"}
                </button>
              </form>

              <div className="section-divider" />

              {/* Announcements List */}
              <div>
                <div className="card-section-title">All Announcements ({announcements.length})</div>
                <div className="card-section-sub">The most recent one shows on the feed</div>
              </div>
              <div className="items-list">
                {announcements.length === 0
                  ? <p className="list-empty">No announcements yet. Post one above.</p>
                  : announcements.map((a, i) => (
                      <div key={a.id} className="ann-row">
                        <div className="ann-info">
                          <div className="ann-row-text">
                            {i === 0 && (
                              <span style={{ fontSize: 10, fontWeight: 800, background: "#dcfce7", color: "#15803d", padding: "1px 6px", borderRadius: 10, marginRight: 6 }}>
                                ACTIVE
                              </span>
                            )}
                            {a.text}
                          </div>
                          <div className="ann-row-time">
                            {new Date(a.created_at).toLocaleString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </div>
                        </div>
                        <button className="delete-btn" onClick={() => handleDeleteAnnouncement(a.id)} title="Delete">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                            <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                          </svg>
                        </button>
                      </div>
                    ))
                }
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}