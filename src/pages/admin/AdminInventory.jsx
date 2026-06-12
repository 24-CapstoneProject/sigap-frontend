import { useState, useEffect } from "react";
import { Modal, Toast } from "../../components/ui/index.jsx";
import { apiFetch } from "../../utils/api.js";
import { rooms } from "../../data/mockData.js";

function StatCard({ value, icon, color, badgeText, sublabel }) {
  const colorSchemes = {
    blue: {
      bg: "bg-[#eff6ff] dark:bg-blue-950/20 text-[#2563eb] dark:text-blue-400",
      badge: "bg-[#eff6ff] dark:bg-blue-950/30 text-[#2563eb] dark:text-blue-400 border border-blue-100 dark:border-blue-900/50",
    },
    emerald: {
      bg: "bg-[#f0fdf4] dark:bg-emerald-950/20 text-[#16a34a] dark:text-emerald-400",
      badge: "bg-[#f0fdf4] dark:bg-emerald-950/30 text-[#16a34a] dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50",
    },
    amber: {
      bg: "bg-[#fffbeb] dark:bg-amber-950/20 text-[#d97706] dark:text-amber-450",
      badge: "bg-[#fffbeb] dark:bg-amber-950/30 text-[#d97706] dark:text-amber-400 border border-amber-100 dark:border-amber-900/50",
    },
    red: {
      bg: "bg-[#fef2f2] dark:bg-red-950/20 text-[#dc2626] dark:text-red-400",
      badge: "bg-[#fef2f2] dark:bg-red-950/30 text-[#dc2626] dark:text-red-400 border border-red-100 dark:border-red-900/50",
    }
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-150 dark:border-slate-700/80 shadow-[0_2px_8px_-3px_rgba(0,0,0,0.05)] hover:shadow-md transition-all duration-300 flex flex-col justify-between h-40">
      {/* Top row: Icon & Badge */}
      <div className="flex items-center justify-between">
        <div className={`w-12 h-12 rounded-xl ${scheme.bg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full ${scheme.badge}`}>
          {badgeText}
        </span>
      </div>
      
      {/* Bottom row: Value & Sublabel */}
      <div className="mt-3">
        <p className="text-3xl font-extrabold text-[#0f172a] dark:text-white tracking-tight">{value}</p>
        <p className="text-[11px] font-semibold text-gray-400 dark:text-gray-400 mt-1">{sublabel}</p>
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editTab, setEditTab] = useState("peminjaman");

  // Table Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    quantity: 1,
    category: "Elektronik",
    location: "Ruang Penyimpanan Gedung SG",
  });

  // Return States
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returningLoanId, setReturningLoanId] = useState(null);
  const [returnCondition, setReturnCondition] = useState("Baik");
  const [returnTime, setReturnTime] = useState("");
  const [isSubmittingReturn, setIsSubmittingReturn] = useState(false);
  const [borrowerForm, setBorrowerForm] = useState({
    nama: "",
    nim: "",
    prodi: "",
    noHp: "",
    ktpVerified: false,
    jamPinjam: "",
    estimasiKembali: "",
    dosen: "",
    mataKuliah: "",
    ruangan: "",
  });

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getWitaTimeStr = () => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Makassar',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    return formatter.format(now).replace('.', ':');
  };

  const loadInventory = async () => {
    try {
      const response = await apiFetch("/api/inventory");
      if (response.ok) {
        const data = await response.json();
        setItems(data.items || []);
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal memuat inventaris", "error");
      }
    } catch (err) {
      console.error("Load inventory error:", err);
      showToast("Kesalahan koneksi saat memuat inventaris", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const counts = {
    total: items.length,
    available: items.filter(i => i.status === "available").length,
    borrowed: items.filter(i => i.status === "borrowed").length,
    broken: items.filter(i => i.status === "broken").length,
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditTab(item.status === "borrowed" ? "peminjaman" : "edit");
    setBorrowerForm({
      nama: item.borrowedBy || "",
      nim: item.nim || "",
      prodi: item.prodi || "",
      noHp: item.phone || "",
      ktpVerified: item.ktpVerified || false,
      jamPinjam: item.time || "",
      estimasiKembali: item.estimasiKembali || "",
      dosen: item.dosen || "",
      mataKuliah: item.mataKuliah || "",
      ruangan: item.ruangan || "",
    });
    setShowEdit(true);
  };

  const handleSave = async () => {
    if (editTab === "edit") {
      try {
        const response = await apiFetch(`/api/inventory/${selectedItem.id}`, {
          method: "PUT",
          body: JSON.stringify({
            name: selectedItem.name,
            description: selectedItem.description || "",
            quantity: parseInt(selectedItem.quantity, 10) || 1,
            category: selectedItem.category || "Elektronik",
            location: selectedItem.location || "Ruang Penyimpanan Gedung SG",
            status: selectedItem.status,
          }),
        });

        if (response.ok) {
          showToast("Data barang berhasil diperbarui");
          setShowEdit(false);
          await loadInventory();
        } else {
          const error = await response.json();
          showToast(error.error || "Gagal memperbarui barang", "error");
        }
      } catch (err) {
        console.error("Save inventory item error:", err);
        showToast("Terjadi kesalahan koneksi", "error");
      }
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await apiFetch("/api/inventory", {
        method: "POST",
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || "",
          quantity: parseInt(formData.quantity, 10) || 1,
          category: formData.category || "Elektronik",
          location: formData.location || "Ruang Penyimpanan Gedung SG",
        }),
      });

      if (response.ok) {
        showToast("Barang berhasil ditambahkan");
        setShowAdd(false);
        setFormData({
          name: "",
          description: "",
          quantity: 1,
          category: "Elektronik",
          location: "Ruang Penyimpanan Gedung SG",
        });
        await loadInventory();
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal menambahkan barang", "error");
      }
    } catch (err) {
      console.error("Add item error:", err);
      showToast("Terjadi kesalahan koneksi", "error");
    }
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus barang ini dari inventaris?")) {
      try {
        const response = await apiFetch(`/api/inventory/${id}`, {
          method: "DELETE",
        });

        if (response.ok) {
          showToast("Barang berhasil dihapus dari inventaris", "info");
          await loadInventory();
        } else {
          const error = await response.json();
          showToast(error.error || "Gagal menghapus barang", "error");
        }
      } catch (err) {
        console.error("Delete item error:", err);
        showToast("Terjadi kesalahan koneksi saat menghapus", "error");
      }
    }
  };

  const handleReturnItem = async () => {
    if (!returningLoanId) return;

    if (returnTime) {
      const timeRegex = /^([0-1]?[0-9]|2[0-3])[:.][0-5][0-9]$/;
      if (!timeRegex.test(returnTime)) {
        showToast("Format jam pengembalian tidak valid! Gunakan format HH:MM (contoh: 15:30)", "error");
        return;
      }
    }

    setIsSubmittingReturn(true);
    try {
      const response = await apiFetch(`/api/inventory/${returningLoanId}/return`, {
        method: "POST",
        body: JSON.stringify({ condition: returnCondition, returnTime }),
      });

      if (response.ok) {
        showToast("✓ Barang berhasil dikembalikan dan status diperbarui.");
        setShowReturnModal(false);
        setReturningLoanId(null);
        setReturnTime("");
        await loadInventory();
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal memproses pengembalian", "error");
      }
    } catch (err) {
      console.error("Return item error:", err);
      showToast("Terjadi kesalahan koneksi", "error");
    } finally {
      setIsSubmittingReturn(false);
    }
  };

  const handleExportExcel = async () => {
    try {
      showToast("⏳ Menyiapkan unduhan laporan...", "info");
      const response = await apiFetch("/api/inventory/export-excel");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan_Inventaris_SIGAP_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast("✓ Laporan Excel berhasil diunduh");
      } else {
        showToast("Gagal mengunduh laporan Excel", "error");
      }
    } catch (err) {
      console.error("Export Excel error:", err);
      showToast("Kesalahan koneksi saat mengunduh", "error");
    }
  };

  const getItemIcon = (name, category) => {
    const n = (name || "").toLowerCase();
    const c = (category || "").toLowerCase();
    if (n.includes("proyektor") || n.includes("infokus") || c.includes("proyektor") || c.includes("infokus")) {
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M23 7l-7 5 7 5V7z" />
          <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
        </svg>
      );
    }
    if (n.includes("kabel") || n.includes("hdmi") || c.includes("kabel") || c.includes("hdmi")) {
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v8M19 12v-2a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v2a4 4 0 0 0 4 4h6a4 4 0 0 0 4-4zM12 18v4" />
        </svg>
      );
    }
    if (n.includes("presenter") || n.includes("clicker") || c.includes("presenter") || c.includes("clicker")) {
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="20" rx="7" />
          <path d="M12 6v4" />
        </svg>
      );
    }
    if (n.includes("monitor") || n.includes("screen") || c.includes("monitor")) {
      return (
        <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      );
    }
    return (
      <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
        <line x1="12" y1="22.08" x2="12" y2="12" />
      </svg>
    );
  };

  // Pagination Logic
  const totalPages = Math.ceil(items.length / itemsPerPage) || 1;
  const paginatedItems = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          value={counts.total} 
          icon={
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3L7.5 11h9L12 3z" />
              <rect x="5" y="14" width="5" height="5" rx="1" />
              <circle cx="17" cy="16.5" r="2.5" />
            </svg>
          } 
          color="blue" 
          badgeText="Total Items" 
          sublabel="Total keseluruhan infokus" 
        />
        <StatCard 
          value={counts.available} 
          icon={
            <svg className="w-6 h-6 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          } 
          color="emerald" 
          badgeText="Tersedia" 
          sublabel="Total infokus tersedia" 
        />
        <StatCard 
          value={counts.borrowed} 
          icon={
            <svg className="w-6 h-6 text-amber-600 dark:text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M9 15l6-6" />
              <path d="M11 9h4v4" />
            </svg>
          } 
          color="amber" 
          badgeText="Dipinjam" 
          sublabel="Total infokus yang dipinjam" 
        />
        <StatCard 
          value={counts.broken} 
          icon={
            <svg className="w-6 h-6 text-red-650 dark:text-red-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          } 
          color="red" 
          badgeText="Rusak" 
          sublabel="Total Infokus Rusak" 
        />
      </div>

      {/* Main Table Container Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-150 dark:border-slate-700/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.05)] overflow-hidden">
        
        {/* Table Header Section */}
        <div className="p-6 border-b border-gray-100 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Daftar Peminjaman Inventaris
            </h2>
            <p className="text-xs font-semibold text-gray-400 dark:text-gray-400 mt-1">
              Tracking barang & KTP jaminan mahasiswa
            </p>
          </div>

          <div className="flex gap-3">
            <button 
              onClick={handleExportExcel}
              className="flex items-center gap-2 border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-650 dark:text-gray-300 px-4 py-2 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-2xs"
            >
              <svg className="w-4 h-4 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Unduh Excel
            </button>
            <button 
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 bg-[#0047d4] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#003cb3] transition-all cursor-pointer shadow-[0_2px_8px_-1px_rgba(0,71,212,0.15)] hover:shadow-md"
            >
              <span className="text-sm font-light">+</span> Tambah Barang
            </button>
          </div>
        </div>

        {/* Table Section */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#f8fafc] dark:bg-slate-700/50 text-[#64748b] dark:text-gray-450 text-[11px] uppercase tracking-wider font-extrabold border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4">Item ID</th>
                <th className="px-6 py-4">Barang</th>
                <th className="px-6 py-4">Peminjam</th>
                <th className="px-6 py-4">Jam</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs">
                    Memuat data inventaris...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-xs">
                    Belum ada data barang terdaftar.
                  </td>
                </tr>
              ) : (
                paginatedItems.map((item) => {
                  const displayId = item.id.startsWith("#") ? item.id : `#${item.id}`;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-700/20 transition-colors">
                      {/* Item ID */}
                      <td className="px-6 py-5 whitespace-nowrap text-xs font-medium text-slate-400 dark:text-gray-400">
                        {displayId}
                      </td>

                      {/* Barang */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#eff6ff] dark:bg-blue-900/30 rounded-lg flex items-center justify-center shrink-0 shadow-2xs select-none">
                            {getItemIcon(item.name, item.category)}
                          </div>
                          <p className="font-bold text-[#0f172a] dark:text-white text-xs">{item.name}</p>
                        </div>
                      </td>

                      {/* Peminjam */}
                      <td className="px-6 py-5 whitespace-nowrap text-[13px] text-slate-600 dark:text-gray-300 font-medium">
                        {item.borrowedBy || <span className="text-gray-300 dark:text-gray-600">-</span>}
                      </td>

                      {/* Jam */}
                      <td className="px-6 py-5 whitespace-nowrap text-[13px] text-slate-500 dark:text-gray-400 font-medium">
                        {item.time ? (item.status === 'borrowed' ? item.time : `${item.time} -`) : <span className="text-gray-300 dark:text-gray-600">-</span>}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-5 whitespace-nowrap">
                        <span className={`inline-block text-[11px] font-bold px-3 py-1.5 rounded-lg border-0 tracking-wide
                          ${item.status === "available" && "bg-[#e8fdf0] dark:bg-emerald-950/20 text-[#16a34a] dark:text-emerald-400"}
                          ${item.status === "borrowed" && "bg-[#fffbeb] dark:bg-amber-950/20 text-[#d97706] dark:text-amber-450"}
                          ${item.status === "broken" && "bg-[#fef2f2] dark:bg-red-950/20 text-[#dc2626] dark:text-red-400"}
                        `}>
                          {item.status === "available" && "Tersedia"}
                          {item.status === "borrowed" && "Dipinjam"}
                          {item.status === "broken" && "Rusak"}
                        </span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-5 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {item.status === "borrowed" && (
                            <button 
                              onClick={() => {
                                setReturningLoanId(item.loanId);
                                setReturnCondition("Baik");
                                setReturnTime(getWitaTimeStr());
                                setShowReturnModal(true);
                              }}
                              className="text-emerald-600 hover:text-emerald-800 p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-all cursor-pointer"
                              title="Kembalikan Barang"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 14L4 9l5-5" />
                                <path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11" />
                              </svg>
                            </button>
                          )}
                          <button 
                            onClick={() => openEdit(item)}
                            className="text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-slate-500 hover:text-red-650 dark:text-slate-400 dark:hover:text-red-400 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all cursor-pointer" 
                            title="Hapus"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Pagination Footer */}
        <div className="p-4 border-t border-gray-150 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 bg-gray-50/20 dark:bg-slate-800/50 select-none">
          {/* Number buttons on the left */}
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-650 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-750 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              const isActive = currentPage === pageNum;
              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs transition-all border ${
                    isActive 
                      ? 'bg-[#0047d4] text-white border-[#0047d4] shadow-sm' 
                      : 'text-gray-600 dark:text-slate-300 border-gray-200 dark:border-slate-650 hover:bg-gray-50 dark:hover:bg-slate-750 cursor-pointer'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="w-8 h-8 rounded-lg flex items-center justify-center border border-gray-200 dark:border-slate-650 text-gray-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-750 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Jump to page on the right */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-gray-455 dark:text-gray-400">Go to page:</span>
            <input
              type="number"
              min="1"
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const p = parseInt(e.target.value, 10);
                if (p >= 1 && p <= totalPages) {
                  setCurrentPage(p);
                }
              }}
              className="w-12 h-8 text-center border border-gray-200 dark:border-slate-650 rounded-lg text-xs font-bold focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* MODAL EDIT */}
      {showEdit && (
        <Modal
          isOpen={showEdit}
          onClose={() => setShowEdit(false)}
          title=""
        >
          <div className="space-y-6 -mx-8 -my-6">
            
            {/* TABS HEADER */}
            <div className="flex items-center justify-center px-8 pt-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex gap-8">
                <button
                  onClick={() => setEditTab("edit")}
                  className={`pb-4 font-semibold transition-all ${
                    editTab === "edit"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setEditTab("peminjaman")}
                  className={`pb-4 font-semibold transition-all ${
                    editTab === "peminjaman"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Peminjaman
                </button>
              </div>
            </div>

            {/* CONTENT */}
            <div className="px-8 pb-8">
              {editTab === "edit" ? (
                // EDIT TAB
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">📝 Edit Barang</h3>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">ID Asset</label>
                    <input
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-white"
                      value={selectedItem.serialNumber}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Nama Barang</label>
                    <input
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      value={selectedItem.name}
                      onChange={(e) =>
                        setSelectedItem({ ...selectedItem, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Status</label>
                    <select
                      className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                      value={selectedItem.status}
                      onChange={(e) =>
                        setSelectedItem({ ...selectedItem, status: e.target.value })
                      }
                    >
                      <option value="available">✓ Tersedia</option>
                      <option value="borrowed">🚚 Dipinjam</option>
                      <option value="broken">⚠️ Rusak</option>
                    </select>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-slate-700 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 border border-gray-300 dark:border-slate-650 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-xs"
                      onClick={() => setShowEdit(false)}
                    >
                      Batal
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-xs"
                      onClick={handleSave}
                    >
                      💾 Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                // PEMINJAMAN TAB
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-lg">👤</span>
                    <h3 className="text-sm font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Detail Peminjaman Otomatis</h3>
                  </div>

                  {selectedItem.status === "borrowed" ? (
                    <div className="space-y-4">
                      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 rounded-2xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Peminjam</span>
                            <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedItem.borrowedBy || "-"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">NIM</span>
                            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">{selectedItem.nim || "-"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Program Studi</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.prodi || "-"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">No HP / Kontak</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.phone || "-"}</p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 dark:bg-slate-900/20 border border-gray-150 dark:border-slate-700 rounded-2xl p-4 space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Mata Kuliah / Kegiatan</span>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedItem.mataKuliah || "-"}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Dosen Pengampu</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">{selectedItem.dosen || "-"}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Lokasi Penggunaan</span>
                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                              {selectedItem.ruangan ? `Ruang ${selectedItem.ruangan}` : "-"}
                            </p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Waktu Pinjam</span>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {selectedItem.time || "-"} {selectedItem.estimasiKembali ? ` s/d ${selectedItem.estimasiKembali}` : ""}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-100 dark:border-slate-700 flex items-center gap-2">
                          <span className="text-xs">🔐</span>
                          <span className="text-xs text-gray-500 dark:text-gray-450 font-semibold">
                            Jaminan KTP Mahasiswa: <strong className="text-emerald-600 dark:text-emerald-450 font-bold">Terverifikasi (Ditahan Otomatis)</strong>
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-250 dark:border-slate-750 flex justify-end gap-2">
                        <button
                          className="px-5 py-2.5 bg-gray-100 hover:bg-gray-250 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl transition-all font-semibold text-xs cursor-pointer"
                          onClick={() => setShowEdit(false)}
                        >
                          Tutup
                        </button>
                        <button
                          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl transition-all font-semibold text-xs cursor-pointer"
                          onClick={() => {
                            setShowEdit(false);
                            setReturningLoanId(selectedItem.loanId);
                            setReturnCondition("Baik");
                            setReturnTime(getWitaTimeStr());
                            setShowReturnModal(true);
                          }}
                        >
                          ↩️ Kembalikan Barang
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="text-center py-8 bg-gray-50 dark:bg-slate-900/10 rounded-2xl border border-dashed border-gray-200 dark:border-slate-750 p-6">
                        <span className="text-4xl block mb-2">✅</span>
                        <p className="font-semibold text-gray-700 dark:text-gray-350 text-sm">Barang Tersedia di Penyimpanan</p>
                        <p className="text-xs text-gray-400 mt-1.5 max-w-xs mx-auto leading-relaxed">
                          Barang tersedia di penyimpanan dan siap dipinjamkan secara otomatis melalui persetujuan permohonan ruangan mahasiswa.
                        </p>
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-250 dark:border-slate-750 flex justify-end">
                        <button
                          className="px-5 py-2.5 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 transition-all font-semibold text-xs cursor-pointer"
                          onClick={() => setShowEdit(false)}
                        >
                          Tutup
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL TAMBAH BARANG */}
      {showAdd && (
        <Modal
          isOpen={showAdd}
          onClose={() => setShowAdd(false)}
          title="Tambah Barang Baru"
        >
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Nama Barang</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                placeholder="Contoh: Proyektor Epson EB-X41..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Deskripsi</label>
              <textarea
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                placeholder="Spesifikasi atau detail barang..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Jumlah Stok</label>
                <input
                  type="number"
                  min="1"
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 1 })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Kategori</label>
                <select
                  className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Elektronik">Elektronik</option>
                  <option value="Komputer">Komputer</option>
                  <option value="Kabel">Kabel</option>
                  <option value="Alat Tulis">Alat Tulis</option>
                  <option value="Audio">Audio</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 dark:text-slate-350 mb-1 block">Lokasi Penyimpanan</label>
              <input
                className="w-full border border-gray-200 dark:border-slate-700 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                placeholder="Contoh: Ruang Penyimpanan Gedung SG..."
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-250 dark:border-slate-750">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-slate-650 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all text-xs"
                onClick={() => setShowAdd(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold text-xs"
                onClick={handleAddItem}
                disabled={!formData.name}
              >
                ✓ Tambah Barang
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showReturnModal && (
        <Modal
          isOpen={showReturnModal}
          onClose={() => {
            setShowReturnModal(false);
            setReturningLoanId(null);
          }}
          title="↩️ Proses Pengembalian Barang"
        >
          <div className="space-y-4">
            <p className="text-sm text-gray-500 leading-relaxed">
              Silakan periksa kondisi fisik dan fungsional barang saat dikembalikan oleh mahasiswa, lalu pilih status kondisi di bawah ini untuk memperbarui sistem.
            </p>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Kondisi Pengembalian
              </label>
              <select
                value={returnCondition}
                onChange={(e) => setReturnCondition(e.target.value)}
                className="w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700"
              >
                <option value="Baik">✓ Baik (Normal / Siap Dipinjam Lagi)</option>
                <option value="Rusak">⚠️ Rusak (Masuk Maintenance / Rusak Fisik)</option>
                <option value="Hilang">❌ Hilang (Stok Berkurang Permanen)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                Jam Pengembalian (WITA)
              </label>
              <input
                type="text"
                value={returnTime}
                onChange={(e) => setReturnTime(e.target.value)}
                placeholder="Contoh: 15:30"
                className="w-full border rounded-lg p-2.5 text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-white border-gray-200 dark:border-slate-700 focus:ring-1 focus:ring-blue-500 focus:outline-none font-semibold"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-gray-250 dark:border-slate-750">
              <button
                className="px-4 py-2 border border-gray-300 dark:border-slate-650 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer text-xs"
                onClick={() => {
                  setShowReturnModal(false);
                  setReturningLoanId(null);
                }}
                disabled={isSubmittingReturn}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold cursor-pointer text-xs"
                onClick={handleReturnItem}
                disabled={isSubmittingReturn}
              >
                {isSubmittingReturn ? "Memproses..." : "✓ Konfirmasi Pengembalian"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* TOAST */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}