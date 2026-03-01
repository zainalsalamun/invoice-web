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
  IconButton,
  Avatar,
} from "@mui/material";
import { Add as AddIcon, PhotoCamera, Close, PictureAsPdf } from "@mui/icons-material";
import { metodePembayaranService } from "../services/metodePembayaranService";
import { notifySuccess, notifyError } from "../utils/notify";

const getApiBase = () => {
  const isProd = process.env.NODE_ENV === "production";
  if (isProd) return ""; // Kosongkan agar menggunakan proxy Vercel
  let url = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
  return url.replace("/api", "");
};

const API_BASE = getApiBase();

const defaultForm = {
  id_pelanggan: "",
  nama: "",
  alamat: "",
  nomor_wa: "",
  kategori_pelanggan: "",
  paket_layanan: "",
  ppn: "",
  tanggal_jatuh_tempo: "",
  metode_pembayaran_id: "",
  aktif: true,
  notes: "",
  status_pembayaran: "BELUM LUNAS",
  tagihan_periode_bulan: "",
  bukti_transfer: null,
  items: [{ deskripsi: "Paket Internet", harga: "", qty: 1, jumlah: 0 }],
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
        paket_layanan: initialData.paket_layanan ?? "",
        ppn: initialData.ppn ?? "",
        tanggal_jatuh_tempo: toInputDate(initialData.tanggal_jatuh_tempo),
        notes: initialData.notes ?? "",
        status_pembayaran: initialData.status_pembayaran ?? "BELUM LUNAS",
        tagihan_periode_bulan: initialData.tagihan_periode_bulan ?? "",
        bukti_transfer: null,
        items: initialData.items && initialData.items.length > 0
          ? initialData.items
          : [{ deskripsi: initialData.paket || "Paket Internet", harga: initialData.harga_langganan || "", qty: 1, jumlah: initialData.harga_langganan || 0 }],
      }
      : defaultForm
  );

  // PPN toggle: ON jika data awal punya ppn > 0
  const [ppnEnabled, setPpnEnabled] = useState(
    initialData ? Number(initialData.ppn || 0) > 0 : false
  );

  // Preview URL untuk gambar bukti transfer yang dipilih
  const [previewUrl, setPreviewUrl] = useState(() => {
    if (!initialData?.bukti_transfer) return null;
    const path = initialData.bukti_transfer;
    if (path.startsWith("http")) return path.replace(/https?:\/\/43\.134\.180\.249:3000/g, "");
    if (path.startsWith("/uploads")) return `${API_BASE}${path}`;
    return `${API_BASE}/uploads/bukti_transfer/${path}`;
  });

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

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;

    if (field === "harga" || field === "qty") {
      const harga = parseFloat(newItems[index].harga) || 0;
      const qty = parseInt(newItems[index].qty) || 0;
      newItems[index].jumlah = harga * qty;
    }

    setForm((prev) => ({ ...prev, items: newItems }));
  };

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { deskripsi: "", harga: "", qty: 1, jumlah: 0 },
      ],
    }));
  };

  const removeItem = (index) => {
    if (form.items.length === 1) return;
    const newItems = form.items.filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, items: newItems }));
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
    const firstItem = form.items[0] || {};
    const subtotal = form.items.reduce((sum, item) => sum + (parseFloat(item.jumlah) || 0), 0);
    // PPN hanya dihitung jika toggle aktif
    const calculatedPpn = ppnEnabled ? Math.round(subtotal * 0.11) : 0;

    const updatedForm = {
      ...form,
      ppn: calculatedPpn,
      paket: firstItem.deskripsi || "",
      harga_langganan: firstItem.harga || 0
    };
    onSubmit(updatedForm);
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

      {/* ─── Paket & Tagihan (Items) ─── */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        Paket & Tagihan
      </Typography>

      {form.items.map((item, index) => (
        <Grid container spacing={2} key={index} sx={{ mb: 2, alignItems: "center" }}>
          <Grid item xs={12} sm={5}>
            <TextField
              label="Deskripsi Paket"
              value={item.deskripsi}
              onChange={(e) => handleItemChange(index, "deskripsi", e.target.value)}
              fullWidth
              size="small"
              placeholder="cth: Paket 20 Mbps"
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              label="Harga (Rp)"
              type="number"
              value={item.harga}
              onChange={(e) => handleItemChange(index, "harga", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} sm={2}>
            <TextField
              label="Qty"
              type="number"
              value={item.qty}
              onChange={(e) => handleItemChange(index, "qty", e.target.value)}
              fullWidth
              size="small"
              inputProps={{ min: 1 }}
            />
          </Grid>
          <Grid item xs={12} sm={2} sx={{ display: "flex", gap: 1 }}>
            <Typography variant="body2" sx={{ alignSelf: "center", minWidth: 80, fontWeight: "bold" }}>
              Rp {(parseFloat(item.jumlah) || 0).toLocaleString()}
            </Typography>
            <IconButton color="error" onClick={() => removeItem(index)} disabled={form.items.length === 1}>
              <Close />
            </IconButton>
          </Grid>
        </Grid>
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<AddIcon />}
        onClick={addItem}
        sx={{ mb: 3, textTransform: "none" }}
      >
        Tambah Baris Layanan
      </Button>

      {/* Total Section */}
      {(() => {
        const subtotal = form.items.reduce((sum, item) => sum + (parseFloat(item.jumlah) || 0), 0);
        const ppnAmount = ppnEnabled ? Math.round(subtotal * 0.11) : 0;
        const total = subtotal + ppnAmount;
        return (
          <Box sx={{ mb: 3, p: 2, bgcolor: "#f1f5f9", borderRadius: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="body2">Subtotal (DPP):</Typography>
              <Typography variant="body2" fontWeight="bold">
                Rp {subtotal.toLocaleString("id-ID")}
              </Typography>
            </Box>
            {/* PPN Toggle */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={ppnEnabled}
                    onChange={(e) => setPpnEnabled(e.target.checked)}
                    size="small"
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2">
                    PPN 11% {ppnEnabled ? "(dikenakan)" : "(tidak dikenakan)"}
                  </Typography>
                }
                sx={{ m: 0 }}
              />
              <Typography variant="body2" fontWeight="bold" color={ppnEnabled ? "text.primary" : "text.disabled"}>
                {ppnEnabled ? `Rp ${ppnAmount.toLocaleString("id-ID")}` : "-"}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1, pt: 1, borderTop: "1px solid #cbd5e1" }}>
              <Typography variant="subtitle1" fontWeight="bold">Total Tagihan:</Typography>
              <Typography variant="subtitle1" fontWeight="bold" color="primary">
                Rp {total.toLocaleString("id-ID")}
              </Typography>
            </Box>
          </Box>
        );
      })()}

      <Grid container spacing={2} sx={{ mb: 2 }}>
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
          accept="image/jpeg,image/jpg,image/png,image/webp,application/pdf"
          style={{ display: "none" }}
          onChange={handleFileChange}
        />

        {previewUrl ? (
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
            <Box sx={{ position: "relative", display: "inline-block" }}>
              {form.bukti_transfer?.type === "application/pdf" || (typeof form.bukti_transfer === "string" && form.bukti_transfer.endsWith(".pdf")) ? (
                <Box sx={{ width: 120, height: 90, border: "2px solid #e0e0e0", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1, bgcolor: "#f5f5f5" }}>
                  <PictureAsPdf sx={{ fontSize: 40, color: "error.main" }} />
                </Box>
              ) : (
                <Avatar
                  src={previewUrl}
                  variant="rounded"
                  sx={{ width: 120, height: 90, border: "2px solid #e0e0e0" }}
                />
              )}
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
          Format: JPG, PNG, WEBP, PDF — Maks. 5MB
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
