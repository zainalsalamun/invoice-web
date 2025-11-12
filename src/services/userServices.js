import apiClient from "../utils/apiClient";

export const userService = {
  async getAll() {
    try {
      const res = await apiClient.get("/users");
      return res.data.data || [];
    } catch (err) {
      console.error("Gagal ambil data user:", err);
      return [];
    }
  },

  async create(data) {
    try {
      const res = await apiClient.post("/users", data);
      return res.data;
    } catch (err) {
      console.error("Gagal menambah user:", err);
      return null;
    }
  },

  async remove(id) {
    try {
      const res = await apiClient.delete(`/users/${id}`);
      return res.data;
    } catch (err) {
      console.error("Gagal menghapus user:", err);
      return null;
    }
  },

  async updatePassword(id, data) {
    try {
      const res = await apiClient.put(`/users/${id}/password`, {
        new_password: data.new_password,
      });
      return res.data;
    } catch (err) {
      console.error("Gagal ubah password:", err);
      return { success: false };
    }
  }
  
};
