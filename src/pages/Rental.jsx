import { useEffect, useMemo, useState } from "react"
import API from "../services/api"
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts"

export default function Rental() {
  const [machines, setMachines] = useState([])
  const [model, setModel] = useState("")
  const [price, setPrice] = useState("")
  const [machineCount, setMachineCount] = useState(1)
  const [yearlyHours, setYearlyHours] = useState(2000)
  const [customer, setCustomer] = useState("")
  const [email, setEmail] = useState("")
  const [answers, setAnswers] = useState(Array(11).fill(1))
  const [scenarios, setScenarios] = useState([])
  const [mailStatus, setMailStatus] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const surveyQuestions = [
    "İç / Dış Çalışma", "Zemin Durumu", "Tümsek", "Eğim",
    "Tozlu Ortam", "Islak Zemin", "Sıcak Çalışma Ortamı",
    "Soğuk Depo", "Servis Uzaklığı", "İtme / Çekme", "Vardiya Yoğunluğu"
  ]

  useEffect(() => {
    API.get("/excel/machines")
      .then(res => setMachines(res.data || []))
      .catch(() => setMessage("Makine listesi alınamadı"))
  }, [])

  const handleModelChange = (code) => {
    setModel(code)
    setScenarios([])
    setMessage("")
    setMailStatus("")
    const selected = machines.find((m) => m.model_code === code)
    setPrice(selected?.price_usd ?? "")
  }

  const handleAnswerChange = (index, value) => {
    const updated = [...answers]
    updated[index] = Number(value)
    setAnswers(updated)
  }

  const totalScore = answers.reduce((a, b) => a + b, 0)
  let riskLabel = "HAFİF"
  let riskColor = "#27ae60"
  if (totalScore > 25) { riskLabel = "ORTA"; riskColor = "#f1c40f" }
  if (totalScore > 40) { riskLabel = "AĞIR"; riskColor = "#e74c3c" }

  const calculateOffer = async () => {
    if (!model) { alert("Model seçiniz"); return }
    if (!price || Number(price) <= 0) { alert("Makine fiyatı geçerli olmalıdır"); return }
    if (!customer.trim()) { alert("Müşteri adı giriniz"); return }
    if (!email.trim()) { alert("E-posta adresi zorunludur"); return }

    try {
      setLoading(true)
      setMessage("")
      setMailStatus("")
      setScenarios([])

      const res = await API.post("/rental/rental-offer-auto", {
        customer,
        email,
        model,
        purchase_price: Number(price),
        machine_count: Number(machineCount),
        yearly_hours: Number(yearlyHours),
        answers
      })

      setScenarios(res.data?.scenarios || [])
      setMailStatus(res.data?.mail_status || "")
      setMessage("Teklif hesaplandı")
    } catch (err) {
      const detail = err?.response?.data?.detail || "Teklif hesaplanamadı"
      setMessage(detail)
    } finally {
      setLoading(false)
    }
  }

  const chartData = useMemo(() => {
    return scenarios.map((s) => ({
      months: s.months,
      monthly: Number(s.monthly_per_machine || 0),
    }))
  }, [scenarios])

  return (
    <div style={{ padding: 30, maxWidth: 1200, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 20 }}>Kiralama Teklifi</h2>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 24 }}>
        <div>
          <label>Model</label>
          <select value={model} onChange={(e) => handleModelChange(e.target.value)} style={{ width: "100%", padding: 10 }}>
            <option value="">Model seç</option>
            {machines.map((m) => (
              <option key={m.id} value={m.model_code}>{m.model_code} - {m.model_name}</option>
            ))}
          </select>
        </div>

        <div>
          <label>Makine Liste Fiyatı (USD)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </div>

        <div>
          <label>Makine Sayısı</label>
          <input type="number" value={machineCount} onChange={(e) => setMachineCount(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </div>

        <div>
          <label>Yıllık Saat</label>
          <input type="number" value={yearlyHours} onChange={(e) => setYearlyHours(e.target.value)} style={{ width: "100%", padding: 10 }} />
        </div>

        <div>
          <label>Müşteri <span style={{ color: "red" }}>*</span></label>
          <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Müşteri adı" style={{ width: "100%", padding: 10 }} />
        </div>

        <div>
          <label>E-posta <span style={{ color: "red" }}>*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" style={{ width: "100%", padding: 10 }} />
        </div>
      </div>

      {/* Survey */}
      <div style={{ background: "#f7f7f7", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, marginBottom: 24 }}>
        <h3 style={{ marginTop: 0 }}>Survey</h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12 }}>
          <div style={{ marginTop: 20, padding: 12, borderRadius: 8, background: riskColor, color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 18 }}>
            Genel Kullanım Seviyesi: {riskLabel}
          </div>

          {surveyQuestions.map((q, i) => (
            <div key={i}>
              <label>{q}</label>
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[{ label: "Hafif", val: 1, color: "#27ae60" }, { label: "Orta", val: 3, color: "#f1c40f" }, { label: "Ağır", val: 5, color: "#e74c3c" }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleAnswerChange(i, opt.val)}
                    style={{
                      flex: 1, padding: 8, borderRadius: 6, border: "1px solid #ccc",
                      background: answers[i] === opt.val ? opt.color : "#f4f4f4",
                      color: answers[i] === opt.val ? "#fff" : "#333",
                      cursor: "pointer", fontWeight: 600
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={calculateOffer}
        disabled={loading}
        style={{ padding: "12px 24px", border: "none", borderRadius: 8, cursor: "pointer", background: "#003366", color: "white", fontSize: 15 }}
      >
        {loading ? "Hesaplanıyor..." : "Teklif Hesapla ve Mail Gönder"}
      </button>

      {message && (
        <div style={{ marginTop: 16, fontWeight: 600, color: message.includes("hesaplandı") ? "green" : "red" }}>
          {message}
          {mailStatus && (
            <span style={{ marginLeft: 10, color: mailStatus === "gönderildi" ? "green" : "orange" }}>
              — Teklif maili {mailStatus}
            </span>
          )}
        </div>
      )}

      {scenarios.length > 0 && (
        <>
          <div style={{ marginTop: 30, overflowX: "auto" }}>
            <table border="1" cellPadding="8" style={{ borderCollapse: "collapse", width: "100%" }}>
              <thead>
                <tr>
                  <th>Vade</th>
                  <th>Aylık / Makine</th>
                  <th>Sözleşme Toplamı</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={i} style={{ background: s.months === 36 ? "#e8f4fd" : "white" }}>
                    <td>{s.months} Ay {s.months === 36 ? "⭐" : ""}</td>
                    <td>{Number(s.monthly_per_machine || 0).toFixed(2)} USD</td>
                    <td>{(Number(s.monthly_per_machine || 0) * s.months).toFixed(2)} USD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ width: "100%", height: 420, marginTop: 40, background: "#fff", padding: 20, borderRadius: 12, boxShadow: "0 8px 25px rgba(0,0,0,0.08)" }}>
            <h3 style={{ color: "#0a3d62" }}>⭐ Önerilen Optimum Kiralama Planı: 36 Ay</h3>
            <ResponsiveContainer width="100%" height="90%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="months" />
                <YAxis />
                <Tooltip formatter={(v) => `${Number(v).toFixed(2)} USD`} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="monthly"
                  stroke="#1f77b4"
                  strokeWidth={3}
                  name="Aylık Kira"
                  dot={(props) => {
                    const { cx, cy, payload } = props
                    if (payload.months === 36) return <circle key="dot-36" cx={cx} cy={cy} r={8} fill="red" />
                    return <circle key={`dot-${payload.months}`} cx={cx} cy={cy} r={4} fill="#1f77b4" />
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      )}
    </div>
  )
}
