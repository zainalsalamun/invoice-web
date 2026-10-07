import apiClient from "./apiClient";

export const getInvoiceProofUrl = (path, apiUrl = apiClient.defaults.baseURL) => {
  if (!path) return "";
  const value = String(path);
  if (/^https?:\/\//i.test(value)) return value;
  const base = String(apiUrl || "").replace(/\/api\/?$/, "").replace(/\/$/, "");
  const uploadPath = value.startsWith("/uploads/")
    ? value
    : `/uploads/invoices/${value.replace(/^\/+/, "")}`;
  return `${base}${uploadPath}`;
};
