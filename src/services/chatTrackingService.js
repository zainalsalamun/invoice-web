import apiClient from "../utils/apiClient";

export const chatTrackingService = {
    async getAll(params = {}) {
        try {
            const res = await apiClient.get("/chat-tracking", { params });
            return res.data?.data || [];
        } catch (err) {
            console.error("Gagal ambil data chat tracking:", err);
            return [];
        }
    },

    async create(data) {
        try {
            const res = await apiClient.post("/chat-tracking", data);
            return res.data?.data || null;
        } catch (err) {
            console.error("Gagal tambah chat tracking:", err);
            throw err;
        }
    },

    async bulkCreate(data) {
        try {
            const res = await apiClient.post("/chat-tracking/bulk", { data });
            return res.data || null;
        } catch (err) {
            console.error("Gagal import chat tracking:", err);
            throw err;
        }
    },

    async update(id, data) {
        try {
            const res = await apiClient.put(`/chat-tracking/${id}`, data);
            return res.data?.data || null;
        } catch (err) {
            console.error("Gagal update chat tracking:", err);
            throw err;
        }
    },

    async remove(id) {
        try {
            const res = await apiClient.delete(`/chat-tracking/${id}`);
            return res.data?.message || null;
        } catch (err) {
            console.error("Gagal hapus chat tracking:", err);
            throw err;
        }
    },
};
