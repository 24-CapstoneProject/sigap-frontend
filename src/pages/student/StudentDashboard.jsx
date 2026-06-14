import { useState, useEffect } from "react";
import { Badge, Button, Modal } from "../../components/ui/index.jsx";
import { apiFetch } from "../../utils/api.js";
import { mapBooking, mapRoomForDashboard } from "../../utils/mappers.js";
import VisualCalendar from "../../components/VisualCalendar.jsx";

function RoomCard({ room, onBook }) {
  const statusBadge = {
    available: { text: "TERSEDIA", class: "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
    occupied: { text: "DIPAKAI", class: "bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400" },
    ending_soon: { text: "SEGERA SELESEI", class: "bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" },
  };

  const badgeInfo = statusBadge[room.status] || statusBadge.available;

  return (
    <div 
      onClick={() => onBook(room)}
      className="bg-white dark:bg-slate-800 rounded-2xl p-5 flex flex-col justify-between hover:shadow-md transition-all duration-200 cursor-pointer group shadow-2xs"
    >
      <div>
        {/* Header */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">
            LANTAI {room.floor}
          </span>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded tracking-wide ${badgeInfo.class}`}>
            {badgeInfo.text}
          </span>
        </div>

        {/* Room Name */}
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          Ruang {room.name}
        </h3>

        {/* Status Text & Icon */}
        <div className="mt-3">
          {room.status === "available" ? (
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-450 text-sm font-semibold">
              <span className="text-base">✓</span>
              <span>Tersedia</span>
            </div>
          ) : room.status === "ending_soon" ? (
            <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-450 text-sm font-medium">
              <span className="text-sm">🕒</span>
              <span>Selesai dlm {room.occupiedUntil}</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 text-sm font-medium">
              <span className="text-sm">🕒</span>
              <span>Selesai dalam {room.occupiedUntil}</span>
            </div>
          )}
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-5">
        {room.status === "available" ? (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onBook(room);
            }}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-sm cursor-pointer text-center"
          >
            Book Ruangan
          </button>
        ) : room.status === "ending_soon" ? (
          <button 
            disabled
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-slate-700 rounded-xl font-semibold text-xs cursor-not-allowed text-center"
          >
            Segera Tersedia
          </button>
        ) : (
          <button 
            disabled
            onClick={(e) => e.stopPropagation()}
            className="w-full py-2.5 bg-gray-50 dark:bg-slate-700/50 text-gray-400 dark:text-gray-500 border border-gray-100 dark:border-slate-700 rounded-xl font-semibold text-xs cursor-not-allowed text-center"
          >
            Sudah Terisi
          </button>
        )}
      </div>
    </div>
  );
}

export default function StudentDashboard({ user, onNavigate, setBookingPreFill }) {
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomSchedules, setRoomSchedules] = useState([]);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedRoom) {
      setLoadingDetail(true);
      apiFetch(`/api/rooms/${selectedRoom.id}`)
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Failed to fetch room detail");
        })
        .then((data) => {
          setRoomSchedules(data.room?.schedules || []);
        })
        .catch((err) => {
          console.error("Failed to fetch room detail:", err);
          setRoomSchedules([]);
        })
        .finally(() => {
          setLoadingDetail(false);
        });
    } else {
      setRoomSchedules([]);
    }
  }, [selectedRoom]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [roomsResponse, bookingsResponse] = await Promise.all([
          apiFetch("/api/rooms"),
          apiFetch("/api/bookings/my-bookings"),
        ]);

        if (roomsResponse.ok) {
          const roomsData = await roomsResponse.json();
          // Sort rooms alphabetically by name (e.g. F.F 01, F.F 02...)
          const sorted = (roomsData.rooms || [])
            .map(mapRoomForDashboard)
            .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
          setRooms(sorted);
        }

        if (bookingsResponse.ok) {
          const bookingsData = await bookingsResponse.json();
          setBookings((bookingsData.bookings || []).map(mapBooking));
        }
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = {
    totalRooms: rooms.length,
    availableRooms: rooms.filter((r) => r.status === "available").length,
    occupiedRooms: rooms.filter((r) => r.status === "occupied").length,
    endingSoon: rooms.filter((r) => r.status === "ending_soon").length,
  };

  const recentBookings = bookings.slice(0, 3);

  return (
    <div className="space-y-8">
      {/* Hero Banner & Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Banner */}
        <div className="lg:col-span-2 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-white relative overflow-hidden flex flex-col justify-center min-h-[160px] shadow-sm">
          <div className="absolute right-4 bottom-[-15px] w-36 h-36 opacity-15 select-none pointer-events-none">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-full h-full text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.62 48.62 0 0112 20.904a48.62 48.62 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M12 13.49v.01" />
            </svg>
          </div>
          <div className="relative z-10 space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Halo, {user.name.split(" ")[0]}</h2>
            <p className="text-blue-100 text-sm max-w-xl leading-relaxed">
              Selamat datang di dashboard fasilitas kampus. Kelola kebutuhan ruangan dan inventaris Anda dengan mudah.
            </p>
          </div>
        </div>

        {/* Quick Actions Stack */}
        <div className="flex flex-col gap-4 justify-between">
          {/* Card 1: Ajukan Ruangan */}
          <button 
            onClick={() => onNavigate("booking")}
            className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 text-left hover:shadow-md transition-all duration-200 group w-full cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-sm shadow-blue-100">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Ajukan Ruangan</h3>
              <p className="text-gray-400 text-xs mt-0.5">Booking ruang diskusi & kelas</p>
            </div>
          </button>

          {/* Card 2: Lapor Barang Temuan */}
          <button 
            onClick={() => onNavigate("lostfound")}
            className="flex items-center gap-4 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl p-5 text-left hover:shadow-md transition-all duration-200 group w-full cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-sm">Lapor Barang Temuan</h3>
              <p className="text-gray-400 text-xs mt-0.5">Cek daftar Lost & Found</p>
            </div>
          </button>
        </div>
      </div>

      {/* Ketersediaan Ruangan Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Ketersediaan Ruangan</h2>
            <p className="text-xs text-gray-400 mt-1">
              Update ketersediaan real-time gedung F.F 01 hingga F.F 12
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {stats.availableRooms} Tersedia
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {stats.occupiedRooms + stats.endingSoon} Terisi
            </span>
          </div>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700">
              Memuat status ruangan...
            </div>
          ) : rooms.length === 0 ? (
            <div className="col-span-full py-12 text-center text-gray-400 text-sm bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700">
              Tidak ada data ruangan.
            </div>
          ) : (
            rooms.map((room) => (
              <RoomCard key={room.id} room={room} onBook={(r) => setSelectedRoom(r)} />
            ))
          )}
        </div>
      </div>

      {/* Visual Room Calendar */}
      <VisualCalendar
        user={user}
        onSelectSlot={(roomId, timeString, dateString) => {
          if (setBookingPreFill) {
            setBookingPreFill({ roomId, jamMulai: timeString, tanggal: dateString });
          }
          onNavigate("booking");
        }}
      />

      {/* Riwayat Peminjaman Saya */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700">
        <div className="p-5 border-b border-gray-150 dark:border-slate-700 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white">Riwayat Peminjaman Saya</h2>
            <p className="text-xs text-gray-400 mt-0.5">3 peminjaman terakhir</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigate("booking")}>Lihat Semua →</Button>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-slate-700">
          {loading ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">Memuat riwayat peminjaman...</div>
          ) : recentBookings.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-400">
              Belum ada riwayat peminjaman. Ajukan peminjaman di menu Peminjaman.
            </div>
          ) : (
            recentBookings.map((bk) => (
              <div key={bk.id} className="px-5 py-3.5 flex items-center justify-between hover:bg-gray-50/50 dark:hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <span className="text-base">🏫</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{bk.mataKuliah}</p>
                    <p className="text-xs text-gray-400">
                      {bk.roomName} · {bk.tanggal} · {bk.jamMulai}
                    </p>
                  </div>
                </div>
                <Badge status={bk.status} />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Room Detail Modal */}
      <Modal isOpen={!!selectedRoom} onClose={() => setSelectedRoom(null)} title={`Detail Ruangan ${selectedRoom?.name}`}>
        {selectedRoom && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Kapasitas</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">{selectedRoom.capacity} kursi</p>
              </div>
              <div className="bg-gray-50 dark:bg-slate-700/50 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-1">Lantai</p>
                <p className="text-sm font-bold text-gray-800 dark:text-white">Lantai {selectedRoom.floor}</p>
              </div>
            </div>

            {/* Detail Card Ruangan (Jadwal Penggunaan Monokromatik) */}
            <div className="bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-700 rounded-xl p-4 text-gray-800 dark:text-gray-200 shadow-xs">
              <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wide mb-2">Jadwal Penggunaan Hari Ini</p>
              {loadingDetail ? (
                <p className="text-xs text-gray-400 animate-pulse">Memuat jadwal...</p>
              ) : roomSchedules && roomSchedules.length > 0 ? (
                <div className="space-y-2">
                  {roomSchedules.map((schedule, idx) => (
                    <div key={idx} className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-relaxed bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-2.5 rounded-lg shadow-2xs">
                      Ruangan dibooking oleh <span className="font-bold text-gray-900 dark:text-white">{schedule.student_name}</span> di jam {schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-150 dark:border-slate-700 p-2.5 rounded-lg shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tersedia</p>
                </div>
              )}
            </div>

            <div>
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fasilitas</p>
              <div className="flex flex-wrap gap-2">
                {selectedRoom.features.map((f) => (
                  <span key={f} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full font-medium">{f}</span>
                ))}
              </div>
            </div>
            <Button variant="primary" className="w-full justify-center" onClick={() => { setSelectedRoom(null); onNavigate("booking"); }}>
              Ajukan Peminjaman Ruangan Ini
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
