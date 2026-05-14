// =============================================
// SIGAP - App.jsx (Main Entry Point)
// Sistem Informasi Gedung, Aset, dan Peminjaman
// Fakultas Teknik - Universitas Tadulako
// =============================================

import { useState } from "react";
import { Sidebar, Topbar } from "./components/layout/index.jsx";
import DashboardPage  from "./pages/DashboardPage.jsx";
import BookingPage    from "./pages/BookingPage.jsx";
import LostFoundPage  from "./pages/LostFoundPage.jsx";
import InventoryPage  from "./pages/InventoryPage.jsx";
import LoginPage      from "./pages/LoginPage.jsx";
import { currentUser } from "./data/mockData.js";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [user, setUser] = useState(null); // Start with null to show login
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  // Dev utility: toggle between mahasiswa and admin roles
  const toggleRole = () => {
    setUser(prev => ({
      ...prev,
      role: prev.role === "mahasiswa" ? "admin" : "mahasiswa",
      name: prev.role === "mahasiswa" ? "Penjaga SG Gedung" : "Syaif Ali M. Risal",
      nim:  prev.role === "mahasiswa" ? "ADMIN-001" : "F55123064",
      avatar: prev.role === "mahasiswa" ? "PS" : "SR",
    }));
    setActivePage("dashboard");
  };

  const renderPage = () => {
    switch (activePage) {
      case "dashboard":  return <DashboardPage  user={user} onNavigate={setActivePage} />;
      case "booking":    return <BookingPage     user={user} />;
      case "lostfound":  return <LostFoundPage   user={user} />;
      case "inventory":  return <InventoryPage   user={user} />;
      default:           return <DashboardPage  user={user} onNavigate={setActivePage} />;
    }
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
          onToggleRole={toggleRole}
          onLogout={handleLogout}
          onMobileMenuOpen={() => setMobileMenuOpen(true)}
        />

        <main className="flex-1 p-4 lg:p-6 max-w-7xl w-full mx-auto" id="main-content">
          {renderPage()}
        </main>
      </div>
    </div>
  );
}
