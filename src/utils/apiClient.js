import axios from "axios";
import { authService } from "../services/authService";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:2002/api",
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
