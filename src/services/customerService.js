import apiClient from "../utils/apiClient";

export const customerService = {
  async getAll() {
    try {
      const res = await apiClient.get("/customers");
      return res.data?.data || [];
    } catch (err) {
      console.error(" Gagal ambil data pelanggan:", err);
      return [];
    }
  },

  // 🔹 Tambah pelanggan baru
  async create(data) {
    try {
      const res = await apiClient.post("/customers", data);
      return res.data?.data || null;
    } catch (err) {
      console.error(" Gagal tambah pelanggan:", err);
      return null;
    }
  },

  // 🔹 Update pelanggan
  async update(id, data) {
    try {
      const res = await apiClient.put(`/customers/${id}`, data);
      return res.data?.data || null;
    } catch (err) {
      console.error(" Gagal update pelanggan:", err);
      return null;
    }
  },

  // 🔹 Hapus pelanggan
  async remove(id) {
    try {
      const res = await apiClient.delete(`/customers/${id}`);
      return res.data?.message || null;
    } catch (err) {
      console.error(" Gagal hapus pelanggan:", err);
      return null;
    }
  },
};

