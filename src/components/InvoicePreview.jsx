import React from "react";
// import { sendWhatsApp } from "../utils/sendWhatsApp";
// import { generatePDF } from "../utils/pdfGenerator";

const InvoicePreview = ({ data }) => {
  if (!data) return null;

  return (
    <div className="invoice-preview">
      <h2>Preview Invoice</h2>
      <p><strong>Nomor Invoice:</strong> {data.nomorInvoice}</p>
      <p><strong>Tanggal Invoice:</strong> {data.tanggalInvoice}</p>
      <p><strong>Nama Pelanggan:</strong> {data.namaPelanggan}</p>
      <p><strong>Alamat:</strong> {data.alamat}</p>
      <p><strong>Layanan:</strong> {data.layanan}</p>
      <p><strong>Harga Paket:</strong> Rp {data.hargaPaket.toLocaleString()}</p>
      <p><strong>PPN 11%:</strong> Rp {data.ppn.toLocaleString()}</p>
      <p><strong>Total:</strong> Rp {data.total.toLocaleString()}</p>
      <p><strong>Status:</strong> {data.statusPembayaran}</p>
      <p><strong>Jatuh Tempo:</strong> {data.tanggalJatuhTempo}</p>

      {/* <div className="btn-group">
        <button onClick={() => generatePDF(data)}>Cetak PDF</button>
        <button onClick={() => sendWhatsApp(data)}>Kirim ke WhatsApp</button>
      </div> */}
    </div>
  );
};

export default InvoicePreview;
