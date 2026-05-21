import { useState } from "react";
import { Badge, Button, Input, Select, Modal, Toast } from "../../components/ui/index.jsx";
import { lostFoundItems } from "../../data/mockData.js";

const LOCATION_OPTIONS = ["SG-1","SG-2","SG-3","SG-4","SG-5","SG-6","SG-7","SG-8","SG-9","SG-10","SG-11","SG-12","Koridor Lantai 1","Koridor Lantai 2","Koridor Lantai 3","Area Lainnya"];

function ItemCard({ item, onSelectDetail, isAdmin, isTerbaru }) {
  const [expanded, setExpanded] = useState(false);

  const statusIcons = { found: "📦", lost: "🔍", claimed: "✅" };
  const statusBg = {
    found:   "from-blue-50 to-blue-100/50",
    lost:    "from-red-50 to-red-100/50",
    claimed: "from-gray-50 to-gray-100/50",
  };

  return (
    <div className={`rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-200 ${item.status === "claimed" ? "opacity-70" : ""}`}>
      {/* Image Placeholder */}
      <div className={`h-36 bg-linear-to-br ${statusBg[item.status]} flex flex-col items-center justify-center border-b border-gray-100 relative`}>
        <span className="text-4xl">{statusIcons[item.status]}</span>
        <span className="text-xs text-gray-400 mt-1 font-medium">{item.location}</span>
        {isTerbaru && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            Terbaru
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 bg-white">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-900 flex-1 pr-2">{item.title}</h3>
          <Badge status={item.status} />
        </div>

        <p className={`text-xs text-gray-500 leading-relaxed ${expanded ? "" : "truncate"}`}
           style={expanded ? {} : { display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {item.description}
        </p>
        {item.description.length > 80 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-blue-600 hover:underline mt-1">
            {expanded ? "Sembunyikan" : "Selengkapnya"}
          </button>
        )}

        <div className="mt-3 space-y-1.5">
          {item.locationDetail && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
            <svg className="w-3.5 h-3.5 text-gray-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{item.locationDetail}</span>
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>Dilaporkan oleh {item.reporterName}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>{item.date} · {item.time}</span>
          </div>
        </div>

        {isAdmin && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <button 
              onClick={() => onSelectDetail(item)}
              className="w-full text-sm font-semibold text-blue-900 border-2 border-blue-900 px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors duration-150">
              Lihat Detail
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLostFound({ user }) {
  const [items, setItems] = useState(lostFoundItems);
  const [toast, setToast] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ message: msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSelectDetail = (item) => {
    setSelectedItem(item);
    setShowDetailModal(true);
  };

  const handleApprove = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setShowDetailModal(false);
    setSelectedItem(null);
    showToast("Laporan diterima dan dipublikasikan.", "success");
  };

  const handleReject = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setShowDetailModal(false);
    setSelectedItem(null);
    showToast("Laporan ditolak dan tidak dipublikasikan.", "info");
  };

  const handleMarkComplete = (id) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, status: "claimed" } : i));
    setShowDetailModal(false);
    setSelectedItem(null);
    showToast("Barang ditandai sebagai selesai.", "success");
  };

  const handleDelete = (id) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setShowDetailModal(false);
    setSelectedItem(null);
    showToast("Laporan dihapus.", "info");
  };

  const filtered = items.filter(item => {
    const statusOk = filterStatus === "all" || item.status === filterStatus;
    return statusOk;
  });

  const counts = {
    all: items.length,
    found: items.filter(i => i.status === "found").length,
    lost: items.filter(i => i.status === "lost").length,
    claimed: items.filter(i => i.status === "claimed").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Moderasi Mading Digital Lost & Found</h2>
          <p className="text-sm text-gray-400 mt-0.5">Verifikasi dan kelola laporan barang temuan dan kehilangan</p>
        </div>
      </div>

      {/* Filter Tabs & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { key: "all", label: "Semua" },
            { key: "found", label: "Barang Temuan" },
            { key: "lost", label: "Barang Hilang" },
            { key: "claimed", label: "Sudah Diklaim" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilterStatus(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-150
                ${filterStatus === tab.key ? "bg-blue-600 text-white shadow-md shadow-blue-100" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}
            >
              {tab.label}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${filterStatus === tab.key ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                {counts[tab.key]}
              </span>
            </button>
          ))}
        </div>

        {/* Stats Cards */}
        <div className="flex gap-2">
          <div className="bg-white rounded-xl border border-gray-200 px-3 py-2 text-center whitespace-nowrap">
            <p className="text-xs text-gray-500 font-medium">Belum Kembali</p>
            <p className="text-sm font-bold text-red-600">{items.filter(i => i.status !== "claimed").length}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 px-3 py-2 text-center whitespace-nowrap">
            <p className="text-xs text-gray-500 font-medium">Selesai Hari Ini</p>
            <p className="text-sm font-bold text-emerald-600">{items.filter(i => i.status === "claimed").length}</p>
          </div>
        </div>
      </div>

      {/* Items Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 py-12 text-center">
          <div className="text-4xl mb-3">✅</div>
          <p className="text-sm font-semibold text-gray-600">Semua laporan telah diverifikasi</p>
          <p className="text-xs text-gray-400 mt-1">Tidak ada laporan yang perlu ditinjau dengan filter ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((item, index) => (
            <ItemCard 
              key={item.id} 
              item={item} 
              onSelectDetail={handleSelectDetail}
              isAdmin={true}
              isTerbaru={index === 0}
            />
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <Modal isOpen={showDetailModal} onClose={() => { setShowDetailModal(false); setSelectedItem(null); }} title="Detail Laporan">
          <div className="space-y-6">
            {/* Image Placeholder */}
            <div className={`h-48 bg-linear-to-br ${selectedItem.status === "found" ? "from-blue-50 to-blue-100/50" : selectedItem.status === "lost" ? "from-red-50 to-red-100/50" : "from-gray-50 to-gray-100/50"} rounded-xl flex flex-col items-center justify-center border border-gray-200`}>
              <span className="text-6xl">{selectedItem.status === "found" ? "📦" : selectedItem.status === "lost" ? "🔍" : "✅"}</span>
              <span className="text-sm text-gray-500 mt-2 font-medium">{selectedItem.location}</span>
            </div>

            {/* Item Info */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">{selectedItem.title}</h3>
                <div className="flex items-center gap-2">
                  <Badge status={selectedItem.status} />
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Deskripsi</p>
                <p className="text-sm text-gray-700 leading-relaxed">{selectedItem.description}</p>
              </div>

              {selectedItem.locationDetail && (
                <div>
                  <p className="text-xs font-semibold text-gray-600 mb-1">Lokasi Detail</p>
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{selectedItem.locationDetail}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Dilaporkan Oleh</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>{selectedItem.reporterName}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Tanggal & Waktu</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{selectedItem.date} · {selectedItem.time}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Kontak</p>
                <p className="text-sm text-blue-600 font-medium">{selectedItem.contact}</p>
              </div>
            </div>

            {selectedItem.status === "claimed" && (
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Diklaim Oleh</p>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{selectedItem.claimerName} ({selectedItem.claimedBy})</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">Tanggal diklaim: {selectedItem.claimedDate}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="border-t border-gray-100 pt-4">
              <div className="grid grid-cols-4 gap-2">
                <Button variant="primary" size="sm" className="justify-center text-xs" onClick={() => handleMarkComplete(selectedItem.id)}>
                  Selesai
                </Button>
                <Button variant="success" size="sm" className="justify-center text-xs" onClick={() => handleApprove(selectedItem.id)}>
                  Terima
                </Button>
                <Button variant="danger" size="sm" className="justify-center text-xs" onClick={() => handleReject(selectedItem.id)}>
                  Tolak
                </Button>
                <Button variant="ghost" size="sm" className="justify-center text-red-600 hover:text-red-700" onClick={() => handleDelete(selectedItem.id)}>
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
