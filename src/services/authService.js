import apiClient from "../utils/apiClient";

export const authService = {
  async login(username, password) {
    try {
      const res = await apiClient.post("/auth/login", { username, password });
      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        return res.data;
      }
      return null;
    } catch (err) {
      console.error("Login gagal:", err);
      return null;
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
  },

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem("user")) || null;
    } catch {
      return null;
    }
  },

  isAuthenticated() {
    return !!localStorage.getItem("token");
  },
};
