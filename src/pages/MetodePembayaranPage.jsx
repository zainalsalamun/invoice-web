import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    Typography,
    TextField,
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
    Tooltip,
    Chip,
    CircularProgress,
} from "@mui/material";
import { Edit, Delete, Add } from "@mui/icons-material";
import Sidebar from "../components/Sidebar";
import { metodePembayaranService } from "../services/metodePembayaranService";
import { notifySuccess, notifyError } from "../utils/notify";

const MetodePembayaranPage = () => {
    const [list, setList] = useState([]);
    const [loading, setLoading] = useState(true);
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    const canDelete = currentUser?.role === "super_admin";

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [editTarget, setEditTarget] = useState(null); // null = tambah baru
    const [namaInput, setNamaInput] = useState("");
    const [saving, setSaving] = useState(false);

    // Confirm delete dialog
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        const data = await metodePembayaranService.getAll();
        setList(data);
        setLoading(false);
    };

    useEffect(() => {
        fetchData();
    }, []);

    const openAdd = () => {
        setEditTarget(null);
        setNamaInput("");
        setDialogOpen(true);
    };

    const openEdit = (item) => {
        setEditTarget(item);
        setNamaInput(item.nama);
        setDialogOpen(true);
    };

    const handleSave = async () => {
        if (!namaInput.trim()) return;
        setSaving(true);
        try {
            if (editTarget) {
                await metodePembayaranService.update(editTarget.id, namaInput.trim());
                notifySuccess("Metode pembayaran berhasil diperbarui!");
            } else {
                await metodePembayaranService.create(namaInput.trim());
                notifySuccess("🎉 Metode pembayaran baru ditambahkan!");
            }
            setDialogOpen(false);
            fetchData();
        } catch (err) {
            const msg =
                err?.response?.data?.message || "Gagal menyimpan metode pembayaran";
            notifyError(msg);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget) return;
        try {
            await metodePembayaranService.remove(deleteTarget.id);
            notifySuccess(`"${deleteTarget.nama}" berhasil dihapus`);
            setDeleteTarget(null);
            fetchData();
        } catch (err) {
            const msg =
                err?.response?.data?.message || "Gagal menghapus metode pembayaran";
            notifyError(msg);
        }
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar active="metode-pembayaran" />

            <Box sx={{ flexGrow: 1, p: 4 }}>
                {/* Header */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 3,
                    }}
                >
                    <Typography variant="h5" fontWeight="bold">
                        💳 Metode Pembayaran
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={openAdd}
                        sx={{
                            fontWeight: "bold",
                            textTransform: "none",
                            borderRadius: 2,
                            boxShadow: "0 3px 6px rgba(0,0,0,0.1)",
                        }}
                    >
                        Tambah Metode
                    </Button>
                </Box>

                {/* Tabel */}
                <TableContainer
                    component={Paper}
                    sx={{ borderRadius: 2, boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}
                >
                    <Table>
                        <TableHead sx={{ bgcolor: "primary.main" }}>
                            <TableRow>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>No</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Nama Metode</TableCell>
                                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Dibuat</TableCell>
                                <TableCell align="center" sx={{ color: "#fff", fontWeight: "bold" }}>
                                    Aksi
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                        <CircularProgress size={30} />
                                    </TableCell>
                                </TableRow>
                            ) : list.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        Belum ada metode pembayaran
                                    </TableCell>
                                </TableRow>
                            ) : (
                                list.map((item, idx) => (
                                    <TableRow
                                        key={item.id}
                                        hover
                                        sx={{ "&:last-child td": { border: 0 } }}
                                    >
                                        <TableCell>{idx + 1}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.nama}
                                                color="primary"
                                                variant="outlined"
                                                size="small"
                                                sx={{ fontWeight: 600 }}
                                            />
                                        </TableCell>
                                        <TableCell sx={{ color: "text.secondary", fontSize: 13 }}>
                                            {new Date(item.created_at).toLocaleDateString("id-ID", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric",
                                            })}
                                        </TableCell>
                                        <TableCell align="center">
                                            <Tooltip title="Edit">
                                                <IconButton
                                                    size="small"
                                                    color="primary"
                                                    onClick={() => openEdit(item)}
                                                >
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            {canDelete && (
                                                <Tooltip title="Hapus">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => setDeleteTarget(item)}
                                                    >
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
            </Box>

            {/* ============ Dialog Tambah / Edit ============ */}
            <Dialog
                open={dialogOpen}
                onClose={() => setDialogOpen(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle fontWeight="bold">
                    {editTarget ? "✏️ Edit Metode Pembayaran" : "➕ Tambah Metode Pembayaran"}
                </DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        label="Nama Metode"
                        fullWidth
                        value={namaInput}
                        onChange={(e) => setNamaInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSave()}
                        placeholder="cth: Transfer BCA, GoPay, dll"
                        sx={{ mt: 1 }}
                        size="small"
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDialogOpen(false)} variant="outlined">
                        Batal
                    </Button>
                    <Button
                        onClick={handleSave}
                        variant="contained"
                        disabled={!namaInput.trim() || saving}
                        startIcon={saving && <CircularProgress size={14} color="inherit" />}
                    >
                        {saving ? "Menyimpan..." : "Simpan"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ============ Dialog Konfirmasi Hapus ============ */}
            <Dialog
                open={!!deleteTarget}
                onClose={() => setDeleteTarget(null)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle fontWeight="bold" color="error.main">
                    🗑️ Konfirmasi Hapus
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Yakin ingin menghapus metode pembayaran{" "}
                        <strong>"{deleteTarget?.nama}"</strong>?
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        ⚠️ Tidak bisa dihapus jika masih digunakan oleh pelanggan.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setDeleteTarget(null)} variant="outlined">
                        Batal
                    </Button>
                    <Button onClick={handleDelete} variant="contained" color="error">
                        Ya, Hapus
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default MetodePembayaranPage;
