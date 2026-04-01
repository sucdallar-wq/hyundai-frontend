import { useState } from "react"
import { useNavigate } from "react-router-dom"
import API from "../services/api"

export default function Login() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  const handleLogin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const formData = new URLSearchParams()
      formData.append("username", username)
      formData.append("password", password)

      const res = await API.post("/login", formData)

      localStorage.setItem("token", res.data.access_token)
      navigate("/dashboard")

    } catch (err) {
      setError("Kullanıcı adı veya şifre hatalı")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: "300px", margin: "120px auto" }}>
      <h2>Forklift Teklif Sistemi</h2>

      <form onSubmit={handleLogin}>
        <input
          placeholder="Kullanıcı adı"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />

        <input
          type="password"
          placeholder="Şifre"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", padding: 8, marginBottom: 12 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{ width: "100%", padding: 10 }}
        >
          {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>

      {error && <p style={{ color: "red", marginTop: 8 }}>{error}</p>}
    </div>
  )
}
