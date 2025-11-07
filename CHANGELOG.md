# 📜 Changelog  
Semua perubahan penting pada proyek **Ringnet Invoice System** akan didokumentasikan di sini.  
Format ini mengikuti konvensi [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] - 2025-11-07  
### ✨ Added  
- DashboardPage menampilkan daftar invoice pelanggan dengan:
  - Filter periode, status pembayaran, dan pencarian pelanggan/invoice  
  - Kartu ringkasan total invoice, total lunas, total belum lunas, dan total tagihan  
  - Tombol aksi “Lihat” dan “Cetak” per baris data  
- CreateInvoicePage dengan:
  - Form input pelanggan, alamat, paket, tanggal, status pembayaran  
  - Preview invoice otomatis setelah submit  
  - Fitur cetak PDF dan kirim ke WhatsApp pelanggan  
- Sidebar baru dengan:
  - Desain gradasi biru `#4facfe → #0052d4`  
  - Logo **Ringnet** (background putih + shadow)  
  - Efek animasi slide-in dan hover halus  
- Integrasi backend Express.js:
  - Endpoint CRUD invoice (`/api/invoices`)  
  - Struktur REST API dengan `controllers`, `routes`, `models`  
- File README backend dengan panduan instalasi dan konfigurasi `.env`  

---

### 🛠 Fixed  
- Bug pada form `InvoiceForm` yang menampilkan pesan “Gagal menyimpan invoice” walau berhasil disimpan  
- Error `onPreview is not a function` ketika berpindah ke halaman preview  
- Warna sidebar sebelumnya terlalu terang dan bentrok dengan logo  
- Perbaikan struktur mapping field dari backend ke frontend (`nomor_invoice`, `nama_pelanggan`, `status_pembayaran`, dll.)

---

### 🔁 Changed  
- Struktur routing utama React Router:
  - `/` → Dashboard utama  
  - `/invoices/new` → Halaman pembuatan invoice baru  
  - `/invoices/:id.pdf` → Preview / cetak PDF invoice  
- Layout komponen utama disusun ulang untuk konsistensi tema  
- Peningkatan transisi UI dan animasi loading pada tabel Dashboard  

---

### 📦 Project Structure (Frontend)

src/
├─ components/
│ ├─ Sidebar.jsx
│ ├─ InvoiceForm.jsx
│ ├─ InvoiceTable.jsx
│ ├─ InvoicePreview.jsx
│ └─ WhatsAppDialog.jsx
├─ pages/
│ ├─ DashboardPage.jsx
│ ├─ CreateInvoicePage.jsx
│ └─ SettingsPage.jsx
├─ services/
│ └─ invoiceService.js
├─ utils/
│ ├─ pdfGenerator.js
│ └─ sendWhatsApp.js
└─ assets/
└─ logoringnet.png


---

### 🧩 Developer Notes  
- Gunakan `.env` untuk mengatur `REACT_APP_API_URL` sesuai environment (`http://localhost:2002/api` untuk local).  
- Jalankan backend dan frontend bersamaan untuk menghindari CORS error.  
- Pastikan port tidak bentrok (`3000` untuk frontend, `2002` untuk backend).  

---

### 👨‍💻 Author  
**Zainal Salamun (Bang Jay)**  
Fullstack Developer — Flutter | Node.js | React | macOS  
📍 Yogyakarta, Indonesia  

---

## [0.1.0] - 2025-11-05  
### Initial Setup  
- Inisialisasi project backend (Express + PostgreSQL)  
- Setup frontend React + Material UI  
- Struktur folder dan konfigurasi dasar environment  