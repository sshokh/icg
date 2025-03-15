import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use(
  (config) => {
    if (!config.headers.hasOwnProperty("Authorization")) {
      const TOKEN = localStorage.getItem("token")
      if (TOKEN) {
        config.headers.Authorization = `Token ${TOKEN}`
      }
    } else if (config.headers.Authorization === "") {
      delete config.headers.Authorization
    }

    return config
  },
  (error) => Promise.reject(error),
)

// Simple response interceptor to prevent unhandled promise rejections
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Silently log the error to prevent it from causing popups
    console.error("API Error:", error)

    // Still reject the promise so local catch blocks work
    return Promise.reject(error)
  },
)

export default api

