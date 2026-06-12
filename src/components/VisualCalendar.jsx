import { useState, useEffect } from "react";
import { apiFetch, API_BASE_URL } from "../utils/api.js";

export default function VisualCalendar({ user, onSelectSlot, onPromptLogin, selectedDate: propSelectedDate, onDateChange, selectedSlot }) {
  const [internalDate, setInternalDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const selectedDate = propSelectedDate !== undefined ? propSelectedDate : internalDate;
  const setSelectedDate = (date) => {
    if (onDateChange) {
      onDateChange(date);
    } else {
      setInternalDate(date);
    }
  };
  const [roomsList, setRoomsList] = useState([]);
  const [bookingsList, setBookingsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredBooking, setHoveredBooking] = useState(null);
  const [selectedBookingDetail, setSelectedBookingDetail] = useState(null);

  // Hourly slots: 07:00 to 18:00
  const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17];

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/bookings/public-schedule?date=${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        setRoomsList(data.rooms || []);
        setBookingsList(data.bookings || []);
      }
    } catch (err) {
      console.error("Failed to fetch public schedule:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [selectedDate]);

  const parseTimeToDecimal = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(":").map(Number);
    return h + (m || 0) / 60;
  };

  const getHourString = (hourDecimal) => {
    const h = Math.floor(hourDecimal);
    return `${String(h).padStart(2, "0")}:00`;
  };

  // Group rooms by floor
  const floors = roomsList.reduce((acc, room) => {
    const floor = room.floor || 1;
    if (!acc[floor]) acc[floor] = [];
    acc[floor].push(room);
    return acc;
  }, {});

  const handleSlotClick = (room, hour) => {
    const timeString = `${String(hour).padStart(2, "0")}:00`;
    if (user) {
      if (onSelectSlot) {
        onSelectSlot(room.id, timeString, selectedDate);
      }
    } else {
      if (onPromptLogin) {
        onPromptLogin(room.id, timeString, selectedDate);
      }
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl border border-gray-100 dark:border-slate-700 transition-all duration-200">
      
      {/* Calendar Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-gray-100 dark:border-slate-700">
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            📅 Jadwal Penggunaan Ruangan
          </h3>
          <p className="text-xs text-gray-400 dark:text-slate-400 mt-1">
            Lihat blok waktu kosong untuk menghindari jadwal bentrok kuliah pengganti atau rapat
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() - 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer font-bold text-sm"
          >
            ◀ Hari Sebelumnya
          </button>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          />
          <button
            onClick={() => {
              const d = new Date(selectedDate);
              d.setDate(d.getDate() + 1);
              setSelectedDate(d.toISOString().split("T")[0]);
            }}
            className="p-2.5 rounded-xl border border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-all cursor-pointer font-bold text-sm"
          >
            Hari Berikutnya ▶
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-gray-500 dark:text-slate-400 font-medium">Memuat jadwal ruangan...</p>
        </div>
      ) : (
        <div className="overflow-x-auto select-none">
          <div className="min-w-[900px] pb-4">
            
            {/* Table Header containing Hours */}
            <div className="grid grid-cols-12 bg-gray-50 dark:bg-slate-900/60 rounded-xl p-2.5 mb-4 text-center font-bold text-xs text-gray-500 dark:text-slate-400">
              <div className="col-span-2 text-left pl-3 uppercase tracking-wider">Ruangan / Waktu</div>
              {hours.map((h) => (
                <div key={h} className="col-span-1 border-l border-gray-200 dark:border-slate-700">
                  {String(h).padStart(2, "0")}:00
                </div>
              ))}
            </div>

            {/* Floor Sections */}
            {Object.keys(floors).sort().map((floor) => (
              <div key={floor} className="mb-6">
                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest pl-2 mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400"></span>
                  Lantai {floor}
                </div>
                
                <div className="space-y-2.5">
                  {floors[floor].map((room) => {
                    // Get approved bookings for this room
                    const roomBookings = bookingsList.filter(
                      (b) => b.room_id === room.id
                    );

                    let skipCounter = 0;

                    return (
                      <div key={room.id} className="grid grid-cols-12 items-stretch min-h-[56px] border border-gray-100 dark:border-slate-700/80 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-white dark:bg-slate-800">
                        
                        {/* Room label */}
                        <div className="col-span-2 flex flex-col justify-center bg-gray-50/50 dark:bg-slate-900/30 px-4 py-2 border-r border-gray-100 dark:border-slate-700/80">
                          <span className="text-sm font-extrabold text-gray-800 dark:text-slate-200">
                            {room.name}
                          </span>
                          <span className="text-[10px] text-gray-400 dark:text-slate-400 mt-0.5">
                            Kapasitas: {room.capacity}
                          </span>
                        </div>

                        {/* Schedule grid cells */}
                        {hours.map((h, index) => {
                          if (skipCounter > 0) {
                            skipCounter--;
                            return null;
                          }

                          const slotStart = h;
                          const slotEnd = h + 1;

                          // Check if any booking overlaps with this slot
                          const activeBooking = roomBookings.find((b) => {
                            const bStart = parseTimeToDecimal(b.start_time);
                            const bEnd = bStart + (b.duration || 1);
                            return bStart < slotEnd && bEnd > slotStart;
                          });

                          if (activeBooking) {
                            // Calculate colSpan based on duration starting from this hour
                            const bStart = parseTimeToDecimal(activeBooking.start_time);
                            const bEnd = bStart + (activeBooking.duration || 1);
                            
                            // Align grid block
                            const startOffset = Math.max(0, Math.floor(bStart) - h);
                            const endOffset = Math.min(hours.length - index, Math.ceil(bEnd) - h);
                            const colSpan = Math.max(1, endOffset - startOffset);
                            
                            skipCounter = colSpan - 1;

                            return (
                              <div
                                key={h}
                                onClick={() => setSelectedBookingDetail(activeBooking)}
                                style={{ gridColumnEnd: `span ${colSpan}` }}
                                className="relative flex flex-col justify-center px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 dark:bg-blue-500/20 dark:hover:bg-blue-500/30 border-l border-blue-500/30 select-none text-left overflow-hidden group/booking cursor-pointer transition-all duration-155"
                              >
                                <div className="text-xs font-bold text-blue-600 dark:text-blue-400 truncate">
                                  {activeBooking.course_name || "Kegiatan Ruangan"}
                                </div>
                                <div className="text-[10px] text-blue-500 dark:text-blue-300 truncate mt-0.5">
                                  👨‍🏫 {activeBooking.lecturer || "Dosen Pengampu"}
                                </div>
                                <div className="text-[9px] text-gray-400 dark:text-slate-400 truncate mt-0.5">
                                  ⏱️ {activeBooking.start_time.substring(0, 5)} - {activeBooking.end_time.substring(0, 5)}
                                </div>

                                {/* Custom Popover on Hover */}
                                <div className="absolute left-1/2 bottom-full -translate-x-1/2 mb-2 w-64 bg-slate-900 dark:bg-slate-950 text-white rounded-xl p-3 shadow-2xl border border-slate-800 pointer-events-none opacity-0 group-hover/booking:opacity-100 transition-opacity duration-150 z-50 text-xs leading-relaxed">
                                  <div className="font-extrabold text-blue-400 mb-1">Detail Peminjaman:</div>
                                  <div><strong>Kegiatan:</strong> {activeBooking.course_name || "-"}</div>
                                  <div><strong>Dosen:</strong> {activeBooking.lecturer || "-"}</div>
                                  <div><strong>Peminjam:</strong> {activeBooking.user_name || "-"}</div>
                                  <div><strong>Waktu:</strong> {activeBooking.start_time.substring(0, 5)} - {activeBooking.end_time.substring(0, 5)}</div>
                                </div>
                              </div>
                            );
                          }

                          // Empty slot
                          const isSlotSelected = selectedSlot && 
                                                 selectedSlot.roomId === room.id && 
                                                 selectedSlot.startTime === `${String(h).padStart(2, "0")}:00` &&
                                                 selectedSlot.date === selectedDate;

                          return (
                            <div
                              key={h}
                              onClick={() => handleSlotClick(room, h)}
                              className={`col-span-1 border-l border-gray-100 dark:border-slate-700/80 flex items-center justify-center cursor-pointer text-xs font-bold transition-all duration-150 py-3
                                ${isSlotSelected 
                                  ? "bg-emerald-500/20 border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-extrabold animate-pulse" 
                                  : "bg-gray-50/10 dark:bg-slate-800/10 hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15 text-transparent hover:text-emerald-600 dark:hover:text-emerald-400"
                                }`}
                              title={isSlotSelected ? "Slot Terpilih" : `Klik untuk booking Ruang ${room.name} mulai pukul ${getHourString(h)}`}
                            >
                              {isSlotSelected ? "✔️" : "➕"}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

          </div>
        </div>
      )}
      
      {/* Legend */}
      <div className="flex gap-4 mt-4 text-xs font-semibold text-gray-500 dark:text-slate-400 pl-2">
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center"></span>
          <span>Sesi Terisi</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3.5 h-3.5 rounded-lg border border-dashed border-gray-200 dark:border-slate-700 bg-gray-50/10"></span>
          <span>Jam Kosong (Klik ➕ untuk Booking)</span>
        </div>
      </div>

      {selectedBookingDetail && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 dark:border-slate-800 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                📖 Detail Jadwal Kuliah
              </h3>
              <button 
                onClick={() => setSelectedBookingDetail(null)} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors text-xl font-bold cursor-pointer p-1"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3.5">
              <div className="bg-blue-50 dark:bg-blue-950/20 rounded-2xl p-4 border border-blue-100 dark:border-blue-900/30">
                <p className="text-[10px] text-blue-500 dark:text-blue-400 font-bold uppercase tracking-wider mb-1">Mata Kuliah</p>
                <p className="text-base font-extrabold text-gray-900 dark:text-white leading-snug">
                  {selectedBookingDetail.course_name || "-"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-50 dark:bg-slate-800/40 rounded-xl p-3 border border-gray-100 dark:border-slate-800">
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Ruangan</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{selectedBookingDetail.room_name || "-"}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-800/40 rounded-xl p-3 border border-gray-100 dark:border-slate-800">
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Tanggal</p>
                  <p className="text-xs font-bold text-gray-800 dark:text-slate-200">{selectedDate}</p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-slate-800/40 rounded-xl p-3 border border-gray-100 dark:border-slate-800 space-y-2.5">
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Dosen Pengampu</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">{selectedBookingDetail.lecturer || "-"}</p>
                </div>
                <hr className="border-gray-100 dark:border-slate-800/50" />
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Waktu / Durasi</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">
                    ⏱️ {selectedBookingDetail.start_time.substring(0, 5)} - {selectedBookingDetail.end_time.substring(0, 5)} ({selectedBookingDetail.duration || 1} Jam)
                  </p>
                </div>
                <hr className="border-gray-100 dark:border-slate-800/50" />
                <div>
                  <p className="text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider mb-0.5">Peminjam / Pengaju</p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-slate-200">👤 {selectedBookingDetail.user_name || "-"}</p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedBookingDetail(null)} 
                className="w-full bg-gray-100 hover:bg-gray-205 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-200 font-semibold py-2.5 px-4 rounded-xl transition-all cursor-pointer text-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
