import React, { useState } from "react";
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
} from "@mui/material";

const METODE_PEMBAYARAN = ["Transfer Bank", "QRIS", "Cash", "Virtual Account"];

const defaultForm = {
  id_pelanggan: "",
  nama: "",
  alamat: "",
  nomor_wa: "",
  paket: "",
  area: "",
  tanggal_aktivasi: "",
  tanggal_jatuh_tempo: "",
  harga_langganan: "",
  metode_pembayaran: "",
  aktif: true,
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
        tanggal_aktivasi: toInputDate(initialData.tanggal_aktivasi),
        tanggal_jatuh_tempo: toInputDate(initialData.tanggal_jatuh_tempo),
        harga_langganan: initialData.harga_langganan ?? "",
      }
      : defaultForm
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSwitch = (e) => {
    setForm((prev) => ({ ...prev, aktif: e.target.checked }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
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

      {/* Informasi Dasar */}
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
            label="Area"
            name="area"
            value={form.area}
            onChange={handleChange}
            fullWidth
            size="small"
            placeholder="cth: Bandung Barat"
          />
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
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Informasi Paket & Tagihan */}
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

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth size="small">
            <InputLabel>Metode Pembayaran</InputLabel>
            <Select
              name="metode_pembayaran"
              value={form.metode_pembayaran}
              label="Metode Pembayaran"
              onChange={handleChange}
            >
              {METODE_PEMBAYARAN.map((m) => (
                <MenuItem key={m} value={m}>
                  {m}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControlLabel
            control={
              <Switch checked={form.aktif} onChange={handleSwitch} color="success" />
            }
            label={form.aktif ? "Status: Aktif ✅" : "Status: Nonaktif ❌"}
          />
        </Grid>
      </Grid>

      <Divider sx={{ mb: 2 }} />

      {/* Tanggal */}
      <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5, fontWeight: 600 }}>
        Tanggal
      </Typography>
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Tanggal Aktivasi"
            name="tanggal_aktivasi"
            value={form.tanggal_aktivasi}
            onChange={handleChange}
            fullWidth
            size="small"
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

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

      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
        <Button variant="outlined" onClick={onCancel}>
          Batal
        </Button>
        <Button variant="contained" type="submit">
          💾 Simpan
        </Button>
      </Box>
    </Box>
  );
};

export default CustomerForm;
