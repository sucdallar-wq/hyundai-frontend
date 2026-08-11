import { useEffect, useMemo, useState } from "react"
import API from "../services/api"
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid,
} from "recharts"

export default function Rental() {
  const [machines, setMachines] = useState([])
  const [model, setModel] = useState("")
  const [price, setPrice] = useState("")
  const [machineCount, setMachineCount] = useState(1)
  const [yearlyHours, setYearlyHours] = useState("")
  const [customer, setCustomer] = useState("")
  const [email, setEmail] = useState("")
  const [answers, setAnswers] = useState(Array(11).fill(1))
  const [scenarios, setScenarios] = useState([])
  const [pdfFile, setPdfFile] = useState("")
  const [message, setMessage] = useState("")
  const [mailMessage, setMailMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const [mailLoading, setMailLoading] = useState(false)

  const surveyQuestions = [
    "İç / Dış Çalışma", "Zemin Durumu", "Tümsek", "Eğim",
    "Tozlu Ortam", "Islak Zemin", "Sıcak Çalışma Ortamı",
    "Soğuk Depo", "Servis Uzaklığı", "İtme / Çekme", "Vardiya Yoğunluğu"
  ]

  const hourOptions = [
    { value: "1000", label: "1.000 saat — Tek vardiya, az kullanım" },
    { value: "1500", label: "1.500 saat — Tek vardiya, yoğun" },
    { value: "2000", label: "2.000 saat — Standart tek vardiya" },
    { value: "3000", label: "3.000 saat — Çift vardiya" },
    { value: "4000", label: "4.000 saat — Yoğun çift vardiya" },
    { value: "6000", label: "6.000 saat — Üç vardiya" },
  ]

  useEffect(() => {
    API.get("/excel/machines")
      .then(res => setMachines(res.data || []))
      .catch(() => setMessage("Makine listesi alınamadı"))
  }, [])

  const handleModelChange = (code) => {
    setModel(code)
    setScenarios([])
    setPdfFile("")
    setMessage("")
    setMailMessage("")
    const selected = machines.find((m) => m.model_code === code)
    setPrice(selected?.price_usd ?? "")
  }

  const handleAnswerChange = (index, value) => {
    const updated = [...answers]
    updated[index] = Number(value)
    setAnswers(updated)
  }

  const totalScore = answers.reduce((a, b) => a + b, 0)
  let riskLabel = "HAFİF", riskColor = "#27ae60"
  if (totalScore > 25) { riskLabel = "ORTA"; riskColor = "#f1c40f" }
  if (totalScore > 40) { riskLabel = "AĞIR"; riskColor = "#e74c3c" }

  const calculateOffer = async () => {
    if (!model) { alert("Model seçiniz"); return }
    if (!price || Number(price) <= 0) { alert("Makine fiyatı geçerli olmalıdır"); return }
    if (!customer.trim()) { alert("Müşteri adı giriniz"); return }
    if (!yearlyHours) { alert("Yıllık çalışma saati seçiniz"); return }

    try {
      setLoading(true)
      setMessage("")
      setMailMessage("")
      setScenarios([])
      setPdfFile("")

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
      setPdfFile(res.data?.pdf_file || "")
      setMessage("Teklif hesaplandı ✅")
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Teklif hesaplanamadı")
    } finally {
      setLoading(false)
    }
  }

  const sendMail = async () => {
    if (!email.trim()) { alert("E-posta adresi giriniz"); return }
    if (!pdfFile) { alert("Önce teklif hesaplayınız"); return }

    try {
      setMailLoading(true)
      setMailMessage("")
      await API.post(`/rental/send-mail?email=${email}&pdf_file=${pdfFile}`)
      setMailMessage("Mail gönderildi ✅")
    } catch {
      setMailMessage("Mail gönderilemedi ❌")
    } finally {
      setMailLoading(false)
    }
  }

  const chartData = useMemo(() =>
    scenarios.map((s) => ({
      months: s.months,
      monthly: Number(s.monthly_per_machine || 0),
    })), [scenarios])

  const selectStyle = { padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%", background: "#fff" }
  const inputStyle = { padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%", background: "#fff" }
  const labelStyle = { display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4, color: "#444" }
  const fieldStyle = { marginBottom: 12 }
  const box = { background: "#f7f7f7", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, marginBottom: 20 }

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 16, fontSize: 20 }}>Kiralama Teklifi</h2>

      {/* Form */}
      <div style={box}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 15, color: "#003366" }}>Teklif Bilgileri</h3>

        <div style={fieldStyle}>
          <label style={labelStyle}>Model</label>
          <select value={model} onChange={(e) => handleModelChange(e.target.value)} style={selectStyle}>
            <option value="">Model seç</option>
            {machines.map((m) => (
              <option key={m.id} value={m.model_code}>{m.model_code} - {m.model_name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={labelStyle}>Makine Fiyatı (USD)</label>
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Makine Sayısı</label>
            <input type="number" value={machineCount} onChange={(e) => setMachineCount(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Yıllık Çalışma Saati</label>
            <select value={yearlyHours} onChange={(e) => setYearlyHours(e.target.value)} style={selectStyle}>
              <option value="">Saat seç</option>
              {hourOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={labelStyle}>Müşteri <span style={{ color: "red" }}>*</span></label>
            <input type="text" value={customer} onChange={(e) => setCustomer(e.target.value)} placeholder="Müşteri adı" style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>E-posta</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@mail.com" style={inputStyle} />
          </div>
        </div>
      </div>

      {/* Survey */}
      <div style={box}>
        <h3 style={{ margin: "0 0 8px 0", fontSize: 15, color: "#003366" }}>Kullanım Anketi</h3>
        <div style={{ padding: 10, borderRadius: 8, background: riskColor, color: "#fff", fontWeight: 700, textAlign: "center", fontSize: 15, marginBottom: 12 }}>
          Genel Kullanım Seviyesi: {riskLabel}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 10 }}>
          {surveyQuestions.map((q, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 8, padding: 10, border: "1px solid #eee" }}>
              <span style={{ fontSize: 13, fontWeight: 500, marginBottom: 8, color: "#333", display: "block" }}>{q}</span>
              <div style={{ display: "flex", gap: 6 }}>
                {[{ label: "Hafif", val: 1, color: "#27ae60" },
                  { label: "Orta", val: 3, color: "#f1c40f" },
                  { label: "Ağır", val: 5, color: "#e74c3c" }].map(opt => (
                  <button key={opt.val} type="button" onClick={() => handleAnswerChange(i, opt.val)}
                    style={{
                      flex: 1, padding: "8px 4px", borderRadius: 6, border: "1px solid #ccc",
                      background: answers[i] === opt.val ? opt.color : "#f4f4f4",
                      color: answers[i] === opt.val ? "#fff" : "#333",
                      cursor: "pointer", fontWeight: 600, fontSize: 13,
                    }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hesapla butonu */}
      <button onClick={calculateOffer} disabled={loading}
        style={{ padding: "12px 24px", border: "none", borderRadius: 8, cursor: "pointer", background: "#003366", color: "white", fontSize: 15, width: "100%" }}>
        {loading ? "Hesaplanıyor..." : "Teklif Hesapla"}
      </button>

      {message && (
        <div style={{ marginTop: 12, fontWeight: 600, color: message.includes("✅") ? "green" : "red" }}>
          {message}
        </div>
      )}

      {scenarios.length > 0 && (
        <>
          {/* Senaryo tablosu */}
          <div style={{ ...box, marginTop: 20, overflowX: "auto" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 15, color: "#003366" }}>Kiralama Senaryoları</h3>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#003366", color: "white" }}>
                  <th style={{ padding: 10, textAlign: "center" }}>Vade</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Aylık / Makine</th>
                  <th style={{ padding: 10, textAlign: "center" }}>Sözleşme Toplamı</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s, i) => (
                  <tr key={i} style={{ background: s.months === 36 ? "#e8f4fd" : "#fff", textAlign: "center" }}>
                    <td style={{ padding: 10, color: "#222", fontWeight: s.months === 36 ? 700 : 400 }}>
                      {s.months} Ay {s.months === 36 ? "⭐" : ""}
                    </td>
                    <td style={{ padding: 10, color: "#222" }}>{Number(s.monthly_per_machine || 0).toFixed(2)} USD</td>
                    <td style={{ padding: 10, color: "#222" }}>{(Number(s.monthly_per_machine || 0) * s.months).toFixed(2)} USD</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mail gönder */}
          <div style={{ ...box, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="E-posta adresi"
              style={{ ...inputStyle, flex: 1, minWidth: 200 }}
            />
            <button onClick={sendMail} disabled={mailLoading}
              style={{ padding: "10px 24px", background: "#e67e22", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 14, whiteSpace: "nowrap" }}>
              {mailLoading ? "Gönderiliyor..." : "📧 Mail Gönder"}
            </button>
            {mailMessage && (
              <span style={{ fontWeight: 600, color: mailMessage.includes("✅") ? "green" : "red" }}>
                {mailMessage}
              </span>
            )}
          </div>

          {/* Grafik */}
          <div style={{ ...box, height: 320 }}>
            <h3 style={{ color: "#0a3d62", fontSize: 15, marginBottom: 8 }}>⭐ Önerilen Optimum Kiralama Planı: 36 Ay</h3>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="months" />
                <YAxis />
                <Tooltip formatter={(v) => `${Number(v).toFixed(2)} USD`} />
                <Legend />
                <Line type="monotone" dataKey="monthly" stroke="#1f77b4" strokeWidth={3} name="Aylık Kira"
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
