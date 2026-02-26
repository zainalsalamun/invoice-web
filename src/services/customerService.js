import apiClient from "../utils/apiClient";

export const customerService = {
  async getAll() {
    try {
      const res = await apiClient.get("/customers");
      return res.data?.data || [];
    } catch (err) {
      console.error("Gagal ambil data pelanggan:", err);
      throw err;
    }
  },

  async getById(id) {
    try {
      const res = await apiClient.get(`/customers/${id}`);
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal ambil detail pelanggan:", err);
      throw err;
    }
  },

  async create(data) {
    try {
      const payload = buildFormData(data);
      const res = await apiClient.post("/customers", payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data?.data || null;
    } catch (err) {
      console.error("Gagal tambah pelanggan:", err);
      throw err;
    }
  },

  async update(id, data) {
    try {
      const payload = buildFormData(data);
      const res = await apiClient.put(`/customers/${id}`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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

/** Build FormData — mendukung upload file bukti_transfer */
function buildFormData(data) {
  const fd = new FormData();
  if (data.id_pelanggan) fd.append("id_pelanggan", data.id_pelanggan);
  if (data.nama) fd.append("nama", data.nama);
  if (data.alamat) fd.append("alamat", data.alamat);
  if (data.kategori_pelanggan) fd.append("kategori_pelanggan", data.kategori_pelanggan);
  if (data.nomor_wa) fd.append("nomor_wa", data.nomor_wa);
  if (data.paket) fd.append("paket", data.paket);
  if (data.paket_layanan) fd.append("paket_layanan", data.paket_layanan);
  if (data.ppn) fd.append("ppn", parseFloat(data.ppn) || 0);
  if (data.tanggal_jatuh_tempo) fd.append("tanggal_jatuh_tempo", data.tanggal_jatuh_tempo);
  if (data.harga_langganan !== undefined) fd.append("harga_langganan", parseFloat(data.harga_langganan) || 0);
  if (data.metode_pembayaran_id) fd.append("metode_pembayaran_id", data.metode_pembayaran_id);
  if (data.notes) fd.append("notes", data.notes);
  if (data.status_pembayaran) fd.append("status_pembayaran", data.status_pembayaran);
  if (data.tagihan_periode_bulan) fd.append("tagihan_periode_bulan", data.tagihan_periode_bulan);
  fd.append("aktif", data.aktif !== undefined ? data.aktif : true);

  // File upload — hanya append jika berupa File object
  if (data.bukti_transfer instanceof File) {
    fd.append("bukti_transfer", data.bukti_transfer);
  }

  if (data.items && Array.isArray(data.items)) {
    // Sanitize items before stringifying
    const sanitizedItems = data.items.map(it => ({
      deskripsi: it.deskripsi || "Item",
      harga: parseFloat(it.harga) || 0,
      qty: parseInt(it.qty) || 1,
      jumlah: (parseFloat(it.harga) || 0) * (parseInt(it.qty) || 1)
    }));
    fd.append("items", JSON.stringify(sanitizedItems));
  }

  return fd;
}
