import { useState } from "react";
import { Badge, StatusDot, Button, Modal } from "../components/ui/index.jsx";
import { rooms, stats, bookingHistory } from "../data/mockData.js";

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

function RoomCard({ room, onBook }) {
  const cardBg = {
    available:   "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-lg",
    occupied:    "bg-red-50/50 border-red-200",
    ending_soon: "bg-amber-50/50 border-amber-200 hover:shadow-md",
  };
  return (
    <div className={`rounded-2xl border p-4 transition-all duration-200 cursor-default ${cardBg[room.status]}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900">{room.name}</h3>
          <p className="text-xs text-gray-400 mt-0.5">Lantai {room.floor} · {room.capacity} kursi</p>
        </div>
        <StatusDot status={room.status} />
      </div>

      <Badge status={room.status} />

      {room.status !== "available" && (
        <div className="mt-3 p-2.5 bg-white/70 rounded-xl">
          <p className="text-xs font-semibold text-gray-700 truncate">{room.occupiedBy}</p>
          <p className="text-xs text-gray-400 mt-0.5">Selesai pukul {room.occupiedUntil}</p>
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-1">
        {room.features.slice(0, 3).map(f => (
          <span key={f} className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{f}</span>
        ))}
      </div>

      {room.status === "available" && (
        <div className="mt-3">
          <Button variant="primary" size="sm" className="w-full justify-center" onClick={() => onBook(room)}>
            Booking Sekarang
          </Button>
        </div>
      )}
    </div>
  );
}

export default function DashboardPage({ user, onNavigate }) {
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [floorFilter, setFloorFilter] = useState("all");

  const filtered = rooms.filter(r => {
    const statusOk = filterStatus === "all" || r.status === filterStatus;
    const floorOk  = floorFilter === "all" || r.floor === Number(floorFilter);
    return statusOk && floorOk;
  });

  const recentBookings = bookingHistory.slice(0, 3);

  return (
    <div className="space-y-6">

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-full opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            <circle cx="150" cy="50" r="80" fill="white" />
            <circle cx="50" cy="150" r="60" fill="white" />
          </svg>
        </div>
        <div className="relative">
          <p className="text-blue-200 text-sm font-medium mb-1">Selamat datang kembali,</p>
          <h2 className="text-2xl font-extrabold">{user.name.split(" ")[0]} </h2>
          <p className="text-blue-200 text-sm mt-1">{user.nim} · {user.prodi}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Ruangan" value={stats.totalRooms} icon="🏛️" color="blue" />
        <StatCard label="Tersedia" value={stats.availableRooms} icon="✅" color="emerald" />
        <StatCard label="Digunakan" value={stats.occupiedRooms} icon="🔴" color="red" />
        <StatCard label="Segera Selesai" value={stats.endingSoon} icon="⏳" color="amber" />
      </div>

      {/* Room Grid */}
      <div className="bg-white rounded-2xl border border-gray-100">
        <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Status Ruangan SG</h2>
            <p className="text-xs text-gray-400 mt-0.5">Real-time · Terakhir diperbarui barusan</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {/* Floor Filter */}
            <select
              value={floorFilter}
              onChange={e => setFloorFilter(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200"
              aria-label="Filter lantai"
            >
              <option value="all">Semua Lantai</option>
              <option value="1">Lantai 1</option>
              <option value="2">Lantai 2</option>
            </select>
            {/* Status Filter */}
            {["all", "available", "occupied", "ending_soon"].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors duration-150
                  ${filterStatus === s ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}`}
              >
                {s === "all" ? "Semua" : s === "available" ? "Tersedia" : s === "occupied" ? "Digunakan" : "Segera Selesai"}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
          {filtered.map(room => (
            <RoomCard key={room.id} room={room} onBook={r => { setSelectedRoom(r); }} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm">
              Tidak ada ruangan yang cocok dengan filter.
            </div>
          )}
        </div>
      </div>

      {/* Recent Booking History */}
      {user.role === "mahasiswa" && (
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Riwayat Peminjaman Saya</h2>
              <p className="text-xs text-gray-400 mt-0.5">3 peminjaman terakhir</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("booking")}>Lihat Semua →</Button>
          </div>
          <div className="divide-y divide-gray-50">
            {recentBookings.map(bk => (
              <div key={bk.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                    <span className="text-base">🏫</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{bk.mataKuliah}</p>
                    <p className="text-xs text-gray-400">{bk.roomName} · {bk.tanggal}</p>
                  </div>
                </div>
                <Badge status={bk.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Room Detail Modal */}
      <Modal isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)} title={`Detail Ruangan ${selectedRoom?.name}`}>
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Kapasitas</p>
                <p className="text-sm font-bold text-gray-800">{selectedRoom.capacity} kursi</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Lantai</p>
                <p className="text-sm font-bold text-gray-800">Lantai {selectedRoom.floor}</p>
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-2">Fasilitas</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.features.map(f => (
                  <span key={f} className="text-xs bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-full">{f}</span>
                ))}
              </div>
            </div>
            <div className="pt-2 flex gap-2 justify-end">
              <Button variant="secondary" onClick={() => setSelectedRoom(null)}>Tutup</Button>
              <Button variant="primary" onClick={() => { setSelectedRoom(null); onNavigate("booking"); }}>
                Booking Ruangan Ini
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
