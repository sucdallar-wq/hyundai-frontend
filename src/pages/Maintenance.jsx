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
      const res = await API.post("/maintenance/calc", {
        model: model,
        hours: Number(hour)
      })
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
      const res = await API.post(
        "/maintenance/pdf",
        {
          customer: customer,
          model: model,
          hours: Number(hour),
          discount: Number(discount || 0)
        },
        { responseType: "blob" }
      )

      const url = window.URL.createObjectURL(new Blob([res.data]))
      const link = document.createElement("a")
      link.href = url
      link.download = `Bakim_${customer}_${model}_${hour}h.pdf`
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch {
      alert("PDF indirilemedi")
    }
  }

  const sendMail = async () => {
    if (!email) { alert("Email giriniz"); return }
    if (rows.length === 0) { alert("Önce hesaplama yapınız"); return }

    try {
      await API.post(
        `/maintenance/send-mail?email=${email}`,
        {
          customer: customer,
          model: model,
          hours: Number(hour),
          discount: Number(discount || 0)
        }
      )
      alert("Mail gönderildi")
    } catch {
      alert("Mail gönderilemedi")
    }
  }

  const discountValue = Number(discount || 0)
  const finalTotal = total ? total - (total * discountValue / 100) : 0

  return (
    <div style={{ padding: 30 }}>
      <h2>Bakım Teklifi</h2>

      <div style={{ display: "flex", gap: 15, flexWrap: "wrap", marginBottom: 25 }}>

        <input
          placeholder="Müşteri"
          value={customer}
          onChange={e => setCustomer(e.target.value)}
        />

        <input
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          style={{ width: 220 }}
        />

        <input
          type="number"
          value={discount}
          onChange={e => setDiscount(e.target.value)}
          placeholder="İndirim %"
          style={{ width: 100 }}
        />

        <select
          value={model}
          onChange={e => handleModelChange(e.target.value)}
        >
          <option value="">Model seç</option>
          {machines.map(m => (
            <option key={m.id} value={m.model_code}>
              {m.model_code} - {m.model_name}
            </option>
          ))}
        </select>

        <select
          value={hour}
          onChange={e => {
            setHour(e.target.value)
            setRows([])
            setTotal(null)
          }}
          disabled={availableHours.length === 0}
        >
          <option value="">Saat seç</option>
          {availableHours.map(h => (
            <option key={h} value={h}>{h} Saat</option>
          ))}
        </select>

        <button onClick={calculate} disabled={loading}>
          {loading ? "Hesaplanıyor..." : "Hesapla"}
        </button>

      </div>

      {message && <p style={{ color: "red" }}>{message}</p>}

      {rows.length > 0 && (
        <>
          <div style={{ marginBottom: 20 }}>
            <h3 style={{ background: "#0a7", color: "white", padding: 10, display: "inline-block", marginRight: 10 }}>
              Toplam: {total.toFixed(2)} USD
            </h3>
            <h3 style={{ background: "#003366", color: "white", padding: 10, display: "inline-block" }}>
              İndirimli Toplam: {finalTotal.toFixed(2)} USD
            </h3>
          </div>

          <button onClick={downloadPDF}>PDF İndir</button>
          <button onClick={sendMail} style={{ marginLeft: 10, background: "#e67e22", color: "white" }}>
            Mail Gönder
          </button>

          <table border="1" cellPadding="6" style={{ marginTop: 15, borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>Kod</th>
                <th>Parça</th>
                <th>Adet</th>
                <th>Birim</th>
                <th>Tutar</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  <td>{r.code}</td>
                  <td>{r.part_name}</td>
                  <td>{r.quantity}</td>
                  <td>{r.unit}</td>
                  <td>{r.line_total?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  )
}
