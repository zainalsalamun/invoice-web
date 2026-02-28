import axios from "axios";
// Hapus import authService karena menyebabkan circular dependency
// import { authService } from "../services/authService";


const isProd = process.env.NODE_ENV === "production";

const apiClient = axios.create({
  // Gunakan /api di production (Vercel Proxy), atau REACT_APP_API_URL di development
  baseURL: isProd ? "/api" : (process.env.REACT_APP_API_URL || "/api"),
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
  (response) => {
    // Transformasi data untuk menghapus URL absolute lama/lainnya agar menjadi path relatif
    const urlPatterns = [
      /https?:\/\/43\.134\.180\.249:3000/g,
      /https?:\/\/touch-order-archives-planner\.trycloudflare\.com/g,
      /https?:\/\/naltech\.ringnet\.web\.id/g
    ];

    let stringified = JSON.stringify(response.data);
    let changed = false;
    urlPatterns.forEach(pattern => {
      if (pattern.test(stringified)) {
        stringified = stringified.replace(pattern, "");
        changed = true;
      }
    });

    if (changed) {
      response.data = JSON.parse(stringified);
    }
    return response;
  },
  (error) => {
    // Jangan redirect jika error terjadi di endpoint login atau register
    const isAuthEndpoint = error.config?.url?.includes("/auth/login") || error.config?.url?.includes("/auth/register");

    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthEndpoint) {
      console.warn("⚠️ Token invalid / expired, logout otomatis...");

      // Hapus token dan user secara manual untuk menghindari circular dependency
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      localStorage.setItem("sessionExpired", "true");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
