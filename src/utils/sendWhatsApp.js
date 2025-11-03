export const sendWhatsApp = (data, phone) => {
    try {
      if (!phone) return;
  
      const formatRupiah = (value) =>
        "Rp " + value.toLocaleString("id-ID", { minimumFractionDigits: 0 });
  
      const message = `
  Halo *${data.namaPelanggan}* 👋
  
  Ini adalah *tagihan layanan internet Ringnet* Anda untuk periode *${data.periode}*.
  
  📄 Nomor Invoice: *${data.nomorInvoice}*
  📅 Tanggal Invoice: ${data.tanggalInvoice}
  💰 Total Tagihan: *${formatRupiah(data.total)}*
  🧾 Status: ${data.statusPembayaran}
  📆 Jatuh Tempo: ${data.tanggalJatuhTempo}
  
  Silakan lakukan pembayaran sebelum jatuh tempo untuk menghindari pemutusan layanan.
  
  Terima kasih telah menggunakan layanan *RINGNET - Internet Service Provider* 🙏
  
  🔗 Lihat atau unduh invoice Anda di sini:
  ${window.location.origin}/invoices/${data.nomorInvoice}.pdf
  `;
  
      const encodedMessage = encodeURIComponent(message);
      window.open(`https://wa.me/${phone}?text=${encodedMessage}`, "_blank");
    } catch (error) {
      console.error("Gagal membuka WhatsApp:", error);
    }
  };
  