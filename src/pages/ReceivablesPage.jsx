import React, { useEffect, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { SearchOutlined } from "@mui/icons-material";
import {
  Alert, Box, Card, CardContent, CircularProgress, InputAdornment, Link,
  Paper, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TablePagination, TableRow, TextField, Typography,
} from "@mui/material";
import InvoicePeriodFilter from "../components/InvoicePeriodFilter";
import PageLayout from "../components/PageLayout";
import { useInvoicePeriod } from "../hooks/useInvoicePeriod";
import { operationalService } from "../services/operationalService";

const money = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(Number(value || 0));

const date = (value) => value ? new Date(value).toLocaleDateString("id-ID", {
  day: "2-digit", month: "short", year: "numeric",
}) : "—";

const ReceivablesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { period, periods, periodError, selectPeriod } = useInvoicePeriod(searchParams.get("periode") ?? undefined);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => { setPage(0); setDebouncedSearch(search.trim()); }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setData(null);
    setError("");
    operationalService.getReceivables({ periode: period || undefined, search: debouncedSearch || undefined, page: page + 1, pageSize })
      .then((result) => { if (active) setData(result); })
      .catch((err) => { if (active) setError(err.response?.data?.message || "Rincian piutang belum dapat dimuat."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [period, debouncedSearch, page, pageSize]);

  const changePeriod = (value) => {
    selectPeriod(value);
    setPage(0);
    setSearchParams(value ? { periode: value } : {}, { replace: true });
  };

  return (
    <PageLayout title="Rincian Piutang" description="Invoice dengan sisa tagihan yang belum terbayar.">
      <Stack direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }} spacing={2} sx={{ mb: 2.5 }}>
        <InvoicePeriodFilter period={period} periods={periods} onChange={changePeriod} error={periodError} note="Periode yang sama dengan ringkasan dashboard, laporan, dan keuangan." />
        <TextField
          size="small"
          label="Cari invoice atau pelanggan"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          inputProps={{ maxLength: 100 }}
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined fontSize="small" /></InputAdornment> }}
          sx={{ minWidth: { xs: "100%", md: 280 }, ml: { md: "auto !important" } }}
        />
      </Stack>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2, mb: 2.5 }}>
        <Card variant="outlined"><CardContent>
          <Typography variant="body2" color="text.secondary">Total Piutang Periode</Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>{data ? money(data.periodTotalOutstanding) : "—"}</Typography>
          <Typography variant="caption" color="text.secondary">Sama dengan kartu Sisa Piutang pada ringkasan.</Typography>
        </CardContent></Card>
        <Card variant="outlined"><CardContent>
          <Typography variant="body2" color="text.secondary">Piutang Hasil Pencarian</Typography>
          <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5 }}>{data ? money(data.filteredOutstanding) : "—"}</Typography>
          <Typography variant="caption" color="text.secondary">{data ? `${data.totalRows} invoice ditemukan.` : "Menunggu data."}</Typography>
        </CardContent></Card>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Paper variant="outlined" sx={{ overflow: "hidden" }}>
        <Box sx={{ px: 2.5, py: 2 }}>
          <Typography variant="h6">Daftar Invoice Belum Terbayar</Typography>
          <Typography variant="body2" color="text.secondary">Sisa piutang = total tagihan − PPh23 − pembayaran. Invoice dengan sisa Rp 0 tidak ditampilkan.</Typography>
        </Box>
        <TableContainer sx={{ position: "relative" }}>
          {loading && <Box sx={{ position: "absolute", inset: 0, zIndex: 1, display: "grid", placeItems: "center", bgcolor: "background.paper", opacity: 0.85 }}><CircularProgress aria-label="Memuat rincian piutang" /></Box>}
          <Table size="small" sx={{ minWidth: 1000 }}>
            <TableHead><TableRow>
              <TableCell>Invoice</TableCell><TableCell>Pelanggan</TableCell><TableCell>Periode</TableCell>
              <TableCell align="right">Tagihan</TableCell><TableCell align="right">PPh23</TableCell>
              <TableCell align="right">Dibayar</TableCell><TableCell align="right">Sisa Piutang</TableCell>
              <TableCell>Jatuh Tempo</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {(data?.items || []).map((item) => <TableRow hover key={item.id}>
                <TableCell><Link component={RouterLink} to={`/invoices/detail/${item.id}`} fontWeight={600}>{item.nomor_invoice}</Link></TableCell>
                <TableCell>{item.nama_pelanggan}</TableCell>
                <TableCell>{item.periode || "Tanpa periode"}</TableCell>
                <TableCell align="right">{money(item.total)}</TableCell>
                <TableCell align="right">{money(item.pph23)}</TableCell>
                <TableCell align="right">{money(item.total_bayar)}</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>{money(item.outstanding)}</TableCell>
                <TableCell>{date(item.tanggal_jatuh_tempo)}</TableCell>
              </TableRow>)}
              {!loading && !data?.items?.length && <TableRow><TableCell colSpan={8} align="center" sx={{ py: 5, color: "text.secondary" }}>Tidak ada invoice dengan sisa piutang untuk filter ini.</TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={data?.totalRows || 0}
          page={data ? page : 0}
          onPageChange={(_event, nextPage) => setPage(nextPage)}
          rowsPerPage={pageSize}
          onRowsPerPageChange={(event) => { setPageSize(Number(event.target.value)); setPage(0); }}
          rowsPerPageOptions={[10, 25, 50]}
          labelRowsPerPage="Baris per halaman"
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} dari ${count}`}
        />
      </Paper>
    </PageLayout>
  );
};

export default ReceivablesPage;
