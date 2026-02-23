import apiClient from "../utils/apiClient";

export const keuanganService = {
    async getSummary() {
        try {
            const res = await apiClient.get("/keuangan/summary");
            return res.data?.data || null;
        } catch (err) {
            console.error("Gagal ambil ringkasan keuangan:", err);
            return null;
        }
    },
};
