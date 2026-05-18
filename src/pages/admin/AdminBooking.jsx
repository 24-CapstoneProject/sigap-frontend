import { useState } from "react";
import { Badge, Button, Modal, Toast } from "../../components/ui/index.jsx";
import { allBookings } from "../../data/mockData.js";

function BookingCard({ booking, isAdmin, onApprove, onReject }) {
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
          <p className="text-[10px] text-gray-400 mb-0.5 uppercase tracking-wide">Pemohon</p>
          <p className="text-xs font-semibold text-gray-700 truncate">{booking.nama}</p>
        </div>
      </div>

      {booking.status === "rejected" && booking.rejectReason && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
          <p className="text-xs text-red-600 font-medium">Alasan Penolakan: {booking.rejectReason}</p>
        </div>
      )}

      {isAdmin && booking.status === "pending" && (
        <div className="flex gap-2">
          <Button variant="success" size="sm" className="flex-1 justify-center" onClick={() => onApprove(booking.id)}>
            ✓ Setujui
          </Button>
          <Button variant="danger" size="sm" className="flex-1 justify-center" onClick={() => onReject(booking.id)}>
            ✕ Tolak
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminBooking({ user }) {
  const [toast, setToast] = useState(null);
  const [bookings, setBookings] = useState(allBookings);
  const [statusFilter, setStatusFilter] = useState("all");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleApprove = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "approved" } : b));
    showToast("Peminjaman berhasil disetujui.", "success");
  };

  const handleReject = (id) => {
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "rejected", rejectReason: "Tidak memenuhi syarat penggunaan fasilitas." } : b));
    showToast("Peminjaman ditolak.", "info");
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
          <h2 className="text-lg font-bold text-gray-900">Manajemen Peminjaman Ruang</h2>
          <p className="text-sm text-gray-400 mt-0.5">Validasi pengajuan peminjaman dari mahasiswa</p>
        </div>
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
          <p className="text-xs text-gray-400 mt-1">Belum ada pengajuan masuk.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(booking => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isAdmin={true}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
