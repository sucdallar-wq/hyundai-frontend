import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Rental from "./pages/Rental"
import Maintenance from "./pages/Maintenance"
import Offers from "./pages/Offers"

function PrivateRoute({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/" replace />
}

function NavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const token = localStorage.getItem("token")

  if (!token || location.pathname === "/") return null

  const logout = () => {
    localStorage.removeItem("token")
    navigate("/", { replace: true })
  }

  const navItems = [
    { path: "/dashboard", label: "Ana Sayfa" },
    { path: "/maintenance", label: "Bakım" },
    { path: "/rental", label: "Kiralama" },
    // { path: "/offers", label: "Teklifler" },
  ]

  return (
    <div style={{
      background: "#003366",
      padding: "10px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      flexWrap: "wrap",
      gap: 8,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {navItems.map(item => (
          <button key={item.path}
            onClick={() => navigate(item.path)}
            style={{
              padding: "6px 12px",
              borderRadius: 6,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
              background: location.pathname === item.path ? "#fff" : "transparent",
              color: location.pathname === item.path ? "#003366" : "#fff",
            }}>
            {item.label}
          </button>
        ))}
      </div>
      <button onClick={logout}
        style={{
          padding: "6px 12px", borderRadius: 6, border: "1px solid #fff",
          cursor: "pointer", fontSize: 13, fontWeight: 600,
          background: "transparent", color: "#fff",
        }}>
        Çıkış
      </button>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <NavBar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/rental" element={<PrivateRoute><Rental /></PrivateRoute>} />
        <Route path="/maintenance" element={<PrivateRoute><Maintenance /></PrivateRoute>} />
        <Route path="/offers" element={<PrivateRoute><Offers /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
