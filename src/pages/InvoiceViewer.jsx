/* src/pages/InvoiceViewer.jsx */

import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Button, Box, Typography, Divider } from "@mui/material";
import logoRingnet from "../assets/logoringnet.png";
import { generatePDF } from "../utils/pdfGenerator";
import { invoiceService } from "../services/invoiceService";

const InvoiceViewer = () => {
  const { invoiceId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [invoice, setInvoice] = useState(null);

  // 🔧 Normalisasi + perhitungan DPP / VAT / Total
  const normalizeInvoice = (data) => {
    if (!data) return null;

    // ambil semua kemungkinan field
    const rawNomor =
      data.nomorInvoice || data.nomor_invoice || data.nomor_tagihan || "-";
    const rawNama = data.namaPelanggan || data.nama_pelanggan || "-";
    const rawAlamat = data.alamat || data.alamat_pelanggan || "-";
    const rawLayanan = data.layanan || data.keterangan || "";
    const rawHargaPaket = data.hargaPaket || data.harga_paket || 0;
    const rawPpn = data.ppn || data.vat || 0;
    const rawTotal = data.total || data.total_tagihan || 0;

    // items: kalau backend sudah kirim array items pakai itu
    // kalau tidak ada, fallback ke 1 baris dari layanan + harga paket
    const items =
      Array.isArray(data.items) && data.items.length > 0
        ? data.items.map((it, idx) => ({
          no: idx + 1,
          keterangan: it.keterangan || it.layanan || rawLayanan || "-",
          harga: Number(it.harga || it.harga_satuan || 0),
          qty: Number(it.qty || it.jumlah || 1),
        }))
        : [
          {
            no: 1,
            keterangan: rawLayanan || "Layanan Internet",
            harga: Number(rawHargaPaket || rawTotal - rawPpn || 0),
            qty: 1,
          },
        ];

    // hitung DPP (sum harga * qty)
    let dpp =
      data.dpp != null
        ? Number(data.dpp)
        : items.reduce((sum, it) => sum + it.harga * it.qty, 0);

    // hitung VAT (ppn)
    let vat =
      data.vat != null
        ? Number(data.vat)
        : rawPpn
          ? Number(rawPpn)
          : Math.round(dpp * 0.11);

    // hitung total: selalu DPP + VAT
    // rawTotal/data.total di database hanya menyimpan DPP (sebelum PPN),
    // jadi tidak bisa digunakan langsung sebagai total akhir.
    const totalTagihan = dpp + vat;

    return {
      id: data.id,
      nomorInvoice: rawNomor,
      namaPelanggan: rawNama,
      alamat: rawAlamat,
      layanan: rawLayanan,
      periode: data.periode || "-",
      statusPembayaran: data.statusPembayaran || data.status_pembayaran || "-",
      tanggalInvoice: data.tanggalInvoice || data.tanggal_invoice || "-",
      tanggalJatuhTempo:
        data.tanggalJatuhTempo || data.tanggal_jatuh_tempo || "-",
      items,
      dpp,
      vat,
      totalTagihan,
    };
  };

  // 🔄 Load invoice: prioritas invoiceId dari URL, fallback ke location.state
  useEffect(() => {
    const loadInvoice = async () => {
      // 1. Selalu coba fetch dari API dulu jika ada invoiceId di URL
      //    Ini memastikan data selalu fresh dan sesuai ID yang diklik
      if (invoiceId) {
        try {
          const res = await invoiceService.getById(invoiceId);
          if (res) {
            setInvoice(normalizeInvoice(res));
            return;
          }
        } catch (e) {
          console.error("Gagal ambil invoice dari API:", e);
        }
      }

      // 2. Fallback ke location.state jika tidak ada invoiceId atau API gagal
      if (location.state?.data) {
        setInvoice(normalizeInvoice(location.state.data));
        return;
      }

      // 3. Tidak ada data sama sekali → balik ke dashboard
      navigate("/");
    };

    loadInvoice();
  }, [invoiceId, location.state, navigate]);

  if (!invoice) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f4f6f9",
        }}
      >
        <Typography>Memuat data invoice...</Typography>
      </Box>
    );
  }

  const formatDate = (val) => {
    if (!val || val === "-") return "-";
    const d = new Date(val);
    if (Number.isNaN(d.getTime())) return val;
    return d.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatCurrency = (n) =>
    `Rp ${Number(n || 0).toLocaleString("id-ID", {
      maximumFractionDigits: 0,
    })}`;

  const {
    nomorInvoice,
    namaPelanggan,
    alamat,
    periode,
    statusPembayaran,
    tanggalInvoice,
    tanggalJatuhTempo,
    items,
    dpp,
    vat,
    totalTagihan,
  } = invoice;

  return (
    <Box
      sx={{
        background: "#f4f6f9",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 6,
      }}
    >
      <Box
        sx={{
          width: "900px",
          background: "#fff",
          borderRadius: "10px",
          boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
          p: 4,
        }}
      >
        {/* HEADER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
          }}
        >
          {/* Logo + company info */}
          <Box sx={{ display: "flex", gap: 2 }}>
            <img
              src={logoRingnet}
              alt="Ringnet Logo"
              width={80}
              height={80}
              style={{ borderRadius: 8 }}
            />
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 700, textTransform: "uppercase" }}
              >
                PT. RING MEDIA NUSANTARA
              </Typography>
              <Typography variant="body2">
                Jl. Wuluh No. 1 Papringan, Nologaten, Catur Tunggal,
              </Typography>
              <Typography variant="body2">Depok, Sleman, Yogyakarta</Typography>
              <Typography variant="body2">0877-4796-3000</Typography>
              <Typography variant="body2">
                ringmedianusantara@gmail.com
              </Typography>
            </Box>
          </Box>

          {/* Info tagihan */}
          <Box sx={{ textAlign: "right" }}>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, mb: 1, textTransform: "uppercase" }}
            >
              TAGIHAN
            </Typography>
            <Typography variant="body2">
              <b>Nomor Tagihan :</b> {nomorInvoice}
            </Typography>
            <Typography variant="body2">
              <b>Tgl Tagihan :</b> {formatDate(tanggalInvoice)}
            </Typography>
            <Typography variant="body2">
              <b>Jatuh Tempo :</b> {formatDate(tanggalJatuhTempo)}
            </Typography>
            <Typography variant="body2">
              <b>Periode :</b> {periode}
            </Typography>
            <Typography variant="body2">
              <b>Status :</b> {statusPembayaran}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* KEPADA */}
        <Box
          sx={{
            border: "1px solid #ccc",
            borderRadius: 1,
            p: 2,
            mb: 3,
            bgcolor: "#fafafa",
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
            Kepada :
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 600 }}>
            {namaPelanggan}
          </Typography>
          {alamat && alamat !== "-" && (
            <Typography variant="body2" sx={{ mt: 0.5 }}>
              {alamat}
            </Typography>
          )}
        </Box>

        {/* TABEL ITEM */}
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            marginBottom: 20,
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  width: "40px",
                }}
              >
                No
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "left",
                }}
              >
                Keterangan
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                  width: "140px",
                }}
              >
                Harga
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  width: "70px",
                  textAlign: "center",
                }}
              >
                Qty
              </th>
              <th
                style={{
                  border: "1px solid #ccc",
                  padding: "8px",
                  textAlign: "right",
                  width: "160px",
                }}
              >
                Sub Total
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, idx) => {
              const subTotal = (it.harga || 0) * (it.qty || 0);
              return (
                <tr key={idx}>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px 8px",
                      textAlign: "center",
                    }}
                  >
                    {it.no || idx + 1}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px 8px",
                    }}
                  >
                    {it.keterangan}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px 8px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(it.harga)}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px 8px",
                      textAlign: "center",
                    }}
                  >
                    {it.qty}
                  </td>
                  <td
                    style={{
                      border: "1px solid #ddd",
                      padding: "6px 8px",
                      textAlign: "right",
                    }}
                  >
                    {formatCurrency(subTotal)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* RINGKASAN DPP / VAT / TOTAL */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 3,
          }}
        >
          <Box sx={{ width: 320 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography>DPP</Typography>
              <Typography>{formatCurrency(dpp)}</Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 0.5,
              }}
            >
              <Typography>VAT 11%</Typography>
              <Typography>{formatCurrency(vat)}</Typography>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
              }}
            >
              <Typography>Total Tagihan</Typography>
              <Typography>{formatCurrency(totalTagihan)}</Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* INFORMASI PEMBAYARAN */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
            Pembayaran ditransfer ke:
          </Typography>
          <Typography variant="body2">
            PT RING MEDIA NUSANTARA
          </Typography>
          <Typography variant="body2">
            Bank Mandiri Bisnis 137-00-7999997-1
          </Typography>

          <Typography variant="body2" sx={{ mt: 2, fontStyle: "italic" }}>
            *Apabila sudah melakukan pembayaran via transfer mohon
            dikonfirmasikan kepada Bag. Keuangan - Nurlia Febriyanti
          </Typography>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* FOOTER */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            mt: 3,
          }}
        >
          <Box>
            <Typography variant="body2">
              Terima kasih telah menggunakan layanan Ringnet.
            </Typography>
          </Box>
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="body2">Hormat kami,</Typography>
            <Typography variant="body2" sx={{ mt: 6, fontWeight: 600 }}>
              PT. RING MEDIA NUSANTARA
            </Typography>
          </Box>
        </Box>

        {/* ACTION BUTTONS */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            gap: 2,
            mt: 4,
            flexWrap: "wrap",
          }}
        >
          <Button
            variant="contained"
            color="primary"
            onClick={() => generatePDF(invoice)}
          >
            📄 Generate PDF
          </Button>
          <Button variant="outlined" onClick={() => navigate(-1)}>
            ⬅️ Kembali
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default InvoiceViewer;
