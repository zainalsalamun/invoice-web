import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InvoiceViewer from "./pages/InvoiceViewer";
import DashboardPage from "./pages/DashboardPage";
import CreateInvoicePage from "./pages/CreateInvoicePage"; // ✅ tambahkan ini
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/create" element={<CreateInvoicePage />} /> {/* ✅ ini penting */}
      <Route path="/invoices/:invoiceId.pdf" element={<InvoiceViewer />} />
    </Routes>
  </BrowserRouter>
);
