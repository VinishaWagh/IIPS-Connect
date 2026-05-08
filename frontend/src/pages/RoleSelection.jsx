import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";
import logo from "../assets/IIPS_Connect_logo.png";

function RoleSelection() {
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromUrl = params.get("token");

    if (tokenFromUrl) {
      localStorage.setItem("token", tokenFromUrl);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    API.get("/users/profile")
      .then((res) => {
        setDisplayName(res.data.name || "");
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!displayName.trim() || !role) {
      alert("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      await API.put("/users/profile", {
        name: displayName,
        role,
      });
      navigate("/feed");
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { width: 100%; min-height: 100vh; }

        .role-page {
          font-family: 'Nunito', sans-serif;
          min-height: 100vh;
          background: linear-gradient(135deg, #f5f6fa 0%, #eef2f8 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .role-card {
          background: #ffffff;
          border-radius: 32px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.12);
          padding: 48px;
          max-width: 500px;
          width: 100%;
          animation: slideUp 0.5s ease;
        }

        .role-header {
          text-align: center;
          margin-bottom: 36px;
        }

        .role-logo {
          width: 80px;
          height: 60px;
          margin-bottom: 20px;
        }

        .role-title {
          font-size: 28px;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 8px;
          letter-spacing: 0.5px;
        }

        .role-subtitle {
          font-size: 14px;
          color: #64748b;
          line-height: 1.6;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-label {
          display: block;
          font-size: 14px;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 10px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .form-input,
        .form-select {
          width: 100%;
          padding: 14px 18px;
          border: 1.5px solid #e5e7eb;
          border-radius: 24px;
          font-family: 'Nunito', sans-serif;
          font-size: 14px;
          font-weight: 600;
          color: #0f172a;
          background: #ffffff;
          outline: none;
          transition: all 0.2s;
        }

        .form-input::placeholder { color: #cbd5e1; }

        .form-input:focus,
        .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-select {
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23cbd5e1' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 40px;
        }

        .form-select option {
          color: #0f172a;
          padding: 8px 0;
        }

        .role-options {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-top: 12px;
        }

        .role-option {
          padding: 16px 18px;
          border: 1.5px solid #e5e7eb;
          border-radius: 18px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          font-family: 'Nunito', sans-serif;
          font-weight: 600;
          color: #0f172a;
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .role-option:hover {
          border-color: #3b82f6;
          background: #eff6ff;
        }

        .role-option input {
          width: 18px;
          height: 18px;
          accent-color: #3b82f6;
          cursor: pointer;
        }

        .role-option-content {
          flex: 1;
        }

        .role-option-title {
          font-size: 14px;
          font-weight: 700;
        }

        .role-option-desc {
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }

        .submit-btn {
          width: 100%;
          padding: 15px;
          background: #3b82f6;
          color: #ffffff;
          border: none;
          border-radius: 50px;
          font-family: 'Nunito', sans-serif;
          font-size: 15px;
          font-weight: 800;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 12px;
        }

        .submit-btn:hover {
          background: #2563eb;
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(37, 99, 235, 0.3);
        }

        .submit-btn:active {
          transform: translateY(0);
        }

        .submit-btn:disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          transform: none;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 600px) {
          .role-card {
            padding: 32px 24px;
          }
          .role-title {
            font-size: 24px;
          }
        }
      `}</style>

      <div className="role-page">
        <div className="role-card">
          <div className="role-header">
            <img src={logo} alt="IIPS Connect" className="role-logo" />
            <h1 className="role-title">Complete Your Profile</h1>
            <p className="role-subtitle">
              Let us know your name and role so we can personalize your experience.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Display Name</label>
              <input
                type="text"
                className="form-input"
                placeholder="Enter your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Your Role</label>
              <div className="role-options">
                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="student"
                    checked={role === "student"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-option-content">
                    <div className="role-option-title">Student</div>
                    <div className="role-option-desc">
                      Currently studying at IIPS
                    </div>
                  </div>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="alumni"
                    checked={role === "alumni"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-option-content">
                    <div className="role-option-title">Alumni</div>
                    <div className="role-option-desc">
                      IIPS graduate and mentor
                    </div>
                  </div>
                </label>

                <label className="role-option">
                  <input
                    type="radio"
                    name="role"
                    value="faculty"
                    checked={role === "faculty"}
                    onChange={(e) => setRole(e.target.value)}
                  />
                  <div className="role-option-content">
                    <div className="role-option-title">Faculty</div>
                    <div className="role-option-desc">
                      Teacher or staff member
                    </div>
                  </div>
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={submitting || !displayName.trim() || !role}
            >
              {submitting ? "Setting up..." : "Continue to Feed"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    minHeight: "100vh",
  },
};

export default RoleSelection;
