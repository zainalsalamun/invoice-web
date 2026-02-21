import apiClient from "../utils/apiClient";

export const metodePembayaranService = {
    async getAll() {
        try {
            const res = await apiClient.get("/metode-pembayaran");
            return res.data?.data || [];
        } catch (err) {
            console.error("Gagal ambil metode pembayaran:", err);
            return [];
        }
    },

    async create(nama) {
        const res = await apiClient.post("/metode-pembayaran", { nama });
        return res.data?.data;
    },

    async update(id, nama) {
        const res = await apiClient.put(`/metode-pembayaran/${id}`, { nama });
        return res.data?.data;
    },

    async remove(id) {
        const res = await apiClient.delete(`/metode-pembayaran/${id}`);
        return res.data?.message;
    },
};
