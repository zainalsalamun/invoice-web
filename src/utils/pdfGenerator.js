import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import logoRingnet from "../assets/logoringnet.png";

// ─── Helpers ──────────────────────────────────────────────
const fmt = (value) => {
  const num = parseFloat(value) || 0;
  return "Rp " + num.toLocaleString("id-ID", { minimumFractionDigits: 0 });
};

const fmtDate = (iso) => {
  if (!iso || iso === "-") return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

// ─── Normalize data dari InvoiceViewer & DashboardPage ───
const normalize = (data) => {
  const rawItems = Array.isArray(data.items) ? data.items : [];

  const items =
    rawItems.length > 0
      ? rawItems.map((it, idx) => ({
        no: it.no || idx + 1,
        keterangan: it.deskripsi || it.keterangan || "-",
        harga: parseFloat(it.harga || 0),
        qty: parseInt(it.qty || 1),
        jumlah: parseFloat(it.jumlah || (it.harga * it.qty) || 0)
      }))
      : [
        {
          no: 1,
          keterangan: data.layanan || "Layanan Internet",
          harga: parseFloat(data.hargaPaket || data.harga_paket || 0),
          qty: 1,
          jumlah: parseFloat(data.hargaPaket || data.harga_paket || 0)
        },
      ];

  const dpp =
    data.dpp != null
      ? parseFloat(data.dpp)
      : items.reduce((s, it) => s + (it.harga || 0) * (it.qty || 1), 0);

  const vat =
    data.vat != null ? parseFloat(data.vat)
      : data.ppn != null ? parseFloat(data.ppn)
        : Math.round(dpp * 0.11);

  const total =
    data.totalTagihan != null ? parseFloat(data.totalTagihan)
      : data.total != null ? parseFloat(data.total)
        : dpp + vat;

  let periodeLabel = data.periode || "-";
  if (periodeLabel && periodeLabel !== "-") {
    // Handle both "2026-02" and "Februari 2026" formats
    const pd = new Date(
      periodeLabel.length <= 7 ? periodeLabel + "-01" : periodeLabel
    );
    if (!isNaN(pd.getTime()))
      periodeLabel = pd.toLocaleDateString("id-ID", { month: "long", year: "numeric" });
  }

  return {
    nomorInvoice: data.nomorInvoice || data.nomor_invoice || "-",
    namaPelanggan: data.namaPelanggan || data.nama_pelanggan || "-",
    alamat: data.alamat || "",
    tanggalInvoice: data.tanggalInvoice || data.tanggal_invoice || "",
    tanggalJatuhTempo: data.tanggalJatuhTempo || data.tanggal_jatuh_tempo || "",
    statusPembayaran: data.statusPembayaran || data.status_pembayaran || "-",
    periodeLabel,
    items,
    dpp,
    vat,
    total,
  };
};


// ─── PDF ──────────────────────────────────────────────────
export const generatePDF = async (data, returnBlob = false) => {
  try {
    const d = normalize(data);


    const itemRows = d.items
      .map(
        (it, idx) => `
        <tr>
          <td style="padding:9px 8px; border-bottom:1px solid #e0e0e0; text-align:center; vertical-align:top;">${it.no || idx + 1}</td>
          <td style="padding:9px 8px; border-bottom:1px solid #e0e0e0; vertical-align:top;">${it.keterangan || "-"}</td>
          <td style="padding:9px 8px; border-bottom:1px solid #e0e0e0; text-align:right; vertical-align:top; white-space:nowrap;">${fmt(it.harga)}</td>
          <td style="padding:9px 8px; border-bottom:1px solid #e0e0e0; text-align:center; vertical-align:top;">${it.qty || 1}</td>
          <td style="padding:9px 8px; border-bottom:1px solid #e0e0e0; text-align:right; vertical-align:top; white-space:nowrap;">${fmt((it.harga || 0) * (it.qty || 1))}</td>
        </tr>`
      )
      .join("");

    const element = document.createElement("div");
    element.style.cssText = `
      width: 820px;
      padding: 44px 52px 48px 52px;
      background: #ffffff;
      font-family: Arial, Helvetica, sans-serif;
      font-size: 13px;
      color: #222;
      box-sizing: border-box;
      position: relative;
    `;
    element.id = "invoice-pdf-temp";

    element.innerHTML = `
<div style="width:100%; position:relative;">

  <!-- ══ HEADER ══ -->
  <table style="width:100%; border-collapse:collapse; position:relative; z-index:1; margin-bottom:0;">
    <tr>
      <!-- Kiri: Logo + Perusahaan -->
      <td style="vertical-align:top; width:58%;">
        <table style="border-collapse:collapse;">
          <tr>
            <td style="vertical-align:middle; padding-right:14px;">
              <img src="${logoRingnet}" width="70" height="70" style="object-fit:contain;" />
            </td>
            <td style="vertical-align:middle;">
              <div style="font-size:18px; font-weight:900; color:#111; margin-bottom:5px;">PT. RING MEDIA NUSANTARA</div>
              <div style="font-size:12px; color:#555; line-height:1.7;">
                Jl. Wuluh No. 1 Papringan, Nologaten, Catur Tunggal,<br/>
                Depok, Sleman, Yogyakarta<br/>
                0877-4796-3000<br/>
                ringmedianusantara@gmail.com
              </div>
            </td>
          </tr>
        </table>
      </td>

      <!-- Kanan: TAGIHAN + Detail -->
      <td style="vertical-align:top; text-align:right; width:42%;">
        <div style="font-size:34px; font-weight:900; color:#111; letter-spacing:2px; margin-bottom:12px;">TAGIHAN</div>
        <table style="border-collapse:collapse; margin-left:auto; font-size:12.5px;">
          <tr>
            <td style="padding:2px 10px 2px 0; font-weight:700; white-space:nowrap; text-align:right;">Nomor Tagihan :</td>
            <td style="padding:2px 0; text-align:right; white-space:nowrap;">${d.nomorInvoice}</td>
          </tr>
          <tr>
            <td style="padding:2px 10px 2px 0; font-weight:700; text-align:right;">Tgl Tagihan :</td>
            <td style="padding:2px 0; text-align:right;">${fmtDate(d.tanggalInvoice)}</td>
          </tr>
          <tr>
            <td style="padding:2px 10px 2px 0; font-weight:700; text-align:right;">Jatuh Tempo :</td>
            <td style="padding:2px 0; text-align:right;">${fmtDate(d.tanggalJatuhTempo)}</td>
          </tr>
          <tr>
            <td style="padding:2px 10px 2px 0; font-weight:700; text-align:right;">Periode :</td>
            <td style="padding:2px 0; text-align:right;">${d.periodeLabel}</td>
          </tr>
          <tr>
            <td style="padding:2px 10px 2px 0; font-weight:700; text-align:right;">Status :</td>
            <td style="padding:2px 0; text-align:right;">${d.statusPembayaran}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>

  <hr style="border:none; border-top:1.5px solid #ccc; margin:18px 0 16px;" />

  <!-- ══ KEPADA ══ -->
  <div style="
    border:1px solid #ccc; border-radius:4px;
    padding:14px 18px; margin-bottom:22px;
    position:relative; z-index:1;
  ">
    <div style="font-size:12px; color:#888; margin-bottom:4px;">Kepada :</div>
    <div style="font-size:15px; font-weight:800; color:#111; margin-bottom:4px;">${d.namaPelanggan}</div>
    ${d.alamat ? `<div style="font-size:12.5px; color:#444;">${d.alamat}</div>` : ""}
  </div>

  <!-- ══ TABEL ITEM ══ -->
  <table style="width:100%; border-collapse:collapse; font-size:13px; position:relative; z-index:1;">
    <thead>
      <tr style="border-top:1.5px solid #333; border-bottom:1.5px solid #333; background:#f7f7f7;">
        <th style="padding:9px 8px; text-align:center; font-weight:700; width:40px;">No</th>
        <th style="padding:9px 8px; text-align:left; font-weight:700;">Keterangan</th>
        <th style="padding:9px 8px; text-align:right; font-weight:700; width:130px;">Harga</th>
        <th style="padding:9px 8px; text-align:center; font-weight:700; width:50px;">Qty</th>
        <th style="padding:9px 8px; text-align:right; font-weight:700; width:130px;">Sub Total</th>
      </tr>
    </thead>
    <tbody>
      ${itemRows}
    </tbody>
  </table>

  <!-- ══ SUMMARY (DPP / VAT / TOTAL) ══ -->
  <table style="width:100%; border-collapse:collapse; font-size:13px; position:relative; z-index:1; margin-top:0; border-bottom:1.5px solid #333;">
    <tr>
      <td style="width:55%;"></td>
      <td style="padding:7px 8px; text-align:right; color:#333;">DPP</td>
      <td style="padding:7px 8px; text-align:right; white-space:nowrap; width:130px;">${fmt(d.dpp)}</td>
    </tr>
    <tr>
      <td></td>
      <td style="padding:7px 8px; text-align:right; color:#333; border-bottom:1px solid #ddd;">VAT 11%</td>
      <td style="padding:7px 8px; text-align:right; white-space:nowrap; border-bottom:1px solid #ddd;">${fmt(d.vat)}</td>
    </tr>
    <tr>
      <td></td>
      <td style="padding:11px 8px; text-align:right; font-weight:700; font-size:14px; color:#111;">Total Tagihan</td>
      <td style="padding:11px 8px; text-align:right; font-weight:700; font-size:14px; white-space:nowrap;">${fmt(d.total)}</td>
    </tr>
  </table>

  <!-- ══ INFO PEMBAYARAN ══ -->
  <div style="margin-top:22px; position:relative; z-index:1; font-size:13px;">
    <div style="font-weight:700; margin-bottom:5px;">Pembayaran ditransfer ke:</div>
    <div style="line-height:1.8; color:#222;">
      PT RING MEDIA NUSANTARA<br/>
      Bank Mandiri Bisnis 137-00-7999997-1
    </div>
    <div style="margin-top:10px; font-style:italic; font-size:12px; color:#555;">
      *Apabila sudah melakukan pembayaran via transfer mohon dikonfirmasikan kepada Bag. Keuangan - Nurlia Febriyanti
    </div>
  </div>

  <hr style="border:none; border-top:1px solid #ccc; margin:22px 0;" />

  <!-- ══ FOOTER ══ -->
  <table style="width:100%; border-collapse:collapse; font-size:12.5px; position:relative; z-index:1;">
    <tr>
      <td style="vertical-align:bottom; color:#444;">
        Terima kasih telah menggunakan layanan Ringnet.
      </td>
      <td style="text-align:right; vertical-align:bottom; padding-left:20px; white-space:nowrap;">
        <div style="color:#444; margin-bottom:52px;">Hormat kami,</div>
        <div style="font-weight:800; font-size:13px; color:#111;">PT. RING MEDIA NUSANTARA</div>
      </td>
    </tr>
  </table>

</div>`;

    document.body.appendChild(element);
    const canvas = await html2canvas(element, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    document.body.removeChild(element);

    const pdf = new jsPDF("p", "mm", "a4");
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const imgW = pageW;
    const imgH = (canvas.height * imgW) / canvas.width;
    const imgData = canvas.toDataURL("image/png");

    let yOffset = 0;
    let first = true;
    while (yOffset < imgH) {
      if (!first) pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, -yOffset, imgW, imgH);
      yOffset += pageH;
      first = false;
    }

    if (returnBlob) {
      return URL.createObjectURL(pdf.output("blob"));
    } else {
      pdf.save(`${d.nomorInvoice || "invoice"}.pdf`);
    }
  } catch (error) {
    console.error("Gagal generate PDF:", error);
    alert("Terjadi kesalahan saat membuat PDF.");
  }
};
