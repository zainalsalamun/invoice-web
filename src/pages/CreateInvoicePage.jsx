import React, { useState } from "react";
import Sidebar from "../components/Sidebar";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";

const CreateInvoicePage = () => {
  const [previewData, setPreviewData] = useState(null);

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {/* Sidebar */}
      <Sidebar active="invoices" />

      {/* Konten Utama */}
      <div
        style={{
          flex: 1,
          padding: "32px",
          backgroundColor: "#f4f6f9",
        }}
      >
        <h2 style={{ marginBottom: 24 }}>🧾 Buat Invoice Baru</h2>

        <div
          style={{
            backgroundColor: "#fff",
            borderRadius: 10,
            boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            padding: 24,
            minHeight: "80vh",
          }}
        >
          {!previewData ? (
            <InvoiceForm onPreview={(data) => setPreviewData(data)} />
          ) : (
            <InvoicePreview
              data={previewData}
              onReset={() => setPreviewData(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateInvoicePage;
