import { useState } from "react";
import { Badge, Button, Input, Select, Modal, Toast } from "../components/ui/index.jsx";
import { inventory } from "../data/mockData.js";

function InventoryRow({ item, onReturn }) {
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <span className="text-sm">{item.category === "Elektronik" ? "🔌" : "🔗"}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{item.name}</p>
            <p className="text-xs text-gray-400 font-mono">{item.serialNumber}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5">
        <span className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full font-medium">{item.category}</span>
      </td>
      <td className="px-4 py-3.5">
        <Badge status={item.status} />
      </td>
      <td className="px-4 py-3.5">
        {item.status === "borrowed" ? (
          <div>
            <p className="text-xs font-semibold text-gray-800">{item.borrowedBy}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
              <span className="text-[10px] text-orange-600 font-semibold">KTP {item.ktp}</span>
            </div>
          </div>
        ) : (
          <span className="text-xs text-gray-400">—</span>
        )}
      </td>
      <td className="px-4 py-3.5">
        {item.status === "borrowed" ? (
          <Button variant="secondary" size="sm" onClick={() => onReturn(item.id)}>
            Catat Kembali
          </Button>
        ) : (
          <span className="text-xs text-emerald-600 font-medium">Siap dipinjam</span>
        )}
      </td>
    </tr>
  );
}

export default function InventoryPage({ user }) {
  const [items, setItems] = useState(inventory);
  const [showLoanForm, setShowLoanForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");

  const [form, setForm] = useState({
    itemId: "",
    borrowerNim: "",
    borrowerName: "",
    borrowedUntil: "",
  });
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!form.itemId)                 e.itemId       = "Pilih barang yang dipinjam.";
    if (!form.borrowerNim.trim())     e.borrowerNim  = "NIM peminjam wajib diisi.";
    if (!form.borrowerName.trim())    e.borrowerName = "Nama peminjam wajib diisi.";
    if (!form.borrowedUntil)          e.borrowedUntil = "Tanggal pengembalian wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleLoan = () => {
    if (!validate()) return;
    setItems(prev => prev.map(i => i.id === form.itemId
      ? { ...i, status: "borrowed", borrowedBy: form.borrowerNim, borrowedUntil: form.borrowedUntil, ktp: "ditahan" }
      : i));
    setForm({ itemId: "", borrowerNim: "", borrowerName: "", borrowedUntil: "" });
    setErrors({});
    setShowLoanForm(false);
    showToast("Data peminjaman berhasil dicatat. KTP peminjam telah ditahan.", "success");
  };

  const handleReturn = (id) => {
    setItems(prev => prev.map(i => i.id === id
      ? { ...i, status: "available", borrowedBy: null, borrowedUntil: null, ktp: null }
      : i));
    showToast("Barang berhasil dicatat sebagai sudah dikembalikan. KTP diserahkan kembali.", "success");
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const filtered = items.filter(i => filterStatus === "all" || i.status === filterStatus);
  const availableItems = items.filter(i => i.status === "available");

  const counts = {
    all: items.length,
    available: items.filter(i => i.status === "available").length,
    borrowed: items.filter(i => i.status === "borrowed").length,
  };

  if (user.role !== "admin") {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <div className="text-5xl mb-4">🔒</div>
        <h3 className="text-lg font-bold text-gray-800 mb-2">Akses Ditolak</h3>
        <p className="text-sm text-gray-500 max-w-xs">Halaman manajemen inventaris hanya dapat diakses oleh Admin dan Penjaga SG.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Inventaris</h2>
          <p className="text-sm text-gray-400 mt-0.5">Kelola peminjaman barang dan status jaminan KTP</p>
        </div>
        <Button variant="primary" onClick={() => setShowLoanForm(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Catat Peminjaman Baru
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <p className="text-2xl font-extrabold text-gray-900">{counts.all}</p>
          <p className="text-xs text-gray-400 mt-1">Total Aset</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl border border-emerald-100 p-4 text-center">
          <p className="text-2xl font-extrabold text-emerald-700">{counts.available}</p>
          <p className="text-xs text-emerald-600 mt-1 font-medium">Tersedia</p>
        </div>
        <div className="bg-orange-50 rounded-2xl border border-orange-100 p-4 text-center">
          <p className="text-2xl font-extrabold text-orange-700">{counts.borrowed}</p>
          <p className="text-xs text-orange-600 mt-1 font-medium">Dipinjam</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {["all", "available", "borrowed"].map(s => (
          <button key={s}
            onClick={() => setFilterStatus(s)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-150
              ${filterStatus === s ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
            {s === "all" ? "Semua" : s === "available" ? "Tersedia" : "Dipinjam"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Barang / No. Seri</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Kategori</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Status</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Peminjam</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <InventoryRow key={item.id} item={item} onReturn={handleReturn} />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-sm text-gray-400">Tidak ada data inventaris.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Loan Form Modal */}
      <Modal isOpen={showLoanForm} onClose={() => { setShowLoanForm(false); setErrors({}); }} title="Catat Peminjaman Barang" size="md">
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3.5 flex gap-3">
            <span className="text-amber-500 text-lg">⚠️</span>
            <p className="text-xs text-amber-700 font-medium">Pastikan KTP peminjam sudah diterima dan disimpan secara fisik sebelum mencatat peminjaman ini.</p>
          </div>

          <Select label="Barang yang Dipinjam" id="itemId" required value={form.itemId}
            onChange={e => handleChange("itemId", e.target.value)} error={errors.itemId}>
            <option value="">-- Pilih Barang --</option>
            {availableItems.map(i => (
              <option key={i.id} value={i.id}>{i.name} ({i.serialNumber})</option>
            ))}
          </Select>

          <Input label="NIM Peminjam" id="borrowerNim" required placeholder="Contoh: F55123064"
            value={form.borrowerNim} onChange={e => handleChange("borrowerNim", e.target.value)} error={errors.borrowerNim} />

          <Input label="Nama Peminjam" id="borrowerName" required placeholder="Nama lengkap sesuai KTP"
            value={form.borrowerName} onChange={e => handleChange("borrowerName", e.target.value)} error={errors.borrowerName} />

          <Input label="Tanggal Pengembalian" id="borrowedUntil" type="date" required
            value={form.borrowedUntil} onChange={e => handleChange("borrowedUntil", e.target.value)} error={errors.borrowedUntil} />

          <div className="bg-gray-50 rounded-xl p-3 flex items-center gap-3">
            <input type="checkbox" id="ktpConfirm" className="w-4 h-4 accent-blue-600 cursor-pointer" />
            <label htmlFor="ktpConfirm" className="text-xs text-gray-600 cursor-pointer font-medium">
              Saya konfirmasi bahwa KTP peminjam <strong>sudah diterima</strong> dan disimpan di pos penjaga SG.
            </label>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setShowLoanForm(false); setErrors({}); }}>Batal</Button>
            <Button variant="primary" onClick={handleLoan}>Simpan Catatan</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
