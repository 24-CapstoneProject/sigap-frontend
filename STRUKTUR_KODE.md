# 📁 Struktur Kode SIGAP - Pemisahan Admin & Mahasiswa

## 🎯 Tujuan
Memisahkan kode untuk Admin dan Mahasiswa agar lebih terorganisir, mudah di-maintain, dan scalable.

## 📂 Struktur Folder Baru

```
src/pages/
├── auth/
│   └── LoginPage.jsx                    # Halaman login untuk semua role
├── student/
│   ├── StudentDashboard.jsx             # Dashboard khusus mahasiswa
│   ├── StudentBooking.jsx               # Booking ruang (mahasiswa)
│   ├── StudentLostFound.jsx             # Lost & Found (mahasiswa)
│   └── StudentInventory.jsx             # Akses ditolak (mahasiswa)
├── admin/
│   ├── AdminDashboard.jsx               # Dashboard khusus admin
│   ├── AdminBooking.jsx                 # Manajemen booking (admin)
│   ├── AdminLostFound.jsx               # Moderasi Lost & Found (admin)
│   └── AdminInventory.jsx               # Manajemen inventaris (admin)
├── BookingPage.jsx                      # (DEPRECATED - gunakan versi baru)
├── DashboardPage.jsx                    # (DEPRECATED - gunakan versi baru)
├── InventoryPage.jsx                    # (DEPRECATED - gunakan versi baru)
├── LostFoundPage.jsx                    # (DEPRECATED - gunakan versi baru)
└── LoginPage.jsx                        # (DEPRECATED - pindah ke auth/)
```

## 🔄 Flow Routing di App.jsx

```javascript
// Sebelum: Satu component untuk semua role
switch (activePage) {
  case "dashboard":  return <DashboardPage user={user} />;
  case "booking":    return <BookingPage user={user} />;
  // ... dengan logika if/else di dalam component
}

// Sesudah: Render berdasarkan role user
if (user.role === "mahasiswa") {
  switch (activePage) {
    case "dashboard":  return <StudentDashboard user={user} />;
    case "booking":    return <StudentBooking user={user} />;
  }
} else if (user.role === "admin") {
  switch (activePage) {
    case "dashboard":  return <AdminDashboard user={user} />;
    case "booking":    return <AdminBooking user={user} />;
  }
}
```

## 👥 Perbandingan Halaman per Role

### Dashboard
| Aspek | Mahasiswa | Admin |
|-------|-----------|-------|
| **Konten** | Status ruangan, riwayat booking | Statistik pengelolaan, permohonan tertunda |
| **Warna** | Biru | Ungu |
| **Fitur** | Lihat ruang tersedia | Quick actions ke halaman manajemen |

### Booking
| Aspek | Mahasiswa | Admin |
|-------|-----------|-------|
| **Konten** | Booking pribadi mahasiswa | Semua booking dari semua mahasiswa |
| **Aksi** | Buat booking, batalkan | Setujui/tolak booking |
| **Validasi** | Admin yang setuju | N/A |

### Lost & Found
| Aspek | Mahasiswa | Admin |
|-------|-----------|-------|
| **Konten** | Semua laporan, buat laporan baru | Semua laporan untuk moderasi |
| **Aksi** | Buat laporan, klaim barang | Terima/tolak laporan |

### Inventaris
| Aspek | Mahasiswa | Admin |
|-------|-----------|-------|
| **Konten** | Akses Ditolak | Semua barang, catat peminjaman |
| **Aksi** | Lihat pesan error | Catat peminjaman, catat pengembalian |

## 🎨 Desain Layout

### Sidebar Navigation (Sudah mendukung role filtering)
```javascript
const navItems = [
  { key: "dashboard", label: "Dashboard", icon: ... },
  { key: "booking", label: "Peminjaman Ruang", icon: ... },
  { key: "lostfound", label: "Lost & Found", icon: ... },
  { key: "inventory", label: "Inventaris", icon: ..., adminOnly: true },
];

// Filter otomatis berdasarkan adminOnly property
navItems.filter(item => !item.adminOnly || user.role === "admin")
```

## 📋 Component Hierarchy

```
App.jsx
├── LoginPage (auth/)
├── (jika role === "mahasiswa")
│   ├── StudentDashboard
│   ├── StudentBooking
│   ├── StudentLostFound
│   └── StudentInventory
└── (jika role === "admin")
    ├── AdminDashboard
    ├── AdminBooking
    ├── AdminLostFound
    └── AdminInventory
```

## ✅ Keuntungan Struktur Baru

1. **Clarity** - Jelas terlihat fitur mana untuk siapa
2. **Maintainability** - Perubahan di StudentDashboard tidak mempengaruhi AdminDashboard
3. **Performance** - Hanya component yang relevan yang di-render
4. **Scalability** - Mudah menambah role/fitur baru (e.g., Guest, Moderator)
5. **Type Safety** - Lebih mudah di-typed dengan TypeScript
6. **Testing** - Bisa test admin dan student flows terpisah

## 🚀 Cara Menambah Role Baru (Contoh: Moderator)

```javascript
// 1. Buat folder di pages/moderator/
// 2. Buat component-nya (ModeratorDashboard.jsx, etc)
// 3. Import di App.jsx
// 4. Tambah kondisi di renderPage():

} else if (user.role === "moderator") {
  switch (activePage) {
    case "dashboard":  return <ModeratorDashboard user={user} />;
    // ... halaman lainnya
  }
}

// 5. Update navItems di Sidebar:
{ key: "reports", label: "Laporan", icon: ..., moderatorOnly: true }
```

## 📝 File yang Perlu di-Delete (Setelah memastikan semua berfungsi)

- `src/pages/BookingPage.jsx`
- `src/pages/DashboardPage.jsx`
- `src/pages/InventoryPage.jsx`
- `src/pages/LostFoundPage.jsx`
- `src/pages/LoginPage.jsx` (sudah pindah ke auth/)

## 🔍 Checklist Implementasi

- ✅ Buat folder auth/, admin/, student/
- ✅ Buat LoginPage di auth/
- ✅ Buat Student pages (Dashboard, Booking, LostFound, Inventory)
- ✅ Buat Admin pages (Dashboard, Booking, LostFound, Inventory)
- ✅ Update App.jsx imports dan renderPage()
- ✅ Test navigasi untuk mahasiswa
- ✅ Test navigasi untuk admin
- ⏳ Delete file lama (setelah testing selesai)

## 💡 Tips Maintenance

1. **Ketika menambah fitur baru:**
   - Tambahkan di kedua versi (Student + Admin) jika relevan
   - Atau hanya di salah satu jika role-specific

2. **Ketika mengubah UI component (Button, Modal, dll):**
   - Gunakan shared component dari `components/ui/`
   - Perubahan akan otomatis reflected di kedua versi

3. **Ketika debug:**
   - Gunakan toggle role di Topbar untuk switch role
   - Cek halaman di browser dev tools

---

**Last Updated:** May 18, 2026
**Status:** ✅ Implementasi Selesai - Siap Testing
