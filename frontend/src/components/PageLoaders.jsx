export function TopProgressBar({ loading }) {
  if (!loading) return null;
  return (
    <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: 4, background: "#e5e7eb" }}>
      <div
        style={{
          width: "65%",
          height: "100%",
          background: "#1e3a5f",
          animation: "progressBar 1.5s ease-in-out infinite",
        }}
      />
      <style>{`
        @keyframes progressBar {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}

export function PostsPageSkeleton() {
  return Array.from({ length: 2 }).map((_, idx) => (
    <div
      key={idx}
      style={{
        background: "#fff",
        borderRadius: 14,
        border: "1px solid #e5e7eb",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 12,
      }}
    >
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#e5e7eb" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: 12, width: "60%", background: "#e5e7eb", borderRadius: 6, marginBottom: 6 }} />
          <div style={{ height: 10, width: "40%", background: "#e5e7eb", borderRadius: 6 }} />
        </div>
      </div>
      <div style={{ height: 12, width: "100%", background: "#e5e7eb", borderRadius: 6 }} />
      <div style={{ height: 12, width: "90%", background: "#e5e7eb", borderRadius: 6 }} />
      <div style={{ height: 12, width: "80%", background: "#e5e7eb", borderRadius: 6 }} />
    </div>
  ));
}

export function NotificationsSkeleton() {
  return Array.from({ length: 3 }).map((_, idx) => (
    <div
      key={idx}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        background: "#fff",
        borderRadius: 12,
        border: "1px solid #e5e7eb",
        padding: 14,
      }}
    >
      <div style={{ width: 34, height: 34, borderRadius: 12, background: "#e5e7eb" }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ height: 12, width: "70%", background: "#e5e7eb", borderRadius: 6, marginBottom: 6 }} />
        <div style={{ height: 10, width: "40%", background: "#e5e7eb", borderRadius: 6 }} />
      </div>
    </div>
  ));
}

export function ProfileSkeleton() {
  return (
    <div style={{ display: "grid", gap: 16, padding: 24 }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#e5e7eb" }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ height: 14, width: "45%", background: "#e5e7eb", borderRadius: 6, marginBottom: 8 }} />
          <div style={{ height: 10, width: "30%", background: "#e5e7eb", borderRadius: 6 }} />
        </div>
      </div>
      {Array.from({ length: 4 }).map((_, idx) => (
        <div key={idx} style={{ height: 46, width: "100%", background: "#e5e7eb", borderRadius: 12 }} />
      ))}
    </div>
  );
}
