import axios from "axios";
import { authService } from "../services/authService";

const isProd = process.env.NODE_ENV === "production";

const apiClient = axios.create({
  // Jika di Vercel (production), abaikan REACT_APP_API_URL dan paksa jadi "/api"
  // Jika di lokal (laptop), hanya mengandalkan REACT_APP_API_URL di .env
  baseURL: isProd ? "/api" : process.env.REACT_APP_API_URL,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Token invalid / expired, logout otomatis...");
      authService.logout();

      localStorage.setItem("sessionExpired", "true");

      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
