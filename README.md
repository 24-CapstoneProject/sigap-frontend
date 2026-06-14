# 🎉 SIGAP - Sistem Informasi Gedung, Aset, & Peminjaman (Gedung SG Untad)

Sistem Informasi Gedung, Aset, & Peminjaman (**SIGAP**) adalah platform portal terpadu untuk mading jadwal perkuliahan, pengajuan peminjaman ruangan kelas/diskusi, peminjaman inventaris alat penunjang belajar (infokus/kabel/dll.), serta pelaporan barang hilang dan temuan (Lost & Found) di Gedung SG Fakultas Teknik Universitas Tadulako.

Website ini mengintegrasikan **React 19 + Vite 8 (Tailwind CSS v4)** di sisi Frontend dengan **Node.js + Express.js + MySQL** di sisi Backend.

---

## 🚀 Fitur Utama (Features)

### 👥 Peran Pengguna (User Roles)
Sistem memiliki dua level hak akses utama yang divalidasi ketat secara relasional:
1. **Administrator (Admin)**: 
   - Mengelola akun pengguna (mahasiswa).
   - Meninjau, menyetujui, atau menolak permohonan booking ruangan.
   - Memproses pengajuan pindah jadwal (reschedule) mahasiswa dengan visual komparasi jadwal lama vs usulan baru.
   - Melakukan bulk-import jadwal kuliah semesteran berbasis file Excel/CSV dengan sistem validasi bentrok otomatis.
   - Mengelola inventaris aset (peminjaman & pengembalian dengan pencatatan kondisi barang, jaminan KTP, serta penentuan jam kembali WITA).
   - Melakukan ekspor data log peminjaman, rekap kondisi, dan stok barang ke format Excel multi-sheet.
   - Memoderasi mading Lost & Found (meninjau laporan pending, menyetujui/menolak bukti klaim kepemilikan barang temuan mahasiswa).
2. **Mahasiswa (Student)**:
   - Melihat mading jadwal visual ruangan Gedung SG secara real-time.
   - Mengajukan booking ruangan dengan mengunggah berkas pendukung (PDF/Gambar) dan opsi pinjam proyektor otomatis.
   - Mengajukan pemindahan jadwal (reschedule) secara interaktif langsung dari kalender visual.
   - Melaporkan kehilangan/temuan barang di mading Lost & Found (lengkap dengan upload foto barang dan pengisian detail area).
   - Mengajukan klaim kepemilikan atas barang temuan disertai penulisan pesan deskripsi bukti kepemilikan.
   - Mengakses Pusat Bantuan (Help Center) untuk melihat FAQ interaktif dan narahubung admin via WhatsApp/Email.
   - Mengubah kata sandi mandiri dan mengaktifkan mode tema (Light/Dark/System Default) dengan kontras tinggi.

---

## 📚 Panduan Dokumentasi (Documentation Index)

Berikut adalah daftar berkas panduan lengkap yang tersedia di repositori ini untuk mempermudah pengerjaan tim:

| Berkas Panduan | Kegunaan | Waktu Baca | Status |
|----------------|----------|------------|--------|
| **[README.md](README.md)** | Panduan Utama Aplikasi (Frontend + Backend) | 10 Menit | 👈 ANDA DI SINI |
| **[QUICKSTART.md](QUICKSTART.md)** | Panduan Instalasi Instan & Pengaktifan DB | 5 Menit | ⏱️ MULAI SEGERA |
| **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** | Referensi Lengkap 42 Endpoints API | 30 Menit | 📚 DOKUMEN API |
| **[FRONTEND_BACKEND_INTEGRATION.md](FRONTEND_BACKEND_INTEGRATION.md)** | Panduan Integrasi React & Express API | 20 Menit | 🔗 INTEGRASI |
| **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** | Kumpulan Solusi Mengatasi Masalah & Error | 15 Menit | 🐛 SOLUSI ERROR |
| **[STRUKTUR_KODE.md](STRUKTUR_KODE.md)** | Penjelasan Skema Folder dan Aliran Data | 10 Menit | 📁 STRUKTUR KODE |
| **[IMPLEMENTATION_CHECKLIST.md](IMPLEMENTATION_CHECKLIST.md)** | Checklist Pencapaian Milestone Fitur | - | ✅ PROGRESS |
| **[README_BACKEND.md](README_BACKEND.md)** | Panduan Spesifik Konfigurasi Sisi Backend | 15 Menit | ⚙️ BACKEND ONLY |

---

## ⚙️ Langkah Instalasi & Menjalankan Aplikasi

### 1️⃣ Prasyarat (Prerequisites)
Sebelum memulai, pastikan perangkat Anda telah terpasang:
- **Node.js** (versi 18 ke atas)
- **MySQL Database Server**
- **Git**

### 2️⃣ Pengaktifan Database MySQL
Buat database baru bernama `sigap` (atau sesuai konfigurasi `.env`), lalu impor skema tabel dan data awal dengan menjalankan perintah berikut melalui terminal/CMD:
```bash
# Impor Skema Tabel
mysql -u root -p < backend/database/schema.sql

# Impor Data Awal (Seeder)
mysql -u root -p < backend/database/seed.sql
```

### 3️⃣ Konfigurasi & Menjalankan Backend (Server)
1. Buka folder backend:
   ```bash
   cd backend
   ```
2. Pasang dependensi Node.js:
   ```bash
   npm install
   ```
3. Salin file contoh environment:
   ```bash
   cp .env.example .env
   ```
   *Buka file `.env` baru tersebut dan sesuaikan nilai parameter `DB_PASSWORD`, `DB_USER` (biasanya `root`), `DB_NAME` (`sigap`), serta `JWT_SECRET` dengan preferensi database lokal Anda.*
4. Jalankan server backend dalam mode pengembangan:
   ```bash
   npm run dev
   ```
   *Server backend akan aktif pada `http://localhost:5000`.*

### 4️⃣ Konfigurasi & Menjalankan Frontend (Client)
1. Buka terminal baru di folder utama proyek (root), lalu pasang dependensi frontend:
   ```bash
   npm install
   ```
2. Jalankan aplikasi frontend menggunakan bundler Vite:
   ```bash
   npm run dev
   ```
   *Aplikasi frontend akan aktif pada URL lokal yang tertera di terminal (biasanya `http://localhost:5173`).*

---

## 🔐 Kredensial Uji Coba (Test Credentials)

Gunakan akun berikut untuk menguji coba fungsionalitas aplikasi di halaman Login:

| Peran (Role) | Username / NIM | Kata Sandi (Password) | Tujuan Pengujian |
|--------------|----------------|-----------------------|------------------|
| **Admin** | `ADMIN001` | `admin123` | Mengakses dashboard admin, mengelola ruangan, inventaris, memproses persetujuan booking & klaim barang hilang. |
| **Mahasiswa** | `F55123064` | `123456` | Mengakses dashboard mahasiswa, mengajukan booking, melakukan klaim lost-found, mengubah password. |
| **Mahasiswa** | `F52123083` | `123456` | Menguji coba bentrok jadwal antarpengguna mahasiswa. |
| **Mahasiswa** | `F52123084` | `123456` | Menguji coba pengajuan reschedule beruntun. |

---

## 📁 Struktur Folder Proyek (Project Directory Tree)

Struktur repositori SIGAP telah dirapikan agar terstruktur dan mudah diidentifikasi:

```
sigap-capstone24/
├── backend/                       ← SISI BACKEND (Express.js)
│   ├── config/                    ← Konfigurasi koneksi MySQL Pool
│   ├── controllers/               ← Modul Logika Bisnis (peminjaman, inventaris, klaim)
│   ├── database/                  ← Skema tabel SQL (schema.sql & seed.sql)
│   ├── middleware/                ← Middleware JWT Auth, Role Validator, Upload (Multer)
│   ├── routes/                    ← Definisi route API Express (42 endpoints)
│   ├── utils/                     ← Helper hash password & pembuatan token
│   ├── uploads/                   ← Berkas unggahan bukti foto & dokumen dari mahasiswa
│   ├── server.js                  ← Entrypoint utama server
│   └── package.json               ← Dependensi Backend
│
├── src/                           ← SISI FRONTEND (React + Vite)
│   ├── assets/                    ← Asset gambar & ikon statis
│   ├── components/                
│   │   ├── layout/                ← Komponen Sidebar & Topbar bersama
│   │   ├── ui/                    ← Komponen UI Reusable (Button, Input, Modal, Badge)
│   │   └── VisualCalendar.jsx     ← Kalender visual jadwal ruangan utama
│   ├── data/                      
│   │   └── mockData.js            ← Penyimpanan data lokal cadangan (mock)
│   ├── pages/                     
│   │   ├── admin/                 ← Halaman Khusus Administrator (Dashboard, Booking, Inventory, Users)
│   │   ├── auth/                  ← Halaman Autentikasi (LoginPage terpadu)
│   │   ├── student/               ← Halaman Khusus Mahasiswa (Dashboard, Booking, Inventory, LostFound)
│   │   └── PublicCalendarPage.jsx ← Portal Kalender Publik untuk pengguna non-login
│   ├── utils/                     
│   │   ├── api.js                 ← Konfigurasi Axios & helper fetch terpusat
│   │   └── mappers.js             ← Helper pemetaan data API & penentuan status selesai
│   ├── App.jsx                    ← Routing visual & distribusi render halaman
│   ├── index.css                  ← Definisi tema (Light/Dark mode) & styling global
│   └── main.jsx                   ← Inisialisasi React DOM
│
├── index.html                     ← Template HTML utama Vite
├── package.json                   ← Dependensi Frontend
├── vite.config.js                 ← Konfigurasi Vite & Compiler Tailwind v4
└── README.md                      ← Panduan Utama Proyek ini
```

---

## 🛠️ Stack Teknologi (Tech Stack)

### Sisi Frontend (Client)
*   **React 19** - Library UI deklaratif modern berbasis komponen.
*   **Vite 8** - Bundler frontend ultra-cepat.
*   **Tailwind CSS v4** - Desain UI premium, responsif, dan dukungan dark-mode berbasis CSS custom properties.
*   **Lucide React** - Ikon outlines SVG modern.

### Sisi Backend (Server) & Database
*   **Node.js** & **Express.js** - Lingkungan runtime & framework server RESTful API.
*   **MySQL Database** - Penyimpanan data relasional terstruktur dengan dukungan views & performance index.
*   **JSON Web Tokens (JWT)** - Mekanisme autentikasi sesi terproteksi.
*   **Bcrypt.js** - Pengaman algoritma hash satu arah untuk sandi pengguna.
*   **Multer** - Penangan unggahan file dokumen pendukung peminjaman ruangan dan foto Lost & Found.
*   **XLSX (SheetJS)** - Pemroses berkas Excel/CSV untuk bulk-import jadwal kuliah semesteran.

---

## 🚀 Panduan Deployment

*   **Frontend (Vite)**: Sangat direkomendasikan dideploy di **Vercel** atau **Netlify**. Sistem build otomatis mendeteksi konfigurasi `vite.config.js` dan memproses build ke direktori `dist/` untuk segera diterbitkan ke publik.
*   **Backend (Express)**: Dapat dideploy di **Railway**, **Render**, **Heroku**, maupun VPS mandiri. Pastikan variabel env pada tab Dashboard Deployment diatur sesuai dengan koneksi database MySQL produksi Anda.

---

**SIGAP Team · Fakultas Teknik Universitas Tadulako**  
*Tahun Pengerjaan: 2026*  
*Version: 1.0.0 (Stable Production Ready)*  
*Status Fitur: ✅ 100% Terintegrasi & Siap Dipublikasikan.*
