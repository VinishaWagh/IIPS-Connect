import { useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import logo from "../assets/IIPS_Connect_logo.png";
import login_img from "../assets/login_img.jpg";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const res = await API.post("/auth/forgot-password", { email });
      setMessage(res.data?.message || "Password reset link sent to your email!");
    } catch (error) {
      console.error(error.response?.data || error.message);
      setMessage(error.response?.data?.message || "Failed to send reset link. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>
        {`
            @import url('https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap');

            *{box-sizing: border-box; margin: 0; padding: 0;}

            html, body, #root{
            width: 100%;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            }

            .forgot-page{
            font-family: 'Nunito', sans-serif;
            min-height: 100vh;
            background: #f5f6fa;
            display: flex;
            flex-direction: column;
            }

            .nav{
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 18px 48px;
            background: #fff;
            }

            .nav-logo{
            display: flex;
            align-items: center;
            cursor: pointer;
            }

            .nav-logo img {
            width: 70px;
            height: 50px;
            }

            .nav-links{
            display: flex;
            align-items: center;
            gap: 32px;
            list-style: none;
            }

            .nav-links li a{
            text-decoration: none;
            color: #6b7280;
            font-size: 14px;
            font-weight: 600;
            }

            .nav-lang{
            display: flex;
            align-items: center;
            color: #6b7280;
            gap: 4px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            }

            .nav-right{
            display: flex;
            align-items: center;
            gap: 20px;
            }

            .nav-signup{
            font-size: 14px;
            font-weight: 700;
            color: #fff;
            background: #3d4a6b;
            border-radius: 6px;
            padding: 5px 12px;
            text-decoration: none;
            align-items: center;
            justify-content: center;
            letter-spacing: 0.5px;
            }

            .main{
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 40px 48px;
            gap: 200px;
            }

            .form-side{
            flex: 0 0 400px;
            max-width: 400px;
            }

            .welcome-title{
            font-size: 28px;
            font-weight: 800;
            color: #1e2a3a;
            letter-spacing: 2px;
            margin-bottom: 8px;
            }

            .subtitle{
            font-size: 14px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 32px;
            }

            .back-link{
            color: #7b8fcf;
            text-decoration: none;
            font-weight: 700;
            }

            .back-link:hover{ text-decoration: underline;}

            .field-label{
            display: block;
            font-size: 14px;
            font-weight: 700;
            color: #1e2a3a;
            margin-bottom: 8px;
            }

            .input-wrap{
            position: relative;
            margin-bottom: 20px;
            }
            .input-wrap input{
            width: 100%;
            padding: 14px 18px;
            border: 1.5px solid #dde1f0;
            border-radius: 30px;
            font-family: 'Nunito', sans-serif;
            font-size: 14px;
            font-weight: 600;
            color: #1e2a3a;
            background: #fff;
            transition: border-color 0.2s;
            }

            .input-wrap input::placeholder {
            color: #b5bcd4;
            }
            .input-wrap input:focus { border-color: #7b8fcf;}

            .reset-btn{
            width: 100%;
            padding: 15px;
            background: #7b8fcf;
            color: #fff;
            border: none;
            border-radius: 50px;
            font-family: 'Nunito', sans-serif;
            font-size: 16px;
            font-weight: 800;
            letter-spacing: 0.5px;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            margin-bottom: 28px;
            }
            .reset-btn:hover { background: #6a7dc0; }
            .reset-btn:active { transform: scale(0.97); }
            .reset-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
            transform: none;
            }

            .message{
            text-align: center;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 20px;
            padding: 12px;
            border-radius: 8px;
            }
            .message.success{
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
            }
            .message.error{
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
            }

            .image-side{
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            max-width: 520px;
            }
            .image-side img{
            width: 100%;
            height: 480px;
            object-fit: cover;
            border-radius: 24px;
            }

            @media (max-width: 900px) {
          .image-side { display: none; }
          .main { justify-content: center; padding: 40px 24px; }
          }
        `}
      </style>

      <div className="forgot-page">
        {/* Navbar */}
        <nav className="nav">
          {/* Logo */}
          <div className="nav-logo">
            <img src={logo} alt="Logo" height="36" />
          </div>
          {/* Links */}
          <ul className="nav-links">
            <li>
              <a href="#">Help</a>
            </li>
            <li>
              <a href="#">Contact Us</a>
            </li>
            <li>
              <span className="nav-lang">
                English
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </li>
          </ul>
          {/* Nav Right */}
          <div className="nav-right">
            <a href="/signup" className="nav-signup">
              Sign Up
            </a>
          </div>
        </nav>

        {/* Main Section */}
        <div className="main">
          <div className="form-side">
            <h1 className="welcome-title">FORGOT PASSWORD?</h1>
            <p className="subtitle">
              No worries! Enter your email and we'll send you a reset link. <br />
              <a href="/login" className="back-link">Back to Login</a>
            </p>

            {message && (
              <div className={`message ${message.includes("sent") ? "success" : "error"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleForgotPassword}>
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <button type="submit" className="reset-btn" disabled={isLoading}>
                {isLoading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
          </div>

          {/* Image Side */}
          <div className="image-side">
            <img src={login_img} alt="Forgot password visual" />
          </div>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;