import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Button,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Tooltip,
    TablePagination,
    Alert,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { Edit, Delete, Add, UploadFile, Search, Clear, ChatOutlined, FactCheckOutlined } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import ChatTrackingImportReviewDialog from "./ChatTrackingImportReviewDialog";
import { chatTrackingService } from "../services/chatTrackingService";
import { authService } from "../services/authService";
import { notifySuccess, notifyError, notifyInfo } from "../utils/notify";
import { userService } from "../services/userServices";
import { buildChatTrackingPayload, isChatTrackingFormValid } from "./chatTrackingForm";


const ChatTrackingPage = () => {
    const theme = useTheme();
    const darkMode = theme.palette.mode === "dark";
    const [list, setList] = useState([]);
    const [totalRows, setTotalRows] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState("");
    const requestSequence = useRef(0);
    const user = authService.getCurrentUser();
    const canDelete = user?.role === "super_admin";
    const canEdit = ["super_admin", "admin", "admin_junior", "teknisi"].includes(user?.role);
    const canImport = ["super_admin", "admin"].includes(user?.role);

    // Dialog State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [saving, setSaving] = useState(false);

    // Form State
    const [form, setForm] = useState({
        nama_pic: "",
        tanggal: "",
        deskripsi: "",
        progress: "Belum Selesai",
        keterangan: "",
        admin_id: "",
        nomor_task: "",
    });


    const [importOpen, setImportOpen] = useState(false);
    const [reviewOpen, setReviewOpen] = useState(false);
    const [reviewBatchId, setReviewBatchId] = useState(null);
    const [importText, setImportText] = useState("");
    const [importing, setImporting] = useState(false);
    const [importYear, setImportYear] = useState("");
    const [importStartRow, setImportStartRow] = useState("3");
    const [importPreview, setImportPreview] = useState(null);
    const [stagedBatchId, setStagedBatchId] = useState(null);
    const [searchNoTask, setSearchNoTask] = useState("");
    const [activeSearch, setActiveSearch] = useState("");
    const [progressFilter, setProgressFilter] = useState("");

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);
    const [admins, setAdmins] = useState([]);


    const fetchData = async ({ searchTerm = activeSearch, selectedPage = page, pageSize = rowsPerPage, selectedProgress = progressFilter } = {}) => {
        const requestId = ++requestSequence.current;
        setLoading(true);
        setLoadError("");
        let params = {};

        // Hanya Super Admin yang bisa melihat semua tugas
        // Admin & Admin Junior hanya bisa melihat tugas mereka sendiri
        if (["admin", "admin_junior", "teknisi"].includes(user?.role) && user?.id) {
            params.admin_id = user.id;
        }

        if (searchTerm) {
            params.nomor_task = searchTerm;
        }
        if (selectedProgress) {
            params.progress = selectedProgress;
        }

        try {
            const result = await chatTrackingService.getPage({
                ...params,
                page: selectedPage + 1,
                pageSize,
            });
            if (requestId !== requestSequence.current) return;
            const lastPage = Math.max(0, Math.ceil(result.pagination.total / pageSize) - 1);
            if (selectedPage > lastPage) {
                setPage(lastPage);
                fetchData({ searchTerm, selectedPage: lastPage, pageSize, selectedProgress });
                return;
            }
            setList(result.data);
            setTotalRows(result.pagination.total);
        } catch (err) {
            if (requestId !== requestSequence.current) return;
            setList([]);
            setTotalRows(0);
            setLoadError(err.response?.data?.message || "Daftar pekerjaan gagal dimuat. Coba lagi.");
        } finally {
            if (requestId === requestSequence.current) setLoading(false);
        }
    };

    const handleSearch = () => {
        const term = searchNoTask.trim();
        setActiveSearch(term);
        setPage(0);
        fetchData({ searchTerm: term, selectedPage: 0 });
    };

    const handleClearSearch = () => {
        setSearchNoTask("");
        setActiveSearch("");
        setPage(0);
        fetchData({ searchTerm: "", selectedPage: 0 });
    };


    const fetchAdmins = async () => {
        if (canDelete) {
            const data = await userService.getAll();
            setAdmins(data.filter(u => ["super_admin", "admin", "admin_junior", "teknisi"].includes(u.role)));
        }
    };

    useEffect(() => {
        fetchData();
        fetchAdmins();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);


    const handleOpenDialog = (item = null) => {
        if (item) {
            setEditing(item);
            setForm({
                nama_pic: item.nama_pic,
                tanggal: item.tanggal ? new Date(item.tanggal).toISOString().split('T')[0] : "",
                deskripsi: item.deskripsi,
                progress: item.progress || "Belum Selesai",
                keterangan: item.keterangan || "",
                admin_id: item.admin_id || "",
                nomor_task: item.nomor_task || "",
            });
        } else {
            setEditing(null);
            // Pre-fill PIC and admin_id for non-super_admin
            const isStaff = ["admin", "admin_junior", "teknisi"].includes(user?.role);
            setForm({
                nama_pic: isStaff ? user.username : "",
                tanggal: new Date().toISOString().split('T')[0],
                deskripsi: "",
                progress: "Belum Selesai",
                keterangan: "",
                admin_id: isStaff ? user.id : "",
                nomor_task: "",
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!isChatTrackingFormValid(form, canDelete)) {
            notifyError(canDelete ? "Harap isi Nama PIC, Tanggal, dan Deskripsi" : "Harap isi Tanggal dan Deskripsi");
            return;
        }

        setSaving(true);
        try {
            const payload = buildChatTrackingPayload(form, canDelete);
            if (editing) {
                await chatTrackingService.update(editing.id, payload);
                notifySuccess("Data berhasil diperbarui!");
            } else {
                await chatTrackingService.create(payload);
                notifySuccess("Data baru berhasil ditambahkan!");
            }
            setDialogOpen(false);
            fetchData();
        } catch (err) {
            if (err.response?.status === 403) {
                notifyError("Akses ditolak. Akun Anda tidak memiliki izin untuk mengubah pekerjaan ini.");
            } else if (err.response?.status === 404 && editing) {
                notifyError("Pekerjaan tidak ditemukan atau bukan lagi tugas Anda. Daftar diperbarui.");
                fetchData();
            } else {
                notifyError(err.response?.data?.message || "Gagal menyimpan data");
            }
        } finally {
            setSaving(false);
        }
    };


    const handleDelete = async (id) => {
        if (window.confirm("Yakin ingin menghapus data ini?")) {
            try {
                await chatTrackingService.remove(id);
                notifyInfo("Data berhasil dihapus");
                fetchData();
            } catch (err) {
                notifyError("Gagal menghapus data");
            }
        }
    };

    const importPayload = () => ({
        text: importText,
        sourceYear: importYear,
        sourceStartRow: importStartRow,
    });

    const handleImportPreview = async () => {
        if (!importText.trim()) return notifyError("Data tidak boleh kosong");

        setImporting(true);
        try {
            const preview = await chatTrackingService.previewImport(importPayload());
            setImportPreview(preview);
            setStagedBatchId(null);
            notifyInfo("Pratinjau siap. Periksa jumlah baris dan masalah sebelum menyimpan snapshot.");
        } catch (err) {
            notifyError(err.response?.data?.message || "Gagal membuat pratinjau impor");
        } finally {
            setImporting(false);
        }
    };

    const handleStageImport = async () => {
        if (!importPreview) return;
        setImporting(true);
        try {
            const result = await chatTrackingService.stageImport(importPayload());
            setStagedBatchId(result?.data?.batchId || null);
            notifySuccess(result?.message || "Snapshot tersimpan di staging.");
        } catch (err) {
            notifyError(err.response?.data?.message || "Gagal menyimpan snapshot staging");
        } finally {
            setImporting(false);
        }
    };

    const handleOpenReview = (batchId = null) => {
        setImportOpen(false);
        setReviewBatchId(batchId);
        setReviewOpen(true);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        fetchData({ selectedPage: newPage });
    };

    const handleChangeRowsPerPage = (event) => {
        const pageSize = parseInt(event.target.value, 10);
        setRowsPerPage(pageSize);
        setPage(0);
        fetchData({ selectedPage: 0, pageSize });
    };

    // Format Helpers
    const formatBulan = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", { month: "long" });
    };
    const formatTanggalHari = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleDateString("id-ID", { day: "numeric" });
    };

    const formatJam = (dateString) => {
        if (!dateString) return "-";
        return new Date(dateString).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' });
    };


    // Set colors based on PIC
    const getPicColor = (name) => {
        const n = name?.toLowerCase() || '';
        if (n.includes('anggi')) return darkMode ? alpha('#818cf8', .16) : '#e0e7ff';
        if (n.includes('prima')) return darkMode ? alpha('#fb7185', .14) : '#ffe4e6';
        if (n.includes('arin')) return darkMode ? alpha('#2dd4bf', .14) : '#ccfbf1';
        return darkMode ? alpha('#94a3b8', .1) : '#f3f4f6';
    };

    const getProgressColor = (prog) => {
        const p = prog?.toLowerCase() || '';
        if (p.includes('sudah selesai')) return { bg: darkMode ? alpha('#22c55e', .16) : '#dcfce7', text: darkMode ? '#86efac' : '#15803d' };
        if (p.includes('sedang diproses')) return { bg: darkMode ? alpha('#60a5fa', .16) : '#dbeafe', text: darkMode ? '#93c5fd' : '#1e40af' };
        if (p.includes('belum selesai')) return { bg: darkMode ? alpha('#f87171', .16) : '#fee2e2', text: darkMode ? '#fca5a5' : '#b91c1c' };
        return { bg: darkMode ? alpha('#94a3b8', .1) : '#f3f4f6', text: darkMode ? '#cbd5e1' : '#374151' };
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar active="/chat-tracking" />

            <Box sx={{ flexGrow: 1, p: { xs: 2, md: 4 }, minWidth: 0, overflowX: 'hidden', bgcolor: "background.default" }}>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <ChatOutlined aria-hidden="true" /> {user?.role === "super_admin" ? "Chat Tracking Management" : "Daftar Tugas Saya"}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, alignItems: 'center' }}>
                        <TextField
                            size="small"
                            placeholder="Cari No Task..."
                            value={searchNoTask}
                            onChange={(e) => setSearchNoTask(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            InputProps={{
                                startAdornment: <Search fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                                endAdornment: searchNoTask && (
                                    <IconButton size="small" aria-label="Bersihkan pencarian" onClick={handleClearSearch}>
                                        <Clear fontSize="small" />
                                    </IconButton>
                                ),
                            }}
                            sx={{ width: 220 }}
                        />
                        <Button variant="outlined" onClick={handleSearch} disabled={loading} sx={{ textTransform: "none", borderRadius: 2 }}>
                            Cari
                        </Button>
                        <FormControl size="small" sx={{ minWidth: 170 }}>
                            <InputLabel id="chat-progress-filter-label">Progres</InputLabel>
                            <Select
                                labelId="chat-progress-filter-label"
                                value={progressFilter}
                                label="Progres"
                                onChange={(event) => {
                                    const selectedProgress = event.target.value;
                                    setProgressFilter(selectedProgress);
                                    setPage(0);
                                    fetchData({ selectedPage: 0, selectedProgress });
                                }}
                            >
                                <MenuItem value="">Semua progres</MenuItem>
                                <MenuItem value="Belum Selesai">Belum Selesai</MenuItem>
                                <MenuItem value="Sedang Diproses">Sedang Diproses</MenuItem>
                                <MenuItem value="Sudah Selesai">Sudah Selesai</MenuItem>
                            </Select>
                        </FormControl>
                        {canImport && (
                            <Button
                                variant="outlined"
                                startIcon={<FactCheckOutlined />}
                                onClick={() => handleOpenReview()}
                                sx={{ fontWeight: "bold", textTransform: "none", borderRadius: 2 }}
                            >
                                Lihat Batch Staging
                            </Button>
                        )}
                        {canImport && (
                            <Button
                                variant="outlined"
                                startIcon={<UploadFile />}
                                onClick={() => setImportOpen(true)}
                                sx={{ fontWeight: "bold", textTransform: "none", borderRadius: 2 }}
                            >
                                Impor ke Staging
                            </Button>
                        )}
                        {canEdit && (
                            <Button
                                variant="contained"
                                startIcon={<Add />}
                                onClick={() => handleOpenDialog()}
                                sx={{ fontWeight: "bold", textTransform: "none", borderRadius: 2 }}
                            >
                                Tambah Data
                            </Button>
                        )}
                    </Box>
                </Box>

                {loadError && (
                    <Alert severity="error" sx={{ mb: 2 }} action={<Button color="inherit" size="small" onClick={() => fetchData()}>Coba lagi</Button>}>
                        {loadError}
                    </Alert>
                )}
                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <Table size="small" sx={{ minWidth: 1300 }}>
                        <TableHead>
                            <TableRow>
                                <TableCell align="center">No</TableCell>
                                <TableCell>No Task</TableCell>
                                <TableCell>Kategori/Nama</TableCell>
                                <TableCell align="center">Tanggal & Bulan</TableCell>
                                <TableCell>
                                    Assign Ke Admin
                                </TableCell>
                                <TableCell sx={{ width: '35%' }}>Deskripsi</TableCell>
                                <TableCell>Progress</TableCell>
                                <TableCell>Keterangan</TableCell>
                                <TableCell align="center">Jam Mulai</TableCell>
                                <TableCell align="center">Jam Selesai</TableCell>
                                <TableCell align="center">Aksi</TableCell>

                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>Memuat data...</TableCell>
                                </TableRow>
                            ) : loadError ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>Daftar belum dapat ditampilkan.</TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={11} align="center" sx={{ py: 3 }}>
                                        {activeSearch ? `Tidak ada nomor task yang cocok dengan “${activeSearch}”.` : "Belum ada data Chat Tracking."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((row, index) => {
                                    const isMyTask = row.admin_id === user?.id;
                                    return (
                                        <TableRow
                                            key={row.id}
                                            hover
                                            sx={{
                                                bgcolor: isMyTask ? alpha(theme.palette.success.main, darkMode ? .08 : .06) : "inherit",
                                                borderLeft: isMyTask ? "4px solid #22c55e" : "none"
                                            }}
                                        >
                                            <TableCell align="center" sx={{ border: '1px solid', borderColor: 'divider', fontWeight: 500 }}>
                                                {page * rowsPerPage + index + 1}
                                            </TableCell>
                                            <TableCell sx={{ border: '1px solid', borderColor: 'divider', fontWeight: "bold", color: "text.secondary" }}>
                                                {row.nomor_task || "-"}
                                            </TableCell>

                                            <TableCell sx={{ borderColor: 'divider', color: darkMode ? '#a99fff' : '#4f46e5', fontWeight: 600, bgcolor: getPicColor(row.nama_pic) }}>
                                                {row.nama_pic}
                                            </TableCell>

                                            <TableCell align="center" sx={{ border: '1px solid', borderColor: 'divider' }}>
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                    <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
                                                        {formatTanggalHari(row.tanggal)}
                                                    </Typography>
                                                    <Typography sx={{ bgcolor: '#b45309', color: '#fff', fontSize: 11, fontWeight: 'bold', px: 1, borderRadius: 1 }}>
                                                        {formatBulan(row.tanggal)}
                                                    </Typography>
                                                </Box>
                                            </TableCell>

                                            <TableCell sx={{ border: '1px solid', borderColor: 'divider', fontWeight: 600 }}>
                                                <Typography variant="body2" sx={{ fontWeight: 'bold', color: row.admin_username ? '#059669' : '#94a3b8' }}>
                                                    {row.admin_username || "Belum diassign"}
                                                </Typography>
                                            </TableCell>

                                            <TableCell sx={{ border: '1px solid', borderColor: 'divider', fontSize: 13 }}>
                                                {row.deskripsi}
                                            </TableCell>
                                            <TableCell sx={{
                                                border: '1px solid',
                                                borderColor: 'divider',
                                                bgcolor: getProgressColor(row.progress).bg,
                                                color: getProgressColor(row.progress).text,
                                                fontWeight: "bold",
                                                fontSize: 12,
                                                textAlign: "center"
                                            }}>
                                                {row.progress}
                                            </TableCell>
                                            <TableCell sx={{ border: '1px solid', borderColor: 'divider', fontSize: 13 }}>
                                                {row.keterangan || "-"}
                                            </TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid', borderColor: 'divider', fontSize: 12, fontWeight: 'bold' }}>
                                                {formatJam(row.created_at)}
                                            </TableCell>
                                            <TableCell align="center" sx={{ border: '1px solid', borderColor: 'divider', fontSize: 12, fontWeight: 'bold', color: row.finished_at ? (darkMode ? '#86efac' : '#15803d') : 'text.secondary' }}>
                                                {row.finished_at ? formatJam(row.finished_at) : "--:--"}
                                            </TableCell>

                                            <TableCell align="center" sx={{ border: '1px solid', borderColor: 'divider', whiteSpace: "nowrap" }}>
                                                {canEdit ? (
                                                    <Tooltip title="Edit">
                                                        <IconButton size="small" color="primary" onClick={() => handleOpenDialog(row)}>
                                                            <Edit fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                ) : (
                                                    <Typography variant="caption" color="text.secondary">-</Typography>
                                                )}
                                                {canDelete && (
                                                    <Tooltip title="Hapus">
                                                        <IconButton size="small" color="error" onClick={() => handleDelete(row.id)}>
                                                            <Delete fontSize="small" />
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[15, 25, 50, 100]}
                    component="div"
                    count={totalRows}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Baris per halaman:"
                />
            </Box>

            {/* Dialog Form */}
            <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle fontWeight="bold">{editing ? "Edit Chat Tracking" : "Tambah Chat Tracking"}</DialogTitle>
                <DialogContent dividers>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
                        {canDelete ? (
                            <FormControl size="small" fullWidth required>
                                <InputLabel>Kategori/Nama (PIC)</InputLabel>
                                <Select
                                    value={form.nama_pic}
                                    label="Kategori/Nama (PIC)"
                                    onChange={(e) => {
                                        const selectedAdmin = admins.find(a => a.username === e.target.value);
                                        setForm({
                                            ...form,
                                            nama_pic: e.target.value,
                                            admin_id: selectedAdmin ? selectedAdmin.id : form.admin_id
                                        });
                                    }}
                                >
                                    <MenuItem value=""><em>-- Pilih PIC --</em></MenuItem>
                                    {form.nama_pic && !admins.some((adm) => adm.username === form.nama_pic) && (
                                        <MenuItem value={form.nama_pic}>{form.nama_pic} (PIC saat ini)</MenuItem>
                                    )}
                                    {admins.map((adm) => (
                                        <MenuItem key={adm.id} value={adm.username}>
                                            {adm.username}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                label="Kategori/Nama (PIC)"
                                size="small"
                                value={form.nama_pic || user?.username || ""}
                                InputProps={{ readOnly: true }}
                                helperText="PIC ditetapkan oleh sistem; hanya super admin yang dapat mengubahnya."
                                fullWidth
                            />
                        )}
                        <TextField
                            label="Nomor Task"
                            size="small"
                            value={form.nomor_task}
                            onChange={(e) => setForm({ ...form, nomor_task: e.target.value })}
                            fullWidth
                            placeholder="Contoh: TASK-001"
                        />

                        <TextField
                            label="Tanggal"
                            type="date"
                            size="small"
                            value={form.tanggal}
                            onChange={(e) => setForm({ ...form, tanggal: e.target.value })}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                        />
                        <TextField
                            label="Deskripsi"
                            size="small"
                            multiline
                            rows={3}
                            value={form.deskripsi}
                            onChange={(e) => setForm({ ...form, deskripsi: e.target.value })}
                            fullWidth
                            required
                        />
                        {editing && (
                            <FormControl size="small" fullWidth>
                                <InputLabel>Progress</InputLabel>
                                <Select
                                    value={form.progress}
                                    label="Progress"
                                    onChange={(e) => setForm({ ...form, progress: e.target.value })}
                                >
                                    <MenuItem value="Sudah Selesai">Sudah Selesai</MenuItem>
                                    <MenuItem value="Sedang Diproses">Sedang Diproses</MenuItem>
                                    <MenuItem value="Belum Selesai">Belum Selesai</MenuItem>
                                </Select>
                            </FormControl>
                        )}
                        <TextField
                            label="Keterangan"
                            size="small"
                            multiline
                            rows={2}
                            value={form.keterangan}
                            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                            fullWidth
                        />

                        {canDelete ? (
                            <FormControl size="small" fullWidth>
                                <InputLabel>Assign Tugas Ke</InputLabel>
                                <Select
                                    value={form.admin_id}
                                    label="Assign Tugas Ke"
                                    onChange={(e) => setForm({ ...form, admin_id: e.target.value })}
                                >
                                    <MenuItem value=""><em>-- Belum diassign --</em></MenuItem>
                                    {form.admin_id && !admins.some((adm) => String(adm.id) === String(form.admin_id)) && (
                                        <MenuItem value={form.admin_id}>Penanggung jawab saat ini</MenuItem>
                                    )}
                                    {admins.map((adm) => (
                                        <MenuItem key={adm.id} value={adm.id}>
                                            {adm.username} ({adm.role})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <TextField
                                label="Ditugaskan kepada"
                                size="small"
                                value={editing?.admin_username || user?.username || ""}
                                InputProps={{ readOnly: true }}
                                fullWidth
                            />
                        )}
                    </Box>

                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} color="inherit">Batal</Button>
                    <Button onClick={handleSave} variant="contained" disabled={saving}>
                        {saving ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog Import */}
            <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="lg">
                <DialogTitle fontWeight="bold">Pratinjau Chat Tracking dari Google Sheets</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Salin delapan kolom A:H: No, Nama PIC, Tanggal, Bulan, Deskripsi, Mulai–End work, Progress, Keterangan. Pilih rentang yang hanya memiliki satu tahun. Maksimal 2.000 baris per batch. Pratinjau dan staging tidak menambah pekerjaan aktif.
                    </Typography>
                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mb: 2 }}>
                        <TextField
                            label="Tahun sumber"
                            type="number"
                            value={importYear}
                            onChange={(e) => { setImportYear(e.target.value); setImportPreview(null); setStagedBatchId(null); }}
                            inputProps={{ min: 2000, max: 2100 }}
                            helperText="Wajib untuk tanggal yang hanya berisi angka hari; jangan menebak tahunnya."
                            fullWidth
                        />
                        <TextField
                            label="Nomor baris pertama di Google Sheets"
                            type="number"
                            value={importStartRow}
                            onChange={(e) => { setImportStartRow(e.target.value); setImportPreview(null); setStagedBatchId(null); }}
                            inputProps={{ min: 1 }}
                            helperText="Jika header A3:H3 ikut disalin, isi 3. Jika mulai dari baris data lain, sesuaikan."
                            fullWidth
                        />
                    </Box>
                    <TextField
                        label="Tempel data A:H di sini"
                        multiline
                        rows={8}
                        value={importText}
                        onChange={(e) => { setImportText(e.target.value); setImportPreview(null); setStagedBatchId(null); }}
                        fullWidth
                        placeholder={"No\tNama PIC\tTanggal\tBulan\tDeskripsi\tMulai–End work\tProgress\tKeterangan\n1\tAnggi\t25\tFebruari\tBuat invoice\t\tSudah Selesai\tTerkirim"}
                    />
                    {importPreview && (
                        <Box sx={{ mt: 2 }}>
                            <Alert severity={importPreview.summary.invalid > 0 ? "warning" : "info"} sx={{ mb: 2 }}>
                                {importPreview.inScope} baris bermakna: {importPreview.summary.valid} valid, {importPreview.summary.review} perlu tinjau, {importPreview.summary.invalid} tidak valid; {importPreview.summary.excluded} header/baris kosong/nomor saja dikecualikan. Total {importPreview.issueCount} masalah. Belum ada data yang masuk pekerjaan aktif.
                            </Alert>
                            {stagedBatchId && (
                                <Alert severity="success" sx={{ mb: 2 }}>
                                    Snapshot staging tersimpan dengan ID {stagedBatchId}. Baris bermasalah tetap harus ditinjau sebelum penerapan.
                                </Alert>
                            )}
                            <Typography variant="subtitle2" sx={{ mb: 1 }}>Contoh hasil baca (maksimal 25 baris)</Typography>
                            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 240, mb: 2 }}>
                                <Table size="small" stickyHeader>
                                    <TableHead><TableRow><TableCell>Baris</TableCell><TableCell>PIC</TableCell><TableCell>Tanggal</TableCell><TableCell>Waktu mentah</TableCell><TableCell>Progress</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
                                    <TableBody>
                                        {importPreview.sample.map((row) => (
                                            <TableRow key={row.sourceRowNo}>
                                                <TableCell>{row.sourceRowNo}</TableCell>
                                                <TableCell>{row.normalized?.nama_pic || row.raw.nama_pic || "-"}</TableCell>
                                                <TableCell>{row.normalized?.tanggal || row.raw.tanggal || "-"}</TableCell>
                                                <TableCell>{row.normalized?.mulai_end_work_raw || "-"}</TableCell>
                                                <TableCell>{row.normalized?.progress || row.raw.progress || "-"}</TableCell>
                                                <TableCell>{row.status}{row.reason ? ` (${row.reason})` : ""}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {importPreview.issues.length > 0 && (
                                <Box sx={{ maxHeight: 180, overflowY: "auto" }}>
                                    <Typography variant="subtitle2">Masalah pertama{importPreview.issuesTruncated ? " (100 ditampilkan)" : ""}</Typography>
                                    {importPreview.issues.map((issue, index) => (
                                        <Typography key={`${issue.sourceRowNo}-${issue.code}-${index}`} variant="body2" color="text.secondary">
                                            Baris {issue.sourceRowNo}: {issue.message}
                                        </Typography>
                                    ))}
                                </Box>
                            )}
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setImportOpen(false)} color="inherit">Batal</Button>
                    {stagedBatchId && (
                        <Button onClick={() => handleOpenReview(stagedBatchId)} variant="outlined">
                            Tinjau Batch Ini
                        </Button>
                    )}
                    <Button onClick={handleImportPreview} variant="outlined" disabled={importing || !importText.trim()}>
                        {importing ? "Memproses..." : "Buat Pratinjau"}
                    </Button>
                    <Button onClick={handleStageImport} variant="contained" disabled={importing || !importPreview || !!stagedBatchId}>
                        Simpan ke Staging
                    </Button>
                </DialogActions>
            </Dialog>
            {canImport && (
                <ChatTrackingImportReviewDialog
                    open={reviewOpen}
                    onClose={() => setReviewOpen(false)}
                    initialBatchId={reviewBatchId}
                />
            )}
        </Box >
    );
};

export default ChatTrackingPage;
