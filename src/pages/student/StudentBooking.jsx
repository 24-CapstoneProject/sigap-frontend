import { useState, useEffect } from "react";
import { Badge, Button, Modal, Toast } from "../../components/ui/index.jsx";
import { apiFetch } from "../../utils/api.js";
import { mapBooking, mapRoomForDashboard } from "../../utils/mappers.js";
import VisualCalendar from "../../components/VisualCalendar.jsx";

const calculateDuration = (startTime, endTime) => {
  if (!startTime || !endTime) return 0;
  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  const diffMinutes = (endH * 60 + endM) - (startH * 60 + startM);
  return Math.max(1, Math.round(diffMinutes / 60)); // minimum 1 hour, rounded
};

export default function StudentBooking({ user, preFill, clearPreFill }) {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Table Page State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Selected Room Page for Top Grid
  const [roomPage, setRoomPage] = useState(0);
  const roomsPerPage = 8;

  // Tooltip State for Rejected Bookings
  const [activeTooltipId, setActiveTooltipId] = useState(null);

  // Form State
  const [form, setForm] = useState({
    roomId: "",
    mataKuliah: "",
    dosen: "",
    tanggal: "",
    jamMulai: "",
    jamSelesai: "",
    wantsInfocus: false,
  });
  const [proofImageFile, setProofImageFile] = useState(null);
  const [errors, setErrors] = useState({});

  // Reschedule States
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedBookingForReschedule, setSelectedBookingForReschedule] = useState(null);
  const [rescheduleForm, setRescheduleForm] = useState({
    newRoomId: "",
    newRoomName: "",
    newBookingDate: new Date().toISOString().split("T")[0],
    newStartTime: "",
    newEndTime: "",
    reason: "",
  });
  const [rescheduleErrors, setRescheduleErrors] = useState({});
  const [isSubmittingReschedule, setIsSubmittingReschedule] = useState(false);

  const [bookingsForSelectedDate, setBookingsForSelectedDate] = useState([]);

  useEffect(() => {
    const fetchBookingsForDate = async () => {
      const targetDate = form.tanggal || new Date().toISOString().split("T")[0];
      try {
        const response = await apiFetch(`/api/bookings/public-schedule?date=${targetDate}`);
        if (response.ok) {
          const data = await response.json();
          setBookingsForSelectedDate(data.bookings || []);
        }
      } catch (err) {
        console.error("Failed to fetch bookings for date:", err);
      }
    };
    fetchBookingsForDate();
  }, [form.tanggal]);

  const parseTimeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [hours, minutes] = String(timeStr).slice(0, 5).split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isRoomOccupiedAtSelectedTime = (room) => {
    const targetDate = form.tanggal || new Date().toISOString().split("T")[0];
    let startStr = form.jamMulai ? form.jamMulai.trim().replace(/\./g, ":") : "";
    let endStr = form.jamSelesai ? form.jamSelesai.trim().replace(/\./g, ":") : "";

    const timeRegex = /^\d{1,2}:\d{2}$/;
    const isStartValid = timeRegex.test(startStr);
    const isEndValid = timeRegex.test(endStr);

    let startMinutes = 0;
    let endMinutes = 0;

    if (isStartValid) {
      const parts = startStr.split(":");
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      startStr = `${hours}:${minutes}`;
      startMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    }
    if (isEndValid) {
      const parts = endStr.split(":");
      const hours = parts[0].padStart(2, '0');
      const minutes = parts[1].padStart(2, '0');
      endStr = `${hours}:${minutes}`;
      endMinutes = parseInt(hours, 10) * 60 + parseInt(minutes, 10);
    }

    const todayStr = new Date().toISOString().split("T")[0];
    if (!isStartValid || !isEndValid || startMinutes >= endMinutes) {
      if (targetDate === todayStr) {
        const now = new Date();
        const nowMinutes = now.getHours() * 60 + now.getMinutes();
        const bookingsList = form.tanggal ? bookingsForSelectedDate : (room.currentBookings || []);
        return bookingsList.some((bk) => {
          if (bk.room_id !== room.id) return false;
          const start = parseTimeToMinutes(bk.start_time);
          const end = parseTimeToMinutes(bk.end_time);
          return nowMinutes >= start && nowMinutes < end;
        });
      }
      return false;
    }

    const bookingsList = form.tanggal ? bookingsForSelectedDate : (room.currentBookings || []);
    return bookingsList.some((bk) => {
      if (bk.room_id !== room.id) return false;
      const bkStart = parseTimeToMinutes(bk.start_time);
      const bkEnd = parseTimeToMinutes(bk.end_time);
      return bkStart < endMinutes && bkEnd > startMinutes;
    });
  };

  useEffect(() => {
    if (form.roomId) {
      const selectedRoomObj = rooms.find(r => r.id === form.roomId);
      if (selectedRoomObj && isRoomOccupiedAtSelectedTime(selectedRoomObj)) {
        handleChange("roomId", "");
        showToast("Ruangan terpilih tidak tersedia pada waktu yang baru ditentukan.", "warning");
      }
    }
  }, [form.tanggal, form.jamMulai, form.jamSelesai, bookingsForSelectedDate]);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadBookings = async () => {
    const response = await apiFetch("/api/bookings/my-bookings");
    if (response.ok) {
      const data = await response.json();
      setBookings((data.bookings || []).map(mapBooking));
    }
  };

  const loadRooms = async () => {
    setRoomsLoading(true);
    try {
      const roomsResponse = await apiFetch("/api/rooms");
      const roomsData = await roomsResponse.json();

      if (!roomsResponse.ok) {
        showToast(`✗ Gagal memuat ruangan: ${roomsData.error || "Server error"}`, "error");
        setRooms([]);
        return;
      }

      // Sort alphabetically by name and map room status dynamically
      const sorted = (roomsData.rooms || [])
        .map(mapRoomForDashboard)
        .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
      setRooms(sorted);
    } catch (err) {
      console.error("Failed to fetch rooms:", err);
      showToast("✗ Gagal memuat daftar ruangan. Pastikan backend berjalan.", "error");
      setRooms([]);
    } finally {
      setRoomsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await Promise.all([loadRooms(), loadBookings()]);
      } catch (err) {
        console.error("Failed to fetch booking data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (preFill) {
      setForm((prev) => ({
        ...prev,
        roomId: preFill.roomId || "",
        tanggal: preFill.tanggal || "",
        jamMulai: preFill.jamMulai || "",
      }));
      if (clearPreFill) {
        clearPreFill();
      }
      showToast("Ruangan terpilih dari visual calendar.", "success");
    }
  }, [preFill]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.roomId) newErrors.roomId = "Pilih ruangan yang ingin dipinjam.";
    if (!form.mataKuliah.trim()) newErrors.mataKuliah = "Nama mata kuliah/praktikum wajib diisi.";
    if (!form.dosen.trim()) newErrors.dosen = "Nama dosen pengampu wajib diisi.";
    if (!form.tanggal) newErrors.tanggal = "Pilih tanggal peminjaman.";
    
    let isTimeValid = false;
    if (!form.jamMulai) {
      newErrors.jamMulai = "Jam mulai wajib diisi.";
    } else {
      const normalizedJam = form.jamMulai.trim().replace(/\./g, ":");
      if (!/^\d{1,2}:\d{2}$/.test(normalizedJam)) {
        newErrors.jamMulai = "Format jam mulai tidak valid (contoh: 08:00 atau 08.00).";
      } else {
        isTimeValid = true;
      }
    }

    if (!form.jamSelesai) {
      newErrors.jamSelesai = "Jam selesai wajib diisi.";
    } else {
      const normalizedSelesai = form.jamSelesai.trim().replace(/\./g, ":");
      if (!/^\d{1,2}:\d{2}$/.test(normalizedSelesai)) {
        newErrors.jamSelesai = "Format jam selesai tidak valid (contoh: 10:00 atau 10.00).";
      } else if (isTimeValid) {
        const [startH, startM] = form.jamMulai.split(":").map(Number);
        const [endH, endM] = normalizedSelesai.split(":").map(Number);
        const diff = (endH * 60 + endM) - (startH * 60 + startM);
        if (diff <= 0) {
          newErrors.jamSelesai = "Jam selesai harus setelah jam mulai.";
        }
      }
    }

    // Validasi tanggal dan jam di masa lalu
    if (form.tanggal) {
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      const todayStr = `${year}-${month}-${day}`;

      if (form.tanggal < todayStr) {
        newErrors.tanggal = "Tanggal peminjaman tidak boleh di masa lalu.";
      } else if (form.tanggal === todayStr && form.jamMulai && isTimeValid) {
        const currentHours = today.getHours();
        const currentMinutes = today.getMinutes();
        const currentTimeStr = `${String(currentHours).padStart(2, '0')}:${String(currentMinutes).padStart(2, '0')}`;
        
        let normalizedJam = form.jamMulai.trim().replace(/\./g, ":");
        const parts = normalizedJam.split(":");
        const paddedHours = parts[0].padStart(2, '0');
        const paddedMinutes = parts[1].padStart(2, '0');
        normalizedJam = `${paddedHours}:${paddedMinutes}`;
        
        if (normalizedJam < currentTimeStr) {
          newErrors.jamMulai = "Tidak dapat memesan jam yang sudah terlewat hari ini.";
        }
      }
    }

    if (!proofImageFile) {
      newErrors.proofImage = "Bukti foto/surat peminjaman wajib diunggah.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      showToast("Silakan periksa kembali form pengisian Anda.", "error");
      return;
    }

    try {
      const normalizedJamMulai = form.jamMulai.trim().replace(/\./g, ":");
      const partsMulai = normalizedJamMulai.split(":");
      const formattedJamMulai = `${partsMulai[0].padStart(2, '0')}:${partsMulai[1].padStart(2, '0')}`;

      const normalizedJamSelesai = form.jamSelesai.trim().replace(/\./g, ":");
      const partsSelesai = normalizedJamSelesai.split(":");
      const formattedJamSelesai = `${partsSelesai[0].padStart(2, '0')}:${partsSelesai[1].padStart(2, '0')}`;

      const duration = calculateDuration(formattedJamMulai, formattedJamSelesai);

      const formData = new FormData();
      formData.append("roomId", form.roomId);
      formData.append("bookingDate", form.tanggal);
      formData.append("startTime", formattedJamMulai);
      formData.append("endTime", formattedJamSelesai);
      formData.append("courseCode", "");
      formData.append("courseName", form.mataKuliah);
      formData.append("lecturer", form.dosen);
      formData.append("duration", duration);
      formData.append("proof_image", proofImageFile);
      formData.append("wantsInfocus", form.wantsInfocus ? "true" : "false");

      const response = await apiFetch("/api/bookings", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        await loadBookings();
        setForm({ roomId: "", mataKuliah: "", dosen: "", tanggal: "", jamMulai: "", jamSelesai: "", wantsInfocus: false });
        setProofImageFile(null);
        setErrors({});
        setCurrentPage(1);
        showToast("✓ Permohonan peminjaman berhasil dikirim! Menunggu validasi admin.", "success");
      } else {
        const error = await response.json();
        showToast(`✗ ${error.error || "Gagal membuat peminjaman"}`, "error");
      }
    } catch (err) {
      console.error("Submit booking error:", err);
      showToast("✗ Terjadi kesalahan saat mengirim permohonan", "error");
    }
  };

  const handleCancel = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin membatalkan permohonan peminjaman ini?")) {
      try {
        const response = await apiFetch(`/api/bookings/${id}/cancel`, { method: "POST" });
        if (response.ok) {
          await loadBookings();
          showToast("✓ Peminjaman berhasil dibatalkan.", "success");
        } else {
          const error = await response.json();
          showToast(`✗ ${error.error || "Gagal membatalkan peminjaman"}`, "error");
        }
      } catch (err) {
        console.error("Cancel booking error:", err);
        showToast("✗ Terjadi kesalahan", "error");
      }
    }
  };

  const handleOpenReschedule = (booking) => {
    setSelectedBookingForReschedule(booking);
    setRescheduleForm({
      newRoomId: "",
      newRoomName: "",
      newBookingDate: new Date().toISOString().split("T")[0],
      newStartTime: "",
      newEndTime: "",
      reason: "",
    });
    setRescheduleErrors({});
    setShowRescheduleModal(true);
  };

  const handleSelectRescheduleSlot = (newRoomId, newStartTime, selectedDate) => {
    const roomObj = rooms.find(r => r.id === newRoomId);
    const roomName = roomObj ? roomObj.name : newRoomId;
    
    const durationHours = selectedBookingForReschedule ? (selectedBookingForReschedule.durasi || 2) : 2;
    const [h, m] = newStartTime.split(":").map(Number);
    const endH = h + durationHours;
    const newEndTime = `${String(endH).padStart(2, "0")}:${String(m).padStart(2, "0")}`;

    setRescheduleForm(prev => ({
      ...prev,
      newRoomId,
      newRoomName: roomName,
      newBookingDate: selectedDate,
      newStartTime,
      newEndTime,
    }));

    showToast(`Slot Terpilih: Ruang ${roomName} pada ${selectedDate} pukul ${newStartTime}`, "success");
  };

  const handleRescheduleSubmit = async () => {
    if (!rescheduleForm.newRoomId || !rescheduleForm.newBookingDate || !rescheduleForm.newStartTime || !rescheduleForm.newEndTime) {
      showToast("Silakan pilih slot waktu kosong pada kalender terlebih dahulu", "error");
      return;
    }

    if (!rescheduleForm.reason || !rescheduleForm.reason.trim()) {
      setRescheduleErrors({ reason: "Alasan pindah jadwal wajib diisi." });
      return;
    }

    setIsSubmittingReschedule(true);
    setRescheduleErrors({});

    try {
      const response = await apiFetch(`/api/bookings/${selectedBookingForReschedule.id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({
          newRoomId: rescheduleForm.newRoomId,
          newBookingDate: rescheduleForm.newBookingDate,
          newStartTime: rescheduleForm.newStartTime,
          newEndTime: rescheduleForm.newEndTime,
          reason: rescheduleForm.reason,
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.json();

      if (response.ok) {
        showToast("Pengajuan pindah jadwal berhasil dikirim dan menunggu verifikasi admin.", "success");
        setShowRescheduleModal(false);
        await loadBookings();
      } else {
        showToast(`Gagal: ${data.error || "Terjadi kesalahan"}`, "error");
      }
    } catch (err) {
      console.error("Reschedule request error:", err);
      showToast("Terjadi kesalahan koneksi saat mengirim pengajuan.", "error");
    } finally {
      setIsSubmittingReschedule(false);
    }
  };

  // Slicing rooms for selector
  const maxRoomPage = Math.ceil(rooms.length / roomsPerPage) - 1;
  const paginatedRooms = rooms.slice(roomPage * roomsPerPage, (roomPage + 1) * roomsPerPage);

  // Filter and pagination for table
  const totalPages = Math.ceil(bookings.length / itemsPerPage) || 1;
  const paginatedBookings = bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Halaman Peminjaman Ruangan</h2>
        <p className="text-sm text-gray-400 mt-1">
          Sistem reservasi terpusat untuk kegiatan akademik dan organisasi mahasiswa.
        </p>
      </div>

      {/* Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Room Selection & Booking details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Pilih Ruangan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base">
                <span className="text-blue-600">🏢</span>
                <span>Pilih Ruangan</span>
              </div>
              {/* Pagination Controls */}
              {rooms.length > roomsPerPage && (
                <div className="flex items-center gap-1">
                  <button
                    disabled={roomPage === 0}
                    onClick={() => setRoomPage(prev => Math.max(0, prev - 1))}
                    className={`p-1.5 rounded-lg border transition-all ${roomPage === 0 ? 'text-gray-300 border-gray-100 dark:border-slate-700 cursor-not-allowed' : 'text-gray-600 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'}`}
                  >
                    &lt;
                  </button>
                  <button
                    disabled={roomPage >= maxRoomPage}
                    onClick={() => setRoomPage(prev => Math.min(maxRoomPage, prev + 1))}
                    className={`p-1.5 rounded-lg border transition-all ${roomPage >= maxRoomPage ? 'text-gray-300 border-gray-100 dark:border-slate-700 cursor-not-allowed' : 'text-gray-600 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'}`}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>

            {roomsLoading ? (
              <div className="py-8 text-center text-xs text-gray-400">Memuat ruangan...</div>
            ) : rooms.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-400">Tidak ada ruangan terdaftar.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {paginatedRooms.map((room) => {
                  const isOccupied = isRoomOccupiedAtSelectedTime(room);
                  const isSelected = form.roomId === room.id;

                  return (
                    <div
                      key={room.id}
                      onClick={() => {
                        if (!isOccupied) {
                          handleChange("roomId", room.id);
                        } else {
                          showToast(`Ruangan ${room.name} sedang dipakai dan tidak dapat dipilih.`, "error");
                        }
                      }}
                      className={`border rounded-xl p-4 flex flex-col justify-between h-[100px] relative transition-all duration-150
                        ${isOccupied 
                          ? "bg-gray-50/50 dark:bg-slate-800/40 border-gray-150 dark:border-slate-700 opacity-60 cursor-not-allowed select-none" 
                          : isSelected
                            ? "bg-blue-50/20 dark:bg-blue-950/20 border-blue-500 shadow-sm"
                            : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600 cursor-pointer"}`}
                    >
                      {/* Check circle for available rooms */}
                      {!isOccupied && (
                        <div className="absolute right-3 top-3">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center transition-all
                            ${isSelected ? "border-blue-600 bg-blue-600 text-white" : "border-gray-300 bg-white"}`}
                          >
                            {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white"></span>}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="text-sm font-bold text-gray-900 dark:text-white">{room.name} - Lantai {room.floor}</h4>
                        <p className="text-[10px] text-gray-455 dark:text-gray-400 mt-0.5">Capacity: {room.capacity}</p>
                      </div>

                      <div>
                        <span className={`inline-block text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wide
                          ${isOccupied 
                            ? "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400" 
                            : "bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400"}`}
                        >
                          {isOccupied ? "DIPAKAI" : "AVAILABLE"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.roomId && <p className="text-xs text-red-650 mt-2 font-medium">{errors.roomId}</p>}
          </div>

          {/* Card 2: Informasi Perkuliahan */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base mb-5 border-b border-gray-100 dark:border-slate-700 pb-3">
              <span className="text-blue-600">ℹ️</span>
              <span>Informasi Perkuliahan</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nama MK */}
              <div className="md:col-span-2">
                <label htmlFor="mataKuliah" className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1.5">
                  Nama Mata Kuliah / Praktikum *
                </label>
                <input
                  id="mataKuliah"
                  type="text"
                  placeholder="Contoh: Pemrograman Web Lanjut"
                  value={form.mataKuliah}
                  onChange={(e) => handleChange("mataKuliah", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
                    ${errors.mataKuliah ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200"}
                    focus:outline-none focus:ring-2`}
                />
                {errors.mataKuliah && <p className="text-xs text-red-600 mt-1 font-medium">{errors.mataKuliah}</p>}
              </div>

              {/* Dosen */}
              <div>
                <label htmlFor="dosen" className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1.5">
                  Nama Dosen Pengampu *
                </label>
                <input
                  id="dosen"
                  type="text"
                  placeholder="Masukkan nama lengkap dosen"
                  value={form.dosen}
                  onChange={(e) => handleChange("dosen", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
                    ${errors.dosen ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200"}
                    focus:outline-none focus:ring-2`}
                />
                {errors.dosen && <p className="text-xs text-red-600 mt-1 font-medium">{errors.dosen}</p>}
              </div>

              {/* Tanggal */}
              <div>
                <label htmlFor="tanggal" className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1.5">
                  Tanggal Peminjaman *
                </label>
                <input
                  id="tanggal"
                  type="date"
                  value={form.tanggal}
                  onChange={(e) => handleChange("tanggal", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
                    ${errors.tanggal ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200"}
                    focus:outline-none focus:ring-2 cursor-pointer`}
                />
                {errors.tanggal && <p className="text-xs text-red-600 mt-1 font-medium">{errors.tanggal}</p>}
              </div>

              {/* Waktu Mulai */}
              <div>
                <label htmlFor="jamMulai" className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1.5">
                  Waktu Mulai (WITA) *
                </label>
                <input
                  id="jamMulai"
                  type="text"
                  placeholder="Contoh: 08:00"
                  value={form.jamMulai}
                  onChange={(e) => handleChange("jamMulai", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
                    ${errors.jamMulai ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200"}
                    focus:outline-none focus:ring-2`}
                />
                {errors.jamMulai && <p className="text-xs text-red-600 mt-1 font-medium">{errors.jamMulai}</p>}
              </div>

              {/* Waktu Selesai */}
              <div>
                <label htmlFor="jamSelesai" className="text-xs font-semibold text-gray-600 dark:text-slate-300 block mb-1.5">
                  Waktu Selesai (WITA) *
                </label>
                <input
                  id="jamSelesai"
                  type="text"
                  placeholder="Contoh: 10:00"
                  value={form.jamSelesai}
                  onChange={(e) => handleChange("jamSelesai", e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
                    ${errors.jamSelesai ? "border-red-400 focus:ring-red-300" : "border-gray-200 dark:border-slate-700 focus:border-blue-500 focus:ring-blue-200"}
                    focus:outline-none focus:ring-2`}
                />
                {errors.jamSelesai && <p className="text-xs text-red-600 mt-1 font-medium">{errors.jamSelesai}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Documents Upload & Infokus option */}
        <div className="lg:sticky lg:top-24 space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 p-5 shadow-xs">
            <div className="flex items-center gap-2 text-gray-900 dark:text-white font-bold text-base mb-4">
              <span className="text-blue-600">📄</span>
              <span>Dokumen Pendukung</span>
            </div>

            {/* Upload Box */}
            <div 
              onClick={() => document.getElementById("proofImage").click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-150 flex flex-col items-center justify-center min-h-[140px]
                ${errors.proofImage 
                  ? "border-red-350 bg-red-50/10 hover:bg-red-50/20" 
                  : "border-gray-200 dark:border-slate-700 hover:border-blue-400 bg-gray-50/30 hover:bg-gray-50/70"}`}
            >
              <input
                id="proofImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files[0]) {
                    setProofImageFile(e.target.files[0]);
                    if (errors.proofImage) setErrors((prev) => ({ ...prev, proofImage: null }));
                  }
                }}
                className="hidden"
              />
              {proofImageFile ? (
                <div className="space-y-2">
                  <span className="text-3xl block">📄</span>
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 truncate max-w-[200px] mx-auto">
                    {proofImageFile.name}
                  </p>
                  <button 
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setProofImageFile(null);
                    }}
                    className="text-[10px] text-red-500 font-bold hover:underline cursor-pointer"
                  >
                    Hapus File
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="text-3xl block text-gray-400">☁️</span>
                  <p className="text-xs font-semibold text-gray-650 dark:text-gray-300">
                    Klik untuk unggah atau seret berkas
                  </p>
                  <p className="text-[10px] text-gray-400">
                    PDF, JPG, PNG (Maks. 5MB)
                  </p>
                </div>
              )}
            </div>

            {/* Wajib diisi Warning Badge */}
            <div className="mt-3">
              {proofImageFile ? (
                <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl p-3 text-center text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  ✓ Berkas berhasil diunggah
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-xl p-3 text-center text-xs text-red-700 dark:text-red-400 font-medium">
                  ⚠️ Wajib diisi sebelum submit
                </div>
              )}
              {errors.proofImage && <p className="text-xs text-red-650 mt-1 font-medium text-center">{errors.proofImage}</p>}
            </div>

            {/* Wants Infocus Toggle/Checkbox */}
            <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100/60 dark:border-blue-900/40 my-4 select-none">
              <input
                type="checkbox"
                id="wantsInfocus"
                checked={form.wantsInfocus}
                onChange={(e) => handleChange("wantsInfocus", e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="wantsInfocus" className="text-xs font-semibold text-gray-700 dark:text-slate-300 cursor-pointer">
                🔌 Pinjam Infokus / Proyektor Sekaligus
              </label>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-md shadow-blue-100 hover:shadow-lg cursor-pointer text-center"
            >
              Ajukan Peminjaman ▷
            </button>
          </div>
        </div>
      </div>

      {/* Riwayat Peminjaman Table Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-150 dark:border-slate-700 overflow-hidden shadow-xs">
        <div className="p-5 border-b border-gray-100 dark:border-slate-700">
          <h3 className="font-bold text-gray-900 dark:text-white text-base">Riwayat Peminjaman Saya</h3>
          <p className="text-xs text-gray-400 mt-0.5">Daftar lengkap permohonan peminjaman ruangan</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 dark:bg-slate-700/50 text-gray-650 dark:text-gray-450 text-xs uppercase font-semibold border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-5 py-4">Tanggal</th>
                <th className="px-5 py-4">Ruangan</th>
                <th className="px-5 py-4">Mata Kuliah / Kegiatan</th>
                <th className="px-5 py-4">Waktu</th>
                <th className="px-5 py-4 text-center">Status</th>
                <th className="px-5 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-xs">
                    Memuat riwayat peminjaman...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-xs">
                    Belum ada riwayat peminjaman.
                  </td>
                </tr>
              ) : (
                paginatedBookings.map((bk) => {
                  const isActive = bk.status === "approved" || bk.status === "pending";
                  const endH = parseInt(bk.jamMulai.split(":")[0]) + parseInt(bk.durasi);
                  const endM = bk.jamMulai.split(":")[1] || "00";
                  const waktuSelesai = `${String(endH).padStart(2, "0")}:${endM}`;

                  return (
                    <tr key={bk.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="px-5 py-4 whitespace-nowrap font-medium text-gray-600 dark:text-gray-300">
                        {bk.tanggal}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap font-bold text-gray-900 dark:text-white">
                        {bk.roomName}
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">{bk.mataKuliah}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{bk.dosen}</p>
                          {bk.rescheduledFromBookingId && (
                            <span className="inline-block mt-1 text-[9px] bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 px-1.5 py-0.5 rounded font-medium">
                              🔄 Reschedule
                            </span>
                          )}
                          {bk.wantsInfocus && (
                            <span className="inline-block mt-1 ml-1.5 text-[9px] bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 px-1.5 py-0.5 rounded font-medium">
                              🔌 Infokus: {bk.assignedInfocusName || "Dimohon"}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-gray-600 dark:text-gray-350">
                        {bk.jamMulai} - {waktuSelesai} WITA
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center relative">
                        <div className="flex items-center gap-1.5 justify-center">
                          <span className={`inline-block text-[10px] font-bold px-3 py-1 rounded-full 
                            ${(bk.status === "approved" || bk.status === "completed") ? "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50" : ""}
                            ${bk.status === "pending" ? "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50" : ""}
                            ${bk.status === "rejected" ? "bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border border-red-100 dark:border-red-900/50" : ""}
                          `}>
                            {bk.status === "approved" && "Disetujui"}
                            {bk.status === "completed" && "Selesai"}
                            {bk.status === "pending" && "Menunggu"}
                            {bk.status === "rejected" && "Ditolak"}
                          </span>
                          {bk.status === "rejected" && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveTooltipId(activeTooltipId === bk.id ? null : bk.id);
                              }}
                              className="text-red-500 hover:text-red-700 font-bold focus:outline-none cursor-pointer text-xs"
                              title="Lihat Alasan Penolakan"
                            >
                              ℹ️
                            </button>
                          )}
                        </div>
                        {activeTooltipId === bk.id && (
                          <div className="absolute right-5 bottom-full mb-2 z-30 w-64 bg-white dark:bg-slate-700 border border-gray-150 dark:border-slate-600 p-4 rounded-2xl shadow-xl text-left text-xs font-medium text-gray-650 dark:text-gray-300 leading-relaxed animate-fade-in">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-bold text-red-600 dark:text-red-400">Alasan Penolakan:</span>
                              <button 
                                onClick={() => setActiveTooltipId(null)}
                                className="text-gray-400 hover:text-gray-650 font-bold text-xs"
                              >
                                ✕
                              </button>
                            </div>
                            <p className="italic">"{bk.rejectReason || 'Tidak ada alasan penolakan dari admin.'}"</p>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-center">
                        <div className="flex items-center justify-center gap-2">
                          {bk.status === "approved" && (
                            <button 
                              onClick={() => handleOpenReschedule(bk)}
                              className="bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            >
                              Pindah
                            </button>
                          )}
                          {isActive && bk.status !== "completed" && (
                            <button 
                              onClick={() => handleCancel(bk.id)}
                              className="bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                            >
                              Batal
                            </button>
                          )}
                          {!isActive && bk.status !== "completed" && (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer with Pagination */}
        {bookings.length > itemsPerPage && (
          <div className="p-4 border-t border-gray-100 dark:border-slate-700 flex items-center justify-between text-xs text-gray-500 bg-gray-50/20">
            <span>
              Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, bookings.length)} of {bookings.length}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className={`p-1.5 rounded-lg border transition-all ${currentPage === 1 ? 'text-gray-300 border-gray-100 dark:border-slate-800 cursor-not-allowed' : 'text-gray-600 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'}`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }).map((_, idx) => {
                const pageNum = idx + 1;
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`px-3 py-1.5 rounded-lg font-bold transition-all border ${currentPage === pageNum ? 'bg-blue-600 text-white border-blue-600' : 'text-gray-600 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'}`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className={`p-1.5 rounded-lg border transition-all ${currentPage === totalPages ? 'text-gray-300 border-gray-100 dark:border-slate-800 cursor-not-allowed' : 'text-gray-600 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer'}`}
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reschedule Modal */}
      <Modal isOpen={showRescheduleModal} onClose={() => setShowRescheduleModal(false)} title="Pengajuan Pindah Jadwal Kuliah & Ruangan" size="xl">
        <div className="space-y-6">
          {selectedBookingForReschedule && (
            <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/40 rounded-2xl p-4 text-xs text-purple-900 dark:text-purple-300">
              <h4 className="font-bold text-sm mb-2">📋 Jadwal Asli yang Akan Dipindahkan:</h4>
              <p><strong>Mata Kuliah:</strong> {selectedBookingForReschedule.mataKuliah}</p>
              <p><strong>Dosen:</strong> {selectedBookingForReschedule.dosen}</p>
              <p><strong>Jadwal Lama:</strong> {selectedBookingForReschedule.roomName} · {selectedBookingForReschedule.tanggal} pukul {selectedBookingForReschedule.jamMulai} ({selectedBookingForReschedule.durasi} Jam)</p>
            </div>
          )}

          <div className="space-y-4">
            {rescheduleForm.newRoomId && (
              <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40 rounded-2xl p-4 text-xs text-emerald-900 dark:text-emerald-300 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="sm:col-span-2 font-bold text-sm mb-1 text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <span>✨ Slot Waktu Baru Terpilih:</span>
                </div>
                <p><strong>Ruangan Baru:</strong> {rescheduleForm.newRoomName}</p>
                <p><strong>Tanggal Baru:</strong> {rescheduleForm.newBookingDate}</p>
                <p><strong>Jam Mulai Baru:</strong> {rescheduleForm.newStartTime}</p>
                <p><strong>Jam Selesai Baru:</strong> {rescheduleForm.newEndTime}</p>
              </div>
            )}

            <div>
              <label htmlFor="rescheduleDate" className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                Pilih Tanggal Baru Perpindahan Jadwal <span className="text-red-500">*</span>
              </label>
              <input
                id="rescheduleDate"
                type="date"
                value={rescheduleForm.newBookingDate}
                onChange={(e) => setRescheduleForm(prev => ({ ...prev, newBookingDate: e.target.value }))}
                className="px-4 py-2.5 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-900 dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              />
            </div>

            <div className="border border-gray-100 dark:border-slate-700/60 rounded-3xl p-4 bg-gray-50/50 dark:bg-slate-900/30">
              <p className="text-xs font-bold text-gray-500 dark:text-slate-400 mb-3 uppercase tracking-wider">
                Silakan Klik Jam/Slot Kosong (Simbol ➕) pada Kalender untuk Memilih Ruangan & Jam Baru:
              </p>
              <VisualCalendar
                user={true}
                selectedDate={rescheduleForm.newBookingDate}
                onDateChange={(date) => setRescheduleForm(prev => ({ ...prev, newBookingDate: date }))}
                onSelectSlot={handleSelectRescheduleSlot}
                selectedSlot={{
                  roomId: rescheduleForm.newRoomId,
                  startTime: rescheduleForm.newStartTime,
                  date: rescheduleForm.newBookingDate
                }}
              />
            </div>

            <div>
              <label htmlFor="rescheduleReason" className="text-sm font-semibold text-gray-700 dark:text-slate-300 block mb-1.5">
                Alasan Perpindahan Jadwal <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rescheduleReason"
                rows={3}
                required
                value={rescheduleForm.reason}
                onChange={(e) => {
                  setRescheduleForm(prev => ({ ...prev, reason: e.target.value }));
                  if (rescheduleErrors.reason) setRescheduleErrors(prev => ({ ...prev, reason: null }));
                }}
                placeholder="Contoh: Tabrakan dengan praktikum dosen lain atau kuliah pengganti hari libur..."
                className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 bg-white dark:bg-slate-900 text-gray-900 dark:text-white
                  ${rescheduleErrors.reason ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}
                  focus:outline-none focus:ring-2`}
              />
              {rescheduleErrors.reason && <p className="text-xs text-red-600 mt-1">{rescheduleErrors.reason}</p>}
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-3 border-t border-gray-100 dark:border-slate-700">
            <Button variant="secondary" onClick={() => setShowRescheduleModal(false)}>Batal</Button>
            <Button variant="primary" onClick={handleRescheduleSubmit} disabled={isSubmittingReschedule || !rescheduleForm.newRoomId}>
              {isSubmittingReschedule ? "Mengirim..." : "Kirim Pengajuan Reschedule"}
            </Button>
          </div>
        </div>
      </Modal>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
