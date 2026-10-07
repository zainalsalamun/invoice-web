import React, { useEffect, useState } from "react";
import dayjs from "dayjs";
import {
  Alert, Box, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography,
} from "@mui/material";
import { PaymentsOutlined, UploadFileOutlined } from "@mui/icons-material";
import { invoiceService } from "../services/invoiceService";
import { metodePembayaranService } from "../services/metodePembayaranService";
import { getPaymentDue, isValidPaymentAmount } from "../utils/invoicePaymentBalance";
import { createPaymentRequestId } from "../utils/paymentRequestId";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 2,
}).format(Number(value || 0));

const acceptedProofTypes = ["image/jpeg", "image/png", "application/pdf"];

const InvoicePaymentDialog = ({ open, invoice, onClose, onSuccess }) => {
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [methodId, setMethodId] = useState("");
  const [methods, setMethods] = useState([]);
  const [proof, setProof] = useState(null);
  const [requestId, setRequestId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || !invoice?.id) return;
    setAmount("");
    setDate(dayjs().format("YYYY-MM-DD"));
    setMethodId(invoice.metode_pembayaran_id || "");
    setProof(null);
    setRequestId(createPaymentRequestId());
    setError("");
    let active = true;
    metodePembayaranService.getAll().then((list) => {
      if (active) setMethods(list || []);
    });
    return () => { active = false; };
  }, [open, invoice?.id, invoice?.metode_pembayaran_id]);

  const due = getPaymentDue(invoice);
  const validAmount = isValidPaymentAmount(amount, due);
  const changeRequest = () => {
    setRequestId(createPaymentRequestId());
    setError("");
  };

  const handleProof = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!acceptedProofTypes.includes(file.type) || file.size > 3 * 1024 * 1024) {
      setError("Bukti harus berupa JPG, PNG, atau PDF berukuran maksimal 3 MB.");
      event.target.value = "";
      return;
    }
    setProof(file);
    changeRequest();
  };

  const handleSubmit = async () => {
    if (saving || !invoice || !validAmount || !requestId) return;
    setSaving(true);
    setError("");
    try {
      const result = await invoiceService.confirmPayment(invoice.id, {
        jumlah_bayar: Number(amount),
        request_id: requestId,
        tanggal_pembayaran: date,
        metode_pembayaran_id: methodId || null,
        buktiFile: proof,
      });
      await onSuccess(result.data, result.message);
      onClose();
    } catch (cause) {
      setError(cause.response?.data?.message || "Pembayaran belum dapat dicatat. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <PaymentsOutlined color="primary" aria-hidden="true" /> Catat Pembayaran
      </DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Box sx={{ p: 2, borderRadius: 2, bgcolor: "action.hover" }}>
            <Typography fontWeight={700}>{invoice?.nomor_invoice || "Invoice"}</Typography>
            <Typography variant="body2" color="text.secondary">Total tagihan: {formatRupiah(invoice?.total)}</Typography>
            <Typography variant="body2" color="text.secondary">Sudah dibayar: {formatRupiah(invoice?.total_bayar)}</Typography>
            <Typography variant="body2" color="text.secondary">PPh23: {formatRupiah(invoice?.pph23)}</Typography>
            <Typography fontWeight={700} sx={{ mt: 0.5 }}>
              Sisa tagihan: {due === null ? "Perlu pemeriksaan" : formatRupiah(due)}
            </Typography>
          </Box>
          {due === null && <Alert severity="warning">Total invoice belum konsisten dengan PPN atau pembayaran sebelumnya. Periksa invoice sebelum mencatat pembayaran.</Alert>}
          <Box sx={{ display: "flex", gap: 1, alignItems: "flex-start" }}>
            <TextField
              label="Nominal diterima"
              type="number"
              value={amount}
              onChange={(event) => { setAmount(event.target.value); changeRequest(); }}
              inputProps={{ min: 0.01, step: 0.01, max: due || undefined }}
              error={amount !== "" && !validAmount}
              helperText={amount !== "" && !validAmount ? `Masukkan nominal lebih dari Rp0 hingga ${formatRupiah(due)}.` : "Status Lunas dihitung otomatis dari sisa tagihan."}
              disabled={saving || due === null || due === 0}
              fullWidth
              required
            />
            <Button variant="outlined" onClick={() => { setAmount(String(due)); changeRequest(); }}
              disabled={saving || !due} sx={{ mt: 0.25, whiteSpace: "nowrap", textTransform: "none" }}>
              Isi sisa
            </Button>
          </Box>
          <TextField select label="Metode pembayaran" value={methodId}
            onChange={(event) => { setMethodId(event.target.value); changeRequest(); }}
            disabled={saving} fullWidth>
            <MenuItem value=""><em>Tidak dipilih</em></MenuItem>
            {methods.map((method) => <MenuItem key={method.id} value={method.id}>{method.nama}</MenuItem>)}
          </TextField>
          <TextField label="Tanggal pembayaran" type="date" value={date}
            onChange={(event) => { setDate(event.target.value); changeRequest(); }}
            InputLabelProps={{ shrink: true }} disabled={saving} fullWidth required />
          <Box>
            <Button component="label" variant="outlined" startIcon={<UploadFileOutlined />} disabled={saving} sx={{ textTransform: "none" }}>
              {proof ? "Ganti bukti" : "Unggah bukti (opsional)"}
              <input hidden type="file" accept="image/jpeg,image/png,application/pdf" onChange={handleProof} />
            </Button>
            {proof && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{proof.name}</Typography>}
            <Typography variant="caption" color="text.secondary" display="block">JPG, PNG, atau PDF; maksimal 3 MB.</Typography>
          </Box>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>Batal</Button>
        <Button variant="contained" onClick={handleSubmit} disabled={saving || !validAmount || !date || !requestId}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
          {saving ? "Menyimpan..." : "Catat Pembayaran"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePaymentDialog;
