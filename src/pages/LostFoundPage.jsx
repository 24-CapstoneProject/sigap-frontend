// =============================================
// SIGAP - Lost & Found Page (Mading Digital)
// =============================================

import { useState } from "react";
import { Badge, Button, Input, Textarea, Modal, Toast, EmptyState } from "../components/ui/index.jsx";
import { lostFoundItems } from "../data/mockData.js";

const LOCATION_OPTIONS = ["SG-1","SG-2","SG-3","SG-4","SG-5","SG-6","SG-7","SG-8","SG-9","SG-10","SG-11","SG-12","Koridor Lantai 1","Koridor Lantai 2","Koridor Lantai 3","Area Lainnya"];

function ItemCard({ item, onClaim, isAdmin }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcons = { found: "📦", lost: "🔍", claimed: "✅" };
  const statusBg = {
    found:   "from-blue-50 to-blue-100/50",
    lost:    "from-red-50 to-red-100/50",
    claimed: "from-gray-50 to-gray-100/50",
  };

  return (
    <div className={`rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${item.status === "claimed" ? "opacity-70" : ""}`}>
      {/* Image Placeholder */}
      <div className={`h-36 bg-linear-to-br ${statusBg[item.status]} flex flex-col items-center justify-center border-b border-gray-100`}>
        <span className="text-4xl">{statusIcons[item.status]}</span>
        <span className="text-xs text-gray-400 mt-1 font-medium">{item.location}</span>
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 flex-1 pr-2">{item.title}</h3>
          <Badge status={item.status} />
        </div>

        <p className={`text-xs text-gray-500 leading-relaxed ${expanded ? "" : "truncate"}`}
           style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>
        {item.description.length > 80 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline mt-1">
            {expanded ? "Sembunyikan" : "Selengkapnya"}
          </button>
        )}

        <div className="mt-3 space-y-1.5">
          {item.locationDetail && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{item.locationDetail}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Dilaporkan oleh {item.reporterName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{item.date} · {item.time}</span>
          </div>
        </div>

        {item.status !== "claimed" && (
          <div className="mt-3 pt-3 border-t border-gray-50 flex gap-2">
            <Button variant="ghost" size="sm" className="flex-1 justify-center text-xs">
              💬 Hubungi
            </Button>
            {item.status === "found" && (
              <Button variant="primary" size="sm" className="flex-1 justify-center text-xs" onClick={() => onClaim(item.id)}>
                Itu Milik Saya
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ImageUploadSimulator({ onImageSelect }) {
  const [preview, setPreview] = useState(null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
      onImageSelect(file.name);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-gray-700">Foto Barang</label>
      <label htmlFor="imageUpload"
        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200">
        {preview ? (
          <img src={preview} alt="Preview barang" className="max-h-32 rounded-lg object-contain" />
        ) : (
          <>
            <svg className="w-8 h-8 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-sm text-gray-500 font-medium">Klik untuk unggah foto</p>
            <p className="text-xs text-gray-400 mt-0.5">PNG, JPG hingga 5MB</p>
          </>
        )}
        <input id="imageUpload" type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </label>
    </div>
  );
}

export default function LostFoundPage({ user }) {
  const [items, setItems] = useState(lostFoundItems);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");

  const [form, setForm] = useState({
    title: "",
    type: "found",
    location: "",
    locationDetail: "",
    description: "",
    contact: "",
    imageName: "",
  });
  const [errors, setErrors] = useState({});

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Nama barang wajib diisi.";
    if (!form.location)           e.location    = "Pilih lokasi barang.";
    if (!form.description.trim()) e.description = "Deskripsi barang wajib diisi.";
    if (!form.contact.trim())     e.contact     = "Kontak Anda wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const newItem = {
      id: `LF${Date.now()}`,
      title: form.title,
      description: form.description,
      location: form.location,
      locationDetail: form.type === "found" ? (form.locationDetail || "Dibawa Penemu") : null,
      status: form.type,
      reportedBy: user.nim,
      reporterName: user.name.split(" ").slice(0, 2).join(" "),
      date: new Date().toLocaleDateString("sv-SE"),
      time: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
      image: form.imageName || null,
      contact: form.contact,
    };

    setItems(prev => [newItem, ...prev]);
    setForm({ title: "", type: "found", location: "", locationDetail: "", description: "", contact: "", imageName: "" });
    setErrors({});
    setShowForm(false);
    showToast("Laporan berhasil dipublikasikan ke mading digital!", "success");
  };

  const handleClaim = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "claimed" } : i));
    showToast("Permintaan klaim dikirim. Silahkan hubungi penemu untuk proses pengambilan.", "info");
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const filtered = items.filter(item => {
    const statusOk = filterStatus === "all" || item.status === filterStatus;
    const typeOk   = filterType === "all" || item.status === filterType;
    return statusOk && typeOk;
  });

  const counts = {
    all: items.length,
    found: items.filter(i => i.status === "found").length,
    lost: items.filter(i => i.status === "lost").length,
    claimed: items.filter(i => i.status === "claimed").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Mading Digital Lost & Found</h2>
          <p className="text-sm text-gray-400 mt-0.5">Papan informasi digital untuk barang temuan dan kehilangan di Gedung SG</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Buat Laporan
        </Button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { key: "found", label: "Ditemukan", icon: "📦", color: "text-blue-600 bg-blue-50" },
          { key: "lost",  label: "Hilang",    icon: "🔍", color: "text-red-600 bg-red-50" },
          { key: "claimed", label: "Diklaim", icon: "✅", color: "text-emerald-600 bg-emerald-50" },
        ].map(s => (
          <div key={s.key} className={`rounded-2xl p-4 text-center ${s.color}`}>
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-xl font-extrabold">{counts[s.key]}</div>
            <div className="text-xs font-medium opacity-80">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Semua" },
          { key: "found", label: "Barang Temuan" },
          { key: "lost", label: "Barang Hilang" },
          { key: "claimed", label: "Sudah Diklaim" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150
              ${filterStatus === tab.key ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <EmptyState icon="🔍" title="Tidak ada laporan" description="Belum ada barang yang dilaporkan dengan filter ini." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClaim={handleClaim} isAdmin={user.role === "admin"} />
          ))}
        </div>
      )}

      {/* Report Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setErrors({}); }} title="Buat Laporan Barang" size="lg">
        <div className="space-y-4">

          {/* Type Toggle */}
          <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
            {[
              { key: "found", label: "📦 Saya Menemukan", desc: "Saya menemukan barang orang lain" },
              { key: "lost",  label: "🔍 Saya Kehilangan", desc: "Saya kehilangan barang saya" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => handleChange("type", t.key)}
                className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all duration-150
                  ${form.type === t.key ? "bg-white shadow-sm text-blue-700" : "text-gray-500 hover:text-gray-700"}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input label="Nama Barang" id="title" required placeholder="Contoh: Charger Laptop ASUS Hitam"
                value={form.title} onChange={e => handleChange("title", e.target.value)} error={errors.title} />
            </div>

            <div className="sm:col-span-2">
              <Textarea label="Deskripsi Barang" id="description" required
                placeholder="Deskripsikan ciri-ciri barang secara detail, termasuk warna, kondisi, isi (jika ada), dll."
                value={form.description} onChange={e => handleChange("description", e.target.value)} error={errors.description} />
            </div>

            <Select label="Lokasi" id="location" required value={form.location}
              onChange={e => handleChange("location", e.target.value)} error={errors.location}>
              <option value="">-- Pilih Ruangan/Lokasi --</option>
              {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </Select>

            {form.type === "found" && (
              <Select label="Status Barang Saat Ini" id="locationDetail" value={form.locationDetail}
                onChange={e => handleChange("locationDetail", e.target.value)}>
                <option value="Dibawa Penemu">Dibawa Penemu (Hubungi Saya)</option>
                <option value="Dititipkan ke Penjaga SG">Dititipkan ke Penjaga SG</option>
              </Select>
            )}

            <div className="sm:col-span-2">
              <Input label="Kontak Anda" id="contact" required
                placeholder="Nomor HP atau Email agar pemilik dapat menghubungi"
                value={form.contact} onChange={e => handleChange("contact", e.target.value)} error={errors.contact} />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadSimulator onImageSelect={name => handleChange("imageName", name)} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setShowForm(false); setErrors({}); }}>Batal</Button>
            <Button variant="primary" onClick={handleSubmit}>Publikasikan Laporan</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
