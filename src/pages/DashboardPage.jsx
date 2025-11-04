import React, { useState } from "react";
import { Box } from "@mui/material";
import Sidebar from "../components/Sidebar";
import InvoiceFilter from "../components/InvoiceFilter";
import InvoiceTable from "../components/InvoiceTable";

const DashboardPage = () => {
  const [filters, setFilters] = useState({ month: "", status: "" });
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

  // Konversi "2025-11" jadi "November 2025"
  const convertMonth = (value) => {
    if (!value) return "";
    const date = new Date(value);
    return date.toLocaleString("id-ID", { month: "long", year: "numeric" });
  };

  const filtered = invoices.filter((i) => {
    const byMonth = filters.month
      ? i.periode.toLowerCase().includes(convertMonth(filters.month).toLowerCase())
      : true;
    const byStatus = filters.status
      ? i.statusPembayaran.toLowerCase() === filters.status.toLowerCase()
      : true;
    return byMonth && byStatus;
  });

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active="dashboard" />
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <h2 style={{ margin: 0 }}>📊 Daftar Invoice Pelanggan</h2>
          <InvoiceFilter onFilter={setFilters} />
        </header>
        <InvoiceTable data={filtered} />
      </Box>
    </Box>
  );
};

export default DashboardPage;
