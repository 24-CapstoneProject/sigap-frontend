import { useState } from "react";
import { Badge, Button, Modal } from "../../components/ui/index.jsx";
import { rooms, allBookings } from "../../data/mockData.js";

function StatCard({ label, value, icon, color }) {
  const colors = {
    blue:    "from-blue-500 to-blue-700 shadow-blue-200",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-200",
    red:     "from-red-500 to-red-700 shadow-red-200",
    amber:   "from-amber-400 to-amber-600 shadow-amber-200",
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

function BookingRequestCard({ booking, onApprove, onReject }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 mb-1">📋 {booking.mataKuliah}</p>
          <p className="text-sm font-bold text-gray-900">{booking.nama}</p>
          <p className="text-xs text-gray-500 mt-0.5">{booking.nim}</p>
        </div>
        <Badge status={booking.status} />
      </div>

      <div className="bg-gray-50 rounded-lg p-3 mb-3 space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Ruangan:</span>
          <span className="font-semibold text-gray-800">{booking.roomName}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Tanggal:</span>
          <span className="font-semibold text-gray-800">{booking.tanggal}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Jam:</span>
          <span className="font-semibold text-gray-800">{booking.jamMulai} - {parseInt(booking.jamMulai) + booking.durasi}:00</span>
        </div>
      </div>

      {booking.status === "pending" && (
        <div className="flex gap-2">
          <Button variant="success" size="sm" className="flex-1 justify-center text-xs" onClick={() => onApprove(booking.id)}>
            ✓ Setujui
          </Button>
          <Button variant="danger" size="sm" className="flex-1 justify-center text-xs" onClick={() => onReject(booking.id)}>
            ✕ Tolak
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard({ user, onNavigate }) {
  const [bookingRequests, setBookingRequests] = useState(allBookings.filter(b => b.status === "pending"));
  const [selectedRoom, setSelectedRoom] = useState(null);
  
  const pendingCount = allBookings.filter(b => b.status === "pending").length;
  const approvedCount = allBookings.filter(b => b.status === "approved").length;
  const occupiedRooms = rooms.filter(r => r.status === "occupied").length;

  const handleApprove = (id) => {
    setBookingRequests(prev => prev.filter(b => b.id !== id));
  };

  const handleReject = (id) => {
    setBookingRequests(prev => prev.filter(b => b.id !== id));
  };

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="150" cy="50" r="80" fill="white" />
            <circle cx="50" cy="150" r="60" fill="white" />
          </svg>
        </div>
        <div className="relative">
          <p className="text-purple-200 text-sm font-medium mb-1">Selamat datang kembali,</p>
          <h2 className="text-2xl font-extrabold">{user.name} 🛡️</h2>
          <p className="text-purple-200 text-sm mt-1">Admin Panel • Manajemen Fasilitas Gedung SG</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Permintaan Tertunda" value={pendingCount} icon="⏳" color="amber" />
        <StatCard label="Disetujui Hari Ini" value={approvedCount} icon="✅" color="emerald" />
        <StatCard label="Ruangan Digunakan" value={occupiedRooms} icon="🏛️" color="red" />
        <StatCard label="Total Ruangan" value={rooms.length} icon="📊" color="blue" />
      </div>

      {/* Pending Booking Requests */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">📋 Permohonan Peminjaman Menunggu</h2>
            <p className="text-xs text-gray-400 mt-0.5">Ajukan persetujuan atau penolakan</p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-semibold">
            {bookingRequests.length} {bookingRequests.length === 1 ? "permintaan" : "permintaan"}
          </div>
        </div>

        <div className="p-5">
          {bookingRequests.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <span className="text-4xl mb-3 block">✅</span>
              <p className="text-sm">Semua permintaan peminjaman telah diproses</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {bookingRequests.map(booking => (
                <BookingRequestCard
                  key={booking.id}
                  booking={booking}
                  onApprove={handleApprove}
                  onReject={handleReject}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button 
          onClick={() => onNavigate("booking")}
          className="bg-blue-50 border border-blue-200 rounded-2xl p-4 hover:bg-blue-100 transition-colors text-center"
        >
          <p className="text-2xl mb-2">📋</p>
          <p className="text-sm font-semibold text-blue-900">Manajemen Booking</p>
        </button>
        <button 
          onClick={() => onNavigate("inventory")}
          className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 hover:bg-emerald-100 transition-colors text-center"
        >
          <p className="text-2xl mb-2">📦</p>
          <p className="text-sm font-semibold text-emerald-900">Inventaris</p>
        </button>
        <button 
          onClick={() => onNavigate("lostfound")}
          className="bg-purple-50 border border-purple-200 rounded-2xl p-4 hover:bg-purple-100 transition-colors text-center"
        >
          <p className="text-2xl mb-2">🔍</p>
          <p className="text-sm font-semibold text-purple-900">Barang Hilang</p>
        </button>
        <button 
          className="bg-gray-50 border border-gray-200 rounded-2xl p-4 hover:bg-gray-100 transition-colors text-center"
        >
          <p className="text-2xl mb-2">📊</p>
          <p className="text-sm font-semibold text-gray-900">Laporan</p>
        </button>
      </div>

    </div>
  );
}
