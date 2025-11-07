import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:2002/api";

export const invoiceService = {
  // 🔹 Ambil semua invoice
  async getAll() {
    try {
      const res = await axios.get(`${BASE_URL}/invoices`);
      // ✅ backend kirim { success: true, data: [...] }
      return res.data?.data || []; 
    } catch (err) {
      console.error("❌ Gagal ambil data invoice:", err);
      return [];
    }
  },

  // 🔹 Ambil invoice by ID
  async getById(id) {
    try {
      const res = await axios.get(`${BASE_URL}/invoices/${id}`);
      // ✅ backend kirim { success: true, data: {...} }
      return res.data?.data || null;
    } catch (err) {
      console.error("❌ Gagal ambil detail invoice:", err);
      return null;
    }
  },

  // 🔹 Update status pembayaran
  async updateStatus(id, status_pembayaran) {
    try {
      const res = await axios.put(`${BASE_URL}/invoices/${id}`, {
        status_pembayaran,
      });
      return res.data?.data || null;
    } catch (err) {
      console.error("❌ Gagal update status:", err);
      return null;
    }
  },

  // 🔹 Buat invoice baru
  async create(data) {
    try {
      const res = await axios.post(`${BASE_URL}/invoices`, data);
      return res.data?.data || null;
    } catch (err) {
      console.error("❌ Gagal buat invoice:", err);
      return null;
    }
  },

  // 🔹 Hapus invoice
  async delete(id) {
    try {
      const res = await axios.delete(`${BASE_URL}/invoices/${id}`);
      return res.data?.message || null;
    } catch (err) {
      console.error("❌ Gagal hapus invoice:", err);
      return null;
    }
  },
};
