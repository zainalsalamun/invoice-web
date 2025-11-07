import React, { useState, useRef } from "react";
import dayjs from "dayjs";
import AlertDialog from "./AlertDialog";
import { invoiceService } from "../services/invoiceService";

const InvoiceForm = ({ onPreview }) => {
  const [formData, setFormData] = useState({
    namaPelanggan: "",
    alamat: "",
    nomorPelanggan: "",
    periode: "",
    layanan: "",
    hargaPaket: "",
    tanggalJatuhTempo: dayjs().add(7, "day").format("YYYY-MM-DD"),
    statusPembayaran: "Belum Lunas",
  });

  const [showAlert, setShowAlert] = useState(false);
  const [errorFields, setErrorFields] = useState([]);
  const [loading, setLoading] = useState(false);

  const refs = {
    namaPelanggan: useRef(null),
    hargaPaket: useRef(null),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorFields((prev) => prev.filter((f) => f !== name));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const required = ["namaPelanggan", "hargaPaket"];
    const empty = required.filter((f) => !formData[f]);
  
    if (empty.length > 0) {
      setErrorFields(empty);
      setShowAlert(true);
      const first = empty[0];
      if (refs[first]?.current) refs[first].current.focus();
      return;
    }
  
    const harga = parseFloat(formData.hargaPaket);
    const ppn = Math.round(harga * 0.11);
    const total = harga + ppn;
  
    const payload = {
      nama_pelanggan: formData.namaPelanggan,
      alamat: formData.alamat || "Jl. Telekomunikasi No. 45, Yogyakarta",
      layanan: formData.layanan || "Paket 50 Mbps",
      harga_paket: harga,
      ppn,
      total,
      periode: formData.periode
        ? dayjs(formData.periode).format("MMMM YYYY")
        : dayjs().format("MMMM YYYY"),
      status_pembayaran: formData.statusPembayaran,
      tanggal_invoice: dayjs().format("YYYY-MM-DD"),
      tanggal_jatuh_tempo: formData.tanggalJatuhTempo,
    };
  
    setLoading(true);
    try {
      const result = await invoiceService.create(payload);
      setLoading(false);
    
      console.log("📦 Response dari server:", result);
    
      if (result && result.success && result.data) {
        console.log("✅ Invoice tersimpan:", result.data);
        onPreview(result.data);
      } else {
        alert("❌ Gagal menyimpan invoice ke server");
      }
    } catch (error) {
      console.error("❌ Error saat kirim data:", error);
      setLoading(false);
      alert("Gagal menyimpan invoice, periksa koneksi server");
    }
    
  };
  
  

  return (
    <>
      <form className="invoice-form" onSubmit={handleSubmit}>
        <h2>🧾 Form Input Invoice</h2>

        <label>Nama Pelanggan</label>
        <input
          ref={refs.namaPelanggan}
          type="text"
          name="namaPelanggan"
          value={formData.namaPelanggan}
          onChange={handleChange}
          className={errorFields.includes("namaPelanggan") ? "input-error" : ""}
        />

        <label>Alamat</label>
        <input
          type="text"
          name="alamat"
          value={formData.alamat}
          onChange={handleChange}
        />

        <label>Nomor Pelanggan</label>
        <input
          type="text"
          name="nomorPelanggan"
          value={formData.nomorPelanggan}
          onChange={handleChange}
        />

        <label>Periode Tagihan</label>
        <input
          type="month"
          name="periode"
          value={formData.periode}
          onChange={handleChange}
        />

        <label>Layanan Internet</label>
        <input
          type="text"
          name="layanan"
          placeholder="Contoh: Paket 50 Mbps"
          value={formData.layanan}
          onChange={handleChange}
        />

        <label>Harga Paket (Rp)</label>
        <input
          ref={refs.hargaPaket}
          type="number"
          name="hargaPaket"
          value={formData.hargaPaket}
          onChange={handleChange}
          className={errorFields.includes("hargaPaket") ? "input-error" : ""}
        />

        <label>Tanggal Jatuh Tempo</label>
        <input
          type="date"
          name="tanggalJatuhTempo"
          value={formData.tanggalJatuhTempo}
          onChange={handleChange}
        />

        <label>Status Pembayaran</label>
        <select
          name="statusPembayaran"
          value={formData.statusPembayaran}
          onChange={handleChange}
        >
          <option>Belum Lunas</option>
          <option>Lunas</option>
        </select>

        <button type="submit" disabled={loading}>
          {loading ? "💾 Menyimpan..." : "📄 Preview Invoice"}
        </button>
      </form>

      <AlertDialog
        isOpen={showAlert}
        message="Nama pelanggan dan harga wajib diisi!"
        onClose={() => setShowAlert(false)}
      />
    </>
  );
};

export default InvoiceForm;
