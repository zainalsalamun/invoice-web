import React, { useEffect, useMemo, useState } from "react";
import { Add, Search } from "@mui/icons-material";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import { operationalService } from "../services/operationalService";
import { notifyError, notifySuccess } from "../utils/notify";

const initialForm = { asset_code: "", serial_number: "", category: "ONT", brand: "", model: "", ownership: "RINGNET", status: "STOCK", condition: "GOOD", location: "", notes: "" };
const statusColor = { STOCK: "info", RESERVED: "info", INSTALLED: "success", LOANED: "primary", RETRIEVAL_SCHEDULED: "warning", RETURNED: "default", INSPECTION: "warning", REPAIR: "warning", LOST: "error", DISPOSED: "default" };

const AssetsPage = () => {
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try { setAssets(await operationalService.getAssets()); }
    catch (error) { notifyError(error.response?.data?.message || "Data alat belum dapat dimuat. Periksa koneksi backend."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => assets.filter((item) => `${item.asset_code} ${item.serial_number} ${item.brand} ${item.model} ${item.customer_name}`.toLowerCase().includes(search.toLowerCase())), [assets, search]);
  const metric = (statuses) => assets.filter((item) => statuses.includes(item.status)).length;

  const submit = async () => {
    if (!form.asset_code.trim() || !form.category.trim()) return notifyError("Kode dan kategori alat wajib diisi.");
    setSaving(true);
    try {
      await operationalService.createAsset(form);
      notifySuccess("Alat berhasil ditambahkan ke inventaris.");
      setOpen(false); setForm(initialForm); await load();
    } catch (error) { notifyError(error.response?.data?.message || "Alat gagal disimpan."); }
    finally { setSaving(false); }
  };

  return (
    <PageLayout title="Alat Pelanggan" description="Inventaris, pemasangan, peminjaman, kondisi, dan penarikan perangkat pelanggan." actions={<Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Tambah Alat</Button>}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 2.5 }}>
        {[["Total Alat", assets.length], ["Stok", metric(["STOCK"])], ["Terpasang/Dipinjam", metric(["INSTALLED", "LOANED"])], ["Perlu Perhatian", metric(["REPAIR", "LOST"])]].map(([label, value]) => (
          <Card key={label}><CardContent><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="h5" sx={{ mt: .75 }}>{value}</Typography></CardContent></Card>
        ))}
      </Box>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ p: 2 }}>
          <Box><Typography variant="h6">Inventaris Perangkat</Typography><Typography variant="body2" color="text.secondary">Pantau posisi dan kondisi alat milik RingNet maupun pelanggan.</Typography></Box>
          <TextField size="small" placeholder="Cari kode, serial, pelanggan..." value={search} onChange={(e) => setSearch(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        </Stack>
        {loading ? <Box sx={{ py: 7, display: "grid", placeItems: "center" }}><CircularProgress /></Box> : (
          <TableContainer><Table size="small">
            <TableHead><TableRow><TableCell>Kode</TableCell><TableCell>Perangkat</TableCell><TableCell>Serial</TableCell><TableCell>Kepemilikan</TableCell><TableCell>Pelanggan/Lokasi</TableCell><TableCell>Kondisi</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
            <TableBody>
              {filtered.map((item) => <TableRow key={item.id} hover>
                <TableCell><Typography fontWeight={700} variant="body2">{item.asset_code}</Typography></TableCell>
                <TableCell>{[item.category, item.brand, item.model].filter(Boolean).join(" · ")}</TableCell>
                <TableCell>{item.serial_number || "-"}</TableCell><TableCell>{item.ownership || "-"}</TableCell>
                <TableCell><Typography variant="body2">{item.customer_name || item.location || "Gudang"}</Typography>{item.site_name && <Typography variant="caption" color="text.secondary">{item.site_name}</Typography>}</TableCell>
                <TableCell><Chip size="small" label={item.condition || "-"} variant="outlined" color={item.condition === "GOOD" ? "success" : "warning"} /></TableCell>
                <TableCell><Chip size="small" label={item.status} color={statusColor[item.status] || "default"} /></TableCell>
              </TableRow>)}
              {!filtered.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>Belum ada data alat.</TableCell></TableRow>}
            </TableBody>
          </Table></TableContainer>
        )}
      </Paper>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Alat</DialogTitle>
        <DialogContent><Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
          <TextField required label="Kode alat" value={form.asset_code} onChange={(e) => setForm({ ...form, asset_code: e.target.value })} />
          <TextField label="Nomor serial" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} />
          <TextField select label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{["ONT", "Router", "Access Point", "Modem", "Switch", "Radio", "Lainnya"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
          <TextField label="Merek" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          <TextField label="Model" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          <TextField select label="Kepemilikan" value={form.ownership} onChange={(e) => setForm({ ...form, ownership: e.target.value })}>{["RINGNET", "CUSTOMER", "PARTNER"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
          <TextField select label="Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{Object.keys(statusColor).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
          <TextField select label="Kondisi" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })}>{["NEW", "GOOD", "FAIR", "DAMAGED", "UNKNOWN"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
          <TextField label="Lokasi" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <TextField label="Catatan" multiline minRows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Box></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)} disabled={saving}>Batal</Button><Button variant="contained" onClick={submit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Alat"}</Button></DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default AssetsPage;
