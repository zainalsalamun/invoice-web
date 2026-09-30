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
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import { operationalService } from "../services/operationalService";
import { notifyError, notifySuccess } from "../utils/notify";

const initialForm = { title: "", module: "Invoice", description: "", impact: "", priority: "MEDIUM", target_release: "" };
const statuses = ["NEW", "TRIAGE", "ACCEPTED", "IN_PROGRESS", "BLOCKED", "READY_REVIEW", "REVISION", "APPROVED", "RELEASED", "CLOSED", "REJECTED"];
const statusColor = { NEW: "info", TRIAGE: "info", ACCEPTED: "primary", IN_PROGRESS: "warning", BLOCKED: "error", READY_REVIEW: "secondary", REVISION: "warning", APPROVED: "success", RELEASED: "success", CLOSED: "default", REJECTED: "error" };
const priorityColor = { LOW: "default", MEDIUM: "info", HIGH: "warning", CRITICAL: "error" };

const SystemRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setLoading(true);
    try { setRequests(await operationalService.getSystemRequests()); }
    catch (error) { notifyError(error.response?.data?.message || "Data request belum dapat dimuat. Periksa koneksi backend."); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => requests.filter((item) => `${item.request_no} ${item.title} ${item.module} ${item.assignee_name}`.toLowerCase().includes(search.toLowerCase())), [requests, search]);
  const paginated = useMemo(
    () => filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
    [filtered, page, rowsPerPage]
  );
  const count = (group) => requests.filter((item) => group.includes(item.status)).length;

  useEffect(() => {
    const lastPage = Math.max(0, Math.ceil(filtered.length / rowsPerPage) - 1);
    if (page > lastPage) setPage(lastPage);
  }, [filtered.length, page, rowsPerPage]);

  const submit = async () => {
    if (!form.title.trim() || !form.module.trim() || !form.description.trim()) return notifyError("Judul, modul, dan deskripsi wajib diisi.");
    setSaving(true);
    try {
      await operationalService.createSystemRequest(form);
      notifySuccess("Request sistem berhasil dibuat.");
      setOpen(false); setForm(initialForm); await load();
    } catch (error) { notifyError(error.response?.data?.message || "Request gagal disimpan."); }
    finally { setSaving(false); }
  };

  const updateStatus = async (id, status) => {
    try {
      await operationalService.updateSystemRequest(id, { status });
      setRequests((current) => current.map((item) => item.id === id ? { ...item, status } : item));
      notifySuccess("Status request diperbarui.");
    } catch (error) { notifyError(error.response?.data?.message || "Status gagal diperbarui."); }
  };

  return (
    <PageLayout title="Request Sistem" description="Alur kebutuhan, perbaikan, review, dan rilis pengembangan aplikasi." actions={<Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>Buat Request</Button>}>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(4, 1fr)" }, gap: 2, mb: 2.5 }}>
        {[["Request Terbuka", count(["NEW", "TRIAGE", "ACCEPTED"])], ["Sedang Dikerjakan", count(["IN_PROGRESS", "BLOCKED"])], ["Review/Revisi", count(["READY_REVIEW", "REVISION", "APPROVED"])], ["Selesai/Rilis", count(["RELEASED", "CLOSED"])]].map(([label, value]) => <Card key={label}><CardContent><Typography color="text.secondary" variant="body2">{label}</Typography><Typography variant="h5" sx={{ mt: .75 }}>{value}</Typography></CardContent></Card>)}
      </Box>
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} spacing={2} sx={{ p: 2 }}>
          <Box><Typography variant="h6">Daftar Request</Typography><Typography variant="body2" color="text.secondary">Setiap perubahan dapat ditelusuri dari permintaan sampai rilis.</Typography></Box>
          <TextField size="small" placeholder="Cari nomor, judul, modul..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0); }} InputProps={{ startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> }} />
        </Stack>
        {loading ? <Box sx={{ py: 7, display: "grid", placeItems: "center" }}><CircularProgress /></Box> : <TableContainer><Table size="small">
          <TableHead><TableRow><TableCell>Nomor</TableCell><TableCell>Request</TableCell><TableCell>Modul</TableCell><TableCell>Prioritas</TableCell><TableCell>Requester / PIC</TableCell><TableCell>Target</TableCell><TableCell width={180}>Status</TableCell></TableRow></TableHead>
          <TableBody>
            {paginated.map((item) => <TableRow key={item.id} hover>
              <TableCell><Typography fontWeight={700} variant="body2">{item.request_no}</Typography></TableCell>
              <TableCell sx={{ maxWidth: 330 }}><Typography variant="body2" fontWeight={650}>{item.title}</Typography><Typography variant="caption" color="text.secondary" noWrap display="block">{item.description}</Typography></TableCell>
              <TableCell>{item.module}</TableCell><TableCell><Chip size="small" label={item.priority} color={priorityColor[item.priority] || "default"} variant="outlined" /></TableCell>
              <TableCell><Typography variant="body2">{item.requester_name || "-"}</Typography><Typography variant="caption" color="text.secondary">PIC: {item.assignee_name || "Belum ditentukan"}</Typography></TableCell>
              <TableCell>{item.target_release || "-"}</TableCell>
              <TableCell><TextField select size="small" fullWidth value={item.status} onChange={(e) => updateStatus(item.id, e.target.value)} sx={{ "& .MuiSelect-select": { py: .75, fontSize: 12, color: `${statusColor[item.status]}.main` } }}>{statuses.map((status) => <MenuItem key={status} value={status}>{status.replaceAll("_", " ")}</MenuItem>)}</TextField></TableCell>
            </TableRow>)}
            {!filtered.length && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 5, color: "text.secondary" }}>Belum ada request sistem.</TableCell></TableRow>}
          </TableBody>
        </Table></TableContainer>}
        {!loading && (
          <TablePagination
            component="div"
            count={filtered.length}
            page={page}
            onPageChange={(_, nextPage) => setPage(nextPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(event) => { setRowsPerPage(parseInt(event.target.value, 10)); setPage(0); }}
            rowsPerPageOptions={[10, 25, 50]}
            labelRowsPerPage="Baris per halaman:"
            labelDisplayedRows={({ from, to, count: total }) => `${from}–${to} dari ${total}`}
          />
        )}
      </Paper>

      <Dialog open={open} onClose={() => !saving && setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Buat Request Sistem</DialogTitle>
        <DialogContent><Stack spacing={2} sx={{ pt: 1 }}>
          <TextField required label="Judul request" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
            <TextField select label="Modul" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })}>{["Dashboard", "Pelanggan", "Paket", "Invoice", "Pekerjaan", "Alat", "Laporan", "Pengaturan", "Lainnya"].map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
            <TextField select label="Prioritas" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>{Object.keys(priorityColor).map((v) => <MenuItem key={v} value={v}>{v}</MenuItem>)}</TextField>
          </Box>
          <TextField required label="Deskripsi kebutuhan" multiline minRows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <TextField label="Dampak bisnis" multiline minRows={2} value={form.impact} onChange={(e) => setForm({ ...form, impact: e.target.value })} />
          <TextField label="Target rilis" placeholder="Contoh: Sprint 12 / Oktober 2026" value={form.target_release} onChange={(e) => setForm({ ...form, target_release: e.target.value })} />
        </Stack></DialogContent>
        <DialogActions><Button onClick={() => setOpen(false)} disabled={saving}>Batal</Button><Button variant="contained" onClick={submit} disabled={saving}>{saving ? "Menyimpan..." : "Buat Request"}</Button></DialogActions>
      </Dialog>
    </PageLayout>
  );
};

export default SystemRequestsPage;
