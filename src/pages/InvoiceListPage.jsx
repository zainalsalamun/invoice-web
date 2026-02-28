/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useMemo, useEffect } from "react";
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Card,
    CardContent,
    Typography,
    Grid,
    Snackbar,
    Alert,
    Slide,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import InvoiceTable from "../components/InvoiceTable";
import { invoiceService } from "../services/invoiceService";
import { generatePDF } from "../utils/pdfGenerator";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import WhatsAppDialog from "../components/WhatsAppDialog";
import { authService } from "../services/authService";

const InvoiceListPage = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const currentMonth = new Date().toISOString().slice(0, 7);

    const [filters, setFilters] = useState({
        month: currentMonth,
        status: "",
        search: "",
    });
    const [invoices, setInvoices] = useState([]);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const [animateKey, setAnimateKey] = useState(0);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "info",
    });

    const [openWaDialog, setOpenWaDialog] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    const fetchInvoices = async () => {
        try {
            const data = await invoiceService.getAll();
            setInvoices(
                data.map((item) => ({
                    id: item._id || item.id,
                    nomorInvoice: item.nomor_invoice,
                    namaPelanggan: item.nama_pelanggan,
                    alamat: item.alamat,
                    layanan: item.layanan,
                    hargaPaket: item.harga_paket,
                    ppn: item.ppn,
                    total: item.total,
                    periode: item.periode,
                    statusPembayaran: item.status_pembayaran,
                    tanggalInvoice: item.tanggal_invoice,
                    tanggalJatuhTempo: item.tanggal_jatuh_tempo,
                    buktiTransfer: item.bukti_transfer,
                    kurangBayar: item.kurang_bayar,
                    tanggalPembayaran: item.tanggal_pembayaran,
                }))
            );
        } catch (err) {
            console.error("❌ Gagal ambil data invoice:", err);
            setSnackbar({
                open: true,
                message: "Gagal memuat data dari server.",
                severity: "error",
            });
        } finally {
            setIsFirstLoad(false);
        }
    };

    useEffect(() => {
        fetchInvoices();
    }, []);

    // 🔹 Animasi filter
    useEffect(() => {
        if (isFirstLoad) return;
        const timeout = setTimeout(() => setAnimateKey((prev) => prev + 1), 250);
        return () => clearTimeout(timeout);
    }, [filters]);

    const convertMonth = (value) => {
        if (!value) return "";
        const date = new Date(value);
        return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
    };

    const getMonthStrings = (value) => {
        if (!value) return { id: "", en: "" };
        const date = new Date(value);
        return {
            id: date.toLocaleString("id-ID", { month: "long", year: "numeric" }).toLowerCase(),
            en: date.toLocaleString("en-US", { month: "long", year: "numeric" }).toLowerCase()
        };
    };

    const filtered = invoices.filter((i) => {
        let byMonth = true;
        if (filters.month) {
            const { id, en } = getMonthStrings(filters.month);
            const p = i.periode?.toLowerCase() || "";
            const t = i.tanggalInvoice || "";
            byMonth = p.includes(id) || p.includes(en) || t.startsWith(filters.month);
        }
        const byStatus = filters.status
            ? i.statusPembayaran?.toLowerCase() === filters.status.toLowerCase()
            : true;
        const bySearch = filters.search
            ? i.namaPelanggan?.toLowerCase().includes(filters.search.toLowerCase()) ||
            i.nomorInvoice?.toLowerCase().includes(filters.search.toLowerCase())
            : true;
        return byMonth && byStatus && bySearch;
    });

    const handleReset = () => {
        setFilters({ month: currentMonth, status: "", search: "" });
        setSnackbar({
            open: true,
            message: `Filter direset ke ${convertMonth(currentMonth)}`,
            severity: "success",
        });
    };

    const handleCloseSnackbar = () =>
        setSnackbar((prev) => ({ ...prev, open: false }));

    const summary = useMemo(() => {
        const totalInvoice = filtered.length;
        const totalLunas = filtered.filter((i) => i.statusPembayaran === "Lunas").length;
        const totalBelum = filtered.filter((i) => i.statusPembayaran === "Belum Lunas").length;
        const totalNominal = filtered.reduce((sum, i) => sum + (i.total || 0), 0);
        return { totalInvoice, totalLunas, totalBelum, totalNominal };
    }, [filtered]);

    const handleView = (invoice) =>
        navigate(`/invoices/${invoice.id}.pdf`, { state: { data: invoice } });

    const handlePrint = (invoice) => generatePDF(invoice);
    const handleSendWhatsApp = (invoice) => {
        setSelectedInvoice(invoice);
        setOpenWaDialog(true);
    };
    const handleSend = (phone) => {
        if (selectedInvoice) sendWhatsApp(selectedInvoice, phone);
    };
    const handleUploadProof = async (invoiceId, file) => {
        if (!file) return;
        const res = await invoiceService.uploadProof(invoiceId, file);
        if (res?.success) {
            setSnackbar({
                open: true,
                message: "✅ Bukti pembayaran berhasil diupload!",
                severity: "success",
            });
            fetchInvoices();
        } else {
            setSnackbar({
                open: true,
                message: "❌ Gagal upload bukti pembayaran.",
                severity: "error",
            });
        }
    };

    const handleDelete = async (id) => {
        try {
            const res = await invoiceService.delete(id);
            if (res) {
                setSnackbar({
                    open: true,
                    message: "✅ Invoice berhasil dihapus!",
                    severity: "success",
                });
                fetchInvoices();
            } else {
                setSnackbar({
                    open: true,
                    message: "❌ Gagal menghapus invoice.",
                    severity: "error",
                });
            }
        } catch (err) {
            console.error("❌ Gagal hapus invoice:", err);
            setSnackbar({
                open: true,
                message: "❌ Gagal menghapus invoice.",
                severity: "error",
            });
        }
    };

    return (
        <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar active="/invoices" />
            <Box sx={{ flexGrow: 1, p: 4 }}>
                <h2 style={{ marginBottom: 20 }}>📊 Daftar Invoice Pelanggan</h2>

                {/* Filter Bar */}
                <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
                    <TextField
                        select
                        label="Bulan"
                        size="small"
                        value={filters.month ? filters.month.split("-")[1] : ""}
                        onChange={(e) => {
                            const newMonth = e.target.value;
                            const currentYear = filters.month ? filters.month.split("-")[0] : new Date().getFullYear();
                            setFilters((f) => ({ ...f, month: `${currentYear}-${newMonth}` }));
                        }}
                        sx={{ width: 130 }}
                    >
                        <MenuItem value="01">Januari</MenuItem>
                        <MenuItem value="02">Februari</MenuItem>
                        <MenuItem value="03">Maret</MenuItem>
                        <MenuItem value="04">April</MenuItem>
                        <MenuItem value="05">Mei</MenuItem>
                        <MenuItem value="06">Juni</MenuItem>
                        <MenuItem value="07">Juli</MenuItem>
                        <MenuItem value="08">Agustus</MenuItem>
                        <MenuItem value="09">September</MenuItem>
                        <MenuItem value="10">Oktober</MenuItem>
                        <MenuItem value="11">November</MenuItem>
                        <MenuItem value="12">Desember</MenuItem>
                    </TextField>
                    <TextField
                        select
                        label="Tahun"
                        size="small"
                        value={filters.month ? filters.month.split("-")[0] : ""}
                        onChange={(e) => {
                            const newYear = e.target.value;
                            const currentMonth = filters.month ? filters.month.split("-")[1] : "01";
                            setFilters((f) => ({ ...f, month: `${newYear}-${currentMonth}` }));
                        }}
                        sx={{ width: 100 }}
                    >
                        {[2024, 2025, 2026, 2027, 2028].map((year) => (
                            <MenuItem key={year} value={String(year)}>
                                {year}
                            </MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        label="Status"
                        size="small"
                        value={filters.status}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, status: e.target.value }))
                        }
                        sx={{ width: 150 }}
                    >
                        <MenuItem value="">Semua</MenuItem>
                        <MenuItem value="Lunas">Lunas</MenuItem>
                        <MenuItem value="Belum Lunas">Belum Lunas</MenuItem>
                    </TextField>
                    <TextField
                        label="Cari pelanggan / invoice"
                        size="small"
                        value={filters.search}
                        onChange={(e) =>
                            setFilters((f) => ({ ...f, search: e.target.value }))
                        }
                        sx={{ minWidth: 220 }}
                    />
                    <Button
                        variant="outlined"
                        color="secondary"
                        size="small"
                        onClick={handleReset}
                    >
                        RESET
                    </Button>
                </Box>

                {/* Summary Cards */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    {[
                        { title: "Total Invoice", value: summary.totalInvoice, color: "#007bff", textColor: "white" },
                        { title: "Lunas", value: summary.totalLunas, color: "#28a745", textColor: "white" },
                        { title: "Belum Lunas", value: summary.totalBelum, color: "#ffc107", textColor: "#333" },
                        { title: "Total Tagihan", value: `Rp ${summary.totalNominal.toLocaleString("id-ID")}`, color: "#6f42c1", textColor: "white" },
                    ].map((card, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    bgcolor: card.color,
                                    color: card.textColor,
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                                    },
                                }}
                            >
                                <CardContent>
                                    <Typography variant="h6">{card.title}</Typography>
                                    <Typography variant="h4" sx={{ fontWeight: "bold" }}>
                                        {card.value}
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* 📈 Grafik Bulanan - HIDDEN TEMPORARILY
                <Box sx={{ mt: 4, mb: 4 }}>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            mb: 2,
                            alignItems: "center",
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                            📈 Statistik Invoice Bulanan
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                            <TextField
                                select
                                size="small"
                                label="Tahun"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                sx={{ width: 120 }}
                            >
                                {[2023, 2024, 2025, 2026].map((y) => (
                                    <MenuItem key={y} value={y}>
                                        {y}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <ToggleButtonGroup
                                value={chartMode}
                                exclusive
                                onChange={(_, val) => val && setChartMode(val)}
                                size="small"
                            >
                                <ToggleButton value="bar">
                                    <BarChart2 size={16} /> &nbsp; Bar
                                </ToggleButton>
                                <ToggleButton value="line">
                                    <TrendingUp size={16} /> &nbsp; Line
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </Box>
                    </Box>

                    {chartData.length === 0 ? (
                        <Typography color="text.secondary">
                            Belum ada data untuk tahun ini.
                        </Typography>
                    ) : (
                        <>
                            <ResponsiveContainer width="100%" height={320}>
                                {chartMode === "bar" ? (
                                    <ComposedChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="bulan" />
                                        <YAxis yAxisId="left" />
                                        <YAxis yAxisId="right" orientation="right" />
                                        <Tooltip />
                                        <Legend />
                                        <Bar yAxisId="left" dataKey="total_invoice" fill="#007bff" name="Total Invoice" />
                                        <Bar yAxisId="left" dataKey="total_lunas" fill="#28a745" name="Lunas" />
                                        <Line yAxisId="right" type="monotone" dataKey="total_nominal" stroke="#6f42c1" name="Total Nominal (Rp)" />
                                    </ComposedChart>
                                ) : (
                                    <LineChart data={chartData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="bulan" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Line type="monotone" dataKey="total_invoice" stroke="#007bff" name="Total Invoice" />
                                        <Line type="monotone" dataKey="total_lunas" stroke="#28a745" name="Lunas" />
                                        <Line type="monotone" dataKey="total_nominal" stroke="#6f42c1" name="Total Nominal (Rp)" />
                                    </LineChart>
                                )}
                            </ResponsiveContainer>

                            <Box
                                sx={{
                                    mt: 3,
                                    p: 2,
                                    border: "1px dashed #ccc",
                                    borderRadius: 2,
                                    backgroundColor: "#fafafa",
                                    textAlign: "center",
                                }}
                            >
                                {(() => {
                                    const totalInvoice = chartData.reduce(
                                        (sum, i) => sum + (i.total_invoice || 0),
                                        0
                                    );
                                    const totalLunas = chartData.reduce(
                                        (sum, i) => sum + (i.total_lunas || 0),
                                        0
                                    );
                                    const totalNominal = chartData.reduce(
                                        (sum, i) => sum + (i.total_nominal || 0),
                                        0
                                    );
                                    return (
                                        <Typography variant="body1" sx={{ fontWeight: 500 }}>
                                            📅 <b>Ringkasan Tahun {selectedYear}</b>:{" "}
                                            <span style={{ color: "#007bff" }}>
                                                {totalInvoice} Invoice
                                            </span>{" "}
                                            |{" "}
                                            <span style={{ color: "#28a745" }}>
                                                {totalLunas} Lunas
                                            </span>{" "}
                                            |{" "}
                                            <span style={{ color: "#6f42c1" }}>
                                                Total Rp {totalNominal.toLocaleString("id-ID")}
                                            </span>
                                        </Typography>
                                    );
                                })()}
                            </Box>
                        </>
                    )}
                </Box>
                */}

                {/* Tabel Invoice */}
                <Slide key={animateKey} direction="up" in mountOnEnter unmountOnExit>
                    <div>
                        <InvoiceTable
                            data={filtered}
                            onView={handleView}
                            onPrint={handlePrint}
                            onSendWhatsApp={handleSendWhatsApp}
                            onUploadProof={handleUploadProof}
                            userRole={user?.role}
                            onDelete={handleDelete}
                        />
                    </div>
                </Slide>

                {/* Dialog & Snackbar */}
                <WhatsAppDialog
                    isOpen={openWaDialog}
                    onClose={() => setOpenWaDialog(false)}
                    onSend={handleSend}
                />
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                >
                    <Alert severity={snackbar.severity} sx={{ fontSize: 14 }}>
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </Box>
        </Box>
    );
};

export default InvoiceListPage;
