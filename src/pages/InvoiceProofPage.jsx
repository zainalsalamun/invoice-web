import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { AttachFileOutlined, CloudUploadOutlined, ReceiptLongOutlined } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { invoiceService } from "../services/invoiceService";
import { getInvoiceProofUrl } from "../utils/invoiceProofUrl";
import { authService } from "../services/authService";

const InvoiceProofPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canUpload = ["super_admin", "admin", "kasir"].includes(authService.getCurrentUser()?.role);
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const fetchInvoice = async () => {
    try {
      const data = await invoiceService.getById(id);
      setInvoice(data);
      if (!data) setFeedback({ severity: "error", message: "Invoice tidak ditemukan atau gagal dimuat." });
    } catch (err) {
      console.error("Gagal memuat data invoice:", err);
      setFeedback({ severity: "error", message: "Invoice gagal dimuat. Coba kembali ke daftar invoice." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFeedback(null);
    setUploading(true);
    try {
      const res = await invoiceService.uploadProof(id, file);
      if (res?.success) {
        setFeedback({ severity: "success", message: "Bukti berhasil diunggah. Status pembayaran tidak berubah." });
        await fetchInvoice();
      } else {
        setFeedback({ severity: "error", message: "Unggah bukti gagal. Periksa format file dan coba lagi." });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ severity: "error", message: "Terjadi kesalahan saat mengunggah bukti." });
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  if (loading) {
    return (
      <Box
        sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="dashboard" />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 3, maxWidth: 600 }}>
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
            <ReceiptLongOutlined aria-hidden="true" /> Bukti Pembayaran
          </Typography>

          {feedback && <Alert severity={feedback.severity} sx={{ mb: 2 }}>{feedback.message}</Alert>}

          {!invoice ? (
            <Button variant="outlined" onClick={() => navigate("/invoices")}>Kembali ke Daftar Invoice</Button>
          ) : (
            <>

          <Typography><b>Nomor Invoice:</b> {invoice.nomor_invoice}</Typography>
          <Typography><b>Nama Pelanggan:</b> {invoice.nama_pelanggan}</Typography>
          <Typography><b>Total:</b> Rp {invoice.total?.toLocaleString("id-ID")}</Typography>

          <Box sx={{ my: 3 }}>
            {invoice.bukti_transfer ? (
              <Box>
                <Typography sx={{ mb: 1, display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AttachFileOutlined aria-hidden="true" /> Bukti yang diupload:
                </Typography>
                {invoice.bukti_transfer?.endsWith(".pdf") ? (
                  <iframe
                    src={getInvoiceProofUrl(invoice.bukti_transfer)}
                    title="Bukti Transfer PDF"
                    width="100%"
                    height="400px"
                    style={{ border: "1px solid #ddd", borderRadius: 8 }}
                  />
                ) : (
                  <img
                    src={getInvoiceProofUrl(invoice.bukti_transfer)}
                    alt="Bukti Transfer"
                    style={{
                      maxWidth: "100%",
                      borderRadius: 8,
                      border: "1px solid #ddd",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  />
                )}
              </Box>
            ) : (
              <Typography sx={{ color: "gray" }}>
                Belum ada bukti pembayaran.
              </Typography>
            )}
          </Box>

          {canUpload && <Button
            variant="contained"
            component="label"
            color="primary"
            disabled={uploading}
            startIcon={<CloudUploadOutlined />}
            sx={{ textTransform: "none" }}
          >
            {uploading ? "Mengunggah..." : "Upload Bukti Baru"}
            <input
              type="file"
              accept="image/jpeg,image/png,application/pdf"
              hidden
              onChange={handleUpload}
            />
          </Button>}

          <Button
            variant="outlined"
            color="secondary"
            sx={{ ml: 2, textTransform: "none" }}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
};

export default InvoiceProofPage;
