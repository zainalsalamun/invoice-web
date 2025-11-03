import React, { useState } from "react";
import InvoiceForm from "../components/InvoiceForm";
import InvoicePreview from "../components/InvoicePreview";
import { generatePDF } from "../utils/pdfGenerator";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import WhatsAppDialog from "../components/WhatsAppDialog";
import "../styles.css";

const HomePage = () => {
  const [invoiceData, setInvoiceData] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  const handleSend = (phone) => {
    sendWhatsApp(invoiceData, phone);
  };

  return (
    <div className="container">
      <div className="app-header">
        <img
          src={require("../assets/logoringnet.png")}
          alt="Ringnet"
          className="logo-ringnet"
        />
        <h1>Ringnet - Internet Service Provider</h1>
      </div>

      {!invoiceData ? (
        <InvoiceForm onSubmit={(data) => setInvoiceData(data)} />
      ) : (
        <>
          <InvoicePreview data={invoiceData} />
          <div className="btn-group">
            <button onClick={() => generatePDF(invoiceData)}>Cetak PDF</button>
            <button onClick={() => setShowDialog(true)}>Kirim ke WhatsApp</button>
            <button onClick={() => setInvoiceData(null)}>Buat Ulang</button>
          </div>
        </>
      )}

      {/* Modal WhatsApp */}
      <WhatsAppDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onSend={handleSend}
      />
    </div>
  );
};

export default HomePage;
