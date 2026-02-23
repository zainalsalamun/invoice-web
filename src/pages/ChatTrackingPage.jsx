import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import { Edit, Delete, Add, UploadFile } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { chatTrackingService } from "../services/chatTrackingService";
import { authService } from "../services/authService";
import { notifySuccess, notifyError, notifyInfo } from "../utils/notify";

const ChatTrackingPage = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const user = authService.getCurrentUser();
    const canDelete = user?.role === "super_admin";
    const canEdit = ["super_admin", "admin"].includes(user?.role);

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
    });

    const [importOpen, setImportOpen] = useState(false);
    const [importText, setImportText] = useState("");
    const [importing, setImporting] = useState(false);

    // Pagination State
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(15);

    const fetchData = async () => {
        setLoading(true);
        const isAdmin = user?.role === "admin";

        let params = {};
        if (isAdmin && user?.username) {
            params.nama_pic = user.username;
        }

        const data = await chatTrackingService.getAll(params);
        setList(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
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
            });
        } else {
            setEditing(null);
            setForm({
                nama_pic: "",
                tanggal: new Date().toISOString().split('T')[0],
                deskripsi: "",
                progress: "Belum Selesai",
                keterangan: "",
            });
        }
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!form.nama_pic || !form.tanggal || !form.deskripsi) {
            notifyError("Harap isi Nama PIC, Tanggal, dan Deskripsi");
            return;
        }

        setSaving(true);
        try {
            if (editing) {
                await chatTrackingService.update(editing.id, form);
                notifySuccess("Data berhasil diperbarui!");
            } else {
                await chatTrackingService.create(form);
                notifySuccess("Data baru berhasil ditambahkan!");
            }
            setDialogOpen(false);
            fetchData();
        } catch (err) {
            notifyError(err.response?.data?.message || "Gagal menyimpan data");
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

    const handleImport = async () => {
        if (!importText.trim()) return notifyError("Data tidak boleh kosong");

        setImporting(true);
        try {
            const lines = importText.trim().split('\n');
            const dataToImport = [];

            const monthMap = {
                'januari': '01', 'februari': '02', 'maret': '03', 'april': '04',
                'mei': '05', 'juni': '06', 'juli': '07', 'agustus': '08',
                'september': '09', 'oktober': '10', 'november': '11', 'desember': '12',
                'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04', 'jun': '06', 'jul': '07',
                'agu': '08', 'sep': '09', 'okt': '10', 'nov': '11', 'des': '12'
            };

            for (let i = 0; i < lines.length; i++) {
                const cols = lines[i].split('\t');
                if (cols.length >= 5) {
                    if (cols[0].toLowerCase() === 'no' || cols[1].toLowerCase() === 'nama pic') continue;

                    const pic = cols[1]?.trim();
                    const tgl = cols[2]?.trim()?.padStart(2, '0');
                    const blnRaw = cols[3]?.trim()?.toLowerCase();
                    const bln = monthMap[blnRaw] || '01';
                    const thn = "2025";
                    const tanggalFormat = `${thn}-${bln}-${tgl}`;

                    const deskripsi = cols[4]?.trim();
                    const progress = cols[5]?.trim() || 'Belum Selesai';
                    const keterangan = cols[6]?.trim() || '';

                    if (pic && deskripsi && !isNaN(parseInt(tgl))) {
                        dataToImport.push({
                            nama_pic: pic,
                            tanggal: tanggalFormat,
                            deskripsi, progress, keterangan
                        });
                    }
                }
            }

            if (dataToImport.length === 0) {
                notifyError("Format data tidak sesuai, pastikan copy dari Excel beserta kolomnya");
                return;
            }

            const res = await chatTrackingService.bulkCreate(dataToImport);
            notifySuccess(res?.message || "Data berhasil diimport");
            setImportOpen(false);
            setImportText("");
            fetchData();
        } catch (err) {
            notifyError(err.response?.data?.message || "Gagal mengimport data");
        } finally {
            setImporting(false);
        }
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
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

    // Set colors based on PIC
    const getPicColor = (name) => {
        const n = name?.toLowerCase() || '';
        if (n.includes('anggi')) return '#e0e7ff';
        if (n.includes('prima')) return '#ffe4e6';
        if (n.includes('arin')) return '#ccfbf1';
        return '#f3f4f6';
    };

    const getProgressColor = (prog) => {
        if (prog?.toLowerCase().includes('sudah selesai')) return '#bbf7d0';
        return '#fed7aa';
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar active="/chat-tracking" />

            <Box sx={{ flexGrow: 1, p: 4, overflowX: 'hidden' }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                    <Typography variant="h5" fontWeight="bold">
                        💬 Chat Tracking Daily Work 2025 - 2026
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        {canEdit && (
                            <>
                                <Button
                                    variant="outlined"
                                    startIcon={<UploadFile />}
                                    onClick={() => setImportOpen(true)}
                                    sx={{ fontWeight: "bold", textTransform: "none", borderRadius: 2 }}
                                >
                                    Import Excel
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<Add />}
                                    onClick={() => handleOpenDialog()}
                                    sx={{ fontWeight: "bold", textTransform: "none", borderRadius: 2 }}
                                >
                                    Tambah Data
                                </Button>
                            </>
                        )}
                    </Box>
                </Box>

                <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 3 }}>
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#dbeafe" }}>
                                <TableCell align="center" sx={{ fontWeight: "bold", border: '1px solid #cbd5e1' }}>No</TableCell>
                                <TableCell sx={{ fontWeight: "bold", border: '1px solid #cbd5e1' }}>Nama PIC</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", border: '1px solid #cbd5e1' }}>Tanggal & Bulan</TableCell>
                                <TableCell sx={{ fontWeight: "bold", border: '1px solid #cbd5e1', width: '40%' }}>Deskripsi</TableCell>
                                <TableCell sx={{ fontWeight: "bold", border: '1px solid #cbd5e1' }}>Progress</TableCell>
                                <TableCell sx={{ fontWeight: "bold", border: '1px solid #cbd5e1' }}>Keterangan</TableCell>
                                <TableCell align="center" sx={{ fontWeight: "bold", border: '1px solid #cbd5e1' }}>Aksi</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Memuat data...</TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} align="center" sx={{ py: 3 }}>Belum ada data Chat Tracking.</TableCell>
                                </TableRow>
                            ) : (
                                list.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell align="center" sx={{ border: '1px solid #e2e8f0', fontWeight: 500 }}>
                                            {(list.length - (page * rowsPerPage + index))}
                                        </TableCell>
                                        <TableCell sx={{ border: '1px solid #e2e8f0', color: '#4f46e5', fontWeight: 600, bgcolor: getPicColor(row.nama_pic) }}>
                                            {row.nama_pic}
                                        </TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #e2e8f0' }}>
                                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                                                <Typography sx={{ fontWeight: 'bold', fontSize: 14 }}>
                                                    {formatTanggalHari(row.tanggal)}
                                                </Typography>
                                                <Typography sx={{ bgcolor: '#b45309', color: '#fff', fontSize: 11, fontWeight: 'bold', px: 1, borderRadius: 1 }}>
                                                    {formatBulan(row.tanggal)}
                                                </Typography>
                                            </Box>
                                        </TableCell>
                                        <TableCell sx={{ border: '1px solid #e2e8f0', fontSize: 13 }}>
                                            {row.deskripsi}
                                        </TableCell>
                                        <TableCell sx={{ border: '1px solid #e2e8f0', bgcolor: getProgressColor(row.progress), color: '#166534', fontWeight: 500, fontSize: 13 }}>
                                            {row.progress}
                                        </TableCell>
                                        <TableCell sx={{ border: '1px solid #e2e8f0', fontSize: 13 }}>
                                            {row.keterangan || "-"}
                                        </TableCell>
                                        <TableCell align="center" sx={{ border: '1px solid #e2e8f0', whiteSpace: "nowrap" }}>
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
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[15, 25, 50, 100]}
                    component="div"
                    count={list.length}
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
                        <TextField
                            label="Nama PIC"
                            size="small"
                            value={form.nama_pic}
                            onChange={(e) => setForm({ ...form, nama_pic: e.target.value })}
                            fullWidth
                            required
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
                        <TextField
                            label="Keterangan"
                            size="small"
                            multiline
                            rows={2}
                            value={form.keterangan}
                            onChange={(e) => setForm({ ...form, keterangan: e.target.value })}
                            fullWidth
                        />
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
            <Dialog open={importOpen} onClose={() => setImportOpen(false)} fullWidth maxWidth="md">
                <DialogTitle fontWeight="bold">Import Data dari Excel / Google Sheet</DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Caranya: Buka file Excel atau Google Sheets Anda, lalu blok baris tabel yang ingin Anda pindahkan (mulai dari No, Nama PIC, dst), klik <b>Copy (Ctrl+C)</b>, kemudian klik di dalam kotak di bawah ini dan klik <b>Paste (Ctrl+V)</b>.
                    </Typography>
                    <TextField
                        label="Paste Data Excel Disini"
                        multiline
                        rows={12}
                        value={importText}
                        onChange={(e) => setImportText(e.target.value)}
                        fullWidth
                        placeholder="1	Anggi	1	Januari	Rekap pembayaran	Sudah Selesai&#10;2	Prima	2	Januari	Merekap arus kas	Sudah Selesai..."
                    />
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={() => setImportOpen(false)} color="inherit">Batal</Button>
                    <Button onClick={handleImport} variant="contained" color="success" disabled={importing}>
                        {importing ? "Mengimport..." : "Mulai Import Data"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
};

export default ChatTrackingPage;
