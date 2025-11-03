import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import InvoiceViewer from "./pages/InvoiceViewer"; // tambahkan ini
import "./styles.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/invoices/:invoiceId.pdf" element={<InvoiceViewer />} />
    </Routes>
  </BrowserRouter>
);
