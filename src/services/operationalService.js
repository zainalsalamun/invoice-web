import apiClient from "../utils/apiClient";

const unwrap = (response, fallback = null) => response.data?.data ?? fallback;

export const operationalService = {
  async getDashboardSummary() {
    return unwrap(await apiClient.get("/dashboard/summary"), {});
  },
  async getServicePlans(params = {}) {
    return unwrap(await apiClient.get("/service-plans", { params }), []);
  },
  async createServicePlan(payload) {
    return unwrap(await apiClient.post("/service-plans", payload));
  },
  async updateServicePlan(id, payload) {
    return unwrap(await apiClient.put(`/service-plans/${id}`, payload));
  },
  async getAssets(params = {}) {
    return unwrap(await apiClient.get("/assets", { params }), []);
  },
  async createAsset(payload) {
    return unwrap(await apiClient.post("/assets", payload));
  },
  async updateAsset(id, payload) {
    return unwrap(await apiClient.put(`/assets/${id}`, payload));
  },
  async getSystemRequests(params = {}) {
    return unwrap(await apiClient.get("/system-requests", { params }), []);
  },
  async createSystemRequest(payload) {
    return unwrap(await apiClient.post("/system-requests", payload));
  },
  async updateSystemRequest(id, payload) {
    return unwrap(await apiClient.put(`/system-requests/${id}`, payload));
  },
  async getReportsOverview() {
    return unwrap(await apiClient.get("/reports/overview"), {});
  },
};
