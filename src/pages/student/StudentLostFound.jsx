import { useState, useEffect } from "react";
import { Badge, Button, Input, Select, Modal, Toast } from "../../components/ui/index.jsx";
import { API_BASE_URL, apiFetch } from "../../utils/api.js";
import { mapLostFoundReport } from "../../utils/mappers.js";

const LOCATION_OPTIONS = ["F.F 01","F.F 02","F.F 03","F.F 04","F.F 05","F.F 06","F.F 07","F.F 08","F.F 09","F.F 10","F.F 11","F.F 12","Koridor Lantai 1","Koridor Lantai 2","Area Lainnya"];

const FOUND_TEMPLATE = `Ditemukan [Nama Barang] di sekitar [Lokasi] sekitar pukul [Waktu].\n\nBagi yang merasa pemilik dari barang ini, silakan hubungi kontak berikut untuk pengambilan:`;
const LOST_TEMPLATE = `Telah hilang [Nama Barang] di sekitar daerah [Lokasi] pada pukul [Waktu].\nJika ada yang tidak sengaja menemukan atau mengamankannya, mohon hubungi kontak di bawah ini.`;

function ItemCard({ item, onClaim, onSelectItem }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcons = { found: "📦", lost: "🔍", claimed: "✅" };
  const statusBg = {
    found:   "from-blue-50 to-blue-100/50",
    lost:    "from-red-50 to-red-100/50",
    claimed: "from-gray-50 to-gray-100/50",
  };

  return (
    <div 
      className={`rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${item.status === "claimed" ? "opacity-70" : ""}`}>
      {/* Image or Placeholder */}
      <div className="h-36 bg-linear-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center border-b border-gray-100 overflow-hidden relative">
        {item.image ? (
          <img 
            src={`${API_BASE_URL}/uploads/${item.image}`} 
            alt={item.title} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <>
            <span className="text-4xl">{statusIcons[item.status]}</span>
            <span className="text-xs text-gray-400 mt-1 font-medium">{item.location}</span>
          </>
        )}
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
          <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>Lokasi: <span className="font-semibold text-gray-800">{item.location}</span></span>
          </div>
          {item.locationDetail && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
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

        <div className="mt-3 pt-3 border-t border-gray-50">
          <button 
            onClick={() => onSelectItem(item)}
            className="w-full text-sm font-semibold text-blue-900 border-2 border-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-150">
            Detail
          </button>
        </div>
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
      onImageSelect(file);
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

export default function StudentLostFound({ user }) {
  const [items, setItems] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    title: "",
    type: "found",
    location: "",
    locationDetail: "",
    description: FOUND_TEMPLATE,
    contact: "",
    imageName: "",
  });
  const [errors, setErrors] = useState({});

  const loadItems = async () => {
    const response = await apiFetch("/api/lostfound");
    if (response.ok) {
      const data = await response.json();
      setItems((data.reports || []).map(mapLostFoundReport).filter((item) => item.rawStatus !== "archived"));
    }
  };

  useEffect(() => {
    const fetchItems = async () => {
      try {
        await loadItems();
      } catch (err) {
        console.error("Failed to fetch lost & found items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchItems();
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim())       e.title       = "Nama barang wajib diisi.";
    if (!form.location)           e.location    = "Pilih lokasi barang.";
    if (form.location === "Area Lainnya" && !form.locationDetail.trim()) {
      e.locationDetail = "Detail area wajib diisi.";
    }
    if (!form.description.trim()) e.description = "Deskripsi barang wajib diisi.";
    if (!form.contact.trim())     e.contact     = "Kontak Anda wajib diisi.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const locationValue = form.location === "Area Lainnya" && form.locationDetail.trim()
        ? `Area Lainnya (${form.locationDetail.trim()})`
        : form.location;

      const formData = new FormData();
      formData.append("type", form.type);
      formData.append("itemName", form.title);
      formData.append("description", form.description);
      formData.append("location", locationValue);
      formData.append("date", new Date().toISOString().split("T")[0]);
      formData.append("category", form.type === "found" ? "Dititipkan di penjaga SG" : "Umum");
      formData.append("contact", form.contact);
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const response = await apiFetch("/api/lostfound", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await loadItems();

        setForm({ title: "", type: "found", location: "", locationDetail: "", description: FOUND_TEMPLATE, contact: "", imageName: "" });
        setImageFile(null);
        setErrors({});
        setShowForm(false);
        showToast("✓ Laporan berhasil dipublikasikan ke mading digital!", "success");
      } else {
        const error = await response.json();
        showToast(`✗ ${error.error || "Gagal membuat laporan"}`, "error");
      }
    } catch (err) {
      console.error("Submit lost & found error:", err);
      showToast("✗ Terjadi kesalahan saat mengirim laporan", "error");
    }
  };

  const handleClaim = async (id) => {
    try {
      const response = await apiFetch(`/api/lostfound/${id}/claim`, {
        method: "POST",
        body: JSON.stringify({ message: form.contact || "Saya ingin mengklaim barang ini." }),
      });

      if (response.ok) {
        await loadItems();
        showToast("✓ Permintaan klaim dikirim. Silahkan hubungi penemu untuk proses pengambilan.", "success");
      } else {
        showToast("✗ Gagal membuat klaim", "error");
      }
    } catch (err) {
      console.error("Claim lost & found error:", err);
      showToast("✗ Terjadi kesalahan", "error");
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => {
      const nextForm = { ...prev, [field]: value };
      if (field === "location" && value !== "Area Lainnya") {
        nextForm.locationDetail = "";
      }
      if (field === "type" && value === "lost") {
        if (prev.description === FOUND_TEMPLATE || prev.description.trim() === "") {
          nextForm.description = LOST_TEMPLATE;
        }
      } else if (field === "type" && value === "found") {
        if (prev.description === LOST_TEMPLATE || prev.description.trim() === "") {
          nextForm.description = FOUND_TEMPLATE;
        }
      }
      return nextForm;
    });
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    if (field === "location" && errors.locationDetail) {
      setErrors(prev => ({ ...prev, locationDetail: null }));
    }
  };

  const handleSelectItem = async (item) => {
    try {
      const response = await apiFetch(`/api/lostfound/${item.id}`);
      if (response.ok) {
        const data = await response.json();
        const mappedReport = mapLostFoundReport(data.report);
        const approvedClaim = (data.claims || []).find(c => c.status === "approved");
        setSelectedItem({
          ...mappedReport,
          claimerName: approvedClaim ? approvedClaim.claimer_name : null,
          claimedBy: approvedClaim ? approvedClaim.claimer_nim : null,
          claimedDate: approvedClaim && approvedClaim.approved_at ? new Date(approvedClaim.approved_at).toLocaleDateString("id-ID") : null,
        });
      } else {
        setSelectedItem(item);
      }
    } catch (err) {
      console.error("Failed to fetch detail:", err);
      setSelectedItem(item);
    }
    setShowDetailModal(true);
  };

  const handleClaimFromDetail = (id) => {
    handleClaim(id);
    setShowDetailModal(false);
    setSelectedItem(null);
  };

  const filtered = items.filter(item => {
    const statusOk = filterStatus === "all" || item.status === filterStatus;
    return statusOk;
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
          Lapor Temuan / Kehilangan
        </Button>
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
        <div className="rounded-2xl border border-gray-100 bg-gray-50 py-12 text-center">
          <div className="text-4xl mb-3">🔍</div>
          <p className="text-sm font-semibold text-gray-600">Tidak ada laporan</p>
          <p className="text-xs text-gray-400 mt-1">Belum ada barang yang dilaporkan dengan filter ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(item => (
            <ItemCard key={item.id} item={item} onClaim={handleClaim} onSelectItem={handleSelectItem} />
          ))}
        </div>
      )}

      {/* Report Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setErrors({}); setForm({ title: "", type: "found", location: "", locationDetail: "", description: FOUND_TEMPLATE, contact: "", imageName: "" }); setImageFile(null); }} title="Buat Laporan Barang" size="lg">
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
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Deskripsi Barang</label>
              <textarea
                rows={3}
                placeholder="Deskripsikan ciri-ciri barang secara detail, termasuk warna, kondisi, isi (jika ada), dll."
                value={form.description}
                onChange={e => handleChange("description", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder:text-gray-400"
              />
              {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
            </div>

            <Select label="Lokasi" id="location" required value={form.location}
              onChange={e => handleChange("location", e.target.value)} error={errors.location}>
              <option value="">-- Pilih Ruangan/Lokasi --</option>
              {LOCATION_OPTIONS.map(l => <option key={l} value={l}>{l}</option>)}
            </Select>

            {form.location === "Area Lainnya" && (
              <div className="sm:col-span-2">
                <Input label="Detail Area Lainnya" id="locationDetail" required
                  placeholder="Contoh: Samping kantin, depan toilet lantai 1, dekat tangga, dll."
                  value={form.locationDetail} onChange={e => handleChange("locationDetail", e.target.value)} error={errors.locationDetail} />
              </div>
            )}

            <div className="sm:col-span-2">
              <Input label="Kontak Anda" id="contact" required
                placeholder="Nomor HP atau Email agar pemilik dapat menghubungi"
                value={form.contact} onChange={e => handleChange("contact", e.target.value)} error={errors.contact} />
            </div>

            <div className="sm:col-span-2">
              <ImageUploadSimulator onImageSelect={file => { setImageFile(file); handleChange("imageName", file.name); }} />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setShowForm(false); setErrors({}); setForm({ title: "", type: "found", location: "", locationDetail: "", description: FOUND_TEMPLATE, contact: "", imageName: "" }); setImageFile(null); }}>Batal</Button>
            <Button variant="primary" onClick={handleSubmit}>Publikasikan Laporan</Button>
          </div>
        </div>
      </Modal>

      {/* Item Detail Modal */}
      {selectedItem && (
        <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null); }} title="Detail Barang">
          <div className="space-y-6">
            {/* Image or Placeholder */}
            <div className="h-64 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center border border-gray-200 overflow-hidden relative">
              {selectedItem.image ? (
                <img 
                  src={`${API_BASE_URL}/uploads/${selectedItem.image}`} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <span className="text-6xl">{selectedItem.status === "found" ? "📦" : selectedItem.status === "lost" ? "🔍" : "✅"}</span>
                  <span className="text-sm text-gray-500 mt-2 font-medium">{selectedItem.location}</span>
                </>
              )}
            </div>

            {/* Item Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedItem.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge status={selectedItem.status} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Deskripsi</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Lokasi</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>{selectedItem.location}</span>
                </div>
              </div>

              {selectedItem.locationDetail && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    {selectedItem.status === "found" ? "Status Barang Saat Ini" : "Lokasi Detail"}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{selectedItem.locationDetail}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Dilaporkan Oleh</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{selectedItem.reporterName}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Tanggal & Waktu</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{selectedItem.date} · {selectedItem.time}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Kontak</p>
                <p className="text-sm text-blue-600 font-medium">{selectedItem.contact}</p>
              </div>
            </div>

            {/* Action Buttons */}
            {selectedItem.status === "claimed" && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Diklaim Oleh</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedItem.claimerName} ({selectedItem.claimedBy})</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tanggal diklaim: {selectedItem.claimedDate}</p>
              </div>
            )}

            {selectedItem.status !== "claimed" && (
              <div className="border-t border-gray-100 pt-4 flex gap-3">
                <Button variant="ghost" size="md" className="flex-1 justify-center">
                  💬 Hubungi
                </Button>
                {selectedItem.status === "found" && (
                  <Button variant="primary" size="md" className="flex-1 justify-center" onClick={() => handleClaimFromDetail(selectedItem.id)}>
                    Itu Milik Saya
                  </Button>
                )}
              </div>
            )}

            {selectedItem.status === "claimed" && (
              <div className="border-t border-gray-100 pt-4 text-center">
                <p className="text-sm text-gray-600 font-medium">✅ Barang ini sudah diklaim oleh {selectedItem.claimerName}</p>
              </div>
            )}
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
