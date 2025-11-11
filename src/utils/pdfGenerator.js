import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import QRCode from "qrcode";
import logoRingnet from "../assets/logoringnet.png";

const formatRupiah = (value) =>
  "Rp " + value.toLocaleString("id-ID", { minimumFractionDigits: 0 });

export const generatePDF = async (data, returnBlob = false) => {
  try {
    const element = document.createElement("div");
    element.style.width = "800px";
    element.style.padding = "20px 25px";
    element.style.background = "white";
    element.style.fontFamily = "Arial, sans-serif";
    element.style.color = "#333";
    element.id = "invoice-temp";

    // Generate QR Code
    const qrDataUrl = await QRCode.toDataURL(
      `${data.namaPelanggan}-${data.nomorInvoice}-${data.total}`
    );

    // Build content HTML
    element.innerHTML = `
<div style="width:100%; font-size:13px; position:relative;">
  <!-- HEADER -->
  <div style="background:#007bff; color:white; padding:15px 20px; border-radius:8px 8px 0 0;
              display:flex; justify-content:space-between; align-items:center;">
    <div style="display:flex; align-items:center; gap:12px;">
      <img src="${logoRingnet}" width="65" height="65"
        style="object-fit:contain; background:white; border-radius:8px; padding:5px;" />
      <div>
        <h2 style="margin:0; font-size:22px;">RINGNET</h2>
        <p style="margin:0; font-size:14px;">Internet Service Provider</p>
      </div>
    </div>
    <div style="text-align:right; font-size:12px;">
      <p style="margin:0;">Jl. Telekomunikasi No. 45, Yogyakarta</p>
      <p style="margin:0;">(0274) 123-456</p>
    </div>
  </div>

  <!-- BODY -->
  <div style="border:1px solid #ccc; border-top:none; border-radius:0 0 8px 8px; padding:25px; position:relative;">
    
    <!-- Watermark -->
    ${
      (() => {
        const status = (data.statusPembayaran || "").toLowerCase();
        let color = "rgba(0,128,0,0.25)";
        let text = "LUNAS";

        if (status.includes("belum")) {
          color = "rgba(255,0,0,0.18)";
          text = "BELUM LUNAS";
        } else if (status.includes("menunggu")) {
          color = "rgba(255,165,0,0.25)";
          text = "MENUNGGU";
        }

        return `
          <div style="
            position:absolute;
            top:45%;
            left:50%;
            transform:translate(-50%,-50%) rotate(-25deg);
            font-size:95px;
            font-weight:900;
            letter-spacing:5px;
            color:${color};
            opacity:0.2;
            z-index:0;
            pointer-events:none;
            user-select:none;
          ">
            ${text}
          </div>`;
      })()
    }

    <!-- Title & QR -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; z-index:1; position:relative;">
      <h3 style="margin:0; color:#007bff; font-size:18px;">INVOICE PEMBAYARAN INTERNET</h3>
      <img src="${qrDataUrl}" width="75" height="75" />
    </div>

    <!-- Detail Pelanggan -->
    <table style="width:100%; font-size:13px; border-collapse:collapse; z-index:1; position:relative;">
      <tbody>
        <tr><td><b>Nomor Invoice:</b></td><td>${data.nomorInvoice}</td></tr>
        <tr><td><b>Tanggal:</b></td><td>${data.tanggalInvoice}</td></tr>
        <tr><td><b>Nama Pelanggan:</b></td><td>${data.namaPelanggan}</td></tr>
        <tr><td><b>Alamat:</b></td><td>${data.alamat}</td></tr>
        <tr><td><b>Layanan:</b></td><td>${data.layanan}</td></tr>
        <tr><td><b>Periode:</b></td><td>${data.periode}</td></tr>
      </tbody>
    </table>

    <hr style="margin:15px 0;"/>

    <!-- Tabel Harga -->
    <table style="width:100%; border-collapse:collapse; font-size:13px; z-index:1; position:relative;">
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
          <td style="padding:8px; font-weight:bold;">Total</td>
          <td style="text-align:right; padding:8px; font-weight:bold;">${formatRupiah(data.total)}</td>
        </tr>
      </tbody>
    </table>

    <div style="margin-top:10px;">
      <p><b>Status Pembayaran:</b> ${data.statusPembayaran}</p>
      <p><b>Jatuh Tempo:</b> ${data.tanggalJatuhTempo}</p>
    </div>

    <!-- Footer -->
    <div style="margin-top:40px; display:flex; justify-content:space-between; z-index:1; position:relative;">
      <div>
        <p>Terima kasih telah menggunakan layanan <b>Ringnet</b> 🙏</p>
        <p>Mohon lakukan pembayaran sebelum jatuh tempo.</p>
      </div>
      <div style="text-align:right;">
        <p>Hormat kami,</p>
        <p style="margin-top:60px; font-weight:bold;">Admin Ringnet</p>
      </div>
    </div>
  </div>
</div>
`;

    // Convert HTML ke Canvas
    document.body.appendChild(element);
    const canvas = await html2canvas(element, { scale: 2.5, useCORS: true });
    document.body.removeChild(element);

    const pdf = new jsPDF("p", "mm", "a4");
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const imgData = canvas.toDataURL("image/png");

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    if (returnBlob) {
      const blob = pdf.output("blob");
      return URL.createObjectURL(blob);
    } else {
      pdf.save(`${data.nomorInvoice}.pdf`);
    }
  } catch (error) {
    console.error(" Gagal generate PDF:", error);
    alert("Terjadi kesalahan saat membuat PDF.");
  }
};
