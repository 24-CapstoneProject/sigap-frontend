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
  const [showRoleChangeModal, setShowRoleChangeModal] = useState(false);
  const [roleChangePassword, setRoleChangePassword] = useState("");
  const [roleChangeError, setRoleChangeError] = useState("");
  const [roleChangeAttempts, setRoleChangeAttempts] = useState(0);

  const handleLogin = (userData) => {
    setUser(userData);
    setActivePage("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setActivePage("dashboard");
  };

  // If not authenticated, show login page
  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Request role change with security verification
  const requestRoleChange = () => {
    setShowRoleChangeModal(true);
    setRoleChangePassword("");
    setRoleChangeError("");
    setRoleChangeAttempts(0);
  };

  // Verify password and toggle role
  const verifyAndToggleRole = () => {
    setRoleChangeError("");
    
    // Max 3 attempts
    if (roleChangeAttempts >= 3) {
      setRoleChangeError("Terlalu banyak percobaan yang salah. Coba lagi nanti.");
      setTimeout(() => {
        setShowRoleChangeModal(false);
        setRoleChangePassword("");
        setRoleChangeError("");
        setRoleChangeAttempts(0);
      }, 2000);
      return;
    }

    // Verify password based on current role
    const expectedPassword = user.role === "mahasiswa" ? "123456" : "admin123";
    
    if (roleChangePassword === expectedPassword) {
      // Password correct - toggle role
      setUser(prev => ({
        ...prev,
        role: prev.role === "mahasiswa" ? "admin" : "mahasiswa",
        name: prev.role === "mahasiswa" ? "Penjaga SG Gedung" : "Syaif Ali M. Risal",
        nim:  prev.role === "mahasiswa" ? "ADMIN-001" : "F55123064",
        avatar: prev.role === "mahasiswa" ? "PS" : "SR",
      }));
      setActivePage("dashboard");
      setShowRoleChangeModal(false);
      setRoleChangePassword("");
    } else {
      // Password incorrect
      const newAttempts = roleChangeAttempts + 1;
      setRoleChangeAttempts(newAttempts);
      setRoleChangeError(`Password salah. ${3 - newAttempts} percobaan tersisa.`);
      setRoleChangePassword("");
    }
  };

  // Handle Enter key in password input
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      verifyAndToggleRole();
    }
  };

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
      />

      {/* Main Content Area */}
      <div className="lg:pl-64 min-h-screen flex flex-col">
        <Topbar
          activePage={activePage}
          user={user}
          onToggleRole={requestRoleChange}
          onLogout={handleLogout}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto" id="main-content">
          {renderPage()}
        </main>
      </div>

      {/* Role Change Verification Modal */}
      <Modal 
        isOpen={showRoleChangeModal} 
        onClose={() => {
          setShowRoleChangeModal(false);
          setRoleChangePassword("");
          setRoleChangeError("");
        }} 
        title="🔐 Verifikasi Perubahan Role"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5 flex gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900">Perubahan Role Memerlukan Verifikasi</p>
              <p className="text-xs text-blue-700 mt-1">Masukkan password akun Anda untuk mengkonfirmasi perubahan role.</p>
            </div>
          </div>

          {roleChangeError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700 font-medium">{roleChangeError}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Password Akun</label>
            <input
              type="password"
              placeholder="Masukkan password Anda..."
              value={roleChangePassword}
              onChange={(e) => {
                setRoleChangePassword(e.target.value);
                if (roleChangeError) setRoleChangeError("");
              }}
              onKeyPress={handleKeyPress}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 placeholder:text-gray-400"
              disabled={roleChangeAttempts >= 3}
            />
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-3">
            <p className="text-xs text-amber-700">
              <strong>💡 Untuk testing:</strong> Mahasiswa: 123456 | Admin: admin123
            </p>
          </div>

          <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
            <Button 
              variant="secondary" 
              onClick={() => {
                setShowRoleChangeModal(false);
                setRoleChangePassword("");
                setRoleChangeError("");
              }}
              disabled={roleChangeAttempts >= 3}
            >
              Batal
            </Button>
            <Button 
              variant="primary" 
              onClick={verifyAndToggleRole}
              disabled={roleChangeAttempts >= 3 || !roleChangePassword}
            >
              {roleChangeAttempts >= 3 ? "⏳ Coba Lagi Nanti" : "Verifikasi & Ganti Role"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
