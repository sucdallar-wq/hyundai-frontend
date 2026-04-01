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

const styles = {
  container: {
    padding: "16px",
    maxWidth: "900px",
    margin: "0 auto",
    fontFamily: "sans-serif",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "12px",
    marginBottom: "20px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "500",
    color: "#333",
  },
  input: {
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box",
  },
  surveyBox: {
    background: "#f7f7f7",
    border: "1px solid #e5e5e5",
    borderRadius: "10px",
    padding: "16px",
    marginBottom: "20px",
  },
  surveyGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "12px",
    marginTop: "12px",
  },
  surveyItem: {
    background: "#fff",
    borderRadius: "8px",
    padding: "10px",
    border: "1px solid #eee",
  },
  surveyLabel: {
    fontSize: "13px",
    fontWeight: "500",
    marginBottom: "8px",
    color: "#333",
    display: "block",
  },
  btnRow: {
    display: "flex",
    gap: "6px",
  },
  calcBtn: {
    padding: "12px 24px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    background: "#003366",
    color: "white",
    fontSize: "15px",
    width: "100%",
    marginTop: "4px",
  },
  table: {
    borderCollapse: "collapse",
    width: "100%",
    marginTop: "20px",
    fontSize: "14px",
  },
  chart: {
    width: "100%",
    height: "320px",
    marginTop: "30px",
    background: "#fff",
    padding: "16px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
}

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
    <div style={styles.container}>
      <h2 style={{ marginBottom: "16px", fontSize: "20px" }}>Kiralama Teklifi</h2>

      {/* Form alanları */}
      <div style={styles.grid}>
        <div style={styles.field}>
          <label style={styles.label}>Model</label>
          <select value={model} onChange={(e) => handleModelChange(e.target.value)} style={styles.input}>
            <option value="">Model seç</option>
            {machines.map((m) => (
              <option key={m.id} value={m.model_code}>{m.model_code} - {m.model_name}</option>
            ))}
          </select>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Makine Fiyatı (USD)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Makine Sayısı</label>
          <input type="number" value={machineCount} onChange={(e) => setMachineCount(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Yıllık Saat</label>
          <input type="number" value={yearlyHours} onChange={(e) => setYearlyHours(e.target.value)} style={styles.input} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Müşteri <span style={{ color: "red" }}>*</span></label>
          <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Müşteri adı" style={styles.input} />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>E-posta <span style={{ color: "red" }}>*</span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" style={styles.input} />
        </div>
      </div>

      {/* Survey */}
      <div style={styles.surveyBox}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: "16px" }}>Kullanım Anketi</h3>

        <div style={{
          padding: "10px",
          borderRadius: "8px",
          background: riskColor,
          color: "#fff",
          fontWeight: "700",
          textAlign: "center",
          fontSize: "15px",
          marginBottom: "12px",
          marginTop: "8px",
        }}>
          Genel Kullanım Seviyesi: {riskLabel}
        </div>

        <div style={styles.surveyGrid}>
          {surveyQuestions.map((q, i) => (
            <div key={i} style={styles.surveyItem}>
              <span style={styles.surveyLabel}>{q}</span>
              <div style={styles.btnRow}>
                {[{ label: "Hafif", val: 1, color: "#27ae60" },
                  { label: "Orta", val: 3, color: "#f1c40f" },
                  { label: "Ağır", val: 5, color: "#e74c3c" }].map(opt => (
                  <button
                    key={opt.val}
                    type="button"
                    onClick={() => handleAnswerChange(i, opt.val)}
                    style={{
                      flex: 1,
                      padding: "8px 4px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      background: answers[i] === opt.val ? opt.color : "#f4f4f4",
                      color: answers[i] === opt.val ? "#fff" : "#333",
                      cursor: "pointer",
                      fontWeight: "600",
                      fontSize: "13px",
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

      <button onClick={calculateOffer} disabled={loading} style={styles.calcBtn}>
        {loading ? "Hesaplanıyor..." : "Teklif Hesapla ve Mail Gönder"}
      </button>

      {message && (
        <div style={{ marginTop: "12px", fontWeight: "600", color: message.includes("hesaplandı") ? "green" : "red" }}>
          {message}
          {mailStatus && (
            <span style={{ marginLeft: "8px", color: mailStatus === "gönderildi" ? "green" : "orange" }}>
              — Teklif maili {mailStatus}
            </span>
          )}
        </div>
      )}

      {scenarios.length > 0 && (
        <>
          <div style={{ overflowX: "auto", marginTop: "20px" }}>
            <table style={styles.table} border="1" cellPadding="8">
              <thead>
                <tr style={{ background: "#003366", color: "white" }}>
                  <th>Vade</th>
                  <th>Aylık / Makine</th>
                  <th>Sözleşme Toplamı</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={i} style={{ background: s.months === 36 ? "#e8f4fd" : "white", textAlign: "center" }}>
                    <td>{s.months} Ay {s.months === 36 ? "⭐" : ""}</td>
                    <td>{Number(s.monthly_per_machine || 0).toFixed(2)} USD</td>
                    <td>{(Number(s.monthly_per_machine || 0) * s.months).toFixed(2)} USD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={styles.chart}>
            <h3 style={{ color: "#0a3d62", fontSize: "15px", marginBottom: "8px" }}>
              ⭐ Önerilen Optimum Kiralama Planı: 36 Ay
            </h3>
            <ResponsiveContainer width="100%" height="85%">
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
