// src/utils/apiClient.js
// import axios from "axios";
// import { authService } from "../services/authService";

// const apiClient = axios.create({
//   baseURL: process.env.REACT_APP_API_URL || "http://localhost:2002/api",
// });

// // 🧩 Tambahkan token otomatis ke semua request
// apiClient.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem("token");
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // ⚙️ Auto logout jika token invalid / expired
// apiClient.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     if (error.response?.status === 401 || error.response?.status === 403) {
//       console.warn("⚠️ Token invalid atau expired, logout otomatis...");
//       authService.logout();
//       window.location.href = "/login";
//     }
//     return Promise.reject(error);
//   }
// );

// export default apiClient;


// src/utils/apiClient.js
import axios from "axios";
import { authService } from "../services/authService";

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:2002/api",
});

// Tambahkan interceptor untuk request (token)
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

// Tambahkan interceptor untuk response (auto logout & snackbar)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      console.warn("⚠️ Token invalid / expired, logout otomatis...");
      authService.logout();

      // 💬 Simpan pesan session expired di localStorage (biar dibaca LoginPage)
      localStorage.setItem("sessionExpired", "true");

      // redirect ke login
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default apiClient;
