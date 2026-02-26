import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Divider,
  Button,
  CircularProgress,
  Chip,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { invoiceService } from "../services/invoiceService";

const getApiBase = () => {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return ""; // Kosongkan agar menggunakan proxy Vercel
  let url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  return url.replace("/api", "");
};

const API_BASE = getApiBase();

const getBuktiUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http")) return path.replace(/https?:\/\/43\.134\.180\.249:3000/g, "");
  return path.startsWith("/uploads") ? `${API_BASE}${path}` : `${API_BASE}/uploads/bukti_transfer/${path}`;
};

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await invoiceService.getById(id);
        setInvoice(data);
      } catch (error) {
        console.error("❌ Gagal mengambil invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!invoice) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography color="error" fontSize={18}>
          Invoice tidak ditemukan ❌
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", backgroundColor: "#f9fafb" }}>
      <Sidebar active="invoices" />

      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Button
          onClick={() => navigate(-1)}
          variant="outlined"
          sx={{
            mb: 3,
            textTransform: "none",
            borderRadius: 2,
          }}
        >
          ← Kembali ke Daftar Invoice
        </Button>

        <Paper
          sx={{
            p: 4,
            borderRadius: 3,
            boxShadow: 3,
            maxWidth: 800,
            mx: "auto",
            backgroundColor: "#fff",
          }}
        >
          <Typography variant="h5" sx={{ mb: 3, fontWeight: "bold" }}>
            🧾 Detail Invoice
          </Typography>

          <Box sx={{ mb: 2 }}>
            <Typography>
              <b>Nomor Invoice:</b> {invoice.nomor_invoice}
            </Typography>
            <Typography>
              <b>Nama Pelanggan:</b> {invoice.nama_pelanggan}
            </Typography>
            <Typography>
              <b>Alamat:</b> {invoice.alamat || "-"}
            </Typography>
            <Typography>
              <b>Layanan:</b> {invoice.layanan}
            </Typography>
            <Typography>
              <b>Periode:</b> {invoice.periode}
            </Typography>
            <Typography>
              <b>Total Tagihan:</b>{" "}
              <b style={{ color: "#007bff" }}>
                Rp {invoice.total?.toLocaleString("id-ID")}
              </b>
            </Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <b>Status:</b>{" "}
              <Chip
                label={invoice.status_pembayaran}
                color={
                  invoice.status_pembayaran === "Lunas" ? "success" : "warning"
                }
                size="small"
              />
            </Typography>
            <Typography>
              <b>Tanggal Invoice:</b>{" "}
              {invoice.tanggal_invoice
                ? new Date(invoice.tanggal_invoice).toLocaleDateString("id-ID")
                : "-"}
            </Typography>
            <Typography>
              <b>Jatuh Tempo:</b>{" "}
              {invoice.tanggal_jatuh_tempo
                ? new Date(invoice.tanggal_jatuh_tempo).toLocaleDateString("id-ID")
                : "-"}
            </Typography>
          </Box>

          <Divider sx={{ my: 3 }} />

          {invoice.bukti_transfer ? (
            <>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}
              >
                📎 Bukti Transfer
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid #ddd",
                  borderRadius: 2,
                  backgroundColor: "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {invoice.bukti_transfer?.endsWith(".pdf") ? (
                  <iframe
                    src={getBuktiUrl(invoice.bukti_transfer)}
                    title="Bukti Transfer PDF"
                    style={{
                      width: "100%",
                      maxWidth: 400,
                      height: 500,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      marginBottom: 8,
                    }}
                  />
                ) : (
                  <img
                    src={getBuktiUrl(invoice.bukti_transfer)}
                    alt="Bukti Transfer"
                    style={{
                      width: "100%",
                      maxWidth: 400,
                      borderRadius: 8,
                      border: "1px solid #ccc",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      marginBottom: 8,
                    }}
                  />
                )}
                <Button
                  variant="contained"
                  color="primary"
                  href={getBuktiUrl(invoice.bukti_transfer)}
                  target="_blank"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                  }}
                >
                  Lihat / Download Bukti
                </Button>
              </Box>
            </>
          ) : (
            <Typography
              sx={{
                mt: 2,
                color: "gray",
                fontStyle: "italic",
              }}
            >
              Belum ada bukti transfer untuk invoice ini.
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default InvoiceDetailPage;
