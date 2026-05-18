import { useState } from "react";
import { Badge, Button, Input, Select, Modal, Toast } from "../../components/ui/index.jsx";
import { rooms, bookingHistory } from "../../data/mockData.js";

const availableRooms = rooms.filter(r => r.status === "available");

const DURATION_OPTIONS = [
  { value: "1", label: "1 Jam (60 menit)" },
  { value: "2", label: "2 Jam (120 menit)" },
  { value: "3", label: "3 Jam (180 menit)" },
];

const JAM_OPTIONS = [
  "07:00","08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00",
];

function BookingCard({ booking, onCancel }) {
  const isActive = booking.status === "approved" || booking.status === "pending";
  
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
            <span className="text-white text-sm font-bold">{booking.roomName}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{booking.mataKuliah}</p>
            <p className="text-xs text-gray-400">{booking.dosen}</p>
          </div>
        </div>
        <Badge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Tanggal</p>
          <p className="text-xs font-semibold text-gray-700">{booking.tanggal}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Jam Mulai</p>
          <p className="text-xs font-semibold text-gray-700">{booking.jamMulai}</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Durasi</p>
          <p className="text-xs font-semibold text-gray-700">{booking.durasi} Jam</p>
        </div>
        <div className="bg-gray-50 rounded-xl p-2.5">
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Status</p>
          <p className="text-xs font-semibold text-gray-700 uppercase">{booking.status}</p>
        </div>
      </div>

      {booking.status === "rejected" && booking.rejectReason && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
          <p className="text-xs text-red-600 font-medium">Alasan Penolakan: {booking.rejectReason}</p>
        </div>
      )}

      {isActive && (
        <Button 
          variant="danger" 
          size="sm" 
          className="w-full justify-center" 
          onClick={() => onCancel(booking.id)}
        >
          ✕ Batalkan Peminjaman
        </Button>
      )}
    </div>
  );
}

export default function StudentBooking({ user }) {
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [bookings, setBookings] = useState(bookingHistory);
  const [statusFilter, setStatusFilter] = useState("all");

  const [form, setForm] = useState({
    roomId: "",
    mataKuliah: "",
    dosen: "",
    tanggal: "",
    jamMulai: "",
    durasi: "",
    keterangan: "",
  });
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const validate = () => {
    const newErrors = {};
    if (!form.roomId)      newErrors.roomId      = "Pilih ruangan yang ingin dipinjam.";
    if (!form.mataKuliah.trim()) newErrors.mataKuliah = "Nama mata kuliah/praktikum wajib diisi.";
    if (!form.dosen.trim()) newErrors.dosen       = "Nama dosen pengampu wajib diisi.";
    if (!form.tanggal)     newErrors.tanggal      = "Pilih tanggal peminjaman.";
    if (!form.jamMulai)    newErrors.jamMulai     = "Pilih jam mulai.";
    if (!form.durasi)      newErrors.durasi       = "Pilih durasi peminjaman.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const room = availableRooms.find(r => r.id === form.roomId);
    const newBooking = {
      id: `BK${Date.now()}`,
      roomId: form.roomId,
      roomName: room?.name || "",
      mataKuliah: form.mataKuliah,
      dosen: form.dosen,
      tanggal: form.tanggal,
      jamMulai: form.jamMulai,
      durasi: Number(form.durasi),
      status: "pending",
      nim: user.nim,
      nama: user.name,
    };

    setBookings(prev => [newBooking, ...prev]);
    setForm({ roomId: "", mataKuliah: "", dosen: "", tanggal: "", jamMulai: "", durasi: "", keterangan: "" });
    setErrors({});
    setShowForm(false);
    showToast("Permohonan peminjaman berhasil dikirim! Menunggu validasi admin.", "success");
  };

  const handleCancel = (id) => {
    setBookings(prev => prev.filter(b => b.id !== id));
    showToast("Peminjaman berhasil dibatalkan.", "info");
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const filtered = bookings.filter(b => statusFilter === "all" || b.status === statusFilter);

  const counts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    approved: bookings.filter(b => b.status === "approved").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Peminjaman Ruang Kelas SG</h2>
          <p className="text-sm text-gray-400 mt-0.5">Ajukan peminjaman ruang untuk kegiatan perkuliahan</p>
        </div>
        <Button variant="primary" onClick={() => setShowForm(true)}>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Ajukan Peminjaman
        </Button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { key: "all", label: "Semua" },
          { key: "pending", label: "Menunggu" },
          { key: "approved", label: "Disetujui" },
          { key: "rejected", label: "Ditolak" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150
              ${statusFilter === tab.key ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
              {counts[tab.key]}
            </span>
          </button>
        ))}
      </div>

      {/* Booking Cards Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-semibold text-gray-600">Belum ada data peminjaman</p>
          <p className="text-xs text-gray-400 mt-1">Klik tombol di atas untuk mengajukan peminjaman.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}

      {/* Booking Form Modal */}
      <Modal isOpen={showForm} onClose={() => { setShowForm(false); setErrors({}); }} title="Ajukan Peminjaman Ruang" size="lg">
        <div className="space-y-4">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3.5 flex gap-3">
            <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-xs text-blue-700">Pastikan detail mata kuliah dan dosen pengampu sudah benar. Data ini akan diverifikasi oleh admin sebelum disetujui.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Select
                label="Ruangan yang Ingin Dipinjam"
                id="roomId"
                required
                value={form.roomId}
                onChange={e => handleChange("roomId", e.target.value)}
                error={errors.roomId}
              >
                <option value="">-- Pilih Ruangan --</option>
                {availableRooms.map(r => (
                  <option key={r.id} value={r.id}>{r.name} (Lantai {r.floor} · {r.capacity} kursi)</option>
                ))}
              </Select>
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Nama Mata Kuliah / Praktikum"
                id="mataKuliah"
                required
                placeholder="Contoh: Rekayasa Sistem Lanjutan"
                value={form.mataKuliah}
                onChange={e => handleChange("mataKuliah", e.target.value)}
                error={errors.mataKuliah}
              />
            </div>

            <div className="sm:col-span-2">
              <Input
                label="Nama Dosen Pengampu"
                id="dosen"
                required
                placeholder="Contoh: Dr. Siti Rahma, S.Kom., M.Cs."
                value={form.dosen}
                onChange={e => handleChange("dosen", e.target.value)}
                error={errors.dosen}
              />
            </div>

            <Input
              label="Tanggal Peminjaman"
              id="tanggal"
              type="date"
              required
              value={form.tanggal}
              onChange={e => handleChange("tanggal", e.target.value)}
              error={errors.tanggal}
            />

            <Select
              label="Jam Mulai"
              id="jamMulai"
              required
              value={form.jamMulai}
              onChange={e => handleChange("jamMulai", e.target.value)}
              error={errors.jamMulai}
            >
              <option value="">-- Pilih Jam --</option>
              {JAM_OPTIONS.map(j => <option key={j} value={j}>{j} WITA</option>)}
            </Select>

            <Select
              label="Durasi Penggunaan"
              id="durasi"
              required
              value={form.durasi}
              onChange={e => handleChange("durasi", e.target.value)}
              error={errors.durasi}
            >
              <option value="">-- Pilih Durasi --</option>
              {DURATION_OPTIONS.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
            </Select>

            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Keterangan Tambahan</label>
              <textarea
                rows={2}
                placeholder="Informasi tambahan (opsional)..."
                value={form.keterangan}
                onChange={e => handleChange("keterangan", e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder:text-gray-400"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button variant="secondary" onClick={() => { setShowForm(false); setErrors({}); }}>Batal</Button>
            <Button variant="primary" onClick={handleSubmit}>Kirim Permohonan</Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
