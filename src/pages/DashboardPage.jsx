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
  Skeleton,
} from "@mui/material";
import Sidebar from "../components/Sidebar";
import InvoiceTable from "../components/InvoiceTable";

const DashboardPage = () => {
  // 🔹 Default bulan sekarang
  const currentMonth = new Date().toISOString().slice(0, 7);

  const [filters, setFilters] = useState({
    month: currentMonth,
    status: "",
    search: "",
  });

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "info",
  });

  const [animateKey, setAnimateKey] = useState(0);
  const [loading, setLoading] = useState(false);

  const [invoices] = useState([
    {
      nomorInvoice: "INV-1762147835889",
      namaPelanggan: "Zainal Salamun",
      periode: "November 2025",
      total: 166500,
      statusPembayaran: "Belum Lunas",
    },
    {
      nomorInvoice: "INV-1762147835890",
      namaPelanggan: "Fadhil Rahman",
      periode: "November 2025",
      total: 266500,
      statusPembayaran: "Lunas",
    },
    {
      nomorInvoice: "INV-1762147835891",
      namaPelanggan: "Siti Aminah",
      periode: "Oktober 2025",
      total: 196500,
      statusPembayaran: "Belum Lunas",
    },
  ]);

  // Konversi format bulan ke “November 2025”
  const convertMonth = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
  };

  // Filter data
  const filtered = invoices.filter((i) => {
    const byMonth = filters.month
      ? i.periode
          .toLowerCase()
          .includes(convertMonth(filters.month).toLowerCase())
      : true;
    const byStatus = filters.status
      ? i.statusPembayaran.toLowerCase() === filters.status.toLowerCase()
      : true;
    const bySearch = filters.search
      ? i.namaPelanggan.toLowerCase().includes(filters.search.toLowerCase()) ||
        i.nomorInvoice.toLowerCase().includes(filters.search.toLowerCase())
      : true;

    return byMonth && byStatus && bySearch;
  });

  // Reset filter ke bulan sekarang
  const handleReset = () => {
    setFilters({
      month: currentMonth,
      status: "",
      search: "",
    });

    setSnackbar({
      open: true,
      message: `Filter berhasil direset ke ${convertMonth(currentMonth)}`,
      severity: "success",
    });
  };

  // Trigger animasi & loading shimmer setiap filter berubah
  useEffect(() => {
    setLoading(true);
    const timeout = setTimeout(() => {
      setAnimateKey((prev) => prev + 1);
      setLoading(false);
    }, 500);
    return () => clearTimeout(timeout);
  }, [filters]);

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // Summary data
  const summary = useMemo(() => {
    const totalInvoice = filtered.length;
    const totalLunas = filtered.filter((i) => i.statusPembayaran === "Lunas").length;
    const totalBelum = filtered.filter((i) => i.statusPembayaran === "Belum Lunas").length;
    const totalNominal = filtered.reduce((sum, i) => sum + i.total, 0);
    return { totalInvoice, totalLunas, totalBelum, totalNominal };
  }, [filtered]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="dashboard" />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <h2 style={{ margin: 0 }}>📊 Daftar Invoice Pelanggan</h2>

          {/* Filter Section */}
          <Box
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "center",
              flexWrap: "wrap",
              justifyContent: "flex-end",
            }}
          >
            <TextField
              label="Periode"
              size="small"
              type="month"
              InputLabelProps={{ shrink: true }}
              value={filters.month}
              onChange={(e) =>
                setFilters((f) => ({ ...f, month: e.target.value }))
              }
              sx={{ minWidth: 150 }}
            />

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
              sx={{
                fontWeight: "bold",
                "&:hover": { backgroundColor: "#f8e1ff" },
              }}
            >
              RESET
            </Button>
          </Box>
        </header>

        {/* Summary Card */}
        <Grid
          container
          spacing={2}
          sx={{
            mb: 3,
            opacity: 0,
            animation: "fadeIn 0.8s ease forwards",
            "@keyframes fadeIn": {
              from: { opacity: 0, transform: "translateY(10px)" },
              to: { opacity: 1, transform: "translateY(0)" },
            },
          }}
        >
          {[
            {
              title: "Total Invoice",
              value: summary.totalInvoice,
              color: "#007bff",
              textColor: "white",
            },
            {
              title: "Lunas",
              value: summary.totalLunas,
              color: "#28a745",
              textColor: "white",
            },
            {
              title: "Belum Lunas",
              value: summary.totalBelum,
              color: "#ffc107",
              textColor: "#333",
            },
            {
              title: "Total Tagihan",
              value: `Rp ${summary.totalNominal.toLocaleString("id-ID")}`,
              color: "#6f42c1",
              textColor: "white",
            },
          ].map((card, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Card
                sx={{
                  bgcolor: card.color,
                  color: card.textColor,
                  transition: "all 0.3s ease",
                  transform: "scale(1)",
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

        {/* Shimmer Loading */}
        {loading ? (
          <Box sx={{ p: 2 }}>
            {[1, 2, 3].map((i) => (
              <Skeleton
                key={i}
                variant="rectangular"
                height={60}
                sx={{ borderRadius: 2, mb: 1.5 }}
                animation="wave"
              />
            ))}
          </Box>
        ) : (
          <Slide
            key={animateKey}
            direction="up"
            in={true}
            mountOnEnter
            unmountOnExit
            timeout={500}
          >
            <div>
              <InvoiceTable data={filtered} />
            </div>
          </Slide>
        )}

        {/* Snackbar Notifikasi */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
            sx={{ width: "100%", fontSize: 14 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </Box>
  );
};

export default DashboardPage;
