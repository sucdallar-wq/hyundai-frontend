import { useEffect, useState } from "react"
import API from "../services/api"

export default function Maintenance() {
  const [machines, setMachines] = useState([])
  const [customer, setCustomer] = useState("")
  const [email, setEmail] = useState("")
  const [discount, setDiscount] = useState("")
  const [model, setModel] = useState("")
  const [hour, setHour] = useState("")
  const [availableHours, setAvailableHours] = useState([])
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    API.get("/excel/machines")
      .then(res => setMachines(res.data))
      .catch(() => setMessage("Makine listesi alınamadı"))
  }, [])

  const handleModelChange = async (val) => {
    setModel(val)
    setHour("")
    setAvailableHours([])
    setRows([])
    setTotal(null)
    if (!val) return
    try {
      const res = await API.get(`/maintenance-hours?model=${val}`)
      setAvailableHours(res.data.available_hours || [])
    } catch {
      setMessage("Bakım saatleri alınamadı")
    }
  }

  const calculate = async () => {
    if (!model) { alert("Model seçiniz"); return }
    if (!hour) { alert("Saat seçiniz"); return }
    setLoading(true)
    setMessage("")
    try {
      const res = await API.post("/maintenance/calc", { model, hours: Number(hour) })
      setRows(res.data.rows)
      setTotal(res.data.total)
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Hesaplama başarısız")
    } finally {
      setLoading(false)
    }
  }

  const downloadPDF = async () => {
    if (!customer) { alert("Müşteri giriniz"); return }
    if (rows.length === 0) { alert("Önce hesaplama yapınız"); return }
    try {
      const res = await API.post("/maintenance/pdf",
        { customer, model, hours: Number(hour), discount: Number(discount || 0) },
        { responseType: "blob" }
      )
      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `Bakim_${customer}_${model}_${hour}h.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch { alert("PDF indirilemedi") }
  }

  const sendMail = async () => {
    if (!email) { alert("Email giriniz"); return }
    if (rows.length === 0) { alert("Önce hesaplama yapınız"); return }
    try {
      await API.post(`/maintenance/send-mail?email=${email}`,
        { customer, model, hours: Number(hour), discount: Number(discount || 0) }
      )
      alert("Mail gönderildi")
    } catch { alert("Mail gönderilemedi") }
  }

  const discountValue = Number(discount || 0)
  const finalTotal = total ? total - (total * discountValue / 100) : 0

  return (
    <div style={{ padding: 16, maxWidth: 900, margin: "0 auto", fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 16, fontSize: 20 }}>Bakım Teklifi</h2>

      {/* Form */}
      <div style={{ background: "#f7f7f7", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <h3 style={{ margin: "0 0 12px 0", fontSize: 15, color: "#003366" }}>Teklif Bilgileri</h3>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Model</label>
          <select value={model} onChange={e => handleModelChange(e.target.value)}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" }}>
            <option value="">Model seç</option>
            {machines.map(m => (
              <option key={m.id} value={m.model_code}>{m.model_code} - {m.model_name}</option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Bakım Paketi</label>
          <select value={hour} onChange={e => { setHour(e.target.value); setRows([]); setTotal(null) }}
            disabled={availableHours.length === 0}
            style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" }}>
            <option value="">Saat seç</option>
            {availableHours.map(h => (
              <option key={h} value={h}>{h} Saat</option>
            ))}
          </select>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>Müşteri</label>
            <input type="text" value={customer} onChange={e => setCustomer(e.target.value)}
              placeholder="Müşteri adı"
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>E-posta</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" }} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 500, marginBottom: 4 }}>İndirim %</label>
            <input type="number" value={discount} onChange={e => setDiscount(e.target.value)}
              placeholder="0"
              style={{ padding: 10, borderRadius: 6, border: "1px solid #ccc", fontSize: 14, width: "100%" }} />
          </div>
        </div>

        <button onClick={calculate} disabled={loading}
          style={{ padding: "12px 24px", border: "none", borderRadius: 8, cursor: "pointer", background: "#003366", color: "white", fontSize: 15, width: "100%" }}>
          {loading ? "Hesaplanıyor..." : "Hesapla"}
        </button>
      </div>

      {message && <p style={{ color: "red", marginBottom: 12 }}>{message}</p>}

      {rows.length > 0 && (
        <>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: 1, minWidth: 140, background: "#0a7", color: "white", padding: 12, borderRadius: 8, textAlign: "center", fontWeight: 700 }}>
              Toplam<br />{total?.toFixed(2)} USD
            </div>
            <div style={{ flex: 1, minWidth: 140, background: "#003366", color: "white", padding: 12, borderRadius: 8, textAlign: "center", fontWeight: 700 }}>
              İndirimli Toplam<br />{finalTotal.toFixed(2)} USD
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
            <button onClick={downloadPDF}
              style={{ flex: 1, padding: 10, background: "#27ae60", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              PDF İndir
            </button>
            <button onClick={sendMail}
              style={{ flex: 1, padding: 10, background: "#e67e22", color: "white", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600 }}>
              Mail Gönder
            </button>
          </div>

          <div style={{ background: "#f7f7f7", border: "1px solid #e5e5e5", borderRadius: 10, padding: 16, overflowX: "auto" }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: 15, color: "#003366" }}>Bakım Kalemleri</h3>
            <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#003366", color: "white" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>Kod</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Parça</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Adet</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Birim</th>
                  <th style={{ padding: "10px", textAlign: "right" }}>Tutar</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f9f9f9" }}>
                    <td style={{ padding: "8px 10px", color: "#222" }}>{r.code}</td>
                    <td style={{ padding: "8px 10px", color: "#222" }}>{r.part_name}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#222" }}>{r.quantity}</td>
                    <td style={{ padding: "8px 10px", textAlign: "center", color: "#222" }}>{r.unit}</td>
                    <td style={{ padding: "8px 10px", textAlign: "right", color: "#222" }}>{r.line_total?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
