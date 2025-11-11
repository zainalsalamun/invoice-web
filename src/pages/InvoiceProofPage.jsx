import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { invoiceService } from "../services/invoiceService";

const InvoiceProofPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [uploading, setUploading] = useState(false);
//   const [filePreview, setFilePreview] = useState(null);

  const fetchInvoice = async () => {
    try {
      const data = await invoiceService.getById(id);
      setInvoice(data);
    } catch (err) {
      console.error("Gagal memuat data invoice:", err);
    }
  };

  useEffect(() => {
    fetchInvoice();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const res = await invoiceService.uploadProof(id, file);
      if (res?.success) {
        alert("✅ Bukti pembayaran berhasil diupload!");
        await fetchInvoice();
      } else {
        alert("❌ Upload gagal, coba lagi.");
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setUploading(false);
    }
  };

  if (!invoice) {
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
          <Typography variant="h6" sx={{ mb: 3, fontWeight: "bold" }}>
            🧾 Bukti Pembayaran
          </Typography>

          <Typography><b>Nomor Invoice:</b> {invoice.nomor_invoice}</Typography>
          <Typography><b>Nama Pelanggan:</b> {invoice.nama_pelanggan}</Typography>
          <Typography><b>Total:</b> Rp {invoice.total?.toLocaleString("id-ID")}</Typography>

          <Box sx={{ my: 3 }}>
            {invoice.bukti_transfer ? (
              <Box>
                <Typography sx={{ mb: 1 }}>📎 Bukti yang diupload:</Typography>
                <img
                  src={`http://localhost:2002${invoice.bukti_transfer}`}
                  alt="Bukti Transfer"
                  style={{
                    maxWidth: "100%",
                    borderRadius: 8,
                    border: "1px solid #ddd",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                />
              </Box>
            ) : (
              <Typography sx={{ color: "gray" }}>
                Belum ada bukti pembayaran.
              </Typography>
            )}
          </Box>

          <Button
            variant="contained"
            component="label"
            color="primary"
            disabled={uploading}
            sx={{ textTransform: "none" }}
          >
            {uploading ? "Mengunggah..." : "Upload Bukti Baru"}
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleUpload}
            />
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            sx={{ ml: 2, textTransform: "none" }}
            onClick={() => navigate(-1)}
          >
            Kembali
          </Button>
        </Paper>
      </Box>
    </Box>
  );
};

export default InvoiceProofPage;
