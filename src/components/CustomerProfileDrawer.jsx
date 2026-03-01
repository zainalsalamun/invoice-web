import React, { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Box,
    Typography,
    Chip,
    Divider,
    IconButton,
    Avatar,
    Skeleton,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Button,
    Tooltip,
    Stack,
    TextField,
    MenuItem,
    CircularProgress,
} from "@mui/material";
import {
    Close as CloseIcon,
    Edit as EditIcon,
    WhatsApp as WhatsAppIcon,
    OpenInNew as OpenInNewIcon,
    CheckCircle as CheckCircleIcon,
} from "@mui/icons-material";
import { customerService } from "../services/customerService";
import { invoiceService } from "../services/invoiceService";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import "dayjs/locale/id";

dayjs.locale("id");

const formatRupiah = (value) => {
    if (!value && value !== 0) return "-";
    return new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    }).format(value);
};

const formatTanggal = (iso) => {
    if (!iso) return "-";
    return dayjs(iso).locale("id").format("D MMMM YYYY");
};

const getAvatarColor = (name) => {
    if (!name) return "#1976d2";
    const colors = ["#1565c0", "#2e7d32", "#e65100", "#6a1b9a", "#c62828", "#00695c", "#4527a0"];
    return colors[name.charCodeAt(0) % colors.length];
};

const initials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

/* ─── Baris info: label kiri, nilai kanan ─── */
const InfoRow = ({ label, value, valueColor, mono }) => (
    <Box
        sx={{
            display: "grid",
            gridTemplateColumns: "160px 1fr",
            alignItems: "flex-start",
            py: 0.85,
            borderBottom: "1px solid #f0f0f0",
            "&:last-child": { borderBottom: 0 },
        }}
    >
        <Typography variant="body2" color="text.secondary" sx={{ pr: 2, fontWeight: 500 }}>
            {label}
        </Typography>
        <Typography
            variant="body2"
            fontWeight={500}
            color={valueColor || "text.primary"}
            fontFamily={mono ? "monospace" : undefined}
            sx={{ wordBreak: "break-word" }}
        >
            {value || "-"}
        </Typography>
    </Box>
);

const CustomerProfileDrawer = ({ customerId, open, onClose, onEdit, onPaymentConfirmed }) => {
    const [customer, setCustomer] = useState(null);
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // ── State dialog konfirmasi pembayaran ───────────────────────────────
    const [confirmDialog, setConfirmDialog] = useState(false);
    const [confirmInvoice, setConfirmInvoice] = useState(null);
    const [loadingLunas, setLoadingLunas] = useState(false);
    const [metodeList, setMetodeList] = useState([]);
    const [selectedMetode, setSelectedMetode] = useState("");
    const [tanggalBayar, setTanggalBayar] = useState("");
    const [confirmMsg, setConfirmMsg] = useState("");
    const [buktiFile, setBuktiFile] = useState(null);       // file object
    const [buktiPreview, setBuktiPreview] = useState(null); // URL preview

    useEffect(() => {
        if (open && customerId) {
            setCustomer(null);
            setInvoices([]);
            fetchCustomerDetail();
            fetchCustomerInvoices();
        }
        // eslint-disable-next-line
    }, [open, customerId]);

    const fetchCustomerDetail = async () => {
        setLoading(true);
        try {
            const data = await customerService.getById(customerId);
            setCustomer(data);
        } catch (err) {
            console.error("Gagal ambil detail pelanggan:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchCustomerInvoices = async () => {
        try {
            const all = await invoiceService.getAll();
            const filtered = all
                .filter((inv) => inv.customer_id === customerId)
                .sort((a, b) => {
                    // Prioritas 1: Belum Lunas / Cicil di atas (tagihan aktif)
                    const aLunas = (a.status_pembayaran || "").toLowerCase() === "lunas";
                    const bLunas = (b.status_pembayaran || "").toLowerCase() === "lunas";
                    if (!aLunas && bLunas) return -1;
                    if (aLunas && !bLunas) return 1;
                    // Prioritas 2: Periode terbaru (alphabetical desc karena "Maret 2026" > "Februari 2026")
                    const parseDate = (inv) => {
                        if (inv.tanggal_invoice) return new Date(inv.tanggal_invoice).getTime();
                        return 0;
                    };
                    // Fallback ke nomor invoice descending
                    if (parseDate(a) !== parseDate(b)) return parseDate(b) - parseDate(a);
                    return (b.nomor_invoice || "").localeCompare(a.nomor_invoice || "");
                });
            setInvoices(filtered);
        } catch (err) {
            console.error("Gagal ambil invoice pelanggan:", err);
        }
    };


    const handleClose = () => {
        setCustomer(null);
        setInvoices([]);
        onClose();
    };

    // Buka dialog konfirmasi tandai lunas
    const handleTandaiLunas = async (inv) => {
        setConfirmInvoice(inv);
        setSelectedMetode(inv.metode_pembayaran_id || "");
        setTanggalBayar(dayjs().format("YYYY-MM-DD"));
        setConfirmMsg("");
        setBuktiFile(null);
        setBuktiPreview(null);
        try {
            const { metodePembayaranService } = await import("../services/metodePembayaranService");
            const data = await metodePembayaranService.getAll();
            setMetodeList(data || []);
        } catch { /* abaikan */ }
        setConfirmDialog(true);
    };

    // Handle pilih file bukti transfer
    const handleBuktiChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setBuktiFile(file);
        setBuktiPreview(URL.createObjectURL(file));
    };

    // Eksekusi konfirmasi lunas ke backend (satu request, handle status + bukti)
    const handleConfirmLunas = async () => {
        if (!confirmInvoice) return;
        setLoadingLunas(true);
        try {
            await invoiceService.confirmPayment(confirmInvoice.id, {
                status_pembayaran: "Lunas",
                tanggal_pembayaran: tanggalBayar,
                metode_pembayaran_id: selectedMetode || null,
                kurang_bayar: 0,
                buktiFile: buktiFile || null,
            });

            setConfirmMsg(`✅ Invoice ${confirmInvoice.nomor_invoice} berhasil ditandai Lunas!`);
            await fetchCustomerInvoices();
            await fetchCustomerDetail();
            // Beritahu parent agar refresh tabel utama
            if (onPaymentConfirmed) onPaymentConfirmed();
            setTimeout(() => {
                setConfirmDialog(false);
                setConfirmInvoice(null);
                setConfirmMsg("");
                setBuktiFile(null);
                setBuktiPreview(null);
            }, 1200);
        } catch {
            setConfirmMsg("❌ Gagal mengkonfirmasi. Coba lagi.");
        } finally {
            setLoadingLunas(false);
        }
    };

    const statusPayment = (customer?.last_invoice_status || customer?.status_pembayaran || "BELUM LUNAS").toUpperCase();

    const isLunas = statusPayment === "LUNAS";
    const isAktif = customer?.aktif !== false;

    // Invoice terbaru (invoices sudah di-sort descending by tanggal_invoice)
    const latestInvoice = invoices.length > 0 ? invoices[0] : null;
    const latestStatus = latestInvoice
        ? (latestInvoice.status_pembayaran || "Belum Lunas")
        : (isLunas ? "Lunas" : "Belum Lunas");
    const latestIsLunas = latestStatus.toLowerCase() === "lunas";

    const totalLunas = invoices.filter((i) => (i.status_pembayaran || "").toLowerCase() === "lunas").length;
    // Total Tagihan = hanya yang BELUM LUNAS (piutang aktif, bukan semua riwayat)
    const totalTagihan = invoices
        .filter((i) => (i.status_pembayaran || "").toLowerCase() !== "lunas")
        .reduce((s, i) => s + Number(i.total || 0), 0);


    return (
        <>
            <Dialog
                open={open}
                onClose={handleClose}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: "hidden",
                        maxHeight: "92vh",
                    },
                }}
            >
                {/* ── HEADER ─────────────────────────────────────────── */}
                <Box
                    sx={{
                        px: 3,
                        pt: 2.5,
                        pb: 2,
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        borderBottom: "1px solid #e8e8e8",
                        bgcolor: "#fff",
                    }}
                >
                    {loading ? (
                        <Skeleton variant="circular" width={52} height={52} />
                    ) : (
                        <Avatar
                            sx={{
                                width: 52,
                                height: 52,
                                fontSize: 20,
                                fontWeight: 700,
                                bgcolor: getAvatarColor(customer?.nama),
                                flexShrink: 0,
                            }}
                        >
                            {initials(customer?.nama)}
                        </Avatar>
                    )}

                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                        {loading ? (
                            <Stack spacing={0.5}>
                                <Skeleton width={200} height={24} />
                                <Skeleton width={120} height={18} />
                            </Stack>
                        ) : (
                            <>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                    <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                                        {customer?.nama || "-"}
                                    </Typography>
                                    <Chip
                                        label={isAktif ? "Aktif" : "Nonaktif"}
                                        size="small"
                                        color={isAktif ? "success" : "default"}
                                        variant="filled"
                                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                    />
                                    <Chip
                                        label={isLunas ? "Lunas" : "Belum Lunas"}
                                        size="small"
                                        color={isLunas ? "success" : "error"}
                                        variant="outlined"
                                        sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                    />
                                </Box>
                                <Typography variant="caption" color="text.secondary" fontFamily="monospace">
                                    {customer?.id_pelanggan ? `ID: ${customer.id_pelanggan}` : ""}
                                    {customer?.kategori_pelanggan ? `  •  ${customer.kategori_pelanggan}` : ""}
                                </Typography>
                            </>
                        )}
                    </Box>

                    {/* Aksi header */}
                    <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
                        {customer?.nomor_wa && (
                            <Tooltip title="WhatsApp">
                                <IconButton
                                    size="small"
                                    href={`https://wa.me/${customer.nomor_wa.replace(/\D/g, "")}`}
                                    target="_blank"
                                    sx={{ color: "#25D366", border: "1px solid #25D366", borderRadius: 1.5 }}
                                >
                                    <WhatsAppIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        )}
                        {customer && (
                            <Button
                                size="small"
                                variant="contained"
                                startIcon={<EditIcon fontSize="small" />}
                                onClick={() => {
                                    handleClose();
                                    onEdit && onEdit(customer);
                                }}
                                sx={{ textTransform: "none", fontWeight: 600, borderRadius: 1.5, px: 2 }}
                            >
                                Edit
                            </Button>
                        )}
                        <IconButton size="small" onClick={handleClose} sx={{ ml: 0.5 }}>
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </Box>
                </Box>

                {/* ── SUMMARY STRIP ──────────────────────────────────── */}
                {!loading && customer && (
                    <Box
                        sx={{
                            display: "flex",
                            bgcolor: "#f7f8fa",
                            borderBottom: "1px solid #e8e8e8",
                        }}
                    >
                        {[
                            { label: "Total Invoice", value: invoices.length },
                            { label: "Sudah Lunas", value: totalLunas },
                            { label: "Belum Lunas", value: invoices.length - totalLunas },
                            { label: "Sisa Tagihan", value: formatRupiah(totalTagihan) },
                        ].map((item, i) => (
                            <Box
                                key={i}
                                sx={{
                                    flex: 1,
                                    textAlign: "center",
                                    py: 1.5,
                                    borderRight: i < 3 ? "1px solid #e8e8e8" : "none",
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={700} color={i === 1 ? "success.main" : i === 2 ? "error.main" : "text.primary"}>
                                    {item.value}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {item.label}
                                </Typography>
                            </Box>
                        ))}
                    </Box>
                )}

                {/* ── BODY ───────────────────────────────────────────── */}
                <DialogContent sx={{ p: 0, bgcolor: "#fff" }}>
                    {loading ? (
                        <Box sx={{ p: 3 }}>
                            <Stack spacing={1.5}>
                                {[...Array(7)].map((_, i) => (
                                    <Skeleton key={i} variant="rounded" height={32} />
                                ))}
                            </Stack>
                        </Box>
                    ) : customer ? (
                        <>
                            {/* ── DUA KOLOM: Info Umum + Paket & Tagihan ── */}
                            <Box
                                sx={{
                                    display: "grid",
                                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                                    gap: 0,
                                }}
                            >
                                {/* Kolom Kiri — Informasi Pelanggan */}
                                <Box sx={{ p: 3, borderRight: { sm: "1px solid #f0f0f0" } }}>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        color="text.secondary"
                                        sx={{ textTransform: "uppercase", letterSpacing: 1, mb: 1.5, display: "block" }}
                                    >
                                        Informasi Pelanggan
                                    </Typography>

                                    <InfoRow label="Alamat" value={customer.alamat} />
                                    <InfoRow label="Nomor WhatsApp" value={customer.nomor_wa} valueColor="#0a8043" />
                                    <InfoRow label="Kategori" value={customer.kategori_pelanggan} />
                                    <InfoRow label="Jatuh Tempo" value={formatTanggal(customer.tanggal_jatuh_tempo)} />
                                    <InfoRow
                                        label="Status Aktif"
                                        value={
                                            <Chip
                                                label={isAktif ? "Aktif" : "Nonaktif"}
                                                size="small"
                                                color={isAktif ? "success" : "default"}
                                                variant="outlined"
                                                sx={{ fontSize: "0.7rem", height: 22 }}
                                            />
                                        }
                                    />

                                    {customer.notes && (
                                        <Box sx={{ mt: 2, p: 1.5, bgcolor: "#fffde7", borderRadius: 1.5, border: "1px solid #ffe082" }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3, display: "block" }}>
                                                📝 Catatan
                                            </Typography>
                                            <Typography variant="body2" sx={{ fontStyle: "italic", color: "#555", lineHeight: 1.5 }}>
                                                {customer.notes}
                                            </Typography>
                                        </Box>
                                    )}
                                </Box>

                                {/* Kolom Kanan — Paket & Tagihan */}
                                <Box sx={{ p: 3 }}>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        color="text.secondary"
                                        sx={{ textTransform: "uppercase", letterSpacing: 1, mb: 1.5, display: "block" }}
                                    >
                                        Paket & Tagihan
                                    </Typography>

                                    <InfoRow label="Paket Layanan" value={customer.paket_layanan || customer.paket} />
                                    <InfoRow label="Harga Langganan" value={formatRupiah(customer.harga_langganan)} valueColor="#1565c0" />
                                    {Number(customer.ppn) > 0 && (
                                        <InfoRow label="PPN" value={formatRupiah(customer.ppn)} />
                                    )}
                                    <InfoRow label="Metode Pembayaran" value={customer.metode_pembayaran_nama} />
                                    {/* Periode & status dari invoice terbaru, bukan field statis customer */}
                                    <InfoRow
                                        label="Periode Tagihan"
                                        value={latestInvoice?.periode || customer.tagihan_periode_bulan || "-"}
                                    />
                                    <InfoRow
                                        label="Status Bayar"
                                        value={
                                            <Chip
                                                label={latestIsLunas ? "Lunas" : "Belum Lunas"}
                                                size="small"
                                                color={latestIsLunas ? "success" : "error"}
                                                variant="filled"
                                                sx={{ fontSize: "0.7rem", height: 22 }}
                                            />
                                        }
                                    />

                                    {/* Rincian item dari invoice terbaru — bukan dari customer.items */}
                                    {latestInvoice?.items && latestInvoice.items.length > 0 ? (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                                Rincian Item
                                            </Typography>
                                            {latestInvoice.items.map((item, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        py: 0.4,
                                                        px: 1,
                                                        borderRadius: 1,
                                                        bgcolor: idx % 2 === 0 ? "#f5f7fa" : "transparent",
                                                    }}
                                                >
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.deskripsi} × {item.qty || 1}
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {formatRupiah(item.jumlah)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : customer.items && customer.items.length > 0 ? (
                                        <Box sx={{ mt: 2 }}>
                                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5 }}>
                                                Rincian Item
                                            </Typography>
                                            {customer.items.map((item, idx) => (
                                                <Box
                                                    key={idx}
                                                    sx={{
                                                        display: "flex",
                                                        justifyContent: "space-between",
                                                        py: 0.4,
                                                        px: 1,
                                                        borderRadius: 1,
                                                        bgcolor: idx % 2 === 0 ? "#f5f7fa" : "transparent",
                                                    }}
                                                >
                                                    <Typography variant="caption" color="text.secondary">
                                                        {item.deskripsi} × {item.qty}
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight={600}>
                                                        {formatRupiah(item.jumlah)}
                                                    </Typography>
                                                </Box>
                                            ))}
                                        </Box>
                                    ) : null}
                                </Box>
                            </Box>

                            {/* ── RIWAYAT INVOICE ─────────────────────────── */}
                            <Box sx={{ borderTop: "1px solid #e8e8e8" }}>
                                <Box sx={{ px: 3, pt: 2, pb: 1, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <Typography
                                        variant="caption"
                                        fontWeight={700}
                                        color="text.secondary"
                                        sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                                    >
                                        Faktur & Tagihan ({invoices.length})
                                    </Typography>
                                </Box>

                                {invoices.length === 0 ? (
                                    <Box sx={{ textAlign: "center", py: 5, color: "text.disabled" }}>
                                        <Typography variant="body2">Belum ada tagihan tercatat.</Typography>
                                    </Box>
                                ) : (
                                    <Box sx={{ overflowX: "auto" }}>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow sx={{ bgcolor: "#f7f8fa" }}>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary", py: 1.2, pl: 3 }}>
                                                        Nomor Invoice
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary", py: 1.2 }}>
                                                        Status
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary", py: 1.2 }}>
                                                        Total
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary", py: 1.2 }}>
                                                        Periode
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary", py: 1.2 }}>
                                                        Tanggal Invoice
                                                    </TableCell>
                                                    <TableCell sx={{ fontWeight: 700, fontSize: "0.75rem", color: "text.secondary", py: 1.2, pr: 2 }}>
                                                        Aksi
                                                    </TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {invoices.map((inv) => {
                                                    const st = (inv.status_pembayaran || "").toLowerCase();
                                                    const isL = st === "lunas";
                                                    const isC = st === "cicil";
                                                    return (
                                                        <TableRow
                                                            key={inv.id}
                                                            hover
                                                            sx={{
                                                                bgcolor: !isL ? "rgba(255, 235, 230, 0.5)" : "transparent",
                                                                transition: "background 0.2s",
                                                            }}
                                                        >
                                                            <TableCell
                                                                sx={{ pl: 3, py: 1.2, cursor: "pointer" }}
                                                                onClick={() => { handleClose(); navigate(`/invoices/${inv.id}.pdf`); }}
                                                            >
                                                                <Typography
                                                                    variant="body2"
                                                                    color="primary"
                                                                    fontFamily="monospace"
                                                                    fontWeight={600}
                                                                    sx={{ "&:hover": { textDecoration: "underline" } }}
                                                                >
                                                                    {inv.nomor_invoice}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ py: 1.2 }}>
                                                                <Chip
                                                                    label={isL ? "Lunas" : isC ? "Cicil" : "Belum Lunas"}
                                                                    size="small"
                                                                    color={isL ? "success" : isC ? "info" : "error"}
                                                                    variant="filled"
                                                                    sx={{ fontSize: "0.68rem", height: 22, fontWeight: 600 }}
                                                                />
                                                            </TableCell>
                                                            <TableCell sx={{ py: 1.2 }}>
                                                                <Typography variant="body2" fontWeight={600}>
                                                                    {formatRupiah(inv.total)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ py: 1.2 }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {inv.periode || "-"}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ py: 1.2 }}>
                                                                <Typography variant="body2" color="text.secondary">
                                                                    {formatTanggal(inv.tanggal_invoice)}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell sx={{ py: 1.2, pr: 2 }}>
                                                                <Stack direction="row" spacing={0.5} alignItems="center">
                                                                    {/* Tombol Tandai Lunas — hanya muncul jika belum lunas */}
                                                                    {!isL && (
                                                                        <Tooltip title="Konfirmasi pembayaran pelanggan">
                                                                            <Button
                                                                                size="small"
                                                                                variant="contained"
                                                                                color="success"
                                                                                startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                                                                onClick={() => handleTandaiLunas(inv)}
                                                                                sx={{
                                                                                    fontSize: "0.68rem",
                                                                                    height: 26,
                                                                                    textTransform: "none",
                                                                                    px: 1,
                                                                                    borderRadius: 1.5,
                                                                                    whiteSpace: "nowrap",
                                                                                    boxShadow: "none",
                                                                                }}
                                                                            >
                                                                                Tandai Lunas
                                                                            </Button>
                                                                        </Tooltip>
                                                                    )}
                                                                    <Tooltip title="Buka invoice">
                                                                        <IconButton
                                                                            size="small"
                                                                            onClick={() => { handleClose(); navigate(`/invoices/${inv.id}.pdf`); }}
                                                                        >
                                                                            <OpenInNewIcon sx={{ fontSize: 15 }} />
                                                                        </IconButton>
                                                                    </Tooltip>
                                                                </Stack>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </Box>
                                )}
                            </Box>
                        </>
                    ) : (
                        <Box sx={{ textAlign: "center", py: 10, color: "text.disabled" }}>
                            <Typography variant="body2">Data tidak ditemukan.</Typography>
                        </Box>
                    )}
                </DialogContent>
            </Dialog>

            {/* ── Dialog Konfirmasi Pembayaran ────────────────────────────────── */}
            <Dialog
                open={confirmDialog}
                onClose={() => !loadingLunas && setConfirmDialog(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ pb: 1, display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box sx={{ bgcolor: "success.light", borderRadius: "50%", width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <CheckCircleIcon color="success" sx={{ fontSize: 22 }} />
                    </Box>
                    <Box>
                        <Typography fontWeight={700} fontSize="1rem">Konfirmasi Pembayaran</Typography>
                        <Typography variant="caption" color="text.secondary">Tandai tagihan ini sebagai sudah dibayar</Typography>
                    </Box>
                </DialogTitle>

                <DialogContent sx={{ pt: 0.5 }}>
                    {confirmInvoice && (
                        <Stack spacing={2}>
                            {/* Info invoice */}
                            <Box sx={{ p: 1.5, bgcolor: "#f0fdf4", borderRadius: 2, border: "1px solid #bbf7d0" }}>
                                <Typography variant="body2" fontWeight={700} color="success.dark">
                                    {confirmInvoice.nomor_invoice}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {confirmInvoice.periode} · <strong>{formatRupiah(confirmInvoice.total)}</strong>
                                </Typography>
                            </Box>

                            {/* Metode Pembayaran */}
                            <TextField
                                select
                                label="Metode Pembayaran"
                                size="small"
                                fullWidth
                                value={selectedMetode}
                                onChange={(e) => setSelectedMetode(e.target.value)}
                            >
                                <MenuItem value=""><em>-- Tidak dipilih --</em></MenuItem>
                                {metodeList.map((m) => (
                                    <MenuItem key={m.id} value={m.id}>{m.nama}</MenuItem>
                                ))}
                            </TextField>

                            {/* Tanggal Bayar */}
                            <TextField
                                label="Tanggal Pembayaran"
                                type="date"
                                size="small"
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                value={tanggalBayar}
                                onChange={(e) => setTanggalBayar(e.target.value)}
                            />

                            {/* ── Upload Bukti Transfer ── */}
                            <Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.8 }}>
                                    <Typography variant="body2" fontWeight={600} color="text.primary">
                                        Bukti Transfer
                                    </Typography>
                                    <Chip label="Dianjurkan" size="small" color="warning" variant="outlined"
                                        sx={{ fontSize: "0.62rem", height: 18, borderRadius: 1 }} />
                                </Box>

                                {/* Preview jika sudah ada file */}
                                {buktiPreview ? (
                                    <Box sx={{ position: "relative" }}>
                                        <Box
                                            component="img"
                                            src={buktiPreview}
                                            alt="Bukti Transfer"
                                            sx={{
                                                width: "100%",
                                                maxHeight: 180,
                                                objectFit: "contain",
                                                borderRadius: 2,
                                                border: "1px solid #e2e8f0",
                                                bgcolor: "#f8fafc",
                                            }}
                                        />
                                        <Button
                                            size="small"
                                            color="error"
                                            variant="text"
                                            onClick={() => { setBuktiFile(null); setBuktiPreview(null); }}
                                            sx={{
                                                position: "absolute",
                                                top: 6,
                                                right: 6,
                                                minWidth: 0,
                                                px: 0.8,
                                                py: 0.2,
                                                fontSize: "0.7rem",
                                                bgcolor: "rgba(255,255,255,0.9)",
                                                "&:hover": { bgcolor: "#fee2e2" },
                                                borderRadius: 1,
                                                textTransform: "none",
                                            }}
                                        >
                                            ✕ Hapus
                                        </Button>
                                        <Typography variant="caption" color="success.main" sx={{ display: "block", mt: 0.5, fontWeight: 600 }}>
                                            ✓ {buktiFile?.name}
                                        </Typography>
                                    </Box>
                                ) : (
                                    /* Area upload — klik untuk pilih file */
                                    <Box
                                        component="label"
                                        htmlFor="bukti-upload-confirm"
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            p: 2.5,
                                            border: "2px dashed #cbd5e1",
                                            borderRadius: 2,
                                            cursor: "pointer",
                                            bgcolor: "#f8fafc",
                                            transition: "all 0.2s",
                                            "&:hover": { borderColor: "#2563eb", bgcolor: "#eff6ff" },
                                            gap: 0.5,
                                        }}
                                    >
                                        <Typography fontSize="1.6rem">🧾</Typography>
                                        <Typography variant="body2" fontWeight={600} color="text.secondary">
                                            Klik untuk upload bukti transfer
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">
                                            JPG, PNG, WEBP, PDF — maks. 5MB
                                        </Typography>
                                        <input
                                            id="bukti-upload-confirm"
                                            type="file"
                                            accept="image/*,.pdf"
                                            hidden
                                            onChange={handleBuktiChange}
                                        />
                                    </Box>
                                )}
                            </Box>

                            {/* Pesan sukses / error */}
                            {confirmMsg && (
                                <Typography
                                    variant="body2"
                                    color={confirmMsg.startsWith("✅") ? "success.main" : "error"}
                                    sx={{ fontWeight: 600, textAlign: "center" }}
                                >
                                    {confirmMsg}
                                </Typography>
                            )}
                        </Stack>

                    )}
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, pt: 1 }}>
                    <Button
                        variant="outlined"
                        size="small"
                        onClick={() => { setConfirmDialog(false); setConfirmMsg(""); }}
                        disabled={loadingLunas}
                        sx={{ textTransform: "none", borderRadius: 2 }}
                    >
                        Batal
                    </Button>
                    <Button
                        variant="contained"
                        color="success"
                        size="small"
                        onClick={handleConfirmLunas}
                        disabled={loadingLunas || !!confirmMsg.startsWith("✅")}
                        startIcon={
                            loadingLunas
                                ? <CircularProgress size={14} color="inherit" />
                                : <CheckCircleIcon sx={{ fontSize: 16 }} />
                        }
                        sx={{ textTransform: "none", borderRadius: 2, px: 2 }}
                    >
                        {loadingLunas ? "Memproses..." : "Konfirmasi Lunas"}
                    </Button>
                </DialogActions>
            </Dialog>
        </>);
};

export default CustomerProfileDrawer;
