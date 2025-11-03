# 🧾 Ringnet Invoice Web App

Aplikasi web sederhana untuk membuat, menampilkan, dan mencetak **Invoice pelanggan Ringnet** (ISP - Internet Service Provider).  
Dibuat menggunakan **React.js** dan menghasilkan file **PDF invoice profesional** yang siap dikirim ke pelanggan via WhatsApp.

---

## 🚀 Fitur Utama

✅ **Input Data Pelanggan Manual**
- Nama pelanggan, alamat, layanan, periode, dan harga paket  
- Validasi otomatis: wajib isi nama & harga paket  

✅ **Preview Invoice**
- Tampilkan pratinjau sebelum cetak  
- Status pembayaran: *Belum Lunas* / *Lunas*  

✅ **Cetak PDF Profesional**
- Generate file PDF dengan logo Ringnet  
- QR Code otomatis (isi: nama, nomor invoice, total tagihan)  
- Stempel “LUNAS” otomatis bila status pembayaran = Lunas  

✅ **Kirim ke WhatsApp (Link Ready)**
- Otomatis generate pesan tagihan dan link PDF  

✅ **Tampilan Modern & Responsive**
- UI bersih dengan form validasi interaktif  
- Dialog validasi modern (bukan alert bawaan browser)  
- Highlight + animasi shake di field kosong  
- Fokus otomatis ke field error pertama  

---

## 🧩 **Tech Stack**

| Bagian | Teknologi |
|--------|------------|
| Frontend | React.js (Vite / CRA) |
| Styling | CSS3 + Flexbox |
| PDF Generator | jsPDF + html2canvas |
| QR Code | qrcode |
| Date Utility | dayjs |
| Routing | react-router-dom |

---

## 🛠️ **Instalasi & Menjalankan Proyek**

### 1️⃣ Clone Repository
```bash
git clone https://github.com/yourusername/invoice-web.git
cd invoice-web

2️⃣ Install Dependencies
npm install

3️⃣ Jalankan Aplikasi
npm start


Aplikasi akan berjalan di:
👉 http://localhost:3000

🧾 Struktur Folder
src/
│
├── assets/
│   └── logoringnet.png
│
├── components/
│   ├── InvoiceForm.jsx        # Form input data pelanggan
│   ├── InvoicePreview.jsx     # Pratinjau invoice sebelum cetak
│   └── AlertDialog.jsx        # Modal dialog validasi form
│
├── pages/
│   ├── HomePage.jsx           # Halaman utama
│   └── InvoiceViewer.jsx      # Viewer PDF via /invoices/:id.pdf
│
├── utils/
│   ├── pdfGenerator.js        # Generator PDF dengan jsPDF + html2canvas
│   └── sendWhatsApp.js        # Utility kirim pesan WA (template)
│
├── styles.css                 # Styling utama aplikasi
└── index.js                   # Routing dan inisialisasi React

🔗 Routing Utama
Route	Fungsi
/	Halaman utama untuk input & preview invoice
/invoices/:invoiceId.pdf	Halaman view-only PDF invoice (preview di browser)

Contoh:
👉 http://localhost:3000/invoices/INV-1762147835889.pdf

📤 Build & Deploy

Untuk membuat versi produksi:

npm run build


Folder hasil build akan berada di /build dan bisa langsung di-deploy ke:

Vercel

Netlify

GitHub Pages

Nginx / Apache server

🧠 Konfigurasi Environment

Buat file .env di root project:

REACT_APP_COMPANY_NAME=Ringnet
REACT_APP_COMPANY_ADDRESS="Jl. Telekomunikasi No. 45, Yogyakarta"
REACT_APP_COMPANY_PHONE="(0274) 123-456"


Variabel ini digunakan otomatis di header invoice.

🧑‍💻 Dibuat Oleh

Zainal Salamun (Bang Jay)
💼 Senior Mobile & Web Developer
🌐 https://github.com/yourusername

📧 ringnet.support@gmail.com

💙 Lisensi

Proyek ini dibuat untuk kebutuhan internal Ringnet ISP.
Distribusi atau modifikasi untuk penggunaan komersial memerlukan izin tertulis.

📸 Tampilan Aplikasi
Form Input Invoice	Preview & Cetak PDF

	
🔥 Catatan Developer

Proyek ini masih tahap awal — mendukung input manual.
Tahap berikutnya: integrasi API pelanggan & otomatisasi penagihan via WhatsApp Cloud API.
