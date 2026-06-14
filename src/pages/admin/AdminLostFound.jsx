import { useState, useEffect } from "react";
import { Badge, Button, Modal, Toast } from "../../components/ui/index.jsx";
import { API_BASE_URL, apiFetch } from "../../utils/api.js";
import { mapLostFoundReport } from "../../utils/mappers.js";

function ItemCard({ item, onSelectDetail, isTerbaru }) {
  const [expanded, setExpanded] = useState(false);
  const statusIcons = { found: "📦", lost: "🔍", claimed: "✅", pending: "⏳" };
  const isClaimed = item.status === "claimed";

  return (
    <div className={`rounded-2xl border overflow-hidden hover:shadow-lg transition-all duration-200
      ${isClaimed 
        ? "bg-[#F4F4F5] dark:bg-slate-900/60 border-gray-200/80 dark:border-slate-800" 
        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700"}`}>
      {/* Image or Placeholder */}
      <div className="h-40 bg-linear-to-br from-gray-50 to-gray-100 flex flex-col items-center justify-center border-b border-gray-100 dark:border-slate-700 overflow-hidden relative">
        {item.image ? (
          <img 
            src={`${API_BASE_URL}/uploads/${item.image}`} 
            alt={item.title} 
            className={`w-full h-full object-cover ${isClaimed ? "opacity-75 grayscale-[20%] brightness-[90%]" : ""}`}
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
            }}
          />
        ) : (
          <div className={`flex flex-col items-center justify-center w-full h-full ${isClaimed ? "opacity-60" : ""}`}>
            <span className="text-4xl">{statusIcons[item.status] || "📋"}</span>
            <span className="text-xs text-gray-400 mt-1 font-medium">{item.location}</span>
          </div>
        )}
        
        {isTerbaru && (
          <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-lg z-10 shadow-sm uppercase tracking-wider">
            Terbaru
          </div>
        )}

        {/* Status Badge Overlay */}
        <div className="absolute top-3 right-3 z-10 select-none">
          {item.status === "claimed" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#6c757d]/95 text-white uppercase tracking-wider shadow-sm border border-white/10 backdrop-blur-xs">
              SUDAH DIKLAIM
            </span>
          )}
          {item.status === "found" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#2563eb]/95 text-white uppercase tracking-wider shadow-sm border border-white/10 backdrop-blur-xs">
              DITEMUKAN
            </span>
          )}
          {item.status === "lost" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#ef4444]/95 text-white uppercase tracking-wider shadow-sm border border-white/10 backdrop-blur-xs">
              HILANG
            </span>
          )}
          {item.status === "pending" && (
            <span className="px-2.5 py-1 rounded-full text-[9px] font-bold bg-[#f59e0b]/95 text-white uppercase tracking-wider shadow-sm border border-white/10 backdrop-blur-xs">
              PENDING
            </span>
          )}
        </div>
      </div>

      <div className={`p-4 ${isClaimed ? "bg-[#F4F4F5] dark:bg-slate-900/60" : "bg-white dark:bg-slate-800"}`}>
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white flex-1 pr-2">{item.title}</h3>
        </div>

        <p className={`text-xs text-gray-550 dark:text-slate-400 leading-relaxed ${expanded ? "" : "truncate"}`}
          style={expanded ? {} : { display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {item.description}
        </p>
        {item.description.length > 80 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline mt-1 cursor-pointer">
            {expanded ? "Sembunyikan" : "Selengkapnya"}
          </button>
        )}

        <div className="mt-3 space-y-1.5">
          {isClaimed ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0" />
              </svg>
              <span>Status: <span className="font-semibold text-gray-800 dark:text-slate-200">Selesai</span></span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400">
              <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>
                {item.type === "lost" ? "Pemilik: " : "Pelapor: "}
                <span className="font-semibold text-gray-800 dark:text-slate-200">{item.reporterName}</span>
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-xs text-gray-550 dark:text-slate-400">
            <svg className="w-3.5 h-3.5 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0" />
            </svg>
            <span>{item.date} • {item.time}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-slate-700/60">
          {isClaimed ? (
            <button 
              onClick={() => onSelectDetail(item)}
              className="w-full text-sm font-semibold text-gray-500 bg-[#E4E4E7] dark:bg-slate-700 dark:text-slate-450 px-3 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors duration-150 cursor-pointer text-center select-none border-none"
            >
              Terverifikasi
            </button>
          ) : (
            <button 
              onClick={() => onSelectDetail(item)} 
              className="w-full text-sm font-semibold text-blue-900 border border-blue-900 dark:text-blue-400 dark:border-blue-800/80 px-3 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors duration-150 cursor-pointer text-center"
            >
              Lihat Detail
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AdminLostFound() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const loadItems = async () => {
    const response = await apiFetch("/api/lostfound");
    if (response.ok) {
      const data = await response.json();
      setItems((data.reports || []).map(mapLostFoundReport));
    } else {
      const error = await response.json();
      showToast(error.error || "Gagal memuat laporan", "error");
    }
  };

  useEffect(() => {
    loadItems().finally(() => setLoading(false));
  }, []);

  const updateReportStatus = async (id, status, adminNotes) => {
    const response = await apiFetch(`/api/lostfound/${id}`, {
      method: "PUT",
      body: JSON.stringify({ status, adminNotes }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Gagal memperbarui laporan");
    }
  };

  const handleSelectDetail = async (item) => {
    try {
      const response = await apiFetch(`/api/lostfound/${item.id}`);
      if (response.ok) {
        const data = await response.json();
        const mappedReport = mapLostFoundReport(data.report);
        const approvedClaim = (data.claims || []).find(c => c.status === "approved");
        setSelectedItem({
          ...mappedReport,
          claims: data.claims || [],
          claimerName: approvedClaim ? approvedClaim.claimer_name : null,
          claimedBy: approvedClaim ? approvedClaim.claimer_nim : null,
          claimedDate: approvedClaim && approvedClaim.approved_at ? new Date(approvedClaim.approved_at).toLocaleDateString("id-ID") : null,
        });
      } else {
        setSelectedItem({ ...item, claims: [] });
      }
    } catch (err) {
      console.error("Failed to fetch detail:", err);
      setSelectedItem({ ...item, claims: [] });
    }
    setShowDetailModal(true);
  };

  const handleApproveClaim = async (claimId) => {
    try {
      const response = await apiFetch(`/api/lostfound/claims/${claimId}/approve`, {
        method: "POST"
      });
      if (response.ok) {
        showToast("Klaim disetujui!", "success");
        await loadItems();
        if (selectedItem) {
          const detailRes = await apiFetch(`/api/lostfound/${selectedItem.id}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const mappedReport = mapLostFoundReport(detailData.report);
            const approvedClaim = (detailData.claims || []).find(c => c.status === "approved");
            setSelectedItem({
              ...mappedReport,
              claims: detailData.claims || [],
              claimerName: approvedClaim ? approvedClaim.claimer_name : null,
              claimedBy: approvedClaim ? approvedClaim.claimer_nim : null,
              claimedDate: approvedClaim && approvedClaim.approved_at ? new Date(approvedClaim.approved_at).toLocaleDateString("id-ID") : null,
            });
          } else {
            setShowDetailModal(false);
            setSelectedItem(null);
          }
        }
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal menyetujui klaim", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menyetujui klaim", "error");
    }
  };

  const handleRejectClaim = async (claimId) => {
    const reason = window.prompt("Masukkan alasan penolakan klaim (opsional):");
    if (reason === null) return; // cancelled
    
    try {
      const response = await apiFetch(`/api/lostfound/claims/${claimId}/reject`, {
        method: "POST",
        body: JSON.stringify({ reason: reason || "Bukti kepemilikan tidak cukup" })
      });
      if (response.ok) {
        showToast("Klaim ditolak.", "info");
        await loadItems();
        if (selectedItem) {
          const detailRes = await apiFetch(`/api/lostfound/${selectedItem.id}`);
          if (detailRes.ok) {
            const detailData = await detailRes.json();
            const mappedReport = mapLostFoundReport(detailData.report);
            const approvedClaim = (detailData.claims || []).find(c => c.status === "approved");
            setSelectedItem({
              ...mappedReport,
              claims: detailData.claims || [],
              claimerName: approvedClaim ? approvedClaim.claimer_name : null,
              claimedBy: approvedClaim ? approvedClaim.claimer_nim : null,
              claimedDate: approvedClaim && approvedClaim.approved_at ? new Date(approvedClaim.approved_at).toLocaleDateString("id-ID") : null,
            });
          } else {
            setShowDetailModal(false);
            setSelectedItem(null);
          }
        }
      } else {
        const error = await response.json();
        showToast(error.error || "Gagal menolak klaim", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Terjadi kesalahan saat menolak klaim", "error");
    }
  };

  const handleApprove = async (id) => {
    try {
      await updateReportStatus(id, "pending", "Laporan diterima admin");
      await loadItems();
      setShowDetailModal(false);
      setSelectedItem(null);
      showToast("Laporan diterima dan dipublikasikan.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await updateReportStatus(id, "archived", "Laporan ditolak admin");
      await loadItems();
      setShowDetailModal(false);
      setSelectedItem(null);
      showToast("Laporan ditolak dan tidak dipublikasikan.", "info");
    } catch (err) {
      showToast(err.message, "error");
    }
  };

  const handleMarkComplete = async (id) => {
    try {
      await updateReportStatus(id, "claimed", "Barang sudah kembali ke pemilik");
      await loadItems();
      setShowDetailModal(false);
      setSelectedItem(null);
      showToast("Barang ditandai sebagai selesai.", "success");
    } catch (err) {
      showToast(err.message, "error");
    }
  };



  const filtered = items.filter((item) => filterStatus === "all" || item.status === filterStatus);

  const counts = {
    all: items.length,
    found: items.filter((i) => i.status === "found").length,
    lost: items.filter((i) => i.status === "lost").length,
    claimed: items.filter((i) => i.status === "claimed").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-gray-200/60 dark:border-slate-700/60 inline-flex items-center gap-1.5 shadow-sm overflow-x-auto max-w-full">
          {[
            { key: "all", label: "Semua", activeClass: "bg-[#2563eb] text-white shadow-xs" },
            { key: "found", label: "Ditemukan", activeClass: "bg-[#2563eb] text-white shadow-xs" },
            { key: "lost", label: "Hilang", activeClass: "bg-[#ef4444] text-white shadow-xs" },
            { key: "claimed", label: "Sudah Diklaim", activeClass: "bg-[#6c757d] text-white shadow-xs" },
          ].map((tab) => {
            const isActive = filterStatus === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                className={`px-4.5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer
                  ${isActive 
                    ? `${tab.activeClass} font-extrabold` 
                    : "bg-transparent text-gray-500 dark:text-slate-400 hover:text-gray-955 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-750"}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Memuat laporan...</div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 py-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm font-semibold text-gray-600">Belum ada laporan</p>
          <p className="text-xs text-gray-400 mt-1">Laporan dari mahasiswa akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item, index) => (
            <ItemCard key={item.id} item={item} onSelectDetail={handleSelectDetail} isTerbaru={index === 0} />
          ))}
        </div>
      )}

      {selectedItem && (
        <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null); }} title="Detail Laporan">
          <div className="space-y-6">
            {/* Image or Placeholder */}
            <div className="h-64 bg-linear-to-br from-gray-50 to-gray-100 rounded-xl flex flex-col items-center justify-center border border-gray-200 overflow-hidden relative">
              {selectedItem.image ? (
                <img 
                  src={`${API_BASE_URL}/uploads/${selectedItem.image}`} 
                  alt={selectedItem.title} 
                  className="w-full h-full object-contain"
                />
              ) : (
                <>
                  <span className="text-6xl">{selectedItem.status === "found" ? "📦" : selectedItem.status === "lost" ? "🔍" : "✅"}</span>
                  <span className="text-sm text-gray-500 mt-2 font-medium">{selectedItem.location}</span>
                </>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedItem.title}</h3>
              <Badge status={selectedItem.status} />
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Deskripsi</p>
              <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Lokasi</p>
              <p className="text-sm text-gray-700">{selectedItem.location}</p>
            </div>

            {selectedItem.locationDetail && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">
                  {selectedItem.status === "found" ? "Status Barang Saat Ini" : "Lokasi Detail"}
                </p>
                <p className="text-sm text-gray-700">{selectedItem.locationDetail}</p>
              </div>
            )}

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Dilaporkan Oleh</p>
              <p className="text-sm text-gray-700">{selectedItem.reporterName}</p>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-600 mb-1">Kontak</p>
              <p className="text-sm text-blue-600 font-medium">{selectedItem.contact}</p>
            </div>

            {/* Tampilan Klaim jika statusnya claimed */}
            {selectedItem.rawStatus === "claimed" && (
              <div className="border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold text-gray-600 mb-1">Diklaim Oleh</p>
                <div className="flex items-center gap-2 text-sm text-gray-700 font-medium">
                  <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedItem.claimerName} ({selectedItem.claimedBy})</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tanggal diklaim: {selectedItem.claimedDate}</p>
              </div>
            )}

            {/* Daftar Klaim Mahasiswa */}
            {selectedItem.type === "found" && selectedItem.rawStatus !== "claimed" && (
              <div className="border-t border-gray-100 pt-4 space-y-3">
                <p className="text-xs font-semibold text-gray-600">Daftar Klaim Mahasiswa</p>
                {selectedItem.claims && selectedItem.claims.length > 0 ? (
                  <div className="space-y-2">
                    {selectedItem.claims.map((claim) => (
                      <div key={claim.id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-gray-800">
                            {claim.claimer_name} ({claim.claimer_nim})
                          </span>
                          {claim.status === "pending" && (
                            <span className="bg-amber-50 text-amber-700 font-semibold px-2 py-0.5 rounded border border-amber-200">
                              Menunggu Verifikasi
                            </span>
                          )}
                          {claim.status === "approved" && (
                            <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                              Disetujui
                            </span>
                          )}
                          {claim.status === "rejected" && (
                            <span className="bg-red-50 text-red-700 font-semibold px-2 py-0.5 rounded border border-red-200">
                              Ditolak
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 leading-relaxed italic">
                          "{claim.message || "Tidak ada pesan tambahan."}"
                        </p>
                        {claim.status === "rejected" && claim.reject_reason && (
                          <p className="text-red-600 font-medium bg-red-50/50 p-1.5 rounded">
                            Alasan Penolakan: {claim.reject_reason}
                          </p>
                        )}
                        {claim.status === "pending" && (
                          <div className="flex gap-2 justify-end pt-1">
                            <Button
                              variant="success"
                              size="xs"
                              onClick={() => handleApproveClaim(claim.id)}
                            >
                              ✓ Setujui
                            </Button>
                            <Button
                              variant="danger"
                              size="xs"
                              onClick={() => handleRejectClaim(claim.id)}
                            >
                              ✗ Tolak
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic">Belum ada mahasiswa yang mengklaim barang ini.</p>
                )}
              </div>
            )}

            <div className="border-t border-gray-100 pt-4">
              {selectedItem.rawStatus === "pending" ? (
                <div className="flex justify-end">
                  <Button variant="danger" size="sm" className="justify-center text-xs" onClick={() => handleReject(selectedItem.id)}>Tolak Laporan</Button>
                </div>
              ) : (
                <div className="flex justify-end items-center">
                  {selectedItem.rawStatus === "approved" && (
                    <Button variant="success" size="sm" className="justify-center text-xs" onClick={() => handleMarkComplete(selectedItem.id)}>✓ Tandai Selesai (Sudah Diklaim)</Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
