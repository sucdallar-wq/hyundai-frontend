import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login"
import Dashboard from "./pages/Dashboard"
import Rental from "./pages/Rental"
import Maintenance from "./pages/Maintenance"
import Offers from "./pages/Offers"

// Token yoksa login'e yönlendir
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token")
  return token ? children : <Navigate to="/" replace />
}

function App() {
  return (
    <BrowserRouter>
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
