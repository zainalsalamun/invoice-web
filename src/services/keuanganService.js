import apiClient from "../utils/apiClient";

export const keuanganService = {
    async getSummary(periode = "") {
        const res = await apiClient.get("/keuangan/summary", { params: periode ? { periode } : {} });
        return res.data?.data || null;
    },
};
