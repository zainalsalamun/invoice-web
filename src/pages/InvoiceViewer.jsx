import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { generatePDF } from "../utils/pdfGenerator";

const InvoiceViewer = () => {
  const { invoiceId } = useParams();
  const [pdfUrl, setPdfUrl] = useState(null);

  useEffect(() => {
    // Simulasi data invoice (bisa nanti diganti ambil dari API)
    const fakeData = {
      nomorInvoice: invoiceId,
      tanggalInvoice: new Date().toISOString().split("T")[0],
      namaPelanggan: "Zainal",
      alamat: "Yogyakarta",
      layanan: "50 Mbps",
      hargaPaket: 150000,
      ppn: 16500,
      total: 166500,
      statusPembayaran: "Belum Lunas",
      tanggalJatuhTempo: "2025-11-10",
      periode: "November 2025",
    };

    // generate PDF ke blob, bukan langsung download
    generatePDF(fakeData, true).then((url) => setPdfUrl(url));
  }, [invoiceId]);

  return (
    <div style={{ textAlign: "center", marginTop: 30 }}>
      <h2>Invoice Viewer</h2>
      <p>Nomor Invoice: {invoiceId}</p>

      {pdfUrl ? (
        <iframe
          src={pdfUrl}
          title="Invoice PDF"
          width="90%"
          height="700px"
          style={{ border: "1px solid #ccc", borderRadius: "8px" }}
        ></iframe>
      ) : (
        <p>Menghasilkan tampilan PDF...</p>
      )}
    </div>
  );
  
};

export default InvoiceViewer;
