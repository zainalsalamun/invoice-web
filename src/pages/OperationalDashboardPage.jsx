import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AccountBalanceWalletOutlined,
  ArrowForward,
  BuildOutlined,
  Inventory2Outlined,
  PeopleAltOutlined,
  ReceiptLongOutlined,
  SupportAgentOutlined,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import { operationalService } from "../services/operationalService";
import { customerService } from "../services/customerService";
import { invoiceService } from "../services/invoiceService";
import { chatTrackingService } from "../services/chatTrackingService";
import { authService } from "../services/authService";
import FinancialOverview from "../components/FinancialOverview";
import InvoicePeriodFilter from "../components/InvoicePeriodFilter";
import { useInvoicePeriod } from "../hooks/useInvoicePeriod";

const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));

const quickActionBaseSx = {
  minHeight: 44,
  borderRadius: 2.5,
  justifyContent: "center",
  fontWeight: 700,
  transition: "background-color 160ms ease, border-color 160ms ease, color 160ms ease, transform 120ms ease, box-shadow 160ms ease",
  "&:active": { transform: "translateY(1px)" },
  "&.Mui-focusVisible": {
    outline: "3px solid",
    outlineColor: "primary.light",
    outlineOffset: 2,
  },
};

const quickActionOutlinedSx = {
  ...quickActionBaseSx,
  borderWidth: 1.5,
  "&:hover": {
    borderWidth: 1.5,
    borderColor: "primary.main",
    bgcolor: "primary.main",
    color: "primary.contrastText",
  },
  "&:active": {
    ...quickActionBaseSx["&:active"],
    borderColor: "primary.dark",
    bgcolor: "primary.dark",
    color: "primary.contrastText",
  },
  "&.Mui-focusVisible": {
    ...quickActionBaseSx["&.Mui-focusVisible"],
    borderColor: "primary.main",
    bgcolor: "primary.main",
    color: "primary.contrastText",
  },
};

const KpiCard = ({ title, value, caption, icon: Icon, color }) => (
  <Card>
    <CardContent>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography color="text.secondary" variant="body2">{title}</Typography>
          <Typography variant="h5" sx={{ mt: 0.75 }}>{value}</Typography>
          <Typography color="text.secondary" variant="caption">{caption}</Typography>
        </Box>
        <Box sx={{ width: 42, height: 42, display: "grid", placeItems: "center", borderRadius: 3, bgcolor: `${color}18`, color }}>
          <Icon />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

const OperationalDashboardPage = () => {
  const navigate = useNavigate();
  const role = authService.getCurrentUser()?.role;
  const canCreateInvoice = ["super_admin", "admin", "kasir"].includes(role);
  const canManageCustomers = ["super_admin", "admin", "admin_junior", "teknisi", "management"].includes(role);
  const canRecordWork = ["super_admin", "admin", "admin_junior", "teknisi"].includes(role);
  const canViewFinance = ["super_admin", "admin", "admin_junior", "kasir", "management"].includes(role);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fallback, setFallback] = useState(false);
  const { period, periods, periodError, selectPeriod } = useInvoicePeriod();

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setSummary(null);
      setFallback(false);
      try {
        const result = await operationalService.getDashboardSummary(period);
        if (active) setSummary(result);
      } catch (error) {
        const fallbackResults = await Promise.allSettled([
          customerService.getAll(),
          invoiceService.getAll(),
          chatTrackingService.getAll(),
        ]);
        const [customers, invoices, works] = fallbackResults.map((result) => result.status === "fulfilled" ? result.value : []);
        const unpaid = invoices.filter((item) => String(item.status_pembayaran || "").toUpperCase() !== "LUNAS");
        if (!active) return;
        setSummary({
          customers: { total: customers.length, active: customers.filter((item) => item.aktif !== false).length },
          invoices: period ? null : { total: invoices.length, unpaid: unpaid.length, outstanding: unpaid.reduce((sum, item) => sum + Math.max(Number(item.total || 0) - Number(item.pph23 || 0) - Number(item.total_bayar || 0), 0), 0) },
          works: { total: works.length, open: works.filter((item) => item.progress !== "Sudah Selesai").length },
          assets: { total: 0, assigned: 0, attention: 0 },
          requests: { total: 0, open: 0, review: 0 },
          recentWorks: works.slice(0, 6),
        });
        setFallback(true);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, [period]);

  if (loading) {
    return <PageLayout title="Dashboard"><Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}><CircularProgress /></Box></PageLayout>;
  }

  return (
    <PageLayout title="Dashboard" description="Ringkasan operasional, penagihan, pekerjaan, dan layanan RingNet.">
      <Box sx={{ mb: 2.5 }}>
        <InvoicePeriodFilter period={period} periods={periods} onChange={selectPeriod} error={periodError} note="Filter berlaku untuk invoice dan pembayaran. Pelanggan, pekerjaan, alat, dan request tetap semua waktu." />
      </Box>
      {fallback && (
        <Alert severity="info" sx={{ mb: 2.5 }}>
          Sebagian metrik operasional belum dapat dimuat. {period ? "Angka invoice untuk periode ini tidak ditampilkan agar tidak tercampur dengan data semua waktu." : "Data pelanggan, invoice, dan pekerjaan tetap ditampilkan."}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", lg: "repeat(5, 1fr)" }, gap: 2 }}>
        <KpiCard title="Pelanggan" value={summary?.customers?.total || 0} caption={`${summary?.customers?.active || 0} aktif`} icon={PeopleAltOutlined} color="#5b4be8" />
        <KpiCard title="Invoice Belum Lunas" value={summary?.invoices ? summary.invoices.unpaid : "—"} caption={summary?.invoices ? money(summary.invoices.outstanding) : "Data periode tidak tersedia"} icon={ReceiptLongOutlined} color="#ef8f25" />
        <KpiCard title="Pekerjaan Terbuka" value={summary?.works?.open || 0} caption={`${summary?.works?.total || 0} total pekerjaan`} icon={BuildOutlined} color="#168aad" />
        <KpiCard title="Alat Perlu Perhatian" value={summary?.assets?.attention || 0} caption={`${summary?.assets?.assigned || 0} terpasang/dipinjam`} icon={Inventory2Outlined} color="#d1495b" />
        <KpiCard title="Request Sistem" value={summary?.requests?.open || 0} caption={`${summary?.requests?.review || 0} menunggu review`} icon={SupportAgentOutlined} color="#16a3a5" />
      </Box>

      {summary?.financial && <Box sx={{ mt: 2.5 }}><FinancialOverview financial={summary.financial} onOpenReceivables={canViewFinance ? () => navigate(`/receivables${period ? `?periode=${encodeURIComponent(period)}` : ""}`) : undefined} /></Box>}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 2fr) minmax(280px, 1fr)" }, gap: 2.5, mt: 2.5 }}>
        <Paper variant="outlined" sx={{ overflow: "hidden" }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ px: 2.5, py: 2 }}>
            <Box>
              <Typography variant="h6">Pekerjaan Terbaru</Typography>
              <Typography variant="body2" color="text.secondary">Aktivitas instalasi, support, dan operasional.</Typography>
            </Box>
            <Button endIcon={<ArrowForward />} onClick={() => navigate("/chat-tracking")}>Lihat semua</Button>
          </Stack>
          <TableContainer>
            <Table size="small">
              <TableHead><TableRow><TableCell>Tanggal</TableCell><TableCell>Deskripsi</TableCell><TableCell>PIC</TableCell><TableCell>Status</TableCell></TableRow></TableHead>
              <TableBody>
                {(summary?.recentWorks || []).map((item) => (
                  <TableRow key={item.id} hover>
                    <TableCell>{item.tanggal ? new Date(item.tanggal).toLocaleDateString("id-ID") : "-"}</TableCell>
                    <TableCell sx={{ maxWidth: 380 }}>{item.deskripsi || "-"}</TableCell>
                    <TableCell>{item.nama_pic || "-"}</TableCell>
                    <TableCell><Chip size="small" label={item.progress || "Baru"} color={item.progress === "Sudah Selesai" ? "success" : "warning"} variant="outlined" /></TableCell>
                  </TableRow>
                ))}
                {!summary?.recentWorks?.length && <TableRow><TableCell colSpan={4} align="center" sx={{ py: 5, color: "text.secondary" }}>Belum ada pekerjaan.</TableCell></TableRow>}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>

        <Paper variant="outlined" sx={{ p: 2.5 }}>
          <Typography variant="h6">Aksi Cepat</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Mulai aktivitas utama tanpa berpindah banyak menu.</Typography>
          <Stack spacing={1.15}>
            {canCreateInvoice && <Button sx={quickActionBaseSx} variant="contained" startIcon={<ReceiptLongOutlined />} onClick={() => navigate("/invoices/new")}>Buat Invoice</Button>}
            {canManageCustomers && <Button sx={quickActionOutlinedSx} variant="outlined" startIcon={<PeopleAltOutlined />} onClick={() => navigate("/customers")}>Kelola Pelanggan</Button>}
            <Button sx={quickActionOutlinedSx} variant="outlined" startIcon={<BuildOutlined />} onClick={() => navigate("/chat-tracking")}>{canRecordWork ? "Catat Pekerjaan" : "Lihat Pekerjaan"}</Button>
            {canViewFinance && <Button sx={quickActionOutlinedSx} variant="outlined" startIcon={<AccountBalanceWalletOutlined />} onClick={() => navigate("/keuangan")}>Buka Keuangan</Button>}
          </Stack>
        </Paper>
      </Box>
    </PageLayout>
  );
};

export default OperationalDashboardPage;
