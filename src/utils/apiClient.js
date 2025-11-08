// src/utils/apiClient.js
import axios from "axios";
import { authService } from "../services/authService";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:2002/api",
  timeout: 10000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      console.warn("⚠️ Token expired atau tidak valid — logout otomatis.");
      authService.logout();
      window.location.href = "/login"; // redirect ke halaman login
    }
    return Promise.reject(error);
  }
);

export default apiClient;
