import apiClient from "../utils/apiClient";

export const chatTrackingService = {
    async getAll(params = {}) {
        const res = await apiClient.get("/chat-tracking", { params });
        return res.data?.data || [];
    },

    async getPage(params = {}) {
        const res = await apiClient.get("/chat-tracking", { params });
        return {
            data: res.data?.data || [],
            pagination: res.data?.pagination || { total: 0, page: params.page, pageSize: params.pageSize },
        };
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

    async previewImport(data) {
        try {
            const res = await apiClient.post("/chat-tracking/import/preview", data);
            return res.data?.data || null;
        } catch (err) {
            throw err;
        }
    },

    async stageImport(data) {
        try {
            const res = await apiClient.post("/chat-tracking/import/stage", data);
            return res.data || null;
        } catch (err) {
            throw err;
        }
    },

    async listImportBatches(params = {}) {
        const res = await apiClient.get("/chat-tracking/import/batches", { params });
        return { data: res.data?.data || [], pagination: res.data?.pagination || { total: 0 } };
    },

    async listImportRows(batchId, params = {}) {
        const res = await apiClient.get(`/chat-tracking/import/batches/${batchId}/rows`, { params });
        return {
            batch: res.data?.batch || null,
            data: res.data?.data || [],
            pagination: res.data?.pagination || { total: 0 },
        };
    },

    async correctImportRow(batchId, rowId, data) {
        const res = await apiClient.put(`/chat-tracking/import/batches/${batchId}/rows/${rowId}`, data);
        return res.data?.data || null;
    },

    async getImportReconciliation(batchId) {
        const res = await apiClient.get(`/chat-tracking/import/batches/${batchId}/reconciliation`);
        return res.data?.data || null;
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
