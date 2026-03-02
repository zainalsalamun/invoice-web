// import apiClient from "../utils/apiClient";

// export const invoiceService = {
//   async getAll() {
//     try {
//       const res = await apiClient.get("/invoices");
//       return res.data?.data || [];
//     } catch (err) {
//       console.error("Gagal ambil data invoice:", err);
//       return [];
//     }
//   },

//   async getById(id) {
//     try {
//       const res = await apiClient.get(`/invoices/${id}`);
//       return res.data?.data || null;
//     } catch (err) {
//       console.error("Gagal ambil detail invoice:", err);
//       return null;
//     }
//   },

//   async updateStatus(id, status_pembayaran) {
//     try {
//       const res = await apiClient.put(`/invoices/${id}`, { status_pembayaran });
//       return res.data?.data || null;
//     } catch (err) {
//       console.error("Gagal update status:", err);
//       return null;
//     }
//   },

//   async create(data) {
//     try {
//       const res = await apiClient.post("/invoices", data);
//       return res.data;
//     } catch (err) {
//       console.error("Gagal buat invoice:", err);
//       return null;
//     }
//   },

//   async delete(id) {
//     try {
//       const res = await apiClient.delete(`/invoices/${id}`);
//       return res.data?.message || null;
//     } catch (err) {
//       console.error("Gagal hapus invoice:", err);
//       return null;
//     }
//   },


//   async uploadProof(id, file) {
//     try {
//       const formData = new FormData();
//       formData.append("bukti_transfer", file);

//       const res = await apiClient.put(`/invoices/${id}/upload`, formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       return res.data;
//     } catch (err) {
//       console.error("Gagal upload bukti pembayaran:", err);
//       return null;
//     }
//   },
// };


import apiClient from "../utils/apiClient";

export const invoiceService = {
  async getAll() {
    try {
      const res = await apiClient.get("/invoices");
      return res.data?.data || [];
    } catch (err) {
      console.error("Gagal ambil data invoice:", err);
      return [];
    }
  },

  async getById(id) {
    if (!id || id === "null" || id === "undefined") {
      console.warn("⚠️ getById dipanggil dengan ID tidak valid:", id);
      return null;
    }
    try {
      const res = await apiClient.get(`/invoices/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal ambil detail invoice:", err);
      return null;
    }
  },

  async updateStatus(id, status_pembayaran) {
    if (!id || id === "null" || id === "undefined") return null;
    try {
      const res = await apiClient.put(`/invoices/${id}`, { status_pembayaran });
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal update status:", err);
      return null;
    }
  },

  async create(data) {
    const res = await apiClient.post("/invoices", data);
    return res.data;
  },

  async update(id, data) {
    if (!id || id === "null" || id === "undefined") return null;
    try {
      const res = await apiClient.put(`/invoices/${id}`, data);
      return res.data;
    } catch (err) {
      console.error("Gagal update invoice:", err);
      return null;
    }
  },

  // Konfirmasi pembayaran: update status + upload bukti dalam 1 request
  async confirmPayment(id, { status_pembayaran, tanggal_pembayaran, metode_pembayaran_id, kurang_bayar, buktiFile }) {
    if (!id || id === "null" || id === "undefined") return null;
    try {
      const formData = new FormData();
      formData.append("status_pembayaran", status_pembayaran || "Lunas");
      if (tanggal_pembayaran) formData.append("tanggal_pembayaran", tanggal_pembayaran);
      if (metode_pembayaran_id) formData.append("metode_pembayaran_id", metode_pembayaran_id);
      formData.append("kurang_bayar", kurang_bayar || 0);
      if (buktiFile) formData.append("bukti_transfer", buktiFile);

      const res = await apiClient.post(`/invoices/${id}/confirm`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    } catch (err) {
      console.error("Gagal konfirmasi pembayaran:", err);
      throw err;
    }
  },


  async delete(id) {
    if (!id || id === "null" || id === "undefined") return null;
    try {
      const res = await apiClient.delete(`/invoices/${id}`);
      return res.data?.message || null;
    } catch (err) {
      console.error("Gagal hapus invoice:", err);
      return null;
    }
  },

  async uploadProof(id, file) {
    if (!id || id === "null" || id === "undefined") return null;
    try {
      const formData = new FormData();
      formData.append("bukti_transfer", file);

      const res = await apiClient.post(`/invoices/${id}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return res.data;
    } catch (err) {
      console.error("Gagal upload bukti pembayaran:", err);
      return null;
    }
  },

  async getMonthlyStats() {
    try {
      const res = await apiClient.get("/invoices/stats/monthly");
      return res.data?.data || [];
    } catch (err) {
      console.error("Gagal ambil data statistik bulanan:", err);
      return [];
    }
  },


};


