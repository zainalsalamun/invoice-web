import apiClient from "../utils/apiClient";

export const customerService = {
  async getAll() {
    try {
      const res = await apiClient.get("/customers");
      return res.data?.data || [];
    } catch (err) {
      console.error("Gagal ambil data pelanggan:", err);
      return [];
    }
  },

  async getById(id) {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal ambil detail pelanggan:", err);
      return null;
    }
  },

  async create(data) {
    try {
      const payload = buildPayload(data);
      const res = await apiClient.post("/customers", payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal tambah pelanggan:", err);
      throw err;
    }
  },

  async update(id, data) {
    try {
      const payload = buildPayload(data);
      const res = await apiClient.put(`/customers/${id}`, payload);
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal update pelanggan:", err);
      throw err;
    }
  },

  async remove(id) {
    try {
      const res = await apiClient.delete(`/customers/${id}`);
      return res.data?.message || null;
    } catch (err) {
      console.error("Gagal hapus pelanggan:", err);
      throw err;
    }
  },
};

/** Bersihkan dan format payload sebelum dikirim ke API */
function buildPayload(data) {
  return {
    id_pelanggan: data.id_pelanggan || null,
    nama: data.nama || "",
    alamat: data.alamat || null,
    nomor_wa: data.nomor_wa || "",
    paket: data.paket || "",
    area: data.area || "",
    aktif: data.aktif !== undefined ? data.aktif : true,
    tanggal_aktivasi: data.tanggal_aktivasi || null,
    tanggal_jatuh_tempo: data.tanggal_jatuh_tempo || null,
    harga_langganan: data.harga_langganan ? parseFloat(data.harga_langganan) : null,
    metode_pembayaran: data.metode_pembayaran || null,
    bukti_transfer: data.bukti_transfer || null,
  };
}
