import { useState } from "react";
import { Badge, Button, Input, Select, Modal, Toast } from "../../components/ui/index.jsx";
import { inventory } from "../../data/mockData.js";

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

export default function AdminInventory({ user }) {
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

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Semua" },
          { key: "available", label: "Tersedia" },
          { key: "borrowed", label: "Dipinjam" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150
              ${filterStatus === tab.key ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {filterStatus === "all" ? counts.all : filterStatus === "available" ? counts.available : counts.borrowed}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Nama Barang</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Kategori</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Peminjam</th>
              <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <InventoryRow key={item.id} item={item} onReturn={handleReturn} />
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">Tidak ada data inventaris untuk status ini</p>
          </div>
        )}
      </div>

      {/* Loan Form Modal */}
      <Modal isOpen={showLoanForm} onClose={() => { setShowLoanForm(false); setErrors({}); }} title="Catat Peminjaman Barang" size="md">
        <div className="space-y-4">
          <Select
            label="Barang yang Dipinjam"
            id="itemId"
            required
            value={form.itemId}
            onChange={e => handleChange("itemId", e.target.value)}
            error={errors.itemId}
          >
            <option value="">-- Pilih Barang --</option>
            {availableItems.map(item => (
              <option key={item.id} value={item.id}>{item.name} ({item.serialNumber})</option>
            ))}
          </Select>

          <Input
            label="NIM Peminjam"
            id="borrowerNim"
            required
            placeholder="Contoh: F55123064"
            value={form.borrowerNim}
            onChange={e => handleChange("borrowerNim", e.target.value)}
            error={errors.borrowerNim}
          />

          <Input
            label="Nama Peminjam"
            id="borrowerName"
            required
            placeholder="Contoh: Syaif Ali M. Risal"
            value={form.borrowerName}
            onChange={e => handleChange("borrowerName", e.target.value)}
            error={errors.borrowerName}
          />

          <Input
            label="Tanggal Pengembalian"
            id="borrowedUntil"
            type="date"
            required
            value={form.borrowedUntil}
            onChange={e => handleChange("borrowedUntil", e.target.value)}
            error={errors.borrowedUntil}
          />

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setShowLoanForm(false); setErrors({}); }}>Batal</Button>
            <Button variant="primary" onClick={handleLoan}>Catat Peminjaman</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
