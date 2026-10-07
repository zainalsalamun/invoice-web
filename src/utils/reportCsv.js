const csvCell = (value) => {
  const text = String(value ?? "");
  const safe = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${safe.replaceAll('"', '""')}"`;
};

export const buildReportCsv = (data, reportDefinitions, financialMetrics) => {
  const generatedAt = new Date(data.generatedAt || Date.now()).toLocaleString("id-ID");
  const invoiceScope = data.invoicePeriod?.label || "Semua periode";
  const rows = [["Kategori Laporan", "Rincian", "Jumlah", "Total Nilai (Rp)", "Selesai", "Belum Selesai", "Persentase Selesai", "Waktu Data", "Cakupan Periode"]];

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
        report.key === "invoices" ? invoiceScope : "Semua waktu",
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
      report.key === "invoices" ? invoiceScope : "Semua waktu",
    ]);
  });

  if (data.financial) {
    financialMetrics.forEach((metric) => rows.push([
      "Ringkasan Keuangan Invoice", metric.label, "", Number(data.financial[metric.key] || 0), "", "", "", generatedAt, invoiceScope,
    ]));
    rows.push(["Ringkasan Keuangan Invoice", "PPh23 Dipotong", "", Number(data.financial.total_withheld || 0), "", "", "", generatedAt, invoiceScope]);
    rows.push(["Ringkasan Keuangan Invoice", "Invoice", Number(data.financial.invoice_count || 0), "", "", "", "", generatedAt, invoiceScope]);
    rows.push(["Ringkasan Keuangan Invoice", "Transaksi Dibatalkan", Number(data.financial.voided_count || 0), "", "", "", "", generatedAt, invoiceScope]);
  }

  return `\uFEFF${rows.map((row) => row.map(csvCell).join(",")).join("\r\n")}`;
};

export const reportCsvFilename = (invoicePeriod, date = new Date()) => {
  const suffix = invoicePeriod?.value?.replace(/[^a-z0-9-]/gi, "-") || "semua-periode";
  return `ringnet-report-${suffix}-${date.toISOString().slice(0, 10)}.csv`;
};
