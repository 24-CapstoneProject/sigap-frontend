import { useState, useEffect } from "react";
import { Badge, Button } from "../../components/ui/index.jsx";
import { apiFetch } from "../../utils/api.js";
import { mapBooking, mapRoomForDashboard } from "../../utils/mappers.js";

function StatCard({ label, value, sublabel, icon, color }) {
  const bgColors = {
    amber: "bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400",
    emerald: "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400",
    red: "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400",
    blue: "bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400",
  };
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/80 shadow-xs flex items-center justify-between transition-all duration-200">
      <div className="space-y-1.5">
        <p className="text-[10px] lg:text-xs font-bold text-blue-900/60 dark:text-slate-400 uppercase tracking-widest">{label}</p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{value}</span>
          <span className="text-xs text-gray-400 dark:text-slate-400 font-medium">{sublabel}</span>
        </div>
      </div>
      <div className={`w-12 h-12 rounded-2xl ${bgColors[color]} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
    </div>
  );
}

function BookingRequestCard({ booking, onApprove, onReject }) {
  const endHour = booking.jamMulai
    ? String(parseInt(booking.jamMulai.split(":")[0], 10) + (booking.durasi || 0)).padStart(2, "0") + ":00"
    : "-";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/80 p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-semibold text-gray-400 dark:text-slate-400 mb-1">📋 {booking.mataKuliah}</p>
          <p className="text-sm font-bold text-gray-900 dark:text-white">{booking.nama}</p>
          <p className="text-xs text-gray-500 dark:text-slate-450 mt-0.5">{booking.nim}</p>
        </div>
        <Badge status={booking.status} />
      </div>

      <div className="bg-gray-50 dark:bg-slate-900/30 rounded-xl p-3.5 mb-3.5 space-y-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-slate-400">Ruangan:</span>
          <span className="font-semibold text-gray-800 dark:text-slate-200">{booking.roomName}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-slate-400">Tanggal:</span>
          <span className="font-semibold text-gray-800 dark:text-slate-200">{booking.tanggal}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600 dark:text-slate-400">Jam:</span>
          <span className="font-semibold text-gray-800 dark:text-slate-200">{booking.jamMulai} - {endHour}</span>
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
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split("T")[0];

  const loadDashboardData = async () => {
    const [roomsResponse, bookingsResponse] = await Promise.all([
      apiFetch("/api/rooms"),
      apiFetch("/api/bookings"),
    ]);

    if (roomsResponse.ok) {
      const roomsData = await roomsResponse.json();
      setRooms((roomsData.rooms || []).map(mapRoomForDashboard));
    }

    if (bookingsResponse.ok) {
      const bookingsData = await bookingsResponse.json();
      setBookings((bookingsData.bookings || []).map(mapBooking));
    }
  };

  useEffect(() => {
    loadDashboardData().finally(() => setLoading(false));
  }, []);

  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const approvedToday = bookings.filter((b) => b.status === "approved" && b.tanggal === today).length;
  const occupiedRooms = rooms.filter((r) => r.status === "occupied" || r.status === "ending_soon").length;
  const availableRooms = rooms.filter((r) => r.status === "available").length;

  const totalCapacity = rooms.reduce((sum, room) => sum + (room.capacity || 0), 0);
  const bookedCapacity = rooms
    .filter((r) => r.status === "occupied" || r.status === "ending_soon")
    .reduce((sum, room) => sum + (room.capacity || 0), 0);
  const bookingPercentage = totalCapacity > 0 ? Math.round((bookedCapacity / totalCapacity) * 100) : 0;

  const roomsWithProjector = rooms.filter((r) => r.features?.includes("Proyektor"));
  const projectorUsed = roomsWithProjector.filter((r) => r.status === "occupied" || r.status === "ending_soon");
  const projectorPercentage = roomsWithProjector.length > 0
    ? Math.round((projectorUsed.length / roomsWithProjector.length) * 100)
    : 0;

  const handleApprove = async (id) => {
    const response = await apiFetch(`/api/bookings/${id}/approve`, {
      method: "POST",
      body: JSON.stringify({ adminNotes: "Disetujui dari dashboard" }),
    });
    if (response.ok) await loadDashboardData();
  };

  const handleReject = async (id) => {
    const response = await apiFetch(`/api/bookings/${id}/reject`, {
      method: "POST",
      body: JSON.stringify({ rejectReason: "Ditolak dari dashboard admin" }),
    });
    if (response.ok) await loadDashboardData();
  };

  return (
    <div className="space-y-6">
      
      {/* 4 Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          label="Permintaan Tertunda" 
          value={pendingBookings.length} 
          sublabel="Awaiting Review" 
          icon={(
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8V4H8v4c0 2.21 1.79 4 4 4s4-1.79 4-4V4h-4zm0 8v4H8v-4c0-2.21 1.79-4 4-4s4 1.79 4 4v4h-4z" />
            </svg>
          )} 
          color="amber" 
        />
        <StatCard 
          label="Disetujui Hari Ini" 
          value={approvedToday} 
          sublabel="Requests Processed" 
          icon={(
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
            </svg>
          )} 
          color="emerald" 
        />
        <StatCard 
          label="Ruangan Digunakan" 
          value={occupiedRooms} 
          sublabel="In-use Now" 
          icon={(
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          )} 
          color="red" 
        />
        <StatCard 
          label="Ruangan Tersedia" 
          value={availableRooms} 
          sublabel="Vacant Spaces" 
          icon={(
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          )} 
          color="blue" 
        />
      </div>

      {/* Main Grid: Rooms Schedule vs Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Room Schedules */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/80 shadow-xs flex flex-col justify-between">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700/60">
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-blue-600">📅</span> Jadwal Penggunaan Ruangan
            </h2>
            <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">Status ruangan berdasarkan peminjaman yang disetujui hari ini</p>
          </div>
          
          <div className="p-6 space-y-4 max-h-[500px] overflow-y-auto divide-y divide-gray-100 dark:divide-slate-700/60">
            {loading ? (
              <p className="text-sm text-gray-400 text-center py-8">Memuat data ruangan...</p>
            ) : rooms.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-8">Belum ada data ruangan.</p>
            ) : (
              rooms.map((room) => (
                <div key={room.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-3.5 flex-1">
                    <div className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs lg:text-sm select-none shrink-0 border border-blue-100/50 dark:border-blue-900/20">
                      {room.name}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm lg:text-base font-bold text-gray-900 dark:text-white truncate">{room.name}</p>
                      {room.status === "occupied" && (
                        <p className="text-xs text-gray-500 dark:text-slate-450 truncate">{room.occupiedBy} (selesai {room.occupiedUntil})</p>
                      )}
                      {room.status === "ending_soon" && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 truncate">Akan selesai {room.occupiedUntil}</p>
                      )}
                      {room.status === "available" && (
                        <p className="text-xs text-gray-400 dark:text-slate-400 truncate">Kapasitas: {room.capacity} Orang</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {room.status === "occupied" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        Terpakai
                      </span>
                    )}
                    {room.status === "ending_soon" && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30">
                        <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse"></span>
                        Segera Selesai
                      </span>
                    )}
                    {room.status === "available" && (
                      <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30">
                        ✓ Tersedia
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Loan Index, Projector Usage & Info card */}
        <div className="space-y-4">
          
          {/* Loan Index Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/80 p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-blue-900/60 dark:text-slate-400 uppercase tracking-widest">Indeks Peminjaman</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 leading-none">{bookingPercentage}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${bookingPercentage}%` }}
              ></div>
            </div>
            <div className="mt-4 flex items-center justify-between text-xs text-gray-400 dark:text-slate-400 font-medium">
              <span>{bookedCapacity} dari {totalCapacity} kapasitas</span>
              <span>{bookingPercentage > 0 ? "Kapasitas aktif terpakai" : "Belum ada peminjaman"}</span>
            </div>
          </div>

          {/* Projector Usage Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/80 p-6 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-[10px] lg:text-xs font-bold text-blue-900/60 dark:text-slate-400 uppercase tracking-widest">Penggunaan Infokus</p>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1.5 leading-none">{projectorPercentage}%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-slate-700 rounded-full h-2">
              <div
                className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${projectorPercentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-400 dark:text-slate-400 font-medium mt-4">
              {projectorUsed.length} dari {roomsWithProjector.length} ruangan berproyektor sedang digunakan
            </p>
          </div>

          {/* Info Card */}
          <div className="bg-blue-50/70 border border-blue-100/50 dark:bg-blue-950/20 dark:border-blue-900/30 rounded-3xl p-5 flex gap-3.5">
            <svg className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-blue-950 dark:text-blue-400">Info Dashboard</h4>
              <p className="text-xs text-blue-900/80 dark:text-blue-300/80 leading-relaxed">
                Saat ini terdapat {occupiedRooms} ruangan sedang aktif digunakan. {availableRooms} ruangan tersedia untuk reservasi baru. Terdapat {pendingBookings.length} permintaan yang sedang menunggu persetujuan administrator.
              </p>
            </div>
          </div>

        </div>

      </div>

      {/* Pending Requests Section (conditional) */}
      {pendingBookings.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-3xl border border-gray-200/60 dark:border-slate-700/80 shadow-xs">
          <div className="p-6 border-b border-gray-100 dark:border-slate-700/60 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Permintaan Peminjaman Tertunda</h2>
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">{pendingBookings.length} permintaan perlu ditinjau</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate("booking")}>Lihat Semua →</Button>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {pendingBookings.slice(0, 3).map((booking) => (
              <BookingRequestCard
                key={booking.id}
                booking={booking}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bottom Quick Navigation Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => onNavigate("booking")}
          className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/85 rounded-2xl p-5 hover:shadow-md transition-all duration-200 text-center cursor-pointer select-none group"
        >
          <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">📅</p>
          <p className="text-xs lg:text-sm font-bold text-gray-800 dark:text-slate-200">Manajemen Booking</p>
        </button>
        <button
          onClick={() => onNavigate("inventory")}
          className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/85 rounded-2xl p-5 hover:shadow-md transition-all duration-200 text-center cursor-pointer select-none group"
        >
          <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">📦</p>
          <p className="text-xs lg:text-sm font-bold text-gray-800 dark:text-slate-200">Inventaris Barang</p>
        </button>
        <button
          onClick={() => onNavigate("lostfound")}
          className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/85 rounded-2xl p-5 hover:shadow-md transition-all duration-200 text-center cursor-pointer select-none group"
        >
          <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">🔍</p>
          <p className="text-xs lg:text-sm font-bold text-gray-800 dark:text-slate-200">Lost & Found</p>
        </button>
        <button
          onClick={() => onNavigate("users")}
          className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700/85 rounded-2xl p-5 hover:shadow-md transition-all duration-200 text-center cursor-pointer select-none group"
        >
          <p className="text-2xl mb-2 group-hover:scale-110 transition-transform">👥</p>
          <p className="text-xs lg:text-sm font-bold text-gray-800 dark:text-slate-200">Pengguna</p>
        </button>
      </div>

    </div>
  );
}
