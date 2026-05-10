import { useEffect, useState } from "react";
import API from "../api/api";
import { useNavigate } from "react-router-dom";
import logo from "../assets/IIPS_Connect_logo.png";
import login_img from "../assets/login_img.jpg";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (token) {
      localStorage.setItem("token", token);
      window.history.replaceState({}, document.title, "/login");
      navigate("/feed");
    }
  }, [navigate]);

  const handleGoogleSignIn = () => {
    window.location.href = "https://iips-connect-production.up.railway.app/api/auth/google";
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/auth/login", {
        email,
        password,
      });

      localStorage.setItem("token", res.data.token);
      navigate("/feed");
    } catch (error) {
      console.log(error.response?.data);
      alert("Login failed");
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

            .login-page{
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

            .signup-text{
            font-size: 14px;
            color: #6b7280;
            font-weight: 600;
            margin-bottom: 32px;
            }

            .signup-text a{
            color: #7b8fcf;
            text-decoration: none;
            font-weight: 700;
            }

            .signup-text a:hover{ text-decoration: underline;}

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

            .forgot-password{
            font-size: 13px;
            font-weight: 700;
            color: #7b8fcf;
            text-decoration: none;
            }

            .forgot-password:hover {
            text-decoration: underline;
            }

            .signin-btn{
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
            .signin-btn:hover { background: #6a7dc0; }
            .signin-btn:active { transform: scale(0.97); }

            .divider{
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 24px;
            }

            .divider-line {
            flex: 1;
            height: 1px;
            background: #dde1f0;
            }

            .divider-text{
            font-size: 13px;
            font-weight: 600;
            color: #9ca3af;
            white-space: nowrap;
            }

            .social-btns{
            display: flex;
            }

            .social-btn{
            flex: 1;
            padding: 13px;
            gap: 13px;
            border: 1.5px solid #dde1f0;
            border-radius: 10px;
            background: #fff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: border-color 0.2s, box-shadow 0.2s;
            color: #1e2a3a;
            }

            .social-btn:hover{
            border-color: #7b8fcf;
            box-shadow: 0 2px 8px rgba(123, 143, 207, 0.15);
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

      <div className="login-page">
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
            <h1 className="welcome-title">WELCOME BACK!</h1>
            <p className="signup-text">
              Don't have an account? <a href="#">Sign Up</a>
            </p>

            <form onSubmit={handleLogin}>
              <label className="field-label">Email</label>
              <div className="input-wrap">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  required
                />
              </div>

              <label className="field-label">Password</label>
              <div className="input-wrap">
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  required
                />
              </div>

              <a href="/forgot-password" className="forgot-password">
                Forgot password?
              </a>

              <button type="submit" className="signin-btn">
                Sign In
              </button>
            </form>
            <div className="divider">
              <div className="divider-line"></div>
              <span className="divider-text">or continue with</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-btns">
              {/* Google Icon */}
              <button
                type="button"
                aria-label="Sign in with Google"
                className="social-btn"
                onClick={handleGoogleSignIn}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign in with Google
              </button>
            </div>
          </div>

          <div className="image-side">
            <img src={login_img} alt="Login_image" />
          </div>
        </div>
      </div>
    </>
  );
}

export default Login;
