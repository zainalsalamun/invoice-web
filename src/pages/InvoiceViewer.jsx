import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button, Box, Typography, Divider } from "@mui/material";
import { QRCodeCanvas } from "qrcode.react";
import logoRingnet from "../assets/logoringnet.png";
import { generatePDF } from "../utils/pdfGenerator";
import { invoiceService } from "../services/invoiceService";

const InvoiceViewer = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);

  useEffect(() => {
    const loadInvoice = async () => {
      // 🟢 Jika data dikirim dari InvoicePreview
      if (location.state?.data) {
        const data = normalizeInvoice(location.state.data);
        setInvoice(data);
        localStorage.setItem("lastInvoice", JSON.stringify(data));
      } else {
        // 🟡 Fallback: ambil dari localStorage
        const stored = localStorage.getItem("lastInvoice");
        if (stored) {
          setInvoice(JSON.parse(stored));
        } else if (invoiceId) {
          // 🔵 Jika tidak ada state/localStorage → ambil dari API
          try {
            const res = await invoiceService.getById(invoiceId);
            if (res) setInvoice(normalizeInvoice(res));
            else navigate("/");
          } catch {
            navigate("/");
          }
        } else {
          // 🚫 Tidak ada data sama sekali
          navigate("/");
        }
      }
    };

    loadInvoice();
  }, [location.state, invoiceId, navigate]);

  // 🔧 Normalisasi field agar kompatibel (snake_case → camelCase)
  const normalizeInvoice = (data) => ({
    nomorInvoice: data.nomorInvoice || data.nomor_invoice || "-",
    namaPelanggan: data.namaPelanggan || data.nama_pelanggan || "-",
    alamat: data.alamat || "-",
    layanan: data.layanan || "-",
    hargaPaket: data.hargaPaket || data.harga_paket || 0,
    ppn: data.ppn || 0,
    total: data.total || 0,
    periode: data.periode || "-",
    statusPembayaran: data.statusPembayaran || data.status_pembayaran || "-",
    tanggalInvoice: data.tanggalInvoice || data.tanggal_invoice || "-",
    tanggalJatuhTempo:
      data.tanggalJatuhTempo || data.tanggal_jatuh_tempo || "-",
  });

  if (!invoice)
    return <p style={{ textAlign: "center" }}>Memuat data invoice...</p>;

  const isLunas = invoice.statusPembayaran === "Lunas";
  const watermarkText = isLunas ? "LUNAS" : "BELUM LUNAS";
  const watermarkColor = isLunas
    ? "rgba(0, 128, 0, 0.15)"
    : "rgba(255, 0, 0, 0.12)";

  return (
    <Box
      sx={{
        background: "#f4f6f9",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 6,
      }}
    >
      <Box
        sx={{
          width: "820px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          p: 5,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Watermark */}
        <Typography
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(-25deg)",
            fontSize: "100px",
            fontWeight: 900,
            color: watermarkColor,
            opacity: 0.25,
            textTransform: "uppercase",
            userSelect: "none",
            pointerEvents: "none",
            zIndex: 0,
          }}
        >
          {watermarkText}
        </Typography>

        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 3,
            position: "relative",
            zIndex: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <img
              src={logoRingnet}
              alt="Ringnet Logo"
              width={85}
              height={85}
              style={{ borderRadius: 8 }}
            />
            <Box>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "#007bff", lineHeight: 1.1 }}
              >
                RINGNET
              </Typography>
              <Typography variant="subtitle2" sx={{ color: "#ff6600" }}>
                Internet Service Provider
              </Typography>
              <Typography variant="body2">
                Jl. Telekomunikasi No. 45, Yogyakarta
              </Typography>
              <Typography variant="body2">(0274) 123-456</Typography>
            </Box>
          </Box>
          <QRCodeCanvas value={invoice.nomorInvoice} size={85} />
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Title */}
        <Typography
          variant="h6"
          sx={{
            color: "#007bff",
            textAlign: "center",
            mb: 3,
            letterSpacing: "0.5px",
            fontWeight: 600,
          }}
        >
          INVOICE PEMBAYARAN INTERNET
        </Typography>

        {/* Detail Pelanggan */}
        <Box
          sx={{
            mb: 3,
            display: "flex",
            flexDirection: "column",
            gap: 0.5,
            fontSize: 15,
          }}
        >
          <Typography>
            <b>Nomor Invoice:</b> {invoice.nomorInvoice}
          </Typography>
          <Typography>
            <b>Tanggal:</b> {invoice.tanggalInvoice}
          </Typography>
          <Typography>
            <b>Nama Pelanggan:</b> {invoice.namaPelanggan}
          </Typography>
          <Typography>
            <b>Alamat:</b> {invoice.alamat}
          </Typography>
          <Typography>
            <b>Layanan:</b> {invoice.layanan}
          </Typography>
          <Typography>
            <b>Periode:</b> {invoice.periode}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Tabel Harga */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          <thead>
            <tr style={{ background: "#f0f0f0" }}>
              <th style={{ textAlign: "left", padding: "10px 8px" }}>
                Deskripsi
              </th>
              <th style={{ textAlign: "right", padding: "10px 8px" }}>Harga</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: "8px" }}>{invoice.layanan}</td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                Rp {invoice.hargaPaket?.toLocaleString("id-ID")}
              </td>
            </tr>
            <tr>
              <td style={{ padding: "8px" }}>PPN 11%</td>
              <td style={{ textAlign: "right", padding: "8px" }}>
                Rp {invoice.ppn?.toLocaleString("id-ID")}
              </td>
            </tr>
            <tr style={{ borderTop: "2px solid #ddd" }}>
              <td style={{ fontWeight: "bold", padding: "8px" }}>Total</td>
              <td
                style={{
                  textAlign: "right",
                  fontWeight: "bold",
                  padding: "8px",
                }}
              >
                Rp {invoice.total?.toLocaleString("id-ID")}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Status */}
        <Box sx={{ textAlign: "left", mb: 3 }}>
          <Typography>
            <b>Status Pembayaran:</b> {invoice.statusPembayaran}
          </Typography>
          <Typography>
            <b>Jatuh Tempo:</b> {invoice.tanggalJatuhTempo}
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        {/* Footer */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mt: 4,
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Typography variant="body2">
              Terima kasih telah menggunakan layanan <b>Ringnet</b> 🙏
            </Typography>
            <Typography variant="body2">
              Mohon lakukan pembayaran sebelum jatuh tempo.
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">Hormat kami,</Typography>
            <Typography
              variant="body2"
              sx={{ mt: 6, fontWeight: "bold", textTransform: "capitalize" }}
            >
              Admin Ringnet
            </Typography>
          </Box>
        </Box>

        {/* Tombol Aksi */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 5,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => generatePDF(invoice)}
          >
            📄 Generate PDF
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            ⬅️ Kembali
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceViewer;
