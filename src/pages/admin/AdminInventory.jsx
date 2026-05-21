import { useState } from "react";
import { Modal, Toast } from "../../components/ui/index.jsx";
import { inventory } from "../../data/mockData.js";

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue:    "from-blue-500 to-blue-700 shadow-blue-200",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-200",
    amber:   "from-amber-400 to-amber-600 shadow-amber-200",
    red:     "from-red-500 to-red-700 shadow-red-200",
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{label}</p>
          <p className="text-3xl font-extrabold text-gray-900">{value}</p>
        </div>
        <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
          <span className="text-white text-lg">{icon}</span>
        </div>
      </div>
    </div>
  );
}

export default function AdminInventory() {
  const [items, setItems] = useState(inventory);
  const [toast, setToast] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [editTab, setEditTab] = useState("peminjaman");
  const [formData, setFormData] = useState({
    serialNumber: "",
    name: "",
    status: "available",
    borrowedBy: "",
    phone: "",
    nim: "",
    date: "",
    time: "",
    ktp: "",
  });
  const [borrowerForm, setBorrowerForm] = useState({
    nama: "",
    nim: "",
    prodi: "",
    noHp: "",
    ktpVerified: false,
    jamPinjam: "",
    estimasiKembali: "",
  });

  const showToast = (msg) => {
    setToast({ message: msg, type: "success" });
    setTimeout(() => setToast(null), 3000);
  };

  const counts = {
    total: items.length,
    available: items.filter(i => i.status === "available").length,
    borrowed: items.filter(i => i.status === "borrowed").length,
    broken: items.filter(i => i.status === "broken").length,
  };

  const openEdit = (item) => {
    setSelectedItem(item);
    setEditTab("peminjaman");
    setBorrowerForm({
      nama: item.borrowedBy || "",
      nim: item.nim || "",
      prodi: item.prodi || "",
      noHp: item.phone || "",
      ktpVerified: item.ktpVerified || false,
      jamPinjam: item.time || "",
      estimasiKembali: item.estimasiKembali || "",
    });
    setShowEdit(true);
  };

  const handleSave = () => {
    setItems(prev =>
      prev.map(i =>
        i.id === selectedItem.id ? selectedItem : i
      )
    );
    setShowEdit(false);
    showToast("Data berhasil diperbarui");
  };

  const handleAddItem = () => {
    const newItem = {
      id: Math.max(...items.map(i => i.id), 0) + 1,
      serialNumber: formData.serialNumber || `AST-${Date.now()}`,
      name: formData.name,
      status: formData.status,
      borrowedBy: formData.borrowedBy || null,
      phone: formData.phone || null,
      nim: formData.nim || null,
      date: formData.date || null,
      time: formData.time || null,
      ktp: formData.ktp || null,
    };
    setItems([...items, newItem]);
    setShowAdd(false);
    setFormData({
      serialNumber: "",
      name: "",
      status: "available",
      borrowedBy: "",
      phone: "",
      nim: "",
      date: "",
      time: "",
      ktp: "",
    });
    showToast("Barang berhasil ditambahkan");
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Inventaris Barang
          </h2>
          <p className="text-sm text-gray-400">Lorem ipsum</p>
        </div>

        <div className="text-right text-sm text-gray-500">
          <p>Kamis, 24 Okt 2024</p>
          <p>09:42 AM</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Total Items" value={counts.total} icon="📦" color="blue" />
        <StatCard label="Tersedia" value={counts.available} icon="✅" color="emerald" />
        <StatCard label="Dipinjam" value={counts.borrowed} icon="🚚" color="amber" />
        <StatCard label="Rusak" value={counts.broken} icon="⚠️" color="red" />
      </div>

      {/* TABLE SECTION */}
      <div className="bg-white rounded-2xl border">

        {/* HEADER TABLE */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <p className="font-semibold text-gray-800">
              Daftar Peminjaman Inventaris
            </p>
            <p className="text-xs text-gray-400">
              Tracking barang & KTP jaminan mahasiswa
            </p>
          </div>

          <div className="flex gap-2">
            <button className="border px-3 py-2 rounded-lg text-sm hover:bg-gray-50 transition-all">
              ⬇ Unduh Excel
            </button>
            <button 
              onClick={() => setShowAdd(true)}
              className="bg-blue-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-blue-700 transition-all font-semibold"
            >
              + Tambah Barang
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase font-semibold border-b">
              <tr>
                <th className="px-4 py-4 text-left">ID Asset</th>
                <th className="px-4 py-4 text-left">Nama Barang</th>
                <th className="px-4 py-4 text-left">Peminjam</th>
                <th className="px-4 py-4 text-left">NIM</th>
                <th className="px-4 py-4 text-left">Tanggal</th>
                <th className="px-4 py-4 text-left">Status</th>
                <th className="px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, idx) => (
                <tr key={item.id} className={`border-t hover:bg-blue-50 transition-all ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>

                  <td className="px-4 py-3">
                    <code className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-mono">
                      {item.serialNumber}
                    </code>
                  </td>

                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-sm">
                        📦
                      </div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                    </div>
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {item.borrowedBy || <span className="text-gray-400">-</span>}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {item.nim || <span className="text-gray-400">-</span>}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {item.date ? `${item.date} ${item.time || ''}`.trim() : <span className="text-gray-400">-</span>}
                  </td>

                  <td className="px-4 py-3">
                    <span className={`inline-block text-xs font-semibold px-3 py-1 rounded-full
                      ${item.status === "available" && "bg-emerald-100 text-emerald-700"}
                      ${item.status === "borrowed" && "bg-amber-100 text-amber-700"}
                      ${item.status === "broken" && "bg-red-100 text-red-700"}
                    `}>
                      {item.status === "available" && "✓ Tersedia"}
                      {item.status === "borrowed" && "🚚 Dipinjam"}
                      {item.status === "broken" && "⚠️ Rusak"}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => openEdit(item)}
                        className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg transition-all font-semibold"
                        title="Edit"
                      >
                        ✏️
                      </button>
                      <button className="bg-red-100 text-red-600 hover:bg-red-200 p-2 rounded-lg transition-all font-semibold" title="Hapus">
                        🗑️
                      </button>
                    </div>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
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
            <div className="flex items-center justify-center px-8 pt-6 border-b border-gray-200">
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
                  <h3 className="font-bold text-gray-900 mb-4">📝 Edit Barang</h3>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">ID Asset</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg p-2 bg-gray-50"
                      value={selectedItem.serialNumber}
                      readOnly
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Barang</label>
                    <input
                      className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={selectedItem.name}
                      onChange={(e) =>
                        setSelectedItem({ ...selectedItem, name: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Status</label>
                    <select
                      className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                  <div className="pt-4 border-t border-gray-200 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                      onClick={() => setShowEdit(false)}
                    >
                      Batal
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                      onClick={handleSave}
                    >
                      💾 Simpan Perubahan
                    </button>
                  </div>
                </div>
              ) : (
                // PEMINJAMAN TAB
                <div>
                  {/* CARD TITLE */}
                  <div className="flex items-center gap-2 mb-6">
                    <span className="text-lg">👤</span>
                    <h3 className="text-sm font-bold text-blue-600">BAGIAN PEMINJAMAN (BORROWER DETAILS)</h3>
                  </div>

                  {/* FORM GRID */}
                  <div className="space-y-4">
                    {/* Row 1: Nama & NIM */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Nama Lengkap</label>
                        <input
                          type="text"
                          placeholder="Nama mahasiswa..."
                          value={borrowerForm.nama}
                          onChange={(e) => setBorrowerForm({ ...borrowerForm, nama: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">NIM</label>
                        <input
                          type="text"
                          placeholder="NIM..."
                          value={borrowerForm.nim}
                          onChange={(e) => setBorrowerForm({ ...borrowerForm, nim: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Row 2: Prodi & No HP */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Prodi (Department)</label>
                        <select
                          value={borrowerForm.prodi}
                          onChange={(e) => setBorrowerForm({ ...borrowerForm, prodi: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                        >
                          <option value="">Pilih Prodi...</option>
                          <option value="SI">Sistem Informasi</option>
                          <option value="TI">Teknik Informatika</option>
                          <option value="TK">Teknik Komputer</option>
                          <option value="MT">Manajemen Teknologi</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">No HP (Contact)</label>
                        <input
                          type="tel"
                          placeholder="Nomor telepon..."
                          value={borrowerForm.noHp}
                          onChange={(e) => setBorrowerForm({ ...borrowerForm, noHp: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {/* Row 3: KTP Checkbox */}
                    <div className="flex items-center gap-3 py-2">
                      <input
                        type="checkbox"
                        id="ktpVerified"
                        checked={borrowerForm.ktpVerified}
                        onChange={(e) => setBorrowerForm({ ...borrowerForm, ktpVerified: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="ktpVerified" className="text-xs font-semibold text-gray-600 cursor-pointer">
                        Ceklis KTP (KTP Verified)
                      </label>
                    </div>

                    {/* Row 4: Jam Pinjam & Estimasi Kembali */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Jam Pinjam</label>
                        <input
                          type="time"
                          value={borrowerForm.jamPinjam}
                          onChange={(e) => setBorrowerForm({ ...borrowerForm, jamPinjam: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-gray-600 mb-2 block">Estimasi Jam Kembali</label>
                        <input
                          type="time"
                          value={borrowerForm.estimasiKembali}
                          onChange={(e) => setBorrowerForm({ ...borrowerForm, estimasiKembali: e.target.value })}
                          className="w-full border border-gray-300 rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>

                  {/* FOOTER */}
                  <div className="mt-6 pt-6 border-t-2 border-dotted border-blue-200 flex justify-end gap-2">
                    <button
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                      onClick={() => setShowEdit(false)}
                    >
                      Batal
                    </button>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                      onClick={handleSave}
                    >
                      Simpan Perubahan
                    </button>
                  </div>
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
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Item ID</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: AST-001, AST-002..."
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
              />
              <p className="text-xs text-gray-400 mt-1">Kosongkan untuk auto-generate</p>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Barang</label>
              <input
                className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Contoh: Proyektor, Laptop, Whiteboard..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Status Awal</label>
              <select
                className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="available">✓ Tersedia</option>
                <option value="borrowed">🚚 Dipinjam</option>
                <option value="broken">⚠️ Rusak</option>
              </select>
            </div>

            {formData.status === "borrowed" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nama Peminjam</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nama mahasiswa..."
                    value={formData.borrowedBy}
                    onChange={(e) => setFormData({ ...formData, borrowedBy: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">NIM</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Contoh: 23101234567..."
                    value={formData.nim}
                    onChange={(e) => setFormData({ ...formData, nim: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-600 mb-1 block">Nomor Telepon</label>
                  <input
                    className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nomor telepon..."
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Tanggal Pinjam</label>
                    <input
                      type="date"
                      className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-gray-600 mb-1 block">Jam Pinjam</label>
                    <input
                      type="time"
                      className="w-full border border-gray-200 rounded-lg p-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t">
              <button
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                onClick={() => setShowAdd(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
                onClick={handleAddItem}
                disabled={!formData.name}
              >
                ✓ Tambah Barang
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