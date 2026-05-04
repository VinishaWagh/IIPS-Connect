import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";
import { TopProgressBar, ProfileSkeleton } from "../components/PageLoaders";

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

export default function ProfileSettings() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileMsg, setProfileMsg] = useState({ text: "", type: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [pwMsg, setPwMsg] = useState({ text: "", type: "" });
  const [pwLoading, setPwLoading] = useState(false);

  /* GET PROFILE — GET /api/users/profile */
  useEffect(() => {
    API.get("/users/profile")
      .then((r) => {
        setUser(r.data);
        setName(r.data.name);
        setEmail(r.data.email);
      })
      .catch(() => navigate("/login"))
      .finally(() => setLoadingProfile(false));
  }, []);

  /* UPDATE PROFILE — PUT /api/users/profile  body: { name, email } */
  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setProfileMsg({ text: "Name and email are required.", type: "error" });
      return;
    }
    setProfileLoading(true);
    try {
      const res = await API.put("/users/profile", { name, email });
      setUser(res.data);
      setProfileMsg({ text: "Profile updated successfully!", type: "success" });
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || "Failed to update profile.",
        type: "error",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  /* UPDATE PASSWORD — PUT /api/users/password  body: { currentPassword, newPassword } */
  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPwMsg({ text: "All fields are required.", type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwMsg({ text: "New passwords do not match.", type: "error" });
      return;
    }
    if (newPassword.length < 6) {
      setPwMsg({
        text: "New password must be at least 6 characters.",
        type: "error",
      });
      return;
    }
    setPwLoading(true);
    try {
      await API.put("/users/password", { currentPassword, newPassword });
      setPwMsg({ text: "Password updated successfully!", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPwMsg({
        text: err.response?.data?.message || "Failed to update password.",
        type: "error",
      });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const ROLE_MAP = {
    faculty: { bg: "#dbeafe", color: "#1d4ed8", text: "Faculty" },
    alumni: { bg: "#fef3c7", color: "#b45309", text: "Alumni" },
    student: { bg: "#dcfce7", color: "#15803d", text: "Student" },
  };
  const roleStyle = ROLE_MAP[user?.role?.toLowerCase()] || ROLE_MAP.student;

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
        .body { max-width: 620px; margin: 0 auto; padding: 28px 16px; display: flex; flex-direction: column; gap: 20px; }
        .page-title { font-size: 20px; font-weight: 800; color: #1e2a3a; }

        /* Profile Header Card */
        .profile-header { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 24px; display: flex; align-items: center; gap: 16px; }
        .profile-info { flex: 1; }
        .profile-info-name { font-size: 17px; font-weight: 800; color: #1e2a3a; }
        .profile-info-email { font-size: 13px; color: #9ca3af; font-weight: 600; margin-top: 3px; }
        .role-badge { display: inline-block; font-size: 11px; font-weight: 700; padding: 2px 10px; border-radius: 20px; margin-top: 6px; }
        .joined-text { font-size: 11.5px; color: #d1d5db; font-weight: 600; margin-top: 4px; }
        .logout-btn { padding: 8px 16px; border: 1.5px solid #fecdd3; border-radius: 10px; background: none; font-family: 'Nunito', sans-serif; font-size: 12.5px; font-weight: 700; color: #e11d48; cursor: pointer; transition: all 0.15s; white-space: nowrap; }
        .logout-btn:hover { background: #fff1f2; }

        /* Form Card */
        .form-card { background: #fff; border-radius: 14px; border: 1px solid #e5e7eb; padding: 24px; display: flex; flex-direction: column; gap: 18px; }
        .card-title { font-size: 15px; font-weight: 800; color: #1e2a3a; }
        .form-group { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 13px; font-weight: 700; color: #1e2a3a; }
        .form-input { padding: 11px 14px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 600; color: #1e2a3a; background: #f8f9fb; outline: none; transition: border-color 0.2s; }
        .form-input:focus { border-color: #7b8fcf; background: #fff; }
        .form-input::placeholder { color: #9ca3af; }
        .form-input:disabled { color: #9ca3af; cursor: not-allowed; }
        .pw-wrap { position: relative; }
        .pw-wrap .form-input { width: 100%; padding-right: 44px; }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #9ca3af; display: flex; align-items: center; }
        .eye-btn:hover { color: #7b8fcf; }
        .save-btn { padding: 11px 24px; background: #1e3a5f; color: #fff; border: none; border-radius: 10px; font-family: 'Nunito', sans-serif; font-size: 14px; font-weight: 800; cursor: pointer; transition: background 0.2s; align-self: flex-start; }
        .save-btn:hover { background: #2d4f80; }
        .save-btn:disabled { background: #9ca3af; cursor: not-allowed; }
        .msg { font-size: 13px; font-weight: 700; padding: 10px 14px; border-radius: 8px; }
        .msg.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .msg.error { background: #fff1f2; color: #e11d48; border: 1px solid #fecdd3; }
        .divider { height: 1px; background: #f0f2f5; }
      `}</style>

      <div className="page-root">
        <header className="topbar">
          <TopProgressBar loading={loadingProfile} />
          <div className="topbar-logo" onClick={() => navigate("/feed")}>
            <img src={logo} alt="IIPS Connect" />
            <span>IIPS Connect</span>
          </div>
          <button className="back-btn" onClick={() => navigate("/feed")}>
            ← Back to Feed
          </button>
        </header>

        <div className="body">
          {loadingProfile ? (
            <ProfileSkeleton />
          ) : (
            <>
              <div className="page-title">Profile Settings</div>

              {/* Profile Header */}
              {user && (
                <div className="profile-header">
                  <Avatar initials={getInitials(user.name)} size={60} />
                  <div className="profile-info">
                    <div className="profile-info-name">{user.name}</div>
                    <div className="profile-info-email">{user.email}</div>
                    <span
                      className="role-badge"
                      style={{
                        background: roleStyle.bg,
                        color: roleStyle.color,
                      }}
                    >
                      {roleStyle.text}
                    </span>
                    <div className="joined-text">
                      Joined{" "}
                      {new Date(user.created_at).toLocaleDateString("en-IN", {
                        month: "long",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <button className="logout-btn" onClick={handleLogout}>
                    🚪 Logout
                  </button>
                </div>
              )}

              {/* Edit Profile */}
              <div className="form-card">
                <div className="card-title">Edit Profile</div>
                <form
                  onSubmit={handleProfileSave}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input
                      className="form-input"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <input
                      className="form-input"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Your email"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Role</label>
                    {/* Role is not editable — set at signup */}
                    <input
                      className="form-input"
                      type="text"
                      value={user?.role || ""}
                      disabled
                    />
                  </div>
                  {profileMsg.text && (
                    <div className={`msg ${profileMsg.type}`}>
                      {profileMsg.text}
                    </div>
                  )}
                  <button
                    className="save-btn"
                    type="submit"
                    disabled={profileLoading}
                  >
                    {profileLoading ? "Saving..." : "Save Changes"}
                  </button>
                </form>
              </div>

              {/* Change Password */}
              <div className="form-card">
                <div className="card-title">Change Password</div>
                <form
                  onSubmit={handlePasswordSave}
                  style={{ display: "flex", flexDirection: "column", gap: 14 }}
                >
                  <div className="form-group">
                    <label className="form-label">Current Password</label>
                    <div className="pw-wrap">
                      <input
                        className="form-input"
                        type={showCurrent ? "text" : "password"}
                        placeholder="Enter current password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowCurrent((p) => !p)}
                      >
                        {showCurrent ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">New Password</label>
                    <div className="pw-wrap">
                      <input
                        className="form-input"
                        type={showNew ? "text" : "password"}
                        placeholder="Enter new password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="eye-btn"
                        onClick={() => setShowNew((p) => !p)}
                      >
                        {showNew ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                            <circle cx="12" cy="12" r="3" />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
                            <line x1="1" y1="1" x2="23" y2="23" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      className="form-input"
                      type="password"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                  {pwMsg.text && (
                    <div className={`msg ${pwMsg.type}`}>{pwMsg.text}</div>
                  )}
                  <button
                    className="save-btn"
                    type="submit"
                    disabled={pwLoading}
                  >
                    {pwLoading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
