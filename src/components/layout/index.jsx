// =============================================
// SIGAP - Layout Components (Sidebar + Topbar)
// =============================================

import { useState, useRef, useEffect } from "react";
import { Avatar } from "../ui/index.jsx";

const navItems = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    key: "booking",
    label: "Manajemen Ruangan",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    key: "inventory",
    label: "Inventaris Barang",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    adminOnly: true,
  },
  {
    key: "lostfound",
    label: "Lost & Found",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    key: "users",
    label: "Manajemen Pengguna",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 4.354a4 4 0 110 8 4 4 0 010-8M3 20.394c0-1.657.895-3.105 2.236-3.896 2.048-1.16 5.588-1.16 7.528 0 1.341.791 2.236 2.24 2.236 3.896M16 6.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5M18.5 20c.464-.766.862-1.631.862-2.606 0-1.418-.895-2.646-2.148-3.195" />
      </svg>
    ),
    adminOnly: true,
  },
];

export function Sidebar({ activePage, onNavigate, user, isMobileOpen, onMobileClose, onLogout }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-blue-950 border-r border-gray-100 z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center justify-center px-6 py-4 border-b border-gray-150 bg-white">
          <img src="/logo.png" alt="SIGAP Logo" className="h-8 object-contain" />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {user.role === "admin" && (
            <div className="px-3 mb-4">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">SG Admin</p>
            </div>
          )}
          <p className="px-3 mb-2 text-[10px] font-bold text-white uppercase tracking-widest">Menu Utama</p>
          {navItems
            .filter(item => !item.adminOnly || user.role === "admin")
            .map(item => {
              const isActive = activePage === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => { onNavigate(item.key); onMobileClose(); }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                    ${isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600"
                      : "text-white hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* User Profile or Admin Footer */}
        {user.role === "admin" ? (
          <div className="px-4 py-4 border-t border-gray-100 space-y-3">
            <div className="bg-gradient-to-br from-blue-50/60 to-blue-100/40 rounded-xl px-3 py-3 border border-blue-100/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-1">
                <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <p className="text-xs font-bold text-blue-900">Admin Utama</p>
              </div>
              <p className="text-[10px] text-blue-700 font-medium">Super Admin Access</p>
            </div>
            <button
              onClick={() => {
                onLogout();
                onMobileClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Keluar
            </button>
          </div>
        ) : (
          <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
            <Avatar initials={user.avatar} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-gray-400 truncate">{user.nim}</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

export function Topbar({ activePage, user, onToggleRole, onLogout, onMobileMenuOpen, onEditProfile, onChangePassword, theme, onThemeChange }) {
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const themeDropdownRef = useRef(null);

  // 🔥 FIX: Menambahkan properti 'users' agar judul Manajemen Pengguna tidak kosong saat diklik
  const pageNames = {
    dashboard: "Dashboard",
    booking: "Manajemen Ruangan",
    inventory: "Inventaris Barang",
    lostfound: "Lost & Found",
    users: "Manajemen Pengguna",
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close theme dropdown when clicking outside
  useEffect(() => {
    function handleClickOutsideTheme(event) {
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
        setIsThemeDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutsideTheme);
    return () => document.removeEventListener("mousedown", handleClickOutsideTheme);
  }, []);

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-10">
      {/* Left: Hamburger + Title */}
      <div className="flex items-center gap-3">
        <button
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
          onClick={onMobileMenuOpen}
          aria-label="Buka menu navigasi"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <div>
          <h1 className="text-base font-bold text-gray-900">{pageNames[activePage] || "SIGAP"}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Right controls: Theme Switcher & Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Switcher */}
        <div className="relative" ref={themeDropdownRef}>
          <button
            onClick={() => setIsThemeDropdownOpen(!isThemeDropdownOpen)}
            className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-all duration-150 flex items-center justify-center border border-transparent hover:border-gray-200"
            title="Pilih Tema"
          >
            {theme === "light" && (
              <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
              </svg>
            )}
            {theme === "dark" && (
              <svg className="w-5 h-5 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
            {theme === "system" && (
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </button>

          {isThemeDropdownOpen && (
            <div className="absolute right-0 mt-2 w-40 bg-white rounded-2xl shadow-xl border border-gray-100 py-1.5 z-50">
              <button
                onClick={() => { onThemeChange("light"); setIsThemeDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors text-left
                  ${theme === "light" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                </svg>
                Terang (Light)
              </button>
              <button
                onClick={() => { onThemeChange("dark"); setIsThemeDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors text-left
                  ${theme === "dark" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                Gelap (Dark)
              </button>
              <button
                onClick={() => { onThemeChange("system"); setIsThemeDropdownOpen(false); }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold transition-colors text-left
                  ${theme === "system" ? "bg-blue-50 text-blue-600" : "text-gray-600 hover:bg-gray-50"}`}
              >
                <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Sistem (Default)
              </button>
            </div>
          )}
        </div>

        {/* User Profile Dropdown (only for student) */}
        {user.role !== "admin" && (
          <div className="relative" ref={dropdownRef}>
            {/* Profile Button */}
            <button
              onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              className="flex items-center gap-2.5 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Buka menu profil"
            >
              <Avatar initials={user.avatar} size="sm" />
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-gray-800 leading-tight">
                  {user.name ? user.name.split(" ").slice(0, 2).join(" ") : "User"}
                </p>
                <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {isProfileDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-50">
                {/* Profile Info Header */}
                <div className="px-4 py-3 border-b border-gray-100 text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>

                {/* Lihat Profile */}
                <button
                  onClick={() => {
                    if (onEditProfile) onEditProfile();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Lihat Profile
                </button>

                {/* Divider */}
                <div className="border-t border-gray-100"></div>

                {/* Logout */}
                <button
                  onClick={() => {
                    onLogout();
                    setIsProfileDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Keluar
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}