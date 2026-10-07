import { buildReportCsv, reportCsvFilename } from "./reportCsv";

const definitions = [
  { key: "customers", title: "Pelanggan per Kategori" },
  { key: "invoices", title: "Invoice per Status" },
];
const metrics = [{ key: "total_paid", label: "Pembayaran Tercatat" }];

test("CSV menandai periode hanya pada invoice dan keuangan", () => {
  const csv = buildReportCsv({
    generatedAt: "2026-10-06T00:00:00.000Z",
    invoicePeriod: { value: "2026-02", label: "Februari 2026" },
    customers: [{ label: "Retail", value: 3 }],
    invoices: [{ label: "Lunas", value: 2, amount: 500000 }],
    financial: { total_paid: 400000, total_withheld: 0, invoice_count: 2, voided_count: 1 },
  }, definitions, metrics);

  expect(csv).toContain('"Cakupan Periode"');
  expect(csv).toContain('"Pelanggan per Kategori","Retail","3","","","","",');
  expect(csv).toContain('"Semua waktu"');
  expect(csv).toContain('"Invoice per Status","Lunas","2","500000"');
  expect(csv).toContain('"Ringkasan Keuangan Invoice","Pembayaran Tercatat","","400000"');
  expect(csv).toContain('"Februari 2026"');
  expect(csv).not.toContain('"Pelanggan per Kategori","Retail","3","","","","","","Februari 2026"');
  expect(reportCsvFilename({ value: "2026-02" }, new Date("2026-10-06T00:00:00.000Z"))).toBe("ringnet-report-2026-02-2026-10-06.csv");
});
