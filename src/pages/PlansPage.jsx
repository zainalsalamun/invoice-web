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

const initialForm = { code: "", name: "", category: "Broadband", bandwidth_mbps: "", price: "", setup_fee: "", tax_rate: "11", invoice_name: "", areas: "" };
const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));

const PlansPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try {
      setPlans(await operationalService.getServicePlans());
    } catch (error) {
      notifyError(error.response?.data?.message || "Data paket belum dapat dimuat. Periksa koneksi backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => plans.filter((item) => `${item.code} ${item.name} ${item.category}`.toLowerCase().includes(search.toLowerCase())), [plans, search]);
  const active = plans.filter((item) => item.is_active).length;
  const categories = new Set(plans.map((item) => item.category).filter(Boolean)).size;
  const average = plans.length ? plans.reduce((sum, item) => sum + Number(item.price || 0), 0) / plans.length : 0;

  const submit = async () => {
    if (!form.code.trim() || !form.name.trim()) return notifyError("Kode dan nama paket wajib diisi.");
    setSaving(true);
    try {
      await operationalService.createServicePlan({
        ...form,
        bandwidth_mbps: form.bandwidth_mbps ? Number(form.bandwidth_mbps) : null,
        price: Number(form.price || 0),
        setup_fee: Number(form.setup_fee || 0),
        tax_rate: Number(form.tax_rate || 0),
        areas: form.areas.split(",").map((value) => value.trim()).filter(Boolean),
      });
      notifySuccess("Paket layanan berhasil ditambahkan.");
      setDialogOpen(false);
      setForm(initialForm);
      await load();
    } catch (error) {
      notifyError(error.response?.data?.message || "Paket gagal disimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout
      title="Paket & Layanan"
      description="Katalog layanan sebagai sumber harga, bandwidth, pajak, dan area layanan."
      actions={<Button variant="contained" startIcon={<Add />} onClick={() => setDialogOpen(true)}>Tambah Paket</Button>}
    >
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 2, mb: 2.5 }}>
        {[["Paket Aktif", active], ["Kategori", categories], ["Rata-rata Harga", money(average)]].map(([label, value]) => (
          <Card key={label}><CardContent><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="h5" sx={{ mt: 0.75 }}>{value}</Typography></CardContent></Card>
        ))}
      </Box>

      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ p: 2 }}>
          <Box><Typography variant="h6">Katalog Paket</Typography><Typography variant="body2" color="text.secondary">{filtered.length} paket ditemukan</Typography></Box>
          <TextField size="small" placeholder="Cari paket..." value={search} onChange={(event) => setSearch(event.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        </Stack>
        {loading ? <Box sx={{ py: 7, display: "grid", placeItems: "center" }}><CircularProgress /></Box> : (
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Kode</TableCell><TableCell>Nama Paket</TableCell><TableCell>Kategori</TableCell><TableCell>Bandwidth</TableCell><TableCell align="right">Harga</TableCell><TableCell>Pajak</TableCell><TableCell>Area</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell><Typography fontWeight={700} variant="body2">{item.code}</Typography></TableCell>
                    <TableCell>{item.name}</TableCell><TableCell>{item.category || "-"}</TableCell>
                    <TableCell>{item.bandwidth_mbps ? `${item.bandwidth_mbps} Mbps` : "-"}</TableCell>
                    <TableCell align="right">{money(item.price)}</TableCell><TableCell>{Number(item.tax_rate || 0)}%</TableCell>
                    <TableCell>{item.areas?.length ? item.areas.join(", ") : "Semua area"}</TableCell>
                    <TableCell><Chip size="small" color={item.is_active ? "success" : "default"} label={item.is_active ? "Aktif" : "Nonaktif"} variant="outlined" /></TableCell>
                  </TableRow>
                ))}
                {!filtered.length && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>Belum ada paket layanan.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog open={dialogOpen} onClose={() => !saving && setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Tambah Paket Layanan</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, pt: 1 }}>
            <TextField required label="Kode paket" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <TextField required label="Nama paket" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <TextField select label="Kategori" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {["Broadband", "Dedicated", "Managed Service", "Add-on"].map((option) => <MenuItem key={option} value={option}>{option}</MenuItem>)}
            </TextField>
            <TextField type="number" label="Bandwidth (Mbps)" value={form.bandwidth_mbps} onChange={(e) => setForm({ ...form, bandwidth_mbps: e.target.value })} />
            <TextField type="number" label="Harga bulanan" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            <TextField type="number" label="Biaya pemasangan" value={form.setup_fee} onChange={(e) => setForm({ ...form, setup_fee: e.target.value })} />
            <TextField type="number" label="Pajak (%)" value={form.tax_rate} onChange={(e) => setForm({ ...form, tax_rate: e.target.value })} />
            <TextField label="Nama di invoice" value={form.invoice_name} onChange={(e) => setForm({ ...form, invoice_name: e.target.value })} />
            <TextField label="Area layanan" helperText="Pisahkan dengan koma" value={form.areas} onChange={(e) => setForm({ ...form, areas: e.target.value })} sx={{ gridColumn: { sm: "1 / -1" } }} />
          </Box>
        </DialogContent>
        <DialogActions><Button onClick={() => setDialogOpen(false)} disabled={saving}>Batal</Button><Button variant="contained" onClick={submit} disabled={saving}>{saving ? "Menyimpan..." : "Simpan Paket"}</Button></DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default PlansPage;
