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

  // Calculate booking percentage
  const totalCapacity = rooms.reduce((sum, room) => sum + room.capacity, 0);
  const bookedCapacity = rooms
    .filter(r => r.status === "occupied" || r.status === "ending_soon")
    .reduce((sum, room) => sum + room.capacity, 0);
  const bookingPercentage = Math.round((bookedCapacity / totalCapacity) * 100);

  // Calculate infocus usage
  const roomsWithProjector = rooms.filter(r => r.features.includes("Proyektor"));
  const projectorUsed = roomsWithProjector.filter(r => r.status === "occupied" || r.status === "ending_soon");
  const projectorPercentage = Math.round((projectorUsed.length / roomsWithProjector.length) * 100);

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

      {/* Room Schedule & Usage Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Jadwal Penggunaan Ruangan */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <h2 className="text-base font-bold text-gray-900">📋 Jadwal Penggunaan Ruangan</h2>
            <p className="text-xs text-gray-400 mt-0.5">Status penggunaan ruangan saat ini</p>
          </div>
          <div className="p-5 space-y-2 max-h-96 overflow-y-auto">
            {rooms.map(room => (
              <div key={room.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-sm font-bold text-blue-600">
                    {room.name}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{room.name}</p>
                    {room.status === "occupied" && (
                      <p className="text-xs text-gray-500">{room.occupiedBy} (selesai {room.occupiedUntil})</p>
                    )}
                    {room.status === "ending_soon" && (
                      <p className="text-xs text-amber-600">Akan selesai {room.occupiedUntil}</p>
                    )}
                    {room.status === "available" && (
                      <p className="text-xs text-emerald-600">Tersedia</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {room.status === "occupied" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                      Terpakai
                    </span>
                  )}
                  {room.status === "ending_soon" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                      Segera Selesai
                    </span>
                  )}
                  {room.status === "available" && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                      ✓ Tersedia
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usage Index Cards */}
        <div className="space-y-4">
          {/* Indeks Peminjaman */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Indeks Peminjaman</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{bookingPercentage}%</p>
              </div>
              <div className="text-3xl">📊</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${bookingPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {bookedCapacity} dari {totalCapacity} kapasitas terpakai
            </p>
          </div>

          {/* Penggunaan Infokus */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Penggunaan Infokus</p>
                <p className="text-2xl font-extrabold text-gray-900 mt-1">{projectorPercentage}%</p>
              </div>
              <div className="text-3xl">📽️</div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${projectorPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {projectorUsed.length} dari {roomsWithProjector.length} infokus sedang digunakan
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl border border-blue-200 p-4">
            <p className="text-xs font-semibold text-blue-900 mb-2">💡 Info</p>
            <p className="text-xs text-blue-800 leading-relaxed">
              {occupiedRooms} ruangan sedang aktif digunakan. {bookingRequests.length} permintaan menunggu persetujuan.
            </p>
          </div>
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
