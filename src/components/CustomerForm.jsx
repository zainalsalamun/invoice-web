import React, { useState, useEffect, useRef } from "react";
import {
  TextField,
  Button,
  Box,
  Typography,
  Grid,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  Switch,
  FormControlLabel,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  IconButton,
  Avatar,
} from "@mui/material";
import { Add as AddIcon, PhotoCamera, Close } from "@mui/icons-material";
import { metodePembayaranService } from "../services/metodePembayaranService";
import { notifySuccess, notifyError } from "../utils/notify";

import { API_BASE_URL } from "../utils/apiClient";

const API_BASE = API_BASE_URL;

const defaultForm = {
  id_pelanggan: "",
  nama: "",
  alamat: "",
  nomor_wa: "",
  paket: "",
  kategori_pelanggan: "",
  tanggal_jatuh_tempo: "",
  harga_langganan: "",
  metode_pembayaran_id: "",
  aktif: true,
  notes: "",
  status_pembayaran: "BELUM LUNAS",
  tagihan_periode_bulan: "",
  bukti_transfer: null, // File object
};

const toInputDate = (iso) => {
  if (!iso) return "";
  return iso.split("T")[0];
};

const CustomerForm = ({ onSubmit, initialData, onCancel }) => {
  const [form, setForm] = useState(
    initialData
      ? {
        ...defaultForm,
        ...initialData,
        id_pelanggan: initialData.id_pelanggan ?? "",
        metode_pembayaran_id: initialData.metode_pembayaran_id ?? "",
        kategori_pelanggan: initialData.kategori_pelanggan ?? "",
        tanggal_jatuh_tempo: toInputDate(initialData.tanggal_jatuh_tempo),
        harga_langganan: initialData.harga_langganan ?? "",
        notes: initialData.notes ?? "",
        status_pembayaran: initialData.status_pembayaran ?? "BELUM LUNAS",
        tagihan_periode_bulan: initialData.tagihan_periode_bulan ?? "",
        bukti_transfer: null, // reset — file baru akan diisi ulang jika ada
      }
      : defaultForm
  );

  // Preview URL untuk gambar bukti transfer yang dipilih
  const [previewUrl, setPreviewUrl] = useState(
    initialData?.bukti_transfer
      ? `${API_BASE}/uploads/bukti_transfer/${initialData.bukti_transfer}`
      : null
  );

  const fileInputRef = useRef(null);

  // -- Metode Pembayaran --
  const [metodePembayaranList, setMetodePembayaranList] = useState([]);
  const [loadingMetode, setLoadingMetode] = useState(true);

  // Dialog tambah metode pembayaran baru
  const [addMetodeDialog, setAddMetodeDialog] = useState(false);
  const [newMetodeName, setNewMetodeName] = useState("");
  const [savingMetode, setSavingMetode] = useState(false);

  const fetchMetode = async () => {
    setLoadingMetode(true);
    const data = await metodePembayaranService.getAll();
    setMetodePembayaranList(data);
    setLoadingMetode(false);
  };

  useEffect(() => {
    fetchMetode();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e) => {
    setForm((prev) => ({ ...prev, aktif: e.target.checked }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm((prev) => ({ ...prev, bukti_transfer: file }));
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    setForm((prev) => ({ ...prev, bukti_transfer: null }));
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  // Simpan metode pembayaran baru langsung dari form
  const handleAddMetode = async () => {
    if (!newMetodeName.trim()) return;
    setSavingMetode(true);
    try {
      const created = await metodePembayaranService.create(newMetodeName.trim());
      notifySuccess(`Metode "${created.nama}" berhasil ditambahkan!`);
      await fetchMetode();
      setForm((prev) => ({ ...prev, metode_pembayaran_id: created.id }));
      setNewMetodeName("");
      setAddMetodeDialog(false);
    } catch (err) {
      const msg = err?.response?.data?.message || "Gagal menambahkan metode";
      notifyError(msg);
    } finally {
      setSavingMetode(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        p: 3,
        bgcolor: "background.paper",
        borderRadius: 2,
        boxShadow: 3,
      }}
    >
      <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
        {initialData ? "✏️ Edit Pelanggan" : "➕ Tambah Pelanggan Baru"}
      </Typography>
      <Divider sx={{ mb: 3 }} />

      {/* ─── Informasi Dasar ─── */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        Informasi Dasar
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={4}>
          <TextField
            label="ID Pelanggan"
            name="id_pelanggan"
            value={form.id_pelanggan}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="cth: CUST-001"
          />
        </Grid>
        <Grid item xs={12} sm={8}>
          <TextField
            label="Nama Pelanggan"
            name="nama"
            value={form.nama}
            onChange={handleChange}
            fullWidth
            required
            size="small"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Nomor WhatsApp"
            name="nomor_wa"
            value={form.nomor_wa}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="08xxxxxxxxxx"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Kategori Pelanggan"
            name="kategori_pelanggan"
            value={form.kategori_pelanggan}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="cth: Retail, Bisnis, Warnet"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Tagihan Periode Bulan"
            name="tagihan_periode_bulan"
            value={form.tagihan_periode_bulan}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="cth: Januari 2024"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel id="status-label">Status Pembayaran</InputLabel>
            <Select
              labelId="status-label"
              name="status_pembayaran"
              value={form.status_pembayaran}
              label="Status Pembayaran"
              onChange={handleChange}
            >
              <MenuItem value="LUNAS">Lunas</MenuItem>
              <MenuItem value="BELUM LUNAS">Belum Lunas</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Alamat"
            name="alamat"
            value={form.alamat ?? ""}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            label="Notes / Catatan"
            name="notes"
            value={form.notes ?? ""}
            onChange={handleChange}
            fullWidth
            size="small"
            multiline
            rows={2}
            placeholder="Catatan tambahan..."
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* ─── Paket & Tagihan ─── */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        Paket & Tagihan
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Paket Internet"
            name="paket"
            value={form.paket}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="cth: Paket 20 Mbps"
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <TextField
            label="Harga Langganan (Rp)"
            name="harga_langganan"
            value={form.harga_langganan}
            onChange={handleChange}
            fullWidth
            size="small"
            type="number"
            inputProps={{ min: 0 }}
          />
        </Grid>

        {/* Metode Pembayaran */}
        <Grid item xs={12} sm={7}>
          <FormControl fullWidth size="small">
            <InputLabel id="metode-label">Metode Bayar</InputLabel>
            <Select
              labelId="metode-label"
              name="metode_pembayaran_id"
              value={form.metode_pembayaran_id ?? ""}
              label="Metode Bayar"
              onChange={handleChange}
              disabled={loadingMetode}
            >
              <MenuItem value="">
                <em>{loadingMetode ? "Memuat..." : "-- Pilih Metode --"}</em>
              </MenuItem>
              {metodePembayaranList.map((m) => (
                <MenuItem key={m.id} value={m.id}>
                  {m.nama}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {/* Link tambah metode baru */}
          <Typography
            variant="caption"
            color="primary"
            sx={{ mt: 0.5, display: "inline-flex", alignItems: "center", gap: 0.3, cursor: "pointer", userSelect: "none" }}
            onClick={() => setAddMetodeDialog(true)}
          >
            <AddIcon sx={{ fontSize: 13 }} /> Tambah metode baru
          </Typography>
        </Grid>

        {/* Status Aktif */}
        <Grid item xs={12} sm={5} sx={{ display: "flex", alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch checked={form.aktif} onChange={handleSwitch} color="success" />
            }
            label={
              <Typography variant="body2" fontWeight={500}>
                {form.aktif ? "✅ Aktif" : "❌ Nonaktif"}
              </Typography>
            }
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* ─── Tanggal ─── */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        Tanggal
      </Typography>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tanggal Jatuh Tempo"
            name="tanggal_jatuh_tempo"
            value={form.tanggal_jatuh_tempo}
            onChange={handleChange}
            fullWidth
            size="small"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* ─── Upload Bukti Transfer ─── */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        Bukti Transfer (Opsional)
      </Typography>
      <Box sx={{ mb: 3 }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              <Avatar
                src={previewUrl}
                variant="rounded"
                sx={{ width: 120, height: 90, border: "2px solid #e0e0e0" }}
              />
              <IconButton
                size="small"
                onClick={removeFile}
                sx={{
                  position: "absolute",
                  top: -8,
                  right: -8,
                  bgcolor: "error.main",
                  color: "#fff",
                  width: 22,
                  height: 22,
                  "&:hover": { bgcolor: "error.dark" },
                }}
              >
                <Close sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {form.bukti_transfer instanceof File
                  ? form.bukti_transfer.name
                  : "Gambar tersimpan sebelumnya"}
              </Typography>
              <Button
                size="small"
                variant="outlined"
                startIcon={<PhotoCamera />}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mt: 1, textTransform: "none" }}
              >
                Ganti Gambar
              </Button>
            </Box>
          </Box>
        ) : (
          <Button
            variant="outlined"
            startIcon={<PhotoCamera />}
            onClick={() => fileInputRef.current?.click()}
            sx={{ textTransform: "none", borderStyle: "dashed" }}
          >
            Upload Bukti Transfer
          </Button>
        )}
        <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 0.5 }}>
          Format: JPG, PNG, WEBP — Maks. 5MB
        </Typography>
      </Box>

      {/* ─── Action Buttons ─── */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={onCancel}>
          Batal
        </Button>
        <Button variant="contained" type="submit">
          💾 Simpan
        </Button>
      </Box>

      {/* ─── Dialog Tambah Metode Pembayaran Baru ─── */}
      <Dialog
        open={addMetodeDialog}
        onClose={() => setAddMetodeDialog(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle fontWeight="bold">➕ Tambah Metode Pembayaran</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            label="Nama Metode"
            fullWidth
            value={newMetodeName}
            onChange={(e) => setNewMetodeName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMetode()}
            placeholder="cth: Transfer BCA, GoPay, dll"
            sx={{ mt: 1 }}
            size="small"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => { setAddMetodeDialog(false); setNewMetodeName(""); }}
            variant="outlined"
          >
            Batal
          </Button>
          <Button
            onClick={handleAddMetode}
            variant="contained"
            disabled={!newMetodeName.trim() || savingMetode}
            startIcon={savingMetode && <CircularProgress size={14} color="inherit" />}
          >
            {savingMetode ? "Menyimpan..." : "Tambah"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CustomerForm;
