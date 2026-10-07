import React, { useEffect, useState } from "react";
import {
  Alert, Button, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Stack, TextField, Typography,
} from "@mui/material";
import { invoiceService } from "../services/invoiceService";

const formatRupiah = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 2,
}).format(Number(value || 0));

const InvoicePaymentVoidDialog = ({ invoiceId, payment, onClose, onSuccess }) => {
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setReason("");
    setError("");
  }, [payment?.id]);

  const cleanReason = reason.trim();
  const validReason = cleanReason.length >= 10 && cleanReason.length <= 500;

  const handleSubmit = async () => {
    if (!payment || !validReason || saving) return;
    setSaving(true);
    setError("");
    try {
      const result = await invoiceService.voidPayment(invoiceId, payment.id, cleanReason);
      await onSuccess(result.data, result.message);
      onClose();
    } catch (cause) {
      setError(cause.response?.data?.message || "Pembayaran belum dapat dibatalkan. Coba lagi.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={Boolean(payment)} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Batalkan pembayaran</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 0.5 }}>
          <Alert severity="warning">
            Transaksi {formatRupiah(payment?.amount)} akan dibatalkan dan saldo invoice dihitung ulang.
            Catatan transaksi dan buktinya tetap tersimpan untuk audit.
          </Alert>
          <TextField
            label="Alasan pembatalan"
            value={reason}
            onChange={(event) => { setReason(event.target.value); setError(""); }}
            multiline minRows={3} fullWidth required
            inputProps={{ maxLength: 500 }}
            helperText={`${cleanReason.length}/500 karakter; minimal 10 karakter.`}
            error={reason.length > 0 && !validReason}
            disabled={saving}
          />
          <Typography variant="body2" color="text.secondary">
            Setelah dibatalkan, transaksi tidak bisa diaktifkan lagi. Catat pembayaran baru jika diperlukan.
          </Typography>
          {error && <Alert severity="error">{error}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} disabled={saving}>Kembali</Button>
        <Button color="error" variant="contained" onClick={handleSubmit} disabled={saving || !validReason}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
          {saving ? "Memproses..." : "Batalkan pembayaran"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InvoicePaymentVoidDialog;
