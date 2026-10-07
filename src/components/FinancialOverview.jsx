import React from "react";
import { ArrowForward } from "@mui/icons-material";
import { Box, Card, CardActionArea, CardContent, Stack, Typography } from "@mui/material";

const money = (value) => new Intl.NumberFormat("id-ID", {
  style: "currency", currency: "IDR", maximumFractionDigits: 0,
}).format(Number(value || 0));

export const financialMetrics = [
  { key: "total_billed", label: "Total Tagihan Invoice", detail: "Nilai seluruh invoice" },
  { key: "total_paid", label: "Pembayaran Tercatat", detail: "Saldo bayar setelah pembatalan" },
  { key: "total_outstanding", label: "Sisa Piutang", detail: "Tagihan dikurangi PPh23 dan pembayaran" },
  { key: "total_voided", label: "Pembayaran Dibatalkan", detail: "Riwayat pembatalan, bukan pendapatan" },
];

const FinancialOverview = ({ financial, onOpenReceivables }) => {
  if (!financial) return null;
  return (
    <Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", xl: "repeat(4, minmax(0, 1fr))" }, gap: 2 }}>
        {financialMetrics.map((metric) => {
          const content = (
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1}>
                <Typography variant="body2" color="text.secondary">{metric.label}</Typography>
                {metric.key === "total_outstanding" && onOpenReceivables && <ArrowForward fontSize="small" color="primary" />}
              </Stack>
              <Typography variant="h6" fontWeight={700} sx={{ my: 0.5 }}>{money(financial[metric.key])}</Typography>
              <Typography variant="caption" color="text.secondary">{metric.detail}</Typography>
            </CardContent>
          );
          return (
            <Card key={metric.key} variant="outlined">
              {metric.key === "total_outstanding" && onOpenReceivables
                ? <CardActionArea aria-label="Lihat rincian sisa piutang" onClick={onOpenReceivables} sx={{ height: "100%" }}>{content}</CardActionArea>
                : content}
            </Card>
          );
        })}
      </Box>
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 1 }}>
        {financial.invoice_count || 0} invoice · PPh23 dipotong {money(financial.total_withheld)} · {financial.voided_count || 0} pembayaran dibatalkan. Pembayaran tercatat termasuk saldo historis pada invoice; pembatalan hanya berasal dari riwayat transaksi aplikasi.
      </Typography>
    </Box>
  );
};

export default FinancialOverview;
