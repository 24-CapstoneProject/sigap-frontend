import { useState, useEffect } from "react";
import { Toast, Modal, Button } from "../../components/ui/index.jsx";
import { API_BASE_URL, apiFetch } from "../../utils/api.js";
import { mapBooking } from "../../utils/mappers.js";

function StatCard({ label, value, icon, color }) {
  const colors = {
    amber: "from-amber-400 to-amber-600 shadow-amber-200",
    emerald: "from-emerald-500 to-emerald-700 shadow-emerald-200",
    red: "from-red-500 to-red-700 shadow-red-200",
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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [selectedRejectedDetail, setSelectedRejectedDetail] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Bulk Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [importErrors, setImportErrors] = useState(null);
  const [importSuccess, setImportSuccess] = useState(null);

  // Infocus Selection Modal States
  const [showInfocusModal, setShowInfocusModal] = useState(false);
  const [approvingBookingId, setApprovingBookingId] = useState(null);
  const [availableProjectors, setAvailableProjectors] = useState([]);
  const [selectedProjectorId, setSelectedProjectorId] = useState("");
  const [projectorsLoading, setProjectorsLoading] = useState(false);

  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 4); // Default to 4 months (approx. 1 semester)
    return d.toISOString().split("T")[0];
  });

  const handleDownloadTemplate = () => {
    const headers = "RUANG,HARI,JAM,KODE,NAMA,TIM DOSEN\n";
    const example1 = "F.F 01,Senin,08:00 - 10:00,IF123,Rekayasa Sistem Lanjutan,Dr. Siti Rahma S.Kom. M.Cs.\n";
    const example2 = "F.F 02,Selasa,10:00 - 13:00,IF456,Pemrograman Web,Dr. Ahmad Fauzi\n";
    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + example1 + example2);
    const link = document.createElement("a");
    link.setAttribute("href", csvContent);
    link.setAttribute("download", "template_import_jadwal.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = async () => {
    try {
      showToast("⏳ Menyiapkan unduhan laporan...", "info");
      const response = await apiFetch("/api/bookings/export-excel");
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Laporan_Peminjaman_Ruangan_SIGAP_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        showToast("✓ Laporan Excel berhasil diunduh");
      } else {
        showToast("Gagal mengunduh laporan Excel", "error");
      }
    } catch (err) {
      console.error("Export Excel error:", err);
      showToast("Kesalahan koneksi saat mengunduh", "error");
    }
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importFile) {
      showToast("Silakan pilih file terlebih dahulu", "error");
      return;
    }
    if (!startDate || !endDate) {
      showToast("Silakan isi rentang tanggal semester terlebih dahulu", "error");
      return;
    }

    setImporting(true);
    setImportErrors(null);
    setImportSuccess(null);

    const formData = new FormData();
    formData.append("file", importFile);
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);

    try {
      const response = await apiFetch("/api/bookings/bulk-import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setImportSuccess(data.message || "Import jadwal berhasil diselesaikan.");
        setImportFile(null);
        await loadBookings();
        showToast("Jadwal perkuliahan berhasil diimpor.");
        setTimeout(() => {
          setShowImportModal(false);
          setImportSuccess(null);
        }, 2500);
      } else {
        if (data.details && Array.isArray(data.details)) {
          setImportErrors(data.details);
        } else {
          setImportErrors([data.error || "Gagal melakukan import jadwal."]);
        }
      }
    } catch (err) {
      console.error("Bulk import error:", err);
      setImportErrors(["Terjadi kesalahan koneksi saat memproses file."]);
    } finally {
      setImporting(false);
    }
  };

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadBookings = async () => {
    const response = await apiFetch("/api/bookings");
    if (response.ok) {
      const data = await response.json();
      setBookings((data.bookings || []).map(mapBooking));
    } else {
      const error = await response.json();
      showToast(error.error || "Gagal memuat data peminjaman", "error");
    }
  };

  useEffect(() => {
    loadBookings().finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id, bookingWantsInfocus = false) => {
    if (bookingWantsInfocus) {
      setApprovingBookingId(id);
      setSelectedProjectorId("");
      setProjectorsLoading(true);
      setShowInfocusModal(true);
      try {
        const response = await apiFetch("/api/inventory/available-projectors");
        if (response.ok) {
          const data = await response.json();
          setAvailableProjectors(data.projectors || []);
        } else {
          showToast("Gagal memuat proyektor tersedia", "error");
        }
      } catch (err) {
        console.error("Load projectors error:", err);
      } finally {
        setProjectorsLoading(false);
      }
    } else {
      await executeApprove(id, null);
    }
  };

  const executeApprove = async (id, projectorId) => {
    try {
      const response = await apiFetch(`/api/bookings/${id}/approve`, {
        method: "POST",
        body: JSON.stringify({ 
          adminNotes: "Disetujui admin",
          assignedInfocusId: projectorId || null
        }),
      });

      if (response.ok) {
        await loadBookings();
        showToast("Peminjaman disetujui");
        setShowInfocusModal(false);
        setApprovingBookingId(null);
        setSelectedProjectorId("");
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal menyetujui peminjaman", "error");
      }
    } catch (err) {
      console.error("Approve booking error:", err);
      showToast("Terjadi kesalahan saat menyetujui", "error");
    }
  };

  const toggleReject = (id) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, showReject: !b.showReject } : b))
    );
  };

  const setRejectReason = (id, reason) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, rejectReason: reason } : b))
    );
  };

  const handleReject = async (id) => {
    const booking = bookings.find((b) => b.id === id);
    const reason = booking?.rejectReason || "Ditolak oleh admin";

    try {
      const response = await apiFetch(`/api/bookings/${id}/reject`, {
        method: "POST",
        body: JSON.stringify({ rejectReason: reason }),
      });

      if (response.ok) {
        await loadBookings();
        showToast("Peminjaman ditolak", "info");
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal menolak peminjaman", "error");
      }
    } catch (err) {
      console.error("Reject booking error:", err);
      showToast("Terjadi kesalahan saat menolak", "error");
    }
  };

  const filtered = bookings.filter((b) => {
    const statusMatch =
      statusFilter === "all" ||
      b.status === statusFilter ||
      (statusFilter === "approved" && b.status === "completed");
    const searchMatch =
      b.nama.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.nim.toLowerCase().includes(searchQuery.toLowerCase());
    return statusMatch && searchMatch;
  });

  const counts = {
    pending: bookings.filter((b) => b.status === "pending").length,
    approved: bookings.filter((b) => b.status === "approved" || b.status === "completed").length,
    rejected: bookings.filter((b) => b.status === "rejected").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Manajemen Ruangan</h2>
          <p className="text-sm text-gray-400">Monitoring dan validasi permohonan peminjaman ruang</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-2 border border-gray-200 dark:border-slate-655 bg-white dark:bg-slate-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-50 dark:hover:bg-slate-700 transition-all cursor-pointer shadow-xs"
          >
            <svg className="w-4 h-4 text-gray-505" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Unduh Excel
          </button>
          <Button
            onClick={() => setShowImportModal(true)}
            variant="primary"
            className="shadow-md hover:shadow-lg transition-all"
          >
            📂 Import Jadwal (Excel/CSV)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Pending Request" value={counts.pending} icon="⏳" color="amber" />
        <StatCard label="Approved" value={counts.approved} icon="✅" color="emerald" />
        <StatCard label="Rejected" value={counts.rejected} icon="✕" color="red" />
      </div>

      {selectedRejectedDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Detail Penolakan</h3>
              <button onClick={() => setSelectedRejectedDetail(null)} className="text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            </div>
            <div className="space-y-4">
              <div className="bg-red-50 rounded-xl p-4 border border-red-200">
                <p className="text-xs text-gray-500 font-semibold mb-1">NAMA MAHASISWA</p>
                <p className="text-lg font-bold text-gray-900">{selectedRejectedDetail.nama}</p>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs text-gray-500 font-semibold mb-2">ALASAN PENOLAKAN</p>
                <p className="text-sm text-red-700 font-medium">{selectedRejectedDetail.rejectReason || "-"}</p>
              </div>
              <button onClick={() => setSelectedRejectedDetail(null)} className="w-full bg-gray-200 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-300 transition-all">Tutup</button>
            </div>
          </div>
        </div>
      )}

      {showInfocusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔌</span>
                <h3 className="text-xl font-bold text-gray-900">Pilih Infokus / Proyektor</h3>
              </div>
              <button 
                onClick={() => {
                  setShowInfocusModal(false);
                  setApprovingBookingId(null);
                }} 
                className="text-gray-400 hover:text-gray-650 text-2xl"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <p className="text-xs text-gray-500 leading-relaxed">
                Mahasiswa ini memohon peminjaman infokus/proyektor. Silakan pilih salah satu perangkat proyektor yang tersedia di bawah ini untuk ditugaskan.
              </p>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-2">
                  Daftar Proyektor Tersedia
                </label>
                {projectorsLoading ? (
                  <div className="py-4 text-center text-xs text-gray-500">
                    ⏳ Memuat proyektor...
                  </div>
                ) : availableProjectors.length === 0 ? (
                  <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-100 text-center font-semibold">
                    ⚠️ Tidak ada proyektor yang tersedia saat ini!
                  </div>
                ) : (
                  <select
                    value={selectedProjectorId}
                    onChange={(e) => setSelectedProjectorId(e.target.value)}
                    className="w-full border rounded-lg p-2.5 text-sm bg-white"
                  >
                    <option value="">-- Pilih Perangkat Proyektor --</option>
                    {availableProjectors.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.serialNumber || p.id}) - Stok: {p.quantity}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <button
                  disabled={!selectedProjectorId}
                  onClick={() => executeApprove(approvingBookingId, selectedProjectorId)}
                  className={`w-full font-bold py-2.5 px-4 rounded-lg text-sm transition-all
                    ${selectedProjectorId 
                      ? "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" 
                      : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                >
                  ✓ Setujui dengan Proyektor
                </button>
                <button
                  onClick={() => executeApprove(approvingBookingId, null)}
                  className="w-full bg-gray-150 text-gray-705 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-gray-200 transition-all cursor-pointer text-center"
                >
                  Setujui Tanpa Proyektor
                </button>
                <button
                  onClick={() => {
                    setShowInfocusModal(false);
                    setApprovingBookingId(null);
                  }}
                  className="w-full border text-gray-500 font-semibold py-2 px-4 rounded-lg text-xs hover:bg-gray-50 transition-all cursor-pointer text-center"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {[
            { key: "pending", label: "Menunggu" },
            { key: "approved", label: "Disetujui" },
            { key: "rejected", label: "Ditolak" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold ${
                statusFilter === tab.key ? "bg-blue-600 text-white" : "bg-white border text-gray-500"
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

      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-50 dark:bg-slate-800/50 px-4 py-3 text-xs text-gray-500 font-semibold">
          <p>Student Name</p>
          <p>Course</p>
          <p>Room & Time</p>
          <p>Status</p>
          <p className="text-center">Actions</p>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data peminjaman...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center text-gray-500">Belum ada permohonan peminjaman.</div>
        ) : (
          filtered.map((b) => (
            <div key={b.id} className="border-t border-gray-100/70 dark:border-slate-700/50">
              <div className="grid grid-cols-5 items-center px-4 py-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-900">{b.nama}</p>
                  <p className="text-xs text-gray-500 mt-1">{b.nim}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{b.mataKuliah}</p>
                  <p className="text-xs text-gray-500 mt-1">{b.dosen}</p>
                </div>
                <div>
                  {b.rescheduledFromBookingId ? (
                    <div className="space-y-2">
                      <span className="inline-block bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                        🔄 Pindah Jadwal
                      </span>
                      
                      <div className="border border-purple-100 rounded-lg p-2 bg-purple-50/30 text-xs">
                        <p className="font-semibold text-purple-500 text-[10px] uppercase mb-0.5">Jadwal Lama:</p>
                        <p className="font-bold text-gray-700">{b.origRoomName || "-"}</p>
                        <p className="text-gray-650 text-[11px]">{b.origTanggal} ({b.origJamMulai} - {b.origJamSelesai})</p>
                      </div>

                      <div className="border border-emerald-100 rounded-lg p-2 bg-emerald-50/30 text-xs">
                        <p className="font-semibold text-emerald-700 text-[10px] uppercase mb-0.5">Usulan Baru:</p>
                        <p className="font-bold text-gray-900">{b.roomName}</p>
                        <p className="text-gray-700 text-[11px]">{b.tanggal} ({b.jamMulai}, {b.durasi}h)</p>
                      </div>

                      {b.rescheduleReason && (
                        <div className="bg-gray-50 rounded-lg p-2 text-xs border">
                          <span className="font-semibold text-gray-500 text-[9px] uppercase block mb-0.5">Alasan Pindah:</span>
                          <p className="text-gray-700 italic">"{b.rescheduleReason}"</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <div className="inline-block bg-blue-100 text-blue-600 px-2 py-1 rounded-lg text-xs font-semibold mb-2">{b.roomName}</div>
                      <p className="text-xs text-gray-600">{b.tanggal}</p>
                      <p className="text-xs text-gray-500">{b.jamMulai} ({b.durasi}h)</p>
                      {b.proofImage && (
                        <div className="mt-1.5">
                          <a 
                            href={`${API_BASE_URL}/uploads/${b.proofImage}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
                          >
                            🖼️ Lihat Bukti Foto
                          </a>
                        </div>
                      )}

                      {b.wantsInfocus && (
                        <div className="mt-2">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border
                            ${b.assignedInfocusName 
                              ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                              : "bg-amber-50 border-amber-100 text-amber-700"}`}
                          >
                            <span>🔌</span>
                            <span>
                              {b.assignedInfocusName 
                                ? `Infokus: ${b.assignedInfocusName}` 
                                : "Memohon Infokus"}
                            </span>
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
                <div>
                  {b.status === "pending" && <span className="inline-block bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold">⏳ Menunggu</span>}
                  {b.status === "approved" && <span className="inline-block bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold">✓ Disetujui</span>}
                  {b.status === "rejected" && <span className="inline-block bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-semibold">✕ Ditolak</span>}
                  {b.status === "completed" && <span className="inline-block bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">✅ Selesai</span>}
                </div>
                <div className="flex justify-center gap-2">
                  {b.status === "pending" && (
                    <>
                      <button onClick={() => handleApprove(b.id, b.wantsInfocus)} className="bg-green-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-green-600 transition-all">✓ Setujui</button>
                      <button onClick={() => toggleReject(b.id)} className="bg-red-500 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-red-600 transition-all">✕ Tolak</button>
                    </>
                  )}
                  {b.status === "rejected" && (
                    <button onClick={() => setSelectedRejectedDetail(b)} className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-2 rounded-lg transition-all font-semibold" title="Lihat Detail Penolakan">👁️ Lihat</button>
                  )}
                </div>
              </div>

              {b.showReject && (
                <div className="px-4 pb-4">
                  <div className="bg-gray-50 border rounded-xl p-4">
                    <p className="text-xs text-gray-500 mb-2">Alasan Penolakan (Opsional)</p>
                    <textarea
                      className="w-full border rounded-lg p-2 text-sm"
                      placeholder="Contoh: Jadwal bentrok..."
                      onChange={(e) => setRejectReason(b.id, e.target.value)}
                    />
                    <div className="flex justify-end mt-3">
                      <button onClick={() => handleReject(b.id)} className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm">Kirim Penolakan</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <Modal
          isOpen={showImportModal}
          onClose={() => {
            setShowImportModal(false);
            setImportFile(null);
            setImportErrors(null);
            setImportSuccess(null);
          }}
          title="📂 Import Jadwal Kuliah & Ruangan"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 dark:bg-slate-800/60 border border-blue-100 dark:border-slate-700 rounded-xl p-4 text-xs text-blue-800 dark:text-blue-200 leading-relaxed space-y-2">
              <p className="font-bold text-sm">📖 Panduan Penggunaan Template:</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Format file yang didukung: <strong>.xlsx, .xls, .csv</strong></li>
                <li>Jadwal yang berhasil diimpor akan langsung berstatus <strong>Disetujui (Approved)</strong>.</li>
                <li>Nama ruangan harus sesuai dengan database (contoh: <strong>F.F 01, F.F 02, ..., F.F 12</strong>).</li>
                <li>Hari harus berupa hari Indonesia (contoh: <strong>Senin, Selasa, Rabu, Kamis, Jumat, Sabtu, Minggu</strong>).</li>
                <li>Jadwal akan diekspansi secara mingguan berulang dari <strong>Tanggal Mulai</strong> sampai <strong>Tanggal Selesai Semester</strong>.</li>
                <li>Format Jam: <strong>HH:MM - HH:MM</strong> atau <strong>HH.MM - HH.MM</strong> (contoh: 08:00 - 10:00).</li>
                <li>Kolom wajib: <strong>RUANG, HARI, JAM, NAMA (Mata Kuliah), TIM DOSEN</strong>.</li>
              </ul>
              <div className="pt-2">
                <Button variant="secondary" size="sm" onClick={handleDownloadTemplate} className="text-xs">
                  📥 Unduh Template CSV (.csv)
                </Button>
              </div>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-4">
              {importSuccess && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800 font-medium">
                  ✓ {importSuccess}
                </div>
              )}

              {importErrors && importErrors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-800 space-y-1.5 max-h-60 overflow-y-auto">
                  <p className="font-bold">❌ Gagal melakukan import. Silakan perbaiki kesalahan berikut:</p>
                  <ul className="list-disc pl-4 space-y-1 text-xs">
                    {importErrors.map((err, idx) => (
                      <li key={idx}>{err}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Semester Date Range Picker */}
              <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-900/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-slate-400 block mb-1.5">
                    TANGGAL MULAI SEMESTER *
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-slate-400 block mb-1.5">
                    TANGGAL SELESAI SEMESTER *
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full text-sm border border-gray-300 dark:border-slate-700 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-slate-200">
                  Pilih File Spreadsheet <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    id="excel_file_import"
                    accept=".xlsx,.xls,.csv"
                    onChange={(e) => {
                      setImportFile(e.target.files[0]);
                      setImportErrors(null);
                    }}
                    className="flex-1 text-sm border border-gray-300 dark:border-slate-600 rounded-xl px-3 py-2 bg-white dark:bg-slate-900 text-gray-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {importFile && (
                    <button
                      type="button"
                      onClick={() => {
                        setImportFile(null);
                        setImportErrors(null);
                      }}
                      className="text-red-600 hover:text-red-800 text-sm font-bold p-2 cursor-pointer"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowImportModal(false);
                    setImportFile(null);
                    setImportErrors(null);
                    setImportSuccess(null);
                  }}
                  disabled={importing}
                >
                  Tutup
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={importing || !importFile}
                >
                  {importing ? "⏳ Memproses..." : "Mulai Import"}
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
