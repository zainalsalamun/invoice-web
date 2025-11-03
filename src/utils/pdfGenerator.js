import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import logoRingnet from "../assets/logoringnet.png";

const formatRupiah = (value) =>
  "Rp " + value.toLocaleString("id-ID", { minimumFractionDigits: 0 });

export const generatePDF = async (data, previewMode = false) => {
  try {
    // Buat container sementara di DOM (wajib untuk html2canvas)
    const element = document.createElement("div");
    element.style.width = "800px";
    element.style.padding = "20px";
    element.style.background = "white";
    element.style.fontFamily = "Arial, sans-serif";
    element.id = "invoice-temp";

    // Generate QR code
    const qrDataUrl = await QRCode.toDataURL(
      `${data.namaPelanggan}-${data.nomorInvoice}-${data.total}`
    );

    // Isi HTML invoice
    element.innerHTML = `
<div style="width:100%; font-family:Arial, sans-serif; font-size:13px; color:#333;">
  
  <!-- HEADER BIRU -->
  <div style="background:#007bff; color:white; padding:15px 20px; border-radius:6px 6px 0 0;
              display:flex; justify-content:space-between; align-items:center;">
    <div style="display:flex; align-items:center; gap:12px;">
      <img src="${logoRingnet}" 
           alt="Ringnet Logo" 
           width="70" 
           height="70" 
           style="object-fit:contain; background:white; border-radius:8px; padding:5px;" />
      <div>
        <h2 style="margin:0; font-size:22px;">RINGNET</h2>
        <p style="margin:0; font-size:14px;">Internet Service Provider</p>
      </div>
    </div>
    <div style="text-align:right; font-size:12px;">
      <p style="margin:0;">${process.env.REACT_APP_COMPANY_ADDRESS}</p>
      <p style="margin:0;">${process.env.REACT_APP_COMPANY_PHONE}</p>
    </div>
  </div>

  <!-- BODY -->
  <div style="padding:20px; border:1px solid #ccc; border-top:none; border-radius:0 0 6px 6px; position:relative;">
    
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
      <h3 style="text-align:left; color:#007bff; margin:0;">INVOICE PEMBAYARAN INTERNET</h3>
      <img src="${qrDataUrl}" width="90" height="90" alt="QR Code"/>
    </div>

    <table style="width:100%; margin-top:10px; border-collapse:collapse; font-size:13px;">
      <tr><td><strong>Nomor Invoice:</strong></td><td>${data.nomorInvoice}</td></tr>
      <tr><td><strong>Tanggal:</strong></td><td>${data.tanggalInvoice}</td></tr>
      <tr><td><strong>Nama Pelanggan:</strong></td><td>${data.namaPelanggan}</td></tr>
      <tr><td><strong>Alamat:</strong></td><td>${data.alamat}</td></tr>
      <tr><td><strong>Layanan:</strong></td><td>${data.layanan}</td></tr>
      <tr><td><strong>Periode:</strong></td><td>${data.periode}</td></tr>
    </table>

    <hr style="margin:15px 0;"/>

    <table style="width:100%; border-collapse:collapse; font-size:13px;">
      <thead>
        <tr style="background:#f0f0f0;">
          <th style="text-align:left; padding:8px;">Deskripsi</th>
          <th style="text-align:right; padding:8px;">Harga</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td style="padding:8px;">${data.layanan}</td>
          <td style="text-align:right; padding:8px;">${formatRupiah(data.hargaPaket)}</td>
        </tr>
        <tr>
          <td style="padding:8px;">PPN 11%</td>
          <td style="text-align:right; padding:8px;">${formatRupiah(data.ppn)}</td>
        </tr>
        <tr>
          <td style="font-weight:bold; padding:8px;">Total</td>
          <td style="text-align:right; font-weight:bold; padding:8px;">${formatRupiah(data.total)}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:20px;">
      <p><strong>Status Pembayaran:</strong> ${data.statusPembayaran}</p>
      <p><strong>Jatuh Tempo:</strong> ${data.tanggalJatuhTempo}</p>
    </div>

    <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:40px;">
      <div style="font-size:12px;">
        <p>Terima kasih telah menggunakan layanan <strong>RINGNET</strong> 🙏</p>
        <p style="margin:0;">Mohon lakukan pembayaran sebelum jatuh tempo.</p>
      </div>
      <div style="text-align:center; font-size:12px;">
        <p>Hormat kami,</p>
        <p style="margin-top:60px; font-weight:bold;">Admin RINGNET</p>
      </div>
    </div>

    <!-- STEMPEL LUNAS OTOMATIS -->
    ${
      data.statusPembayaran === "Lunas"
        ? `<div style="
              position:absolute;
              top:200px;
              left:50%;
              transform:translateX(-50%) rotate(-20deg);
              font-size:50px;
              color:rgba(0,128,0,0.25);
              font-weight:bold;
              border:5px solid rgba(0,128,0,0.25);
              padding:15px 40px;
              border-radius:10px;
              text-transform:uppercase;">
              LUNAS
           </div>`
        : ""
    }
  </div>
</div>
`;

    // Tambahkan ke body sementara untuk dirender
    document.body.appendChild(element);

    // Render HTML ke gambar
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL("image/png");

    // Hapus element sementara dari DOM
    document.body.removeChild(element);

    // Buat PDF
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    // 🔹 Tambahkan mode view (preview)
    if (previewMode) {
      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      return url; // <— kirim URL ke viewer
    } else {
      pdf.save(`${data.nomorInvoice}.pdf`);
    }
  } catch (error) {
    console.error("❌ Gagal generate PDF:", error);
    alert("Terjadi kesalahan saat membuat PDF.");
  }
};
