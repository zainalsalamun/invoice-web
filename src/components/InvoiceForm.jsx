import React, { useState, useRef } from "react";
import dayjs from "dayjs";
import AlertDialog from "./AlertDialog";

const InvoiceForm = ({ onSubmit }) => {
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

  // 🔹 Refs untuk fokus otomatis
  const refs = {
    namaPelanggan: useRef(null),
    hargaPaket: useRef(null),
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Hapus error highlight saat user isi field
    setErrorFields((prev) => prev.filter((f) => f !== name));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["namaPelanggan", "hargaPaket"];
    const empty = requiredFields.filter((f) => !formData[f]);

    if (empty.length > 0) {
      setErrorFields(empty);
      setShowAlert(true);

      // 🔹 Fokus ke field pertama yang kosong
      const firstEmpty = empty[0];
      if (refs[firstEmpty]?.current) {
        refs[firstEmpty].current.focus();
      }

      return;
    }

    const harga = parseFloat(formData.hargaPaket);
    const ppn = harga * 0.11;
    const total = harga + ppn;

    onSubmit({
      ...formData,
      hargaPaket: harga,
      ppn,
      total,
      tanggalInvoice: dayjs().format("YYYY-MM-DD"),
      nomorInvoice: "INV-" + Date.now(),
    });
  };

  return (
    <>
      <form className="invoice-form" onSubmit={handleSubmit}>
        <h2>Form Input Invoice</h2>

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

        <button type="submit">Preview Invoice</button>
      </form>

      {/* Modal Alert */}
      <AlertDialog
        isOpen={showAlert}
        message="Nama pelanggan dan harga wajib diisi!"
        onClose={() => setShowAlert(false)}
      />
    </>
  );
};

export default InvoiceForm;
