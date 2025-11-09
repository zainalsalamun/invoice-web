// // src/utils/apiClient.js
// import axios from "axios";
// import { authService } from "../services/authService";

// const apiClient = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:2002/api",
//   timeout: 10000,
// });

// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) config.headers.Authorization = `Bearer ${token}`;
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401) {
//       console.warn("⚠️ Token expired atau tidak valid — logout otomatis.");
//       authService.logout();
//       window.location.href = "/login"; // redirect ke halaman login
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;


// src/utils/apiClient.js
import axios from "axios";
import { enqueueSnackbar } from "notistack"; 
const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:2002/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
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
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("⚠️ Token kadaluarsa / tidak valid. Auto logout aktif.");

      // Hapus token & data user
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Notifikasi snackbar (lebih elegan daripada alert)
      enqueueSnackbar("🔒 Sesi kamu telah berakhir. Silakan login kembali.", {
        variant: "warning",
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      });

      // Redirect otomatis ke halaman login
      if (window.location.pathname !== "/login") {
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500); // kasih jeda 1.5 detik biar snackbar sempat tampil
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
