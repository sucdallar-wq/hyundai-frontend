import { useNavigate } from "react-router-dom"

export default function Dashboard() {
  const navigate = useNavigate()

  const pages = [
    { path: "/maintenance", label: "Bakım Teklifi", color: "#0a7", icon: "🔧" },
    { path: "/rental", label: "Kiralama Teklifi", color: "#003366", icon: "🚛" },
    //  geçici kaldırma { path: "/offers", label: "Teklifler", color: "#e67e22", icon: "📋" },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 600, margin: "40px auto", fontFamily: "sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: 8, fontSize: 22, color: "#003366" }}>
        Hyundai Forklift
      </h1>
      <p style={{ textAlign: "center", color: "#666", marginBottom: 32, fontSize: 14 }}>
        Teklif Yönetim Sistemi
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {pages.map(p => (
          <button key={p.path} onClick={() => navigate(p.path)}
            style={{
              padding: "18px 24px",
              borderRadius: 12,
              border: "none",
              cursor: "pointer",
              background: p.color,
              color: "white",
              fontSize: 16,
              fontWeight: 600,
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}>
            <span style={{ fontSize: 24 }}>{p.icon}</span>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}