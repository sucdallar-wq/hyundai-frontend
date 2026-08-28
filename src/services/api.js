import axios from "axios"

console.log(import.meta.env.VITE_API_URL)

const API = axios.create({ 
  baseURL: import.meta.env.VITE_API_URL || "https://hyundai-rental-tetas-ujiw.onrender.com" 
}) 

// Her isteğe token ekle
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export default API
