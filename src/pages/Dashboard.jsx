import { useNavigate } from "react-router-dom"

const ForkliftIcon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Gövde */}
    <rect x="18" y="28" width="28" height="18" rx="3" fill="white" fillOpacity="0.9"/>
    {/* Kabin */}
    <rect x="30" y="20" width="16" height="14" rx="2" fill="white" fillOpacity="0.7"/>
    {/* Cam */}
    <rect x="32" y="22" width="12" height="8" rx="1" fill="white" fillOpacity="0.3"/>
    {/* Ön teker */}
    <circle cx="26" cy="48" r="6" fill="white" fillOpacity="0.9"/>
    <circle cx="26" cy="48" r="3" fill="white" fillOpacity="0.4"/>
    {/* Arka teker */}
    <circle cx="44" cy="48" r="6" fill="white" fillOpacity="0.9"/>
    <circle cx="44" cy="48" r="3" fill="white" fillOpacity="0.4"/>
    {/* Fork direği */}
    <rect x="10" y="16" width="4" height="30" rx="1" fill="white" fillOpacity="0.8"/>
    {/* Forklar */}
    <rect x="6" y="42" width="18" height="3" rx="1" fill="white" fillOpacity="0.9"/>
    <rect x="6" y="36" width="18" height="3" rx="1" fill="white" fillOpacity="0.9"/>
    {/* Egzoz / detay */}
    <rect x="42" y="18" width="3" height="8" rx="1" fill="white" fillOpacity="0.5"/>
  </svg>
)

const WrenchIcon = () => (
  <svg width="32" height="32" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M48 8C42 8 38 12 38 18C38 20 38.5 21.8 39.5 23.3L12 50.5C10.5 52 10.5 54.5 12 56C13.5 57.5 16 57.5 17.5 56L44.7 28.5C46.2 29.5 48 30 50 30C56 30 60 26 60 20C60 18.5 59.7 17 59.2 15.7L52 22.9L48.5 19.4L55.7 12.2C54.4 11.7 51.8 11 50 11L48 8Z" fill="white" fillOpacity="0.9"/>
    <circle cx="16" cy="52" r="4" fill="white" fillOpacity="0.6"/>
  </svg>
)

export default function Dashboard() {
  const navigate = useNavigate()

  const pages = [
    {
      path: "/maintenance",
      label: "Bakım Teklifi",
      desc: "Periyodik bakım maliyeti hesapla",
      color: "#0a7",
      icon: <WrenchIcon />,
    },
    {
      path: "/rental",
      label: "Kiralama Teklifi",
      desc: "Filo kiralama senaryoları oluştur",
      color: "#003366",
      icon: <ForkliftIcon />,
    },
  ]

  return (
    <div style={{ padding: 24, maxWidth: 500, margin: "40px auto", fontFamily: "sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <h1 style={{ fontSize: 22, color: "#003366", marginBottom: 6 }}>Hyundai Forklift</h1>
        <p style={{ color: "#888", fontSize: 14 }}>Teklif Yönetim Sistemi</p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {pages.map(p => (
          <button key={p.path} onClick={() => navigate(p.path)}
            style={{
              padding: "20px 24px",
              borderRadius: 14,
              border: "none",
              cursor: "pointer",
              background: p.color,
              color: "white",
              textAlign: "left",
              display: "flex",
              alignItems: "center",
              gap: 16,
              boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
            }}>
            <div style={{
              width: 52, height: 52, borderRadius: 12,
              background: "rgba(255,255,255,0.15)",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>
              {p.icon}
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{p.label}</div>
              <div style={{ fontSize: 13, opacity: 0.75, marginTop: 3 }}>{p.desc}</div>
            </div>
            <div style={{ marginLeft: "auto", fontSize: 20, opacity: 0.5 }}>›</div>
          </button>
        ))}
      </div>
    </div>
  )
}
