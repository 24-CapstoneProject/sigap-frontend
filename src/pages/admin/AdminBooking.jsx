import { useState } from "react";
import { Toast } from "../../components/ui/index.jsx";
import { allBookings } from "../../data/mockData.js";

function StatCard({ label, value, icon, color }) {
  const colors = {
    amber:   "from-amber-400 to-amber-600 shadow-amber-200",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-200",
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

export default function AdminBooking() {
  const [toast, setToast] = useState(null);
  const [bookings, setBookings] = useState(allBookings);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRejectedDetail, setSelectedRejectedDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ✅ APPROVE
  const handleApprove = (id) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === id ? { ...b, status: "approved" } : b
      )
    );
    showToast("Peminjaman disetujui");
  };

  // ✅ TOGGLE FORM REJECT
  const toggleReject = (id) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === id ? { ...b, showReject: !b.showReject } : b
      )
    );
  };

  // ✅ SET REASON
  const setRejectReason = (id, reason) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === id ? { ...b, rejectReason: reason } : b
      )
    );
  };

  // ✅ REJECT
  const handleReject = (id) => {
    setBookings(prev =>
      prev.map(b =>
        b.id === id
          ? { ...b, status: "rejected", showReject: false }
          : b
      )
    );
    showToast("Peminjaman ditolak", "info");
  };

  const filtered = bookings.filter((b) => {
    const statusMatch = statusFilter === "all" || b.status === statusFilter;
    const searchMatch = b.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        b.nim.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const counts = {
    pending: bookings.filter(b => b.status === "pending").length,
    approved: bookings.filter(b => b.status === "approved").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
  };

  return (
    <div className="space-y-6">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Manajemen Ruangan
          </h2>
          <p className="text-sm text-gray-400">
            Monitoring real-time aktivitas fasilitas hari ini.
          </p>
        </div>

        <div className="text-right text-sm text-gray-500">
          <p>Kamis, 24 Okt 2024</p>
          <p>09:42 AM</p>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard 
          label="Pending Request" 
          value={counts.pending} 
          icon="⏳" 
          color="amber"
        />
        <StatCard 
          label="Approved Today" 
          value={counts.approved} 
          icon="✅" 
          color="emerald"
        />
        <StatCard 
          label="Rejected Today" 
          value={counts.rejected} 
          icon="✕" 
          color="red"
        />
      </div>

      {/* DETAIL MODAL - REJECTED BOOKING */}
      {selectedRejectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detail Penolakan</h3>
              <button
                onClick={() => setSelectedRejectedDetail(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">NAMA MAHASISWA</p>
                <p className="text-lg font-bold text-gray-900">{selectedRejectedDetail.nama}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">RUANGAN</p>
                  <p className="text-sm font-bold text-gray-900">{selectedRejectedDetail.roomName}</p>
                </div>
                <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                  <p className="text-xs text-gray-500 font-semibold mb-1">DURASI</p>
                  <p className="text-sm font-bold text-gray-900">{selectedRejectedDetail.durasi} Jam</p>
                </div>
              </div>

              <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">TANGGAL & JAM</p>
                <p className="text-sm font-bold text-gray-900">{selectedRejectedDetail.tanggal}</p>
                <p className="text-sm font-bold text-gray-900 mt-1">{selectedRejectedDetail.jamMulai} WITA</p>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-2">MATA KULIAH</p>
                <p className="text-sm font-semibold text-gray-900">{selectedRejectedDetail.mataKuliah}</p>
              </div>

              {selectedRejectedDetail.rejectReason && (
                <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                  <p className="text-xs text-gray-500 font-semibold mb-2">ALASAN PENOLAKAN</p>
                  <p className="text-sm text-red-700 font-medium">{selectedRejectedDetail.rejectReason}</p>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setSelectedRejectedDetail(null)}
                  className="flex-1 bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-all"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FILTER & SEARCH */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {[
            { key: "pending", label: "Menunggu" },
            { key: "approved", label: "Disetujui" },
            { key: "rejected", label: "Ditolak" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold
                ${statusFilter === tab.key
                  ? "bg-blue-600 text-white"
                  : "bg-white border text-gray-500"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 Cari nama mahasiswa..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
        />
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-2xl border overflow-hidden">

        {/* HEADER TABLE */}
        <div className="grid grid-cols-5 bg-gray-50 px-4 py-3 text-xs text-gray-500 font-semibold">
          <p>Student Name</p>
          <p>Course</p>
          <p>Room & Time</p>
          <p>Status</p>
          <p className="text-center">Actions</p>
        </div>

        {/* ROWS */}
        {filtered.map((b) => (
          <div key={b.id} className="border-t">

            {/* ROW */}
            <div className="grid grid-cols-5 items-center px-4 py-4 text-sm">

              {/* STUDENT */}
              <div>
                <p className="font-semibold text-gray-900">{b.nama}</p>
                <p className="text-xs text-gray-500 mt-1">{b.nim}</p>
              </div>

              {/* COURSE */}
              <div>
                <p className="font-semibold text-gray-900">{b.mataKuliah}</p>
                <p className="text-xs text-gray-500 mt-1">{b.dosen}</p>
              </div>

              {/* ROOM & TIME */}
              <div>
                <div className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs font-semibold mb-2">
                  {b.roomName}
                </div>
                <p className="text-xs text-gray-600">{b.tanggal}</p>
                <p className="text-xs text-gray-500">{b.jamMulai} ({b.durasi}h)</p>
              </div>

              {/* STATUS */}
              <div>
                {b.status === "pending" && (
                  <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ⏳ Menunggu
                  </span>
                )}
                {b.status === "approved" && (
                  <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ✓ Disetujui
                  </span>
                )}
                {b.status === "rejected" && (
                  <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">
                    ✕ Ditolak
                  </span>
                )}
              </div>

              {/* ACTION */}
              <div className="flex justify-center gap-2">
                {b.status === "pending" && (
                  <>
                    <button
                      onClick={() => handleApprove(b.id)}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600 transition-all"
                    >
                      ✓ Setujui
                    </button>
                    <button
                      onClick={() => toggleReject(b.id)}
                      className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-all"
                    >
                      ✕ Tolak
                    </button>
                  </>
                )}
                {b.status === "rejected" && (
                  <button
                    onClick={() => setSelectedRejectedDetail(b)}
                    className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg transition-all font-semibold"
                    title="Lihat Detail Penolakan"
                  >
                    👁️ Lihat
                  </button>
                )}
              </div>
            </div>

            {/* REJECT FORM */}
            {b.showReject && (
              <div className="px-4 pb-4">
                <div className="bg-gray-50 border rounded-xl p-4">

                  <p className="text-xs text-gray-500 mb-2">
                    Alasan Penolakan (Opsional)
                  </p>

                  <textarea
                    className="w-full border rounded-lg p-2 text-sm"
                    placeholder="Contoh: Jadwal bentrok..."
                    onChange={(e) =>
                      setRejectReason(b.id, e.target.value)
                    }
                  />

                  <div className="flex justify-end mt-3">
                    <button
                      onClick={() => handleReject(b.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm"
                    >
                      Kirim Penolakan
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        ))}

      </div>

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