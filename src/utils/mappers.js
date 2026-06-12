const formatDate = (value) => {
  if (!value) return "";
  if (typeof value === "string" && value.includes("T")) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  }
  if (value instanceof Date) {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }
  return String(value).split("T")[0];
};

const formatTime = (value) => {
  if (!value) return "";
  return String(value).slice(0, 5);
};

const getBookingStatus = (booking) => {
  if (booking.status !== "approved") {
    return booking.status;
  }
  try {
    const bookingDateStr = formatDate(booking.booking_date || booking.tanggal);
    const startTimeStr = booking.start_time || booking.jamMulai;
    const endTimeStr = booking.end_time || booking.endTime;
    
    if (!bookingDateStr) return booking.status;

    const now = new Date();

    let endDateTime;
    if (endTimeStr) {
      const [h, m, s] = String(endTimeStr).split(":");
      endDateTime = new Date(`${bookingDateStr}T${h}:${m}:${s || "00"}`);
    } else if (startTimeStr) {
      const [h, m] = String(startTimeStr).split(":");
      const durationHours = booking.duration || booking.durasi || 0;
      endDateTime = new Date(`${bookingDateStr}T${h}:${m}:00`);
      endDateTime.setHours(endDateTime.getHours() + parseInt(durationHours, 10));
    } else {
      return booking.status;
    }

    if (now > endDateTime) {
      return "completed";
    }
  } catch (err) {
    console.error("Error checking booking passed status:", err);
  }
  return booking.status;
};

export const mapBooking = (booking) => ({
  id: booking.id,
  roomName: booking.room_name || booking.roomName || "-",
  mataKuliah: booking.course_name || booking.mataKuliah || "-",
  dosen: booking.lecturer || booking.dosen || "-",
  tanggal: formatDate(booking.booking_date || booking.tanggal),
  jamMulai: formatTime(booking.start_time || booking.jamMulai),
  durasi: booking.duration || booking.durasi || 0,
  status: getBookingStatus(booking),
  rejectReason: booking.reject_reason || booking.rejectReason || "",
  nama: booking.user_name || booking.nama || "-",
  nim: booking.nim || "-",
  proofImage: booking.proof_image || booking.proofImage || null,
  showReject: false,
  // Reschedule fields
  rescheduledFromBookingId: booking.rescheduled_from_booking_id || booking.rescheduledFromBookingId || null,
  rescheduleReason: booking.reschedule_reason || booking.rescheduleReason || "",
  origRoomName: booking.orig_room_name || booking.origRoomName || null,
  origTanggal: formatDate(booking.orig_booking_date || booking.origTanggal),
  origJamMulai: formatTime(booking.orig_start_time || booking.origJamMulai),
  origJamSelesai: formatTime(booking.orig_end_time || booking.origJamSelesai),
  // Infocus fields
  wantsInfocus: booking.wants_infocus || booking.wantsInfocus ? true : false,
  assignedInfocusId: booking.assigned_infocus_id || booking.assignedInfocusId || null,
  assignedInfocusName: booking.assigned_infocus_name || booking.assignedInfocusName || null,
});

const parseTimeToMinutes = (timeStr) => {
  const [hours, minutes] = String(timeStr).slice(0, 5).split(":").map(Number);
  return hours * 60 + minutes;
};

const parseFeatures = (features) => {
  if (Array.isArray(features)) return features;
  if (!features) return [];
  try {
    return JSON.parse(features);
  } catch {
    return [];
  }
};

export const mapRoomForDashboard = (room) => {
  const features = parseFeatures(room.features);
  const base = {
    id: room.id,
    name: room.name,
    floor: room.floor,
    capacity: room.capacity,
    features,
  };

  if (room.status && room.status !== "available") {
    return {
      ...base,
      status: "occupied",
      occupiedBy: "Ruangan tidak tersedia",
      occupiedUntil: "-",
    };
  }

  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const todayBookings = [...(room.currentBookings || [])].sort(
    (a, b) => parseTimeToMinutes(a.start_time) - parseTimeToMinutes(b.start_time)
  );

  const activeBooking = todayBookings.find((booking) => {
    const start = parseTimeToMinutes(booking.start_time);
    const end = parseTimeToMinutes(booking.end_time);
    return nowMinutes >= start && nowMinutes < end;
  });

  const upcomingBooking = todayBookings.find((booking) => {
    const start = parseTimeToMinutes(booking.start_time);
    return nowMinutes < start;
  });

  const relevantBooking = activeBooking || upcomingBooking;

  if (relevantBooking) {
    const start = parseTimeToMinutes(relevantBooking.start_time);
    const end = parseTimeToMinutes(relevantBooking.end_time);
    const endingSoon = activeBooking && end - nowMinutes <= 15;
    const bookerName = relevantBooking.user_name || relevantBooking.course_name || "Mahasiswa";

    return {
      ...base,
      status: endingSoon ? "ending_soon" : "occupied",
      occupiedBy: activeBooking
        ? `${bookerName} · ${relevantBooking.course_name || "Kegiatan perkuliahan"}`
        : `Dijadwalkan: ${bookerName} (${formatTime(relevantBooking.start_time)})`,
      occupiedUntil: formatTime(relevantBooking.end_time),
    };
  }

  return {
    ...base,
    status: "available",
  };
};

export const mapLostFoundReport = (report) => ({
  id: report.id,
  title: report.item_name || report.title || "-",
  description: report.description || "",
  location: report.location || "-",
  locationDetail: report.category || report.locationDetail || "",
  type: report.type,
  status:
    report.status === "claimed"
      ? "claimed"
      : report.status === "archived"
        ? "archived"
        : report.type,
  reporterName: report.user_name || report.reporterName || "-",
  date: formatDate(report.date_occurred || report.date || report.created_at),
  time: report.created_at
    ? new Date(report.created_at).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : report.time || "",
  contact: report.contact || report.admin_notes || "-",
  adminNotes: report.admin_notes || "",
  image: report.image || null,
  rawStatus: report.status,
});
