import apiClient from "../utils/apiClient";

export const authService = {
  async login(username, password, rememberMe = true) {
    try {
      const res = await apiClient.post("/auth/login", { username, password });
      if (res.data.success) {
        const storage = rememberMe ? localStorage : sessionStorage;
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        sessionStorage.removeItem("token");
        sessionStorage.removeItem("user");
        storage.setItem("token", res.data.token);
        storage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      }
      return null;
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Terjadi kesalahan saat login";
      console.error("Login gagal:", errorMsg, err);
      return { success: false, message: errorMsg };
    }
  },

  async register(username, password, role) {
    try {
      const res = await apiClient.post("/auth/register", { username, password, role });
      return res.data;
    } catch (err) {
      console.error("Register gagal:", err);
      return null;
    }
  },

  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem("user") || sessionStorage.getItem("user");
      return JSON.parse(user) || null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
  },
};
