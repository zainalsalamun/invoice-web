import React, { useState } from "react";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import { useNavigate } from "react-router-dom";
import WhatsAppDialog from "./WhatsAppDialog";

const InvoicePreview = ({ data, onReset }) => {
  const navigate = useNavigate();
  const [isWaOpen, setIsWaOpen] = useState(false);

  if (!data) return null;

  const nomor = data.nomor_invoice || data.nomorInvoice;
  const nama = data.nama_pelanggan || data.namaPelanggan;
  const alamat = data.alamat;
  const layanan = data.layanan;
  const harga = data.harga_paket || data.hargaPaket;
  const ppn = data.ppn;
  const total = data.total;
  const periode = data.periode;
  const status = data.status_pembayaran || data.statusPembayaran;
  const jatuhTempo = data.tanggal_jatuh_tempo || data.tanggalJatuhTempo;
  const tanggalInvoice = data.tanggal_invoice || data.tanggalInvoice;

  return (
    <div className="invoice-preview">
      <h2>Preview Invoice</h2>

      <p><strong>Nomor Invoice:</strong> {nomor}</p>
      <p><strong>Tanggal Invoice:</strong> {tanggalInvoice}</p>
      <p><strong>Nama Pelanggan:</strong> {nama}</p>
      <p><strong>Alamat:</strong> {alamat}</p>
      <p><strong>Layanan:</strong> {layanan}</p>
      <p><strong>Harga Paket:</strong> Rp {harga?.toLocaleString()}</p>
      <p><strong>PPN 11%:</strong> Rp {ppn?.toLocaleString()}</p>
      <p><strong>Total:</strong> Rp {total?.toLocaleString()}</p>
      <p><strong>Status:</strong> {status}</p>
      <p><strong>Periode:</strong> {periode}</p>
      <p><strong>Jatuh Tempo:</strong> {jatuhTempo}</p>

      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "20px" }}>
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
            navigate(`/invoices/${nomor}.pdf`, {
              state: { data },
            })
          }
        >
          Preview PDF
        </button>

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

      <WhatsAppDialog
        isOpen={isWaOpen}
        onClose={() => setIsWaOpen(false)}
        onSend={(phone) => sendWhatsApp(data, phone)}
      />
    </div>
  );
};

export default InvoicePreview;
