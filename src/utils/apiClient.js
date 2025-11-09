// src/utils/apiClient.js
// import axios from "axios";
// import { enqueueSnackbar } from "notistack"; 
// const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:2002/api";

// const apiClient = axios.create({
//   baseURL: BASE_URL,
//   headers: {
//     "Content-Type": "application/json",
//   },
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
//     const status = error?.response?.status;

//     if (status === 401) {
//       console.warn("⚠️ Token kadaluarsa / tidak valid. Auto logout aktif.");

//       // Hapus token & data user
//       localStorage.removeItem("token");
//       localStorage.removeItem("user");

//       // Notifikasi snackbar (lebih elegan daripada alert)
//       enqueueSnackbar("🔒 Sesi kamu telah berakhir. Silakan login kembali.", {
//         variant: "warning",
//         anchorOrigin: { vertical: "bottom", horizontal: "right" },
//       });

//       // Redirect otomatis ke halaman login
//       if (window.location.pathname !== "/login") {
//         setTimeout(() => {
//           window.location.href = "/login";
//         }, 1500); // kasih jeda 1.5 detik biar snackbar sempat tampil
//       }
//     }

//     return Promise.reject(error);
//   }
// );

// export default apiClient;


// src/utils/apiClient.js
import axios from "axios";
import { notifyWarning } from "./notify.js";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:2002/api";

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// 🧠 Tambahkan token otomatis di setiap request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// 🚨 Tangani error global
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    if (status === 401) {
      console.warn("⚠️ Token kadaluarsa / tidak valid. Auto logout aktif.");

      // Hapus token & data user
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      // Snackbar peringatan
      notifyWarning("🔒 Sesi kamu telah berakhir. Silakan login kembali.");

      // Redirect otomatis setelah sedikit delay
      if (window.location.pathname !== "/login") {
        setTimeout(() => (window.location.href = "/login"), 1500);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
