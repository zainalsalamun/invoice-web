// src/services/customerService.js
import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:2002/api";

export const customerService = {
  async getAll() {
    try {
      const res = await axios.get(`${BASE_URL}/customers`);
      return res.data?.data || [];
    } catch (err) {
      console.error("❌ Gagal ambil data pelanggan:", err);
      return [];
    }
  },

  async create(data) {
    try {
      const res = await axios.post(`${BASE_URL}/customers`, data);
      return res.data?.data || null;
    } catch (err) {
      console.error("❌ Gagal tambah pelanggan:", err);
      return null;
    }
  },

  async update(id, data) {
    try {
      const res = await axios.put(`${BASE_URL}/customers/${id}`, data);
      return res.data?.data || null;
    } catch (err) {
      console.error("❌ Gagal update pelanggan:", err);
      return null;
    }
  },

  async remove(id) {
    try {
      const res = await axios.delete(`${BASE_URL}/customers/${id}`);
      return res.data?.message || null;
    } catch (err) {
      console.error("❌ Gagal hapus pelanggan:", err);
      return null;
    }
  },
};
