import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

/* ── Particle Background ─────────────────────── */
function ParticleField() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }));

    const mouse = { x: -999, y: -999 };
    window.addEventListener("mousemove", e => { mouse.x = e.clientX; mouse.y = e.clientY; });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        const dx = mouse.x - p.x, dy = mouse.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          p.vx -= dx / dist * 0.3;
          p.vy -= dy / dist * 0.3;
        }
        p.vx *= 0.99; p.vy *= 0.99;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(134, 168, 231, ${p.opacity})`;
        ctx.fill();
      });

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(134, 168, 231, ${0.12 * (1 - d / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }} />;
}

/* ── Animated Counter ────────────────────────── */
function Counter({ target, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = target / 60;
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

/* ── Scroll Reveal Wrapper ───────────────────── */
function Reveal({ children, delay = 0, direction = "up" }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const transforms = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(-40px)", right: "translateX(40px)" };

  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "none" : transforms[direction],
      transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

/* ── Magnetic Button ─────────────────────────── */
function MagneticBtn({ children, onClick, primary }) {
  const ref = useRef(null);

  const handleMouseMove = (e) => {
    const btn = ref.current;
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
  };

  const handleMouseLeave = () => {
    ref.current.style.transform = "translate(0, 0)";
  };

  return (
    <button
      ref={ref}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        padding: "14px 36px",
        borderRadius: 50,
        border: primary ? "none" : "2px solid rgba(134,168,231,0.4)",
        background: primary ? "linear-gradient(135deg, #2a5298, #4a90e2)" : "rgba(255,255,255,0.04)",
        color: "#fff",
        fontSize: 15,
        fontWeight: 700,
        fontFamily: "'Sora', sans-serif",
        cursor: "pointer",
        transition: "transform 0.2s cubic-bezier(.23,1,.32,1), box-shadow 0.3s, background 0.3s",
        boxShadow: primary ? "0 0 32px rgba(74,144,226,0.35), 0 4px 16px rgba(0,0,0,0.3)" : "none",
        backdropFilter: "blur(8px)",
        letterSpacing: "0.3px",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = primary
          ? "0 0 48px rgba(74,144,226,0.6), 0 8px 24px rgba(0,0,0,0.4)"
          : "0 0 20px rgba(134,168,231,0.2)";
      }}
    >
      {children}
    </button>
  );
}

/* ── Feature Card ────────────────────────────── */
function FeatureCard({ icon, title, desc, delay, accent }) {
  const [hovered, setHovered] = useState(false);

  return (
    <Reveal delay={delay} direction="up">
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: hovered
            ? `linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))`
            : "rgba(255,255,255,0.03)",
          border: `1px solid ${hovered ? accent + "60" : "rgba(255,255,255,0.07)"}`,
          borderRadius: 20,
          padding: "32px 28px",
          backdropFilter: "blur(12px)",
          transition: "all 0.4s cubic-bezier(.23,1,.32,1)",
          transform: hovered ? "translateY(-6px)" : "none",
          boxShadow: hovered ? `0 20px 48px rgba(0,0,0,0.3), 0 0 0 1px ${accent}30` : "none",
          cursor: "default",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Glow spot */}
        {hovered && (
          <div style={{
            position: "absolute", top: -40, right: -40,
            width: 120, height: 120, borderRadius: "50%",
            background: accent + "18", filter: "blur(30px)",
            pointerEvents: "none",
          }} />
        )}
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: `linear-gradient(135deg, ${accent}30, ${accent}10)`,
          border: `1px solid ${accent}40`,
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 22, marginBottom: 18,
          transition: "transform 0.3s",
          transform: hovered ? "scale(1.1) rotate(-4deg)" : "none",
        }}>
          {icon}
        </div>
        <div style={{ fontSize: 17, fontWeight: 700, color: "#e8edf5", marginBottom: 10, fontFamily: "'Sora', sans-serif" }}>
          {title}
        </div>
        <div style={{ fontSize: 14, color: "#8a9ab8", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
          {desc}
        </div>
      </div>
    </Reveal>
  );
}

/* ── Glowing Orb ─────────────────────────────── */
function Orb({ top, left, color, size = 400 }) {
  return (
    <div style={{
      position: "absolute", top, left,
      width: size, height: size, borderRadius: "50%",
      background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
      filter: "blur(60px)",
      pointerEvents: "none", zIndex: 0,
      animation: "orbFloat 8s ease-in-out infinite",
    }} />
  );
}

/* ── Typewriter ──────────────────────────────── */
function Typewriter({ words }) {
  const [idx, setIdx] = useState(0);
  const [text, setText] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const word = words[idx];
    let timeout;
    if (!deleting && text === word) {
      timeout = setTimeout(() => setDeleting(true), 2000);
    } else if (deleting && text === "") {
      setDeleting(false);
      setIdx(i => (i + 1) % words.length);
    } else {
      timeout = setTimeout(() => {
        setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      }, deleting ? 50 : 80);
    }
    return () => clearTimeout(timeout);
  }, [text, deleting, idx, words]);

  return (
    <span style={{ color: "#4a90e2", display: "inline" }}>
      {text}
      <span style={{ animation: "blink 1s step-end infinite", opacity: 1 }}>|</span>
    </span>
  );
}

/* ── Testimonial Card ────────────────────────── */
function TestimonialCard({ name, role, roleColor, quote, delay }) {
  return (
    <Reveal delay={delay} direction="up">
      <div style={{
        background: "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.07)",
        borderRadius: 18,
        padding: "28px 24px",
        backdropFilter: "blur(8px)",
        position: "relative",
      }}>
        <div style={{ fontSize: 36, color: "#4a90e2", lineHeight: 1, marginBottom: 12, fontFamily: "Georgia, serif" }}>"</div>
        <p style={{ fontSize: 14, color: "#9aabb8", lineHeight: 1.75, fontFamily: "'DM Sans', sans-serif", marginBottom: 20, fontStyle: "italic" }}>
          {quote}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "linear-gradient(135deg, #2a5298, #4a90e2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif",
          }}>
            {name.split(" ").map(w => w[0]).join("")}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#e8edf5", fontFamily: "'Sora', sans-serif" }}>{name}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: roleColor, marginTop: 2 }}>{role}</div>
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ── MAIN LANDING PAGE ───────────────────────── */
export default function LandingPage() {
  const navigate = useNavigate();
  const [scrollY, setScrollY] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: "🎓", title: "Academic Community", desc: "Connect with students, faculty, and alumni from IIPS. Share knowledge, discuss ideas, and grow together.", accent: "#4a90e2" },
    { icon: "🤝", title: "Alumni Mentorship", desc: "Get guidance from industry professionals who walked the same halls. Real mentors, real careers, real impact.", accent: "#a78bfa" },
    { icon: "📢", title: "Campus Announcements", desc: "Never miss an exam date, event, or opportunity. Faculty post directly — you get notified instantly.", accent: "#34d399" },
    { icon: "🏆", title: "Trending Discussions", desc: "See what's buzzing on campus. From hackathons to placement drives — stay ahead of the curve.", accent: "#f59e0b" },
    { icon: "📅", title: "Events & Activities", desc: "Discover upcoming tech talks, networking nights, and college events all in one place.", accent: "#fb7185" },
    { icon: "🔒", title: "Role-Based Access", desc: "Student, Faculty, or Alumni — your experience is tailored to your role with appropriate permissions.", accent: "#38bdf8" },
  ];

  const testimonials = [
    { name: "Priya Sharma", role: "Student · CS 3rd Year", roleColor: "#34d399", quote: "IIPS Connect completely changed how I interact with seniors and alumni. Got my internship through a connection I made here!", delay: 0 },
    { name: "Dr. Anita Verma", role: "Faculty · Computer Science", roleColor: "#60a5fa", quote: "Finally a platform where I can post announcements and actually see students engage with them the same day.", delay: 100 },
    { name: "Rahul Verma", role: "Alumni · SDE at Microsoft", roleColor: "#f59e0b", quote: "I love giving back. The mentorship feature lets me connect with juniors who are exactly where I was 4 years ago.", delay: 200 },
  ];

  const navStyle = {
    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
    padding: "0 48px", height: 64,
    display: "flex", alignItems: "center", justifyContent: "space-between",
    background: scrollY > 40 ? "rgba(6,11,22,0.85)" : "transparent",
    backdropFilter: scrollY > 40 ? "blur(16px)" : "none",
    borderBottom: scrollY > 40 ? "1px solid rgba(255,255,255,0.06)" : "none",
    transition: "all 0.4s ease",
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        body { background: #060b16; color: #e8edf5; font-family: 'DM Sans', sans-serif; overflow-x: hidden; }

        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
        @keyframes orbFloat {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(20px, -30px) scale(1.05); }
          66% { transform: translate(-15px, 20px) scale(0.95); }
        }
        @keyframes heroGlow {
          0%, 100% { opacity: 0.5; } 50% { opacity: 1; }
        }
        @keyframes badgePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(74,144,226,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(74,144,226,0); }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50% { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .gradient-text {
          background: linear-gradient(135deg, #e8edf5 0%, #4a90e2 50%, #a78bfa 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .shimmer-text {
          background: linear-gradient(90deg, #e8edf5 0%, #4a90e2 25%, #a78bfa 50%, #4a90e2 75%, #e8edf5 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #060b16; }
        ::-webkit-scrollbar-thumb { background: #2a3a5a; border-radius: 3px; }
      `}</style>

      <ParticleField />

      {/* NAV */}
      <nav style={navStyle}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "linear-gradient(135deg, #2a5298, #4a90e2)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 800, color: "#fff", fontFamily: "'Sora', sans-serif",
          }}>IC</div>
          <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, fontSize: 16, color: "#e8edf5" }}>
            IIPS Connect
          </span>
        </div>

        <div style={{ display: "flex", gap: 32, alignItems: "center" }}>
          {["Features", "Community", "About"].map(item => (
            <a key={item} href={`#${item.toLowerCase()}`} style={{
              color: "#8a9ab8", fontSize: 14, fontWeight: 600,
              textDecoration: "none", fontFamily: "'Sora', sans-serif",
              transition: "color 0.2s",
            }}
            onMouseEnter={e => e.target.style.color = "#e8edf5"}
            onMouseLeave={e => e.target.style.color = "#8a9ab8"}
            >{item}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button onClick={() => navigate("/login")} style={{
            padding: "8px 20px", borderRadius: 50,
            border: "1px solid rgba(255,255,255,0.12)",
            background: "transparent", color: "#e8edf5",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
            fontFamily: "'Sora', sans-serif", transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = "rgba(74,144,226,0.5)"}
          onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"}
          >Sign In</button>
          <button onClick={() => navigate("/signup")} style={{
            padding: "8px 20px", borderRadius: 50,
            border: "none",
            background: "linear-gradient(135deg, #2a5298, #4a90e2)",
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            fontFamily: "'Sora', sans-serif",
            boxShadow: "0 0 20px rgba(74,144,226,0.3)",
            transition: "all 0.2s",
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = "0 0 32px rgba(74,144,226,0.6)"}
          onMouseLeave={e => e.currentTarget.style.boxShadow = "0 0 20px rgba(74,144,226,0.3)"}
          >Get Started</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: "120px 24px 80px", overflow: "hidden" }}>
        <Orb top="-100px" left="-150px" color="rgba(42,82,152,0.25)" size={500} />
        <Orb top="200px" left="60%" color="rgba(167,139,250,0.15)" size={400} />
        <Orb top="50%" left="10%" color="rgba(52,211,153,0.1)" size={300} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 800 }}>

          {/* Headline */}
          <h1 style={{
            fontFamily: "'Sora', sans-serif",
            fontSize: "clamp(40px, 7vw, 76px)",
            fontWeight: 800,
            lineHeight: 1.1,
            marginBottom: 12,
            letterSpacing: "-1.5px",
          }}>
            <span className="gradient-text">Where IIPS</span>
            <br />
            <Typewriter words={["Connects.", "Learns.", "Grows.", "Mentors.", "Thrives."]} />
          </h1>

          <p style={{
            fontSize: "clamp(15px, 2vw, 18px)",
            color: "#8a9ab8", lineHeight: 1.8,
            maxWidth: 560, margin: "24px auto 48px",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            The all-in-one community platform for IIPS students, faculty, and alumni.
            Share ideas, find mentors, discover events — all in one place.
          </p>

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <MagneticBtn primary onClick={() => navigate("/signup")}>
              🚀 Join the Community
            </MagneticBtn>
            <MagneticBtn onClick={() => navigate("/login")}>
              Sign In →
            </MagneticBtn>
          </div>
        </div>

        {/* Floating UI preview cards */}
        <div style={{ position: "absolute", right: "5%", top: "25%", opacity: 0.6, display: "none" }} className="preview-cards">
        </div>

      </section>

      {/* STATS */}
      <section style={{ padding: "60px 24px", position: "relative", zIndex: 1 }}>
        <div style={{
          maxWidth: 900, margin: "0 auto",
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: 1,
          background: "rgba(255,255,255,0.05)",
          borderRadius: 20,
          overflow: "hidden",
          border: "1px solid rgba(255,255,255,0.07)",
        }}>
          {[
            { num: 500, suffix: "+", label: "Active Members" },
            { num: 120, suffix: "+", label: "Alumni Mentors" },
            { num: 1200, suffix: "+", label: "Posts Shared" },
            { num: 48, suffix: "+", label: "Events Hosted" },
          ].map((s, i) => (
            <div key={i} style={{
              padding: "36px 24px", textAlign: "center",
              background: "rgba(6,11,22,0.6)",
              borderRight: i < 3 ? "1px solid rgba(255,255,255,0.05)" : "none",
            }}>
              <div style={{
                fontSize: 40, fontWeight: 800,
                fontFamily: "'Sora', sans-serif",
                background: "linear-gradient(135deg, #4a90e2, #a78bfa)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              }}>
                <Counter target={s.num} suffix={s.suffix} />
              </div>
              <div style={{ fontSize: 13, color: "#8a9ab8", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section id="features" style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <Orb top="0" left="40%" color="rgba(167,139,250,0.1)" size={500} />
        <div style={{ maxWidth: 1080, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{
                display: "inline-block", padding: "4px 14px",
                borderRadius: 2, border: "none",
                fontSize: 15, fontWeight: 700, color: "#a78bfa",
                fontFamily: "'Sora', sans-serif", letterSpacing: "1px",
                marginBottom: 16,
              }}>
                EVERYTHING YOU NEED
              </div>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.5px",
                color: "#e8edf5", lineHeight: 1.2,
              }}>
                Built for the <span className="shimmer-text">IIPS community</span>
              </h2>
              <p style={{ fontSize: 15, color: "#8a9ab8", marginTop: 14, fontFamily: "'DM Sans', sans-serif" }}>
                Every feature designed around how students, faculty, and alumni actually interact.
              </p>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
            {features.map((f, i) => (
              <FeatureCard key={i} {...f} delay={i * 80} />
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="community" style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 64 }}>
              <div style={{
                display: "inline-block", padding: "4px 14px",
                fontSize: 15, fontWeight: 700, color: "#34d399",
                fontFamily: "'Sora', sans-serif", letterSpacing: "1px",
                marginBottom: 16,
              }}>
                HOW IT WORKS?
              </div>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.5px",
                color: "#e8edf5", lineHeight: 1.2,
              }}>
                Three steps to get connected
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { step: "01", title: "Sign up with your role", desc: "Create your account as a Student, Faculty, or Alumni. Your experience is personalized from day one.", icon: "👤", color: "#4a90e2" },
              { step: "02", title: "Explore the community", desc: "Browse the feed, discover trending posts, connect with alumni mentors, and check upcoming events.", icon: "🌐", color: "#a78bfa" },
              { step: "03", title: "Grow together", desc: "Post updates, comment, like, save posts, send connection requests, and get mentored by professionals.", icon: "🚀", color: "#34d399" },
            ].map((item, i) => (
              <Reveal key={i} delay={i * 100} direction={i % 2 === 0 ? "left" : "right"}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 40,
                  padding: "40px",
                  flexDirection: i % 2 === 0 ? "row" : "row-reverse",
                  background: "rgba(255,255,255,0.02)",
                  borderRadius: 20,
                  border: "1px solid rgba(255,255,255,0.05)",
                  marginBottom: 16,
                }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: 20, flexShrink: 0,
                    background: `linear-gradient(135deg, ${item.color}30, ${item.color}10)`,
                    border: `1px solid ${item.color}40`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 32,
                  }}>
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: item.color, letterSpacing: "2px", marginBottom: 8, fontFamily: "'Sora', sans-serif" }}>
                      STEP {item.step}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: "#e8edf5", marginBottom: 10, fontFamily: "'Sora', sans-serif" }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 14, color: "#8a9ab8", lineHeight: 1.7, fontFamily: "'DM Sans', sans-serif" }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="about" style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <Orb top="0" left="-100px" color="rgba(74,144,226,0.1)" size={400} />
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <Reveal>
            <div style={{ textAlign: "center", marginBottom: 56 }}>
              <div style={{
                display: "inline-block", padding: "4px 14px",
                fontSize: 15, fontWeight: 700, color: "#f59e0b",
                fontFamily: "'Sora', sans-serif", letterSpacing: "1px",
                marginBottom: 16,
              }}>
                COMMUNITY VOICES...
              </div>
              <h2 style={{
                fontFamily: "'Sora', sans-serif", fontWeight: 800,
                fontSize: "clamp(28px, 4vw, 44px)", letterSpacing: "-0.5px",
                color: "#e8edf5",
              }}>
                Loved by the IIPS family
              </h2>
            </div>
          </Reveal>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} {...t} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA BANNER */}
      <section style={{ padding: "80px 24px", position: "relative", zIndex: 1 }}>
        <Reveal>
          <div style={{
            maxWidth: 800, margin: "0 auto", textAlign: "center",
            padding: "64px 40px",
            background: "linear-gradient(135deg, rgba(42,82,152,0.2), rgba(167,139,250,0.1))",
            border: "1px solid rgba(74,144,226,0.2)",
            borderRadius: 28,
            backdropFilter: "blur(12px)",
            position: "relative", overflow: "hidden",
          }}>
            {/* Background decoration */}
            <div style={{
              position: "absolute", top: -60, right: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: "rgba(74,144,226,0.1)", filter: "blur(40px)",
              pointerEvents: "none",
            }} />
            <div style={{
              position: "absolute", bottom: -60, left: -60,
              width: 200, height: 200, borderRadius: "50%",
              background: "rgba(167,139,250,0.1)", filter: "blur(40px)",
              pointerEvents: "none",
            }} />

            <div style={{ fontSize: 40, marginBottom: 16 }}>🎓</div>
            <h2 style={{
              fontFamily: "'Sora', sans-serif", fontWeight: 800,
              fontSize: "clamp(24px, 4vw, 40px)", color: "#e8edf5",
              letterSpacing: "-0.5px", marginBottom: 16, lineHeight: 1.2,
            }}>
              Ready to join your<br />
              <span className="gradient-text">college community?</span>
            </h2>
            <p style={{ fontSize: 15, color: "#8a9ab8", marginBottom: 40, fontFamily: "'DM Sans', sans-serif", lineHeight: 1.7 }}>
              Whether you're a student looking for guidance, a faculty member<br />
              sharing knowledge, or an alumni giving back — IIPS Connect is for you.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <MagneticBtn primary onClick={() => navigate("/signup")}>
                Create Free Account
              </MagneticBtn>
              <MagneticBtn onClick={() => navigate("/login")}>
                I already have an account
              </MagneticBtn>
            </div>
          </div>
        </Reveal>
      </section>

      {/* FOOTER */}
      <footer style={{
        padding: "40px 24px",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        position: "relative", zIndex: 1,
      }}>
        <div style={{
          maxWidth: 1080, margin: "0 auto",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          flexWrap: "wrap", gap: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 7,
              background: "linear-gradient(135deg, #2a5298, #4a90e2)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontWeight: 800, color: "#fff",
            }}>IC</div>
            <span style={{ fontFamily: "'Sora', sans-serif", fontWeight: 700, color: "#8a9ab8", fontSize: 14 }}>
              IIPS Connect
            </span>
          </div>
          <p style={{ fontSize: 13, color: "#4a5568", fontFamily: "'DM Sans', sans-serif" }}>
            Built with ❤️ for the IIPS community · {new Date().getFullYear()}
          </p>
          <div style={{ display: "flex", gap: 24 }}>
            {["Privacy", "Terms", "Contact"].map(item => (
              <a key={item} href="#" style={{
                fontSize: 13, color: "#4a5568", textDecoration: "none",
                fontFamily: "'DM Sans', sans-serif", transition: "color 0.2s",
              }}
              onMouseEnter={e => e.target.style.color = "#8a9ab8"}
              onMouseLeave={e => e.target.style.color = "#4a5568"}
              >{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </>
  );
}