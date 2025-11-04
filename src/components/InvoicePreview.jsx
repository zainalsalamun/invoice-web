import React, { useState } from "react";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import { useNavigate } from "react-router-dom";
import WhatsAppDialog from "./WhatsAppDialog";

const InvoicePreview = ({ data, onReset }) => {
  const navigate = useNavigate();
  const [isWaOpen, setIsWaOpen] = useState(false);

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

      <div
        style={{
          display: "flex",
          gap: "10px",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {/* Tombol Preview PDF */}
        <button
          style={{
            background: "#007bff",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() =>
            navigate(`/invoices/${data.nomorInvoice}.pdf`, {
              state: { data }, // kirim semua data dari form ke viewer
            })
          }
        >
          Preview PDF
        </button>

        {/* Tombol Kirim ke WhatsApp */}
        <button
          style={{
            background: "#28a745",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={() => setIsWaOpen(true)}
        >
          Kirim ke WhatsApp
        </button>

        {/* Tombol Buat Ulang */}
        <button
          style={{
            background: "#6c757d",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "6px",
            cursor: "pointer",
          }}
          onClick={onReset}
        >
          Buat Ulang
        </button>
      </div>

      {/* Modal Input Nomor WhatsApp */}
      <WhatsAppDialog
        isOpen={isWaOpen}
        onClose={() => setIsWaOpen(false)}
        onSend={(phone) => sendWhatsApp(data, phone)}
      />
    </div>
  );
};

export default InvoicePreview;
