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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { AttachFileOutlined, ErrorOutline, ReceiptLongOutlined, PaymentsOutlined } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { invoiceService } from "../services/invoiceService";
import { authService } from "../services/authService";
import { getInvoiceProofUrl } from "../utils/invoiceProofUrl";
import { getPaymentDue } from "../utils/invoicePaymentBalance";
import InvoicePaymentDialog from "../components/InvoicePaymentDialog";
import InvoicePaymentVoidDialog from "../components/InvoicePaymentVoidDialog";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 2,
}).format(Number(value || 0));

const formatDate = (value) => value
  ? new Date(value).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
  : "-";

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [payments, setPayments] = useState([]);
  const [paymentsError, setPaymentsError] = useState("");
  const [loading, setLoading] = useState(true);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentNotice, setPaymentNotice] = useState("");
  const [paymentOpenError, setPaymentOpenError] = useState("");
  const [paymentToVoid, setPaymentToVoid] = useState(null);
  const canRecordPayment = ["super_admin", "admin", "kasir"].includes(authService.getCurrentUser()?.role);
  const canVoidPayment = ["super_admin", "admin"].includes(authService.getCurrentUser()?.role);

  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const data = await invoiceService.getById(id);
        setInvoice(data);
        if (data) {
          try {
            setPayments(await invoiceService.getPayments(id));
          } catch (error) {
            setPaymentsError(error.response?.data?.message || "Riwayat pembayaran gagal dimuat.");
          }
        }
      } catch (error) {
        console.error("Gagal mengambil invoice:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const openPaymentDialog = async () => {
    setPaymentOpenError("");
    const current = await invoiceService.getById(id);
    if (!current) {
      setPaymentOpenError("Invoice terbaru gagal dimuat. Coba lagi sebelum mencatat pembayaran.");
      return;
    }
    setInvoice(current);
    if (current.status_pembayaran === "Lunas" || !(getPaymentDue(current) > 0)) {
      setPaymentOpenError("Saldo invoice sudah lunas atau perlu diperiksa. Pembayaran baru tidak dapat dicatat.");
      return;
    }
    setPaymentDialogOpen(true);
  };

  const handlePaymentSuccess = async (updatedInvoice, message) => {
    setInvoice(updatedInvoice);
    setPaymentNotice(message || "Pembayaran berhasil dicatat.");
    setPaymentsError("");
    try {
      setPayments(await invoiceService.getPayments(id));
    } catch (error) {
      setPaymentsError(error.response?.data?.message || "Pembayaran tercatat, tetapi riwayat belum dapat dimuat ulang.");
    }
  };

  const handleVoidSuccess = async (updatedInvoice, message) => {
    setInvoice(updatedInvoice);
    setPaymentNotice(message || "Pembayaran berhasil dibatalkan.");
    setPaymentsError("");
    try {
      setPayments(await invoiceService.getPayments(id));
    } catch (error) {
      setPaymentsError(error.response?.data?.message || "Pembayaran dibatalkan, tetapi riwayat belum dapat dimuat ulang.");
    }
  };

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
        <Typography color="error" fontSize={18} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <ErrorOutline aria-hidden="true" /> Invoice tidak ditemukan
        </Typography>
      </Box>
    );
  }

  const total = Number(invoice.total || 0);
  const paid = Number(invoice.total_bayar || 0);
  const withheld = Number(invoice.pph23 || 0);
  const remaining = getPaymentDue(invoice);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
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
            maxWidth: 960,
            mx: "auto",
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
            <Typography variant="h5" sx={{ fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}>
              <ReceiptLongOutlined aria-hidden="true" /> Detail Invoice
            </Typography>
            {canRecordPayment && invoice.status_pembayaran !== "Lunas" && remaining !== null && remaining > 0 && (
              <Button variant="contained" startIcon={<PaymentsOutlined />} onClick={openPaymentDialog} sx={{ textTransform: "none" }}>
                Catat Bayar
              </Button>
            )}
          </Box>

          {paymentNotice && <Alert severity="success" onClose={() => setPaymentNotice("")} sx={{ mb: 2 }}>{paymentNotice}</Alert>}
          {paymentOpenError && <Alert severity="error" sx={{ mb: 2 }}>{paymentOpenError}</Alert>}
          {remaining === null && <Alert severity="warning" sx={{ mb: 2 }}>Total invoice atau pembayaran sebelumnya perlu diperiksa sebelum pembayaran baru dicatat.</Alert>}

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
              <b>{formatRupiah(total)}</b>
            </Typography>
            <Typography><b>Sudah Dibayar:</b> {formatRupiah(paid)}</Typography>
            <Typography><b>PPh23:</b> {formatRupiah(withheld)}</Typography>
            <Typography><b>Sisa Tagihan:</b> {remaining === null ? "Perlu pemeriksaan total dan PPN" : formatRupiah(remaining)}</Typography>
            <Typography sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <b>Status:</b>{" "}
              <Chip
                label={invoice.status_pembayaran}
                color={
                  invoice.status_pembayaran === "Lunas" ? "success" : invoice.status_pembayaran === "Cicil" ? "info" : "warning"
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

          <Typography variant="h6" sx={{ mb: 1.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 1 }}>
            <PaymentsOutlined aria-hidden="true" /> Riwayat Pembayaran
          </Typography>
          {paymentsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>{paymentsError}</Alert>
          ) : payments.length === 0 ? (
            <Alert severity="info" sx={{ mb: 2 }}>
              Belum ada transaksi di riwayat pembayaran baru.
              {paid > 0 && " Total terbayar yang sudah tersimpan tetap ditampilkan di atas."}
            </Alert>
          ) : (
            <TableContainer sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, mb: 2 }}>
              <Table size="small" sx={{ minWidth: 900 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>Tanggal</TableCell>
                    <TableCell align="right">Nominal</TableCell>
                    <TableCell>Metode</TableCell>
                    <TableCell>Dicatat oleh</TableCell>
                    <TableCell>Bukti</TableCell>
                    <TableCell>Status</TableCell>
                    {canVoidPayment && <TableCell align="right">Aksi</TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {payments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell>{formatDate(payment.paid_at)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{formatRupiah(payment.amount)}</TableCell>
                      <TableCell>{payment.metode_pembayaran_nama || "-"}</TableCell>
                      <TableCell>{payment.recorded_by_name || "-"}</TableCell>
                      <TableCell>
                        {payment.bukti_transfer ? (
                          <Button size="small" href={getInvoiceProofUrl(payment.bukti_transfer)} target="_blank" rel="noopener noreferrer">
                            Lihat bukti
                          </Button>
                        ) : "-"}
                      </TableCell>
                      <TableCell>
                        {payment.voided_at ? (
                          <Box>
                            <Chip size="small" color="default" label="Dibatalkan" />
                            <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.5 }}>
                              {formatDate(payment.voided_at)} oleh {payment.voided_by_name || "Petugas"}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              Alasan: {payment.void_reason}
                            </Typography>
                          </Box>
                        ) : <Chip size="small" color="success" label="Aktif" />}
                      </TableCell>
                      {canVoidPayment && (
                        <TableCell align="right">
                          {!payment.voided_at && (
                            <Button size="small" color="error" variant="outlined" onClick={() => setPaymentToVoid(payment)}>
                              Batalkan
                            </Button>
                          )}
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          <Divider sx={{ my: 3 }} />

          {invoice.bukti_transfer ? (
            <>
              <Typography
                variant="h6"
                sx={{ mb: 1, fontWeight: "bold", display: "flex", alignItems: "center", gap: 1 }}
              >
                <AttachFileOutlined aria-hidden="true" /> Bukti Transfer
              </Typography>
              <Box
                sx={{
                  p: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: (theme) => theme.palette.mode === "dark" ? "#141720" : "#fafafa",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                {invoice.bukti_transfer?.endsWith(".pdf") ? (
                  <iframe
                    src={getInvoiceProofUrl(invoice.bukti_transfer)}
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
                    src={getInvoiceProofUrl(invoice.bukti_transfer)}
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
                  href={getInvoiceProofUrl(invoice.bukti_transfer)}
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
      <InvoicePaymentDialog
        open={paymentDialogOpen}
        invoice={invoice}
        onClose={() => setPaymentDialogOpen(false)}
        onSuccess={handlePaymentSuccess}
      />
      <InvoicePaymentVoidDialog
        invoiceId={id}
        payment={paymentToVoid}
        onClose={() => setPaymentToVoid(null)}
        onSuccess={handleVoidSuccess}
      />
    </Box>
  );
};

export default InvoiceDetailPage;
