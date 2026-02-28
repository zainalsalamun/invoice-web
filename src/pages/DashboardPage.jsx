import React, { useState, useEffect, useMemo } from "react";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  Paper,
  CircularProgress,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import { invoiceService } from "../services/invoiceService";
import { chatTrackingService } from "../services/chatTrackingService";
import { authService } from "../services/authService";
import {
  Assignment,
  CheckCircle,
  Pending,
  Receipt,
  Payment,
  ErrorOutline,
} from "@mui/icons-material";

const DashboardPage = () => {
  const user = authService.getCurrentUser();
  const [invoices, setInvoices] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invData, taskData] = await Promise.all([
        invoiceService.getAll(),
        chatTrackingService.getAll(),
      ]);
      setInvoices(invData || []);
      setTasks(taskData || []);
    } catch (err) {
      console.error("Gagal ambil data dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const invoiceStats = useMemo(() => {
    const total = invoices.length;
    const lunas = invoices.filter((i) => i.status_pembayaran === "Lunas").length;
    const belum = invoices.filter((i) => i.status_pembayaran === "Belum Lunas").length;
    const totalRp = invoices.reduce((sum, i) => sum + (i.total || 0), 0);
    return { total, lunas, belum, totalRp };
  }, [invoices]);

  const taskStats = useMemo(() => {
    const total = tasks.length;
    const selesai = tasks.filter((t) => t.progress === "Sudah Selesai").length;
    const proses = tasks.filter((t) => t.progress === "Sedang Diproses").length;
    const belum = tasks.filter((t) => t.progress === "Belum Selesai").length;
    return { total, selesai, proses, belum };
  }, [tasks]);

  const formatRupiah = (angka) => {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 0,
    }).format(angka || 0);
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f1f5f9" }}>
      <Sidebar active="/" />

      <Box sx={{ flexGrow: 1, p: { xs: 3, md: 5 }, minWidth: 0, overflowX: "hidden" }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 1, color: "#1e293b", display: "flex", alignItems: "center", gap: 2 }}>
          🏠 Dashboard Utama
        </Typography>
        <Typography variant="body1" sx={{ mb: 4, color: "#64748b" }}>
          Selamat datang kembali, <b>{user?.username}</b>. Berikut ringkasan aktivitas sistem hari ini.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ width: "100%", maxWidth: "1400px", mx: "auto" }}>
            {/* --- SECTION 1: TASK TRACKING --- */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2.5, color: "#334155", display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
              📋 Ringkasan Tugas (Chat Tracking)
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Tugas" value={taskStats.total} icon={<Assignment />} color="#3b82f6" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Sudah Selesai" value={taskStats.selesai} icon={<CheckCircle />} color="#22c55e" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Sedang Diproses" value={taskStats.proses} icon={<Pending />} color="#f59e0b" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Belum Selesai" value={taskStats.belum} icon={<ErrorOutline />} color="#ef4444" />
              </Grid>
            </Grid>

            {/* --- SECTION 2: INVOICE SUMMARY --- */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2.5, color: "#334155", display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
              🧾 Ringkasan Invoice & Keuangan
            </Typography>
            <Grid container spacing={3} sx={{ mb: 6 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Invoice" value={invoiceStats.total} icon={<Receipt />} color="#6366f1" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Invoice Lunas" value={invoiceStats.lunas} icon={<Payment />} color="#10b981" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Belum Bayar" value={invoiceStats.belum} icon={<ErrorOutline />} color="#f43f5e" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard title="Total Tagihan" label="Rp" value={formatRupiah(invoiceStats.totalRp)} icon={<Assignment />} color="#8b5cf6" />
              </Grid>
            </Grid>

            {/* --- SECTION 3: RECENT ACTIVITIES --- */}
            <Typography variant="h6" fontWeight="bold" sx={{ mb: 2.5, color: "#334155", display: 'flex', alignItems: 'center', gap: 1, px: 0.5 }}>
              🕒 Tugas Terbaru
            </Typography>
            <Paper sx={{ width: "100%", borderRadius: 3, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", overflow: "hidden" }}>
              <TableContainer sx={{ width: "100%" }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: "#f8fafc" }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Tanggal</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>PIC</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Deskripsi</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Progress</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {tasks.slice(0, 5).map((task) => (
                      <TableRow key={task._id || task.id} hover>
                        <TableCell sx={{ width: 120 }}>{new Date(task.tanggal).toLocaleDateString('id-ID')}</TableCell>
                        <TableCell fontWeight="bold" sx={{ width: 150 }}>{task.nama_pic}</TableCell>
                        <TableCell sx={{ maxWidth: 400 }}>{task.deskripsi}</TableCell>
                        <TableCell sx={{ width: 180 }}>
                          <span style={{
                            padding: "6px 12px",
                            borderRadius: 6,
                            fontSize: "0.75rem",
                            fontWeight: "bold",
                            backgroundColor: task.progress === "Sudah Selesai" ? "#dcfce7" : task.progress === "Sedang Diproses" ? "#fef3c7" : "#fee2e2",
                            color: task.progress === "Sudah Selesai" ? "#166534" : task.progress === "Sedang Diproses" ? "#92400e" : "#991b1b"
                          }}>
                            {task.progress}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
};

const StatCard = ({ title, value, icon, color, label }) => (
  <Card sx={{
    height: '100%',
    borderRadius: 3,
    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.1)",
    borderLeft: `6px solid ${color}`,
    transition: "transform 0.2s",
    "&:hover": { transform: "translateY(-4px)", boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)" }
  }}>
    <CardContent sx={{ p: 3, "&:last-child": { pb: 3 } }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: "bold" }}>
            {title}
          </Typography>
          <Box sx={{ mt: label ? 0 : 0.5 }}>
            {label && (
              <Typography variant="subtitle2" sx={{ color: "#475569", fontWeight: "bold", mb: -0.5 }}>
                {label}
              </Typography>
            )}
            <Typography variant="h4" fontWeight="800" sx={{ color: "#1e293b" }}>
              {value}
            </Typography>
          </Box>
        </Box>
        <Box sx={{
          bgcolor: `${color}15`,
          p: 1.5,
          borderRadius: 2,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {React.cloneElement(icon, { fontSize: 'large' })}
        </Box>
      </Box>
    </CardContent>
  </Card>
);

export default DashboardPage;
