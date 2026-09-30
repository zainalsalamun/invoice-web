import React, { useEffect, useState } from "react";
import { Download } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import PageLayout from "../components/PageLayout";
import { operationalService } from "../services/operationalService";

const reportDefinitions = [
  { key: "customers", title: "Pelanggan per Kategori", description: "Sebaran basis pelanggan berdasarkan segmen." },
  { key: "invoices", title: "Invoice per Status", description: "Jumlah dan nilai tagihan berdasarkan status pembayaran." },
  { key: "works", title: "Produktivitas PIC", description: "Jumlah pekerjaan dan pekerjaan selesai per PIC." },
  { key: "assets", title: "Alat per Status", description: "Posisi inventaris dan perangkat pelanggan." },
  { key: "requests", title: "Request Sistem per Tahap", description: "Sebaran backlog pengembangan aplikasi." },
];

const money = (value) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(Number(value || 0));

const assetLabels = {
  STOCK: "Stok",
  INSTALLED: "Terpasang",
  LOANED: "Dipinjam",
  REPAIR: "Perbaikan",
  LOST: "Hilang",
  RETIRED: "Tidak Aktif",
  "TANPA STATUS": "Tanpa Status",
};

const requestLabels = {
  NEW: "Baru",
  ANALYSIS: "Analisis",
  IN_PROGRESS: "Dikerjakan",
  READY_REVIEW: "Siap Review",
  REVISION: "Revisi",
  APPROVED: "Disetujui",
  RELEASED: "Dirilis",
  CLOSED: "Ditutup",
  REJECTED: "Ditolak",
  "TANPA STATUS": "Tanpa Status",
};

const titleCase = (value) => String(value || "Tanpa data")
  .trim()
  .toLocaleLowerCase("id-ID")
  .replace(/(^|\s)\S/g, (letter) => letter.toLocaleUpperCase("id-ID"));

const normalizeLabel = (reportKey, label) => {
  const clean = String(label || "Tanpa data").trim();
  const upper = clean.toUpperCase();
  if (reportKey === "invoices") {
    if (upper === "LUNAS") return "Lunas";
    if (upper === "BELUM LUNAS") return "Belum Lunas";
  }
  if (reportKey === "works" && upper === "TANPA PIC") return "Tanpa PIC";
  if (reportKey === "assets") return assetLabels[upper] || titleCase(clean);
  if (reportKey === "requests") return requestLabels[upper] || titleCase(clean.replaceAll("_", " "));
  return titleCase(clean);
};

const normalizeReportData = (source) => {
  const normalized = { ...source };
  reportDefinitions.forEach((report) => {
    const grouped = new Map();
    (source?.[report.key] || []).forEach((item) => {
      const label = normalizeLabel(report.key, item.label);
      const key = label.toLocaleLowerCase("id-ID");
      const current = grouped.get(key) || { label, value: 0 };
      current.value += Number(item.value || 0);
      if (item.amount !== undefined) current.amount = Number(current.amount || 0) + Number(item.amount || 0);
      if (item.done !== undefined) current.done = Number(current.done || 0) + Number(item.done || 0);
      grouped.set(key, current);
    });
    normalized[report.key] = Array.from(grouped.values()).sort((a, b) => b.value - a.value || a.label.localeCompare(b.label, "id-ID"));
  });
  return normalized;
};

const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};

const ReportsPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    operationalService.getReportsOverview()
      .then((result) => setData(normalizeReportData(result)))
      .catch((err) => setError(err.response?.data?.message || "Laporan belum dapat dimuat. Periksa koneksi backend."))
      .finally(() => setLoading(false));
  }, []);

  const exportCsv = () => {
    if (!data) return;
    const generatedAt = new Date(data.generatedAt || Date.now()).toLocaleString("id-ID");
    const rows = [["Kategori Laporan", "Rincian", "Jumlah", "Total Nilai (Rp)", "Selesai", "Belum Selesai", "Persentase Selesai", "Waktu Data"]];

    reportDefinitions.forEach((report) => {
      const items = data[report.key] || [];
      items.forEach((item) => {
        const total = Number(item.value || 0);
        const done = item.done === undefined ? "" : Number(item.done || 0);
        rows.push([
          report.title,
          item.label,
          total,
          item.amount === undefined ? "" : Number(item.amount || 0),
          done,
          done === "" ? "" : Math.max(total - done, 0),
          done === "" || total === 0 ? "" : `${((done / total) * 100).toFixed(2)}%`,
          generatedAt,
        ]);
      });

      rows.push([
        report.title,
        "TOTAL",
        items.reduce((sum, item) => sum + Number(item.value || 0), 0),
        items.some((item) => item.amount !== undefined) ? items.reduce((sum, item) => sum + Number(item.amount || 0), 0) : "",
        items.some((item) => item.done !== undefined) ? items.reduce((sum, item) => sum + Number(item.done || 0), 0) : "",
        items.some((item) => item.done !== undefined) ? items.reduce((sum, item) => sum + Math.max(Number(item.value || 0) - Number(item.done || 0), 0), 0) : "",
        "",
        generatedAt,
      ]);
    });

    const csv = `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `ringnet-report-${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageLayout title="Laporan" description="Ringkasan data operasional untuk evaluasi dan presentasi manajemen." actions={<Button variant="contained" startIcon={<Download />} onClick={exportCsv} disabled={!data}>Export CSV</Button>}>
      {loading && <Box sx={{ minHeight: 360, display: "grid", placeItems: "center" }}><CircularProgress /></Box>}
      {error && <Alert severity="warning">{error}</Alert>}
      {data && (
        <>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={1} sx={{ mb: 2.5 }}>
            <Typography color="text.secondary">Data tersaji langsung dari sistem, tidak lagi perlu direkap manual dari beberapa tab.</Typography>
            <Chip variant="outlined" label={`Diperbarui ${new Date(data.generatedAt).toLocaleString("id-ID")}`} />
          </Stack>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "repeat(2, minmax(0, 1fr))" }, gap: 2.5 }}>
            {reportDefinitions.map((report) => {
              const items = data[report.key] || [];
              const max = Math.max(...items.map((item) => Number(item.value || 0)), 1);
              return (
                <Card key={report.key} sx={report.key === "works" ? { gridColumn: { lg: "1 / -1" } } : undefined}>
                  <CardContent>
                    <Typography variant="h6">{report.title}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.25 }}>{report.description}</Typography>
                    <Stack spacing={1.8}>
                      {items.map((item) => (
                        <Box key={item.label}>
                          <Stack direction="row" justifyContent="space-between" spacing={2} sx={{ mb: .55 }}>
                            <Typography variant="body2" fontWeight={600}>{item.label}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              {item.value} {item.done !== undefined ? `· ${item.done} selesai` : ""} {item.amount !== undefined ? `· ${money(item.amount)}` : ""}
                            </Typography>
                          </Stack>
                          <LinearProgress variant="determinate" value={(Number(item.value || 0) / max) * 100} sx={{ height: 7, borderRadius: 5 }} />
                        </Box>
                      ))}
                      {!items.length && <Typography color="text.secondary" variant="body2">Belum ada data.</Typography>}
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        </>
      )}
    </PageLayout>
  );
};

export default ReportsPage;
