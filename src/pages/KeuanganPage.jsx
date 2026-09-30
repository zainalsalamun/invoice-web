import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import { keuanganService } from "../services/keuanganService";
import {
    Card,
    CardContent,
    Typography,
    Table,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Paper,
    Box,
    CircularProgress,
    List,
    ListItemButton,
    ListItemText,
    ListItemIcon,
    Divider,
    TablePagination
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { CreditCard, AccountBalance, Payments, Money, AccountBalanceWalletOutlined } from "@mui/icons-material";

const KeuanganPage = () => {
    const theme = useTheme();
    const darkMode = theme.palette.mode === "dark";
    const [summary, setSummary] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedMethodId, setSelectedMethodId] = useState(null);

    // Pagination state
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        const data = await keuanganService.getSummary();
        if (data) {
            setSummary(data.summary || []);
            setCustomers(data.customers || []);
            setStats(data.stats || null);
        }
        setLoading(false);
    };

    const getMethodIcon = (methodName) => {
        if (!methodName) return <Money />;
        const lower = methodName.toLowerCase();
        if (lower.includes("transfer") || lower.includes("bank")) return <AccountBalance />;
        if (lower.includes("cash") || lower.includes("tunai")) return <Payments />;
        return <CreditCard />;
    };

    const formatRupiah = (angka) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(angka || 0);
    };

    const filteredCustomers = selectedMethodId
        ? customers.filter(c => c.metode_id === selectedMethodId)
        : customers;

    const paginatedCustomers = filteredCustomers.slice(
        page * rowsPerPage,
        page * rowsPerPage + rowsPerPage
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const selectedMethod = summary.find(s => (s._id || s.id) === selectedMethodId);

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "background.default" }}>
            <Sidebar active="/keuangan" />
            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", minWidth: 0, overflowX: "hidden" }}>
                <Box
                    sx={{
                        p: 4,
                        pb: 2,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography variant="h5" fontWeight="bold" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccountBalanceWalletOutlined aria-hidden="true" /> Laporan Keuangan
                    </Typography>
                </Box>

                <Box sx={{ px: { xs: 2, md: 3 }, pb: 3 }}>
                    {/* Global Stats */}
                    {stats && (
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 2, mb: 3 }}>
                            <Card sx={{ boxShadow: darkMode ? "0 10px 24px rgba(0,0,0,.22)" : "0 4px 10px rgba(0,0,0,0.05)", borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary">Total Pendapatan</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: darkMode ? "#64b5f6" : "#1976d2" }}>
                                        {formatRupiah(stats.total_tagihan_semua)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Dari {stats.total_pelanggan} pelanggan
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card sx={{ boxShadow: darkMode ? "0 10px 24px rgba(0,0,0,.22)" : "0 4px 10px rgba(0,0,0,0.05)", borderRadius: 3 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="text.secondary">Pendapatan Aktif</Typography>
                                    <Typography variant="h5" sx={{ fontWeight: 700, color: darkMode ? "#81c784" : "#2e7d32" }}>
                                        {formatRupiah(stats.total_tagihan_aktif)}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                        Dari {stats.total_aktif} pelanggan aktif
                                    </Typography>
                                </CardContent>
                            </Card>
                        </Box>
                    )}

                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "minmax(0,1fr)", lg: "280px minmax(0,1fr)" }, gap: 3 }}>
                        {/* Sidebar Keuangan */}
                        <Paper sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: darkMode ? "0 10px 24px rgba(0,0,0,.2)" : "0 4px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                            <Box sx={{ px: 2.5, py: 2, bgcolor: darkMode ? "#20242f" : "#f8fafc", borderBottom: "1px solid", borderColor: "divider" }}>
                                <Typography variant="h6" sx={{ fontSize: 16, fontWeight: 700 }}>Pilih Metode</Typography>
                            </Box>
                            {loading ? (
                                <div style={{ padding: 20, textAlign: "center" }}><CircularProgress size={30} /></div>
                            ) : (
                                <List component="nav" style={{ padding: 0 }}>
                                    {/* Option: All Methods */}
                                    <ListItemButton
                                        selected={selectedMethodId === null}
                                        onClick={() => {
                                            setSelectedMethodId(null);
                                            setPage(0);
                                        }}
                                        sx={{
                                            bgcolor: selectedMethodId === null ? alpha(theme.palette.primary.main, darkMode ? .16 : .08) : "transparent",
                                            borderLeft: selectedMethodId === null ? `4px solid ${theme.palette.primary.main}` : "4px solid transparent",
                                            px: 2.5, py: 2,
                                            "&.Mui-selected, &.Mui-selected:hover": { bgcolor: alpha(theme.palette.primary.main, darkMode ? .16 : .08) },
                                        }}
                                    >
                                        <ListItemIcon sx={{ minWidth: 40, color: selectedMethodId === null ? "primary.main" : "text.secondary" }}>
                                            <Money />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography style={{ fontWeight: selectedMethodId === null ? 600 : 500, fontSize: 14 }}>Semua Metode</Typography>}
                                            secondary={<Typography color="text.secondary" sx={{ fontSize: 12 }}>Tampilkan Semua</Typography>}
                                        />
                                    </ListItemButton>
                                    <Divider />

                                    {/* List of specific methods */}
                                    {summary.map((item) => (
                                        <React.Fragment key={item._id || item.id}>
                                            <ListItemButton
                                                selected={selectedMethodId === (item._id || item.id)}
                                                onClick={() => {
                                                    setSelectedMethodId(item._id || item.id);
                                                    setPage(0);
                                                }}
                                                sx={{
                                                    bgcolor: selectedMethodId === (item._id || item.id) ? alpha(theme.palette.primary.main, darkMode ? .16 : .08) : "transparent",
                                                    borderLeft: selectedMethodId === (item._id || item.id) ? `4px solid ${theme.palette.primary.main}` : "4px solid transparent",
                                                    px: 2.5, py: 2,
                                                    "&.Mui-selected, &.Mui-selected:hover": { bgcolor: alpha(theme.palette.primary.main, darkMode ? .16 : .08) },
                                                }}
                                            >
                                                <ListItemIcon sx={{ minWidth: 40, color: selectedMethodId === (item._id || item.id) ? "primary.main" : "text.secondary" }}>
                                                    {getMethodIcon(item.metode)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography style={{ fontWeight: selectedMethodId === (item._id || item.id) ? 600 : 500, fontSize: 14 }}>{item.metode || "Tidak Ada"}</Typography>}
                                                    secondary={<Typography color="text.secondary" sx={{ fontSize: 12 }}>{formatRupiah(item.total_tagihan)}</Typography>}
                                                />
                                            </ListItemButton>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Main Content (Full Customers Table) */}
                        <Paper sx={{ minWidth: 0, borderRadius: 3, border: "1px solid", borderColor: "divider", boxShadow: darkMode ? "0 10px 24px rgba(0,0,0,.2)" : "0 4px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                            <Box sx={{ px: 3, py: 2.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <Typography variant="h6" style={{ fontSize: 18, fontWeight: 600 }}>
                                        {selectedMethodId ? `Pelanggan: ${selectedMethod?.metode}` : "Semua Pelanggan"}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: .5 }}>
                                        Total {filteredCustomers.length} Pelanggan
                                    </Typography>
                                </div>
                                {selectedMethodId && (
                                    <div style={{ textAlign: "right" }}>
                                        <Typography variant="subtitle2" color="text.secondary">Tagihan Metode Ini</Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 700, color: "primary.main" }}>
                                            {formatRupiah(selectedMethod.total_tagihan)}
                                        </Typography>
                                    </div>
                                )}
                            </Box>

                            {loading ? (
                                <div style={{ padding: 40, textAlign: "center" }}><CircularProgress /></div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell style={{ fontWeight: 600 }}>ID Pelanggan</TableCell>
                                                <TableCell style={{ fontWeight: 600 }}>Nama</TableCell>
                                                <TableCell style={{ fontWeight: 600 }}>Kategori</TableCell>
                                                <TableCell style={{ fontWeight: 600 }}>Status</TableCell>
                                                <TableCell align="right" style={{ fontWeight: 600 }}>Tagihan (Rp)</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {paginatedCustomers.length > 0 ? (
                                                paginatedCustomers.map((customer) => (
                                                    <TableRow key={customer._id || customer.id} hover>
                                                        <TableCell>{customer.id_pelanggan || "-"}</TableCell>
                                                        <TableCell style={{ fontWeight: 500 }}>{customer.nama}</TableCell>
                                                        <TableCell>{customer.kategori_pelanggan || "-"}</TableCell>
                                                        <TableCell>
                                                            <span style={{
                                                                padding: "4px 10px",
                                                                borderRadius: 12,
                                                                fontSize: 12,
                                                                fontWeight: 500,
                                                                backgroundColor: customer.aktif ? "rgba(76, 175, 80, 0.1)" : "rgba(244, 67, 54, 0.1)",
                                                                color: customer.aktif ? "#4CAF50" : "#F44336"
                                                            }}>
                                                                {customer.aktif ? "Aktif" : "Nonaktif"}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell align="right" style={{ fontWeight: 500 }}>
                                                            {new Intl.NumberFormat("id-ID").format(customer.harga_langganan || 0)}
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={5} align="center" sx={{ p: 5, color: "text.secondary" }}>
                                                        Belum ada data pelanggan.
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                    <TablePagination
                                        rowsPerPageOptions={[10, 25, 50]}
                                        component="div"
                                        count={filteredCustomers.length}
                                        rowsPerPage={rowsPerPage}
                                        page={page}
                                        onPageChange={handleChangePage}
                                        onRowsPerPageChange={handleChangeRowsPerPage}
                                        labelRowsPerPage="Baris per halaman"
                                    />
                                </div>
                            )}
                        </Paper>
                    </Box>
                </Box>
            </div>
        </Box>
    );
};

export default KeuanganPage;
