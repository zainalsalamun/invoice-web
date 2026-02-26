import React, { useState } from "react";
import { sendWhatsApp } from "../utils/sendWhatsApp";
import { useNavigate } from "react-router-dom";
import WhatsAppDialog from "./WhatsAppDialog";

const InvoicePreview = ({ data, onReset }) => {
  const navigate = useNavigate();
  const [isWaOpen, setIsWaOpen] = useState(false);

  if (!data) return null;

  const items = Array.isArray(data.items) ? data.items : [];
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
    <div className="invoice-preview" style={{ maxWidth: "800px", margin: "0 auto", padding: "20px", border: "1px solid #ddd", borderRadius: "8px", backgroundColor: "#fff" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Preview Invoice</h2>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
        <div>
          <p><strong>Nomor Invoice:</strong> {nomor}</p>
          <p><strong>Tanggal Invoice:</strong> {tanggalInvoice}</p>
          <p><strong>Periode:</strong> {periode}</p>
        </div>
        <div>
          <p><strong>Nama Pelanggan:</strong> {nama}</p>
          <p><strong>Status:</strong> <span style={{ color: status === "Lunas" ? "green" : "red", fontWeight: "bold" }}>{status}</span></p>
          <p><strong>Jatuh Tempo:</strong> {jatuhTempo}</p>
        </div>
      </div>

      <p><strong>Alamat:</strong> {alamat}</p>

      <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px", marginBottom: "20px" }}>
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
            <th style={{ padding: "10px", textAlign: "left" }}>Deskripsi</th>
            <th style={{ padding: "10px", textAlign: "right" }}>Harga</th>
            <th style={{ padding: "10px", textAlign: "center" }}>Qty</th>
            <th style={{ padding: "10px", textAlign: "right" }}>Jumlah</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((it, idx) => (
              <tr key={idx} style={{ borderBottom: "1px solid #dee2e6" }}>
                <td style={{ padding: "10px" }}>{it.deskripsi || it.keterangan}</td>
                <td style={{ padding: "10px", textAlign: "right" }}>Rp {parseFloat(it.harga).toLocaleString("id-ID")}</td>
                <td style={{ padding: "10px", textAlign: "center" }}>{it.qty}</td>
                <td style={{ padding: "10px", textAlign: "right" }}>Rp {parseFloat(it.jumlah).toLocaleString("id-ID")}</td>
              </tr>
            ))
          ) : (
            <tr style={{ borderBottom: "1px solid #dee2e6" }}>
              <td style={{ padding: "10px" }}>{layanan || "Layanan Internet"}</td>
              <td style={{ padding: "10px", textAlign: "right" }}>Rp {parseFloat(harga).toLocaleString("id-ID")}</td>
              <td style={{ padding: "10px", textAlign: "center" }}>1</td>
              <td style={{ padding: "10px", textAlign: "right" }}>Rp {parseFloat(harga).toLocaleString("id-ID")}</td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ marginLeft: "auto", width: "300px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span>Subtotal:</span>
          <span>Rp {(total - ppn).toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "5px" }}>
          <span>PPN 11%:</span>
          <span>Rp {ppn?.toLocaleString("id-ID")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #eee", paddingTop: "5px", fontWeight: "bold" }}>
          <span>Total:</span>
          <span>Rp {total?.toLocaleString("id-ID")}</span>
        </div>
        {data.kurang_bayar > 0 && (
          <div style={{ display: "flex", justifyContent: "space-between", color: "red", fontWeight: "bold", marginTop: "5px" }}>
            <span>Kurang Bayar ({data.status_pembayaran || status}):</span>
            <span>Rp {data.kurang_bayar.toLocaleString("id-ID")}</span>
          </div>
        )}
        {data.tanggal_pembayaran && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginTop: "10px", color: "#666" }}>
            <span>Tgl Bayar:</span>
            <span>{data.tanggal_pembayaran}</span>
          </div>
        )}
      </div>

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
