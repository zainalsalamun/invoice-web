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
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    TablePagination
} from "@mui/material";
import { CreditCard, AccountBalance, Payments, Money } from "@mui/icons-material";

const KeuanganPage = () => {
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
        <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "#f4f7fb" }}>
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
                    <Typography variant="h5" fontWeight="bold">
                        💰 Laporan Keuangan
                    </Typography>
                </Box>

                <div style={{ padding: "0 24px 24px" }}>
                    {/* Global Stats */}
                    {stats && (
                        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
                            <Card style={{ flex: 1, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", borderRadius: 12 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="textSecondary">Total Pendapatan</Typography>
                                    <Typography variant="h5" style={{ fontWeight: 600, color: "#2196F3" }}>
                                        {formatRupiah(stats.total_tagihan_semua)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                                        Dari {stats.total_pelanggan} pelanggan
                                    </Typography>
                                </CardContent>
                            </Card>
                            <Card style={{ flex: 1, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", borderRadius: 12 }}>
                                <CardContent>
                                    <Typography variant="subtitle2" color="textSecondary">Pendapatan Aktif</Typography>
                                    <Typography variant="h5" style={{ fontWeight: 600, color: "#4CAF50" }}>
                                        {formatRupiah(stats.total_tagihan_aktif)}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 8 }}>
                                        Dari {stats.total_aktif} pelanggan aktif
                                    </Typography>
                                </CardContent>
                            </Card>
                        </div>
                    )}

                    <div style={{ display: "flex", gap: 24 }}>
                        {/* Sidebar Keuangan */}
                        <Paper style={{ width: 280, flexShrink: 0, borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                            <div style={{ padding: "16px 20px", backgroundColor: "#f8fafc", borderBottom: "1px solid #edf2f7" }}>
                                <Typography variant="h6" style={{ fontSize: 16, fontWeight: 600 }}>Pilih Metode</Typography>
                            </div>
                            {loading ? (
                                <div style={{ padding: 20, textAlign: "center" }}><CircularProgress size={30} /></div>
                            ) : (
                                <List component="nav" style={{ padding: 0 }}>
                                    {/* Option: All Methods */}
                                    <ListItem
                                        button
                                        selected={selectedMethodId === null}
                                        onClick={() => {
                                            setSelectedMethodId(null);
                                            setPage(0);
                                        }}
                                        style={{
                                            backgroundColor: selectedMethodId === null ? "rgba(33, 150, 243, 0.08)" : "transparent",
                                            borderLeft: selectedMethodId === null ? "4px solid #2196F3" : "4px solid transparent",
                                            padding: "16px 20px"
                                        }}
                                    >
                                        <ListItemIcon style={{ minWidth: 40, color: selectedMethodId === null ? "#2196F3" : "#757575" }}>
                                            <Money />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={<Typography style={{ fontWeight: selectedMethodId === null ? 600 : 500, fontSize: 14 }}>Semua Metode</Typography>}
                                            secondary={<Typography style={{ fontSize: 12, color: "#757575" }}>Tampilkan Semua</Typography>}
                                        />
                                    </ListItem>
                                    <Divider />

                                    {/* List of specific methods */}
                                    {summary.map((item) => (
                                        <React.Fragment key={item._id || item.id}>
                                            <ListItem
                                                button
                                                selected={selectedMethodId === (item._id || item.id)}
                                                onClick={() => {
                                                    setSelectedMethodId(item._id || item.id);
                                                    setPage(0);
                                                }}
                                                style={{
                                                    backgroundColor: selectedMethodId === (item._id || item.id) ? "rgba(33, 150, 243, 0.08)" : "transparent",
                                                    borderLeft: selectedMethodId === (item._id || item.id) ? "4px solid #2196F3" : "4px solid transparent",
                                                    padding: "16px 20px"
                                                }}
                                            >
                                                <ListItemIcon style={{ minWidth: 40, color: selectedMethodId === (item._id || item.id) ? "#2196F3" : "#757575" }}>
                                                    {getMethodIcon(item.metode)}
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={<Typography style={{ fontWeight: selectedMethodId === (item._id || item.id) ? 600 : 500, fontSize: 14 }}>{item.metode || "Tidak Ada"}</Typography>}
                                                    secondary={<Typography style={{ fontSize: 12, color: "#757575" }}>{formatRupiah(item.total_tagihan)}</Typography>}
                                                />
                                            </ListItem>
                                            <Divider />
                                        </React.Fragment>
                                    ))}
                                </List>
                            )}
                        </Paper>

                        {/* Main Content (Full Customers Table) */}
                        <Paper style={{ flexGrow: 1, borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.05)", overflow: "hidden" }}>
                            <div style={{ padding: "20px 24px", borderBottom: "1px solid #edf2f7", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <Typography variant="h6" style={{ fontSize: 18, fontWeight: 600 }}>
                                        {selectedMethodId ? `Pelanggan: ${selectedMethod?.metode}` : "Semua Pelanggan"}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" style={{ marginTop: 4 }}>
                                        Total {filteredCustomers.length} Pelanggan
                                    </Typography>
                                </div>
                                {selectedMethodId && (
                                    <div style={{ textAlign: "right" }}>
                                        <Typography variant="subtitle2" color="textSecondary">Tagihan Metode Ini</Typography>
                                        <Typography variant="h6" style={{ fontWeight: 600, color: "#2196F3" }}>
                                            {formatRupiah(selectedMethod.total_tagihan)}
                                        </Typography>
                                    </div>
                                )}
                            </div>

                            {loading ? (
                                <div style={{ padding: 40, textAlign: "center" }}><CircularProgress /></div>
                            ) : (
                                <div style={{ overflowX: "auto" }}>
                                    <Table>
                                        <TableHead style={{ backgroundColor: "#f8fafc" }}>
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
                                                    <TableCell colSpan={5} align="center" style={{ padding: 40, color: "#999" }}>
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
                    </div>
                </div>
            </div>
        </div>
    );
};

export default KeuanganPage;
