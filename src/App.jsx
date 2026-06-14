// =============================================
// SIGAP - App.jsx (Main Entry Point)
// Sistem Informasi Gedung, Aset, dan Peminjaman
// Fakultas Teknik - Universitas Tadulako
// =============================================

import { useState, useEffect } from "react";
import { API_BASE_URL, getToken, logoutRequest } from "./utils/api.js";
import { Sidebar, Topbar } from "./components/layout/index.jsx";
import { Modal, Input, Button, Toast } from "./components/ui/index.jsx";

// Auth Pages
import LoginPage from "./pages/auth/LoginPage.jsx";
import PublicCalendarPage from "./pages/PublicCalendarPage.jsx";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import StudentBooking from "./pages/student/StudentBooking.jsx";
import StudentLostFound from "./pages/student/StudentLostFound.jsx";
import StudentInventory from "./pages/student/StudentInventory.jsx";
import StudentHelpCenter from "./pages/student/StudentHelpCenter.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminBooking from "./pages/admin/AdminBooking.jsx";
import AdminLostFound from "./pages/admin/AdminLostFound.jsx";
import AdminInventory from "./pages/admin/AdminInventory.jsx";
import AdminUsers from "./pages/admin/AdminUsers.jsx";

import { currentUser } from "./data/mockData.js";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null); // Start with null to show login
  const [showLogin, setShowLogin] = useState(false);
  const [bookingPreFill, setBookingPreFill] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [changePasswordForm, setChangePasswordForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [changePasswordError, setChangePasswordError] = useState("");
  const [changePasswordSuccess, setChangePasswordSuccess] = useState("");
  const [editedName, setEditedName] = useState("");
  const [editedEmail, setEditedEmail] = useState("");
  const [editedPhone, setEditedPhone] = useState("");
  const [editedAddress, setEditedAddress] = useState("");
  const [editedProdi, setEditedProdi] = useState("");
  const [editedAvatar, setEditedAvatar] = useState("");
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState("");

  const [theme, setTheme] = useState(localStorage.getItem("theme") || "system");

  useEffect(() => {
    const applyTheme = (currentTheme) => {
      if (currentTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else if (currentTheme === "light") {
        document.documentElement.classList.remove("dark");
      } else {
        const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (isSystemDark) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      const handleSystemChange = (e) => {
        if (e.matches) {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      };
      mediaQuery.addEventListener("change", handleSystemChange);
      return () => mediaQuery.removeEventListener("change", handleSystemChange);
    }
  }, [theme]);

  useEffect(() => {
    const restoreSession = async () => {
      const token = getToken();
      const savedUser = localStorage.getItem("user");
      if (!token || !savedUser) return;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/verify`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!response.ok) {
          throw new Error("invalid token");
        }

        const parsedUser = JSON.parse(savedUser);
        setUser({
          id: parsedUser.id,
          name: parsedUser.name,
          nim: parsedUser.nim,
          email: parsedUser.email,
          role: parsedUser.role,
          prodi: parsedUser.prodi,
          avatar: parsedUser.name?.substring(0, 2).toUpperCase() || "SR",
        });
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    };

    restoreSession();
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setShowLogin(false);
    if (bookingPreFill && userData.role === "mahasiswa") {
      setActivePage("booking");
    } else {
      setActivePage("dashboard");
    }
  };

  const handleLogout = async () => {
    await logoutRequest();
    setUser(null);
    setBookingPreFill(null);
    setShowLogin(false);
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

  const handleChangePassword = async () => {
    setChangePasswordError("");
    setChangePasswordSuccess("");

    if (!changePasswordForm.oldPassword || !changePasswordForm.newPassword || !changePasswordForm.confirmPassword) {
      setChangePasswordError("Semua field wajib diisi");
      return;
    }

    if (changePasswordForm.newPassword !== changePasswordForm.confirmPassword) {
      setChangePasswordError("Password baru dan konfirmasi tidak cocok");
      return;
    }

    if (changePasswordForm.newPassword.length < 6) {
      setChangePasswordError("Password baru minimal 6 karakter");
      return;
    }

    try {
      const token = getToken();
      const response = await fetch(`${API_BASE_URL}/api/users/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          oldPassword: changePasswordForm.oldPassword,
          newPassword: changePasswordForm.newPassword,
        }),
      });

      if (response.ok) {
        setChangePasswordSuccess("✓ Password berhasil diubah!");
        setTimeout(() => {
          setShowChangePasswordModal(false);
          setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
          setChangePasswordSuccess("");
        }, 2000);
      } else {
        const error = await response.json();
        setChangePasswordError(error.error || "Gagal mengubah password");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setChangePasswordError("Terjadi kesalahan saat mengubah password");
    }
  };

  // If not authenticated, show public calendar or login page
  if (!user) {
    if (showLogin) {
      return (
        <LoginPage
          onLogin={handleLogin}
          onCancel={() => setShowLogin(false)}
        />
      );
    }
    return (
      <PublicCalendarPage
        onLoginClick={(preFill = null) => {
          if (preFill && preFill.roomId) {
            setBookingPreFill(preFill);
          }
          setShowLogin(true);
        }}
      />
    );
  }

  const renderPage = () => {
    if (user.role === "mahasiswa") {
      // Student Pages
      switch (activePage) {
        case "dashboard":  return <StudentDashboard user={user} onNavigate={setActivePage} setBookingPreFill={setBookingPreFill} />;
        case "booking":    return <StudentBooking user={user} preFill={bookingPreFill} clearPreFill={() => setBookingPreFill(null)} />;
        case "lostfound":  return <StudentLostFound user={user} />;
        case "inventory":  return <StudentInventory user={user} />;
        case "help":       return <StudentHelpCenter user={user} />;
        default:           return <StudentDashboard user={user} onNavigate={setActivePage} setBookingPreFill={setBookingPreFill} />;
      }
    } else if (user.role === "admin") {
      // Admin Pages
      switch (activePage) {
        case "dashboard":  return <AdminDashboard user={user} onNavigate={setActivePage} />;
        case "booking":    return <AdminBooking user={user} />;
        case "lostfound":  return <AdminLostFound user={user} />;
        case "inventory":  return <AdminInventory user={user} />;
        case "users":      return <AdminUsers user={user} />;
        default:           return <AdminDashboard user={user} onNavigate={setActivePage} />;
      }
    }
    return <StudentDashboard user={user} onNavigate={setActivePage} setBookingPreFill={setBookingPreFill} />;
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 transition-colors duration-200">
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
          theme={theme}
          onThemeChange={setTheme}
        />

        <main className="flex-1 p-4 lg:p-6 w-full" id="main-content">
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
              {user.role === "mahasiswa" && (
                <Button 
                  variant="danger" 
                  onClick={() => {
                    setShowChangePasswordModal(true);
                  }}
                >
                  🔐 Ubah Password
                </Button>
              )}
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

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <Modal 
          isOpen={showChangePasswordModal}
          onClose={() => {
            setShowChangePasswordModal(false);
            setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
            setChangePasswordError("");
            setChangePasswordSuccess("");
          }}
          title="🔐 Ubah Password"
        >
          <div className="space-y-4">
            {changePasswordSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-green-700 font-medium">{changePasswordSuccess}</p>
              </div>
            )}

            {changePasswordError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-red-700 font-medium">{changePasswordError}</p>
              </div>
            )}

            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Password Lama *
                </label>
                <Input
                  type="password"
                  placeholder="Masukkan password lama"
                  value={changePasswordForm.oldPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Password Baru *
                </label>
                <Input
                  type="password"
                  placeholder="Masukkan password baru (minimal 6 karakter)"
                  value={changePasswordForm.newPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1.5 block">
                  Konfirmasi Password Baru *
                </label>
                <Input
                  type="password"
                  placeholder="Konfirmasi password baru"
                  value={changePasswordForm.confirmPassword}
                  onChange={(e) => setChangePasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
              <Button 
                variant="secondary" 
                className="flex-1 justify-center" 
                onClick={() => {
                  setShowChangePasswordModal(false);
                  setChangePasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
                  setChangePasswordError("");
                  setChangePasswordSuccess("");
                }}
              >
                Batal
              </Button>
              <Button 
                onClick={handleChangePassword}
                className="flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white"
              >
                ✓ Ubah Password
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
