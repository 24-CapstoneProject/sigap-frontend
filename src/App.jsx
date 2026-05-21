// =============================================
// SIGAP - App.jsx (Main Entry Point)
// Sistem Informasi Gedung, Aset, dan Peminjaman
// Fakultas Teknik - Universitas Tadulako
// =============================================

import { useState } from "react";
import { Sidebar, Topbar } from "./components/layout/index.jsx";
import { Modal, Input, Button, Toast } from "./components/ui/index.jsx";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage.jsx";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentBooking from "./pages/student/StudentBooking.jsx";
import StudentLostFound from "./pages/student/StudentLostFound.jsx";
import StudentInventory from "./pages/student/StudentInventory.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminBooking from "./pages/admin/AdminBooking.jsx";
import AdminLostFound from "./pages/admin/AdminLostFound.jsx";
import AdminInventory from "./pages/admin/AdminInventory.jsx";

import { currentUser } from "./data/mockData.js";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null); // Start with null to show login
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedProdi, setEditedProdi] = useState("");
  const [editedAvatar, setEditedAvatar] = useState("");
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState("");

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage("dashboard");
  };

  const handleEditProfile = () => {
    if (user) {
      setEditedName(user.name);
      setEditedEmail(user.email || "");
      setEditedPhone(user.phone || "");
      setEditedAddress(user.address || "");
      setEditedProdi(user.prodi || "");
      setEditedAvatar(user.avatar || "");
      setPreviewPhotoUrl("");
      setIsEditingProfile(false);
      setShowEditProfileModal(true);
    }
  };

  const handleStartEditingProfile = () => {
    setIsEditingProfile(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPreviewPhotoUrl(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const presetAvatars = [
    { initials: "SR", color: "from-blue-600 to-blue-800" },
    { initials: "AB", color: "from-purple-600 to-purple-800" },
    { initials: "CD", color: "from-green-600 to-green-800" },
    { initials: "EF", color: "from-red-600 to-red-800" },
    { initials: "GH", color: "from-pink-600 to-pink-800" },
    { initials: "IJ", color: "from-indigo-600 to-indigo-800" },
  ];

  const handleSaveProfile = () => {
    if (user) {
      setUser(prev => ({
        ...prev,
        name: editedName,
        email: editedEmail,
        phone: editedPhone,
        address: editedAddress,
        prodi: editedProdi,
        avatar: editedAvatar,
      }));
      setShowEditProfileModal(false);
      setIsEditingProfile(false);
      setPreviewPhotoUrl("");
    }
  };

  // If not authenticated, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }



  const renderPage = () => {
    if (user.role === "mahasiswa") {
      // Student Pages
      switch (activePage) {
        case "dashboard":  return <StudentDashboard user={user} onNavigate={setActivePage} />;
        case "booking":    return <StudentBooking user={user} />;
        case "lostfound":  return <StudentLostFound user={user} />;
        case "inventory":  return <StudentInventory user={user} />;
        default:           return <StudentDashboard user={user} onNavigate={setActivePage} />;
      }
    } else if (user.role === "admin") {
      // Admin Pages
      switch (activePage) {
        case "dashboard":  return <AdminDashboard user={user} onNavigate={setActivePage} />;
        case "booking":    return <AdminBooking user={user} />;
        case "lostfound":  return <AdminLostFound user={user} />;
        case "inventory":  return <AdminInventory user={user} />;
        default:           return <AdminDashboard user={user} onNavigate={setActivePage} />;
      }
    }
    return <StudentDashboard user={user} onNavigate={setActivePage} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <Sidebar
        activePage={activePage}
        onNavigate={setActivePage}
        user={user}
        isMobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Topbar
          activePage={activePage}
          user={user}
          onLogout={handleLogout}
          onEditProfile={handleEditProfile}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto" id="main-content">
          {renderPage()}
        </main>
      </div>

      {/* View & Edit Profile Modal */}
      <Modal 
        isOpen={showEditProfileModal} 
        onClose={() => {
          setShowEditProfileModal(false);
          setPreviewPhotoUrl("");
          setIsEditingProfile(false);
        }} 
        title="👤 Profil Saya"
      >
        {!isEditingProfile ? (
          // VIEW MODE
          <div className="space-y-6">
            {/* Photo Section */}
            <div className="flex flex-col items-center">
              <div className={`w-32 h-32 rounded-full bg-gradient-to-br ${presetAvatars.find(a => a.initials === user.avatar)?.color || 'from-blue-600 to-blue-800'} flex items-center justify-center mb-3`}>
                <span className="text-4xl font-bold text-white">{user.avatar}</span>
              </div>
            </div>

            {/* Profile Info (Read Only) */}
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Nama Lengkap</p>
                <p className="text-sm text-gray-900 font-medium">{user.name}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Email</p>
                <p className="text-sm text-gray-900 font-medium">{user.email || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Nomor Telepon</p>
                <p className="text-sm text-gray-900 font-medium">{user.phone || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Prodi / Program Studi</p>
                <p className="text-sm text-gray-900 font-medium">{user.prodi || "-"}</p>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-600 mb-1">Alamat</p>
                <p className="text-sm text-gray-900 font-medium">{user.address || "-"}</p>
              </div>

              {/* Info Fields (Read Only) */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2 border border-gray-100">
                <p className="text-xs text-gray-600"><strong>NIM:</strong> {user.nim}</p>
                <p className="text-xs text-gray-600 capitalize"><strong>Role:</strong> {user.role}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end pt-4 border-t border-gray-100">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setShowEditProfileModal(false);
                  setPreviewPhotoUrl("");
                  setIsEditingProfile(false);
                }}
              >
                Tutup
              </Button>
              <Button 
                variant="primary" 
                onClick={handleStartEditingProfile}
              >
                Edit Profile
              </Button>
            </div>
          </div>
        ) : (
          // EDIT MODE
          <div className="space-y-6">
            {/* Photo Section */}
            <div className="flex flex-col items-center">
              {previewPhotoUrl ? (
                <img src={previewPhotoUrl} alt="Preview" className="w-24 h-24 rounded-full object-cover mb-3" />
              ) : (
                <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${presetAvatars.find(a => a.initials === editedAvatar)?.color || 'from-blue-600 to-blue-800'} flex items-center justify-center mb-3`}>
                  <span className="text-2xl font-bold text-white">{editedAvatar || user.avatar}</span>
                </div>
              )}
              
              <label className="w-full flex items-center justify-center px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-400 transition-colors">
                <span className="text-xs font-semibold text-gray-600">Ganti Foto</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {/* Preset Avatar Options */}
              <div className="mt-4 w-full">
                <p className="text-xs font-semibold text-gray-600 mb-2">Atau Pilih Avatar</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  {presetAvatars.map((avatar) => (
                    <button
                      key={avatar.initials}
                      onClick={() => {
                        setEditedAvatar(avatar.initials);
                        setPreviewPhotoUrl("");
                      }}
                      className={`w-12 h-12 rounded-full bg-gradient-to-br ${avatar.color} flex items-center justify-center text-white font-bold transition-all ${editedAvatar === avatar.initials ? 'ring-2 ring-blue-500' : ''}`}
                    >
                      {avatar.initials}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="space-y-4 border-t border-gray-100 pt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Lengkap</label>
                <Input
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <Input
                  type="email"
                  value={editedEmail}
                  onChange={(e) => setEditedEmail(e.target.value)}
                  placeholder="Masukkan email"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon</label>
                <Input
                  value={editedPhone}
                  onChange={(e) => setEditedPhone(e.target.value)}
                  placeholder="Masukkan nomor telepon"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prodi / Program Studi</label>
                <Input
                  value={editedProdi}
                  onChange={(e) => setEditedProdi(e.target.value)}
                  placeholder="Masukkan program studi"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat</label>
                <textarea
                  value={editedAddress}
                  onChange={(e) => setEditedAddress(e.target.value)}
                  placeholder="Masukkan alamat lengkap"
                  rows="3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder:text-gray-400 font-sans"
                />
              </div>

              {/* Info Fields (Read Only) */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-2">
                <p className="text-xs text-gray-600"><strong>NIM:</strong> {user.nim}</p>
                <p className="text-xs text-gray-600 capitalize"><strong>Role:</strong> {user.role}</p>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
              <Button 
                variant="secondary" 
                onClick={() => {
                  setIsEditingProfile(false);
                }}
              >
                Kembali
              </Button>
              <Button 
                variant="primary" 
                onClick={handleSaveProfile}
                disabled={!editedName.trim()}
              >
                Simpan Perubahan
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
