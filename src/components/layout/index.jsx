// =============================================
// SIGAP - Layout Components (Sidebar + Topbar)
// =============================================

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
    label: "Peminjaman Ruang",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
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
    key: "inventory",
    label: "Inventaris",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    adminOnly: true,
  },
];

export function Sidebar({ activePage, onNavigate, user, isMobileOpen, onMobileClose }) {
  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={onMobileClose} />
      )}

      {/* Sidebar Panel */}
      <aside className={`
        fixed top-0 left-0 h-full w-64 bg-white border-r border-gray-100 z-30 flex flex-col
        transition-transform duration-300 ease-in-out
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <div>
            <span className="text-base font-extrabold text-gray-900 tracking-tight">SIGAP</span>
            <p className="text-[10px] text-gray-400 font-medium leading-tight">Gedung SG · Untad</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Menu Utama</p>
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
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <span className={isActive ? "text-white" : "text-gray-400"}>{item.icon}</span>
                  {item.label}
                </button>
              );
            })}
        </nav>

        {/* Role Indicator */}
        <div className="px-3 pb-3">
          <div className={`mx-0 px-3 py-2 rounded-xl text-xs font-semibold text-center
            ${user.role === "admin" ? "bg-purple-50 text-purple-700 border border-purple-100" : "bg-blue-50 text-blue-700 border border-blue-100"}`}>
            {user.role === "admin" ? "🔑 Mode Admin" : "🎓 Mode Mahasiswa"}
          </div>
        </div>

        {/* User Profile */}
        <div className="px-4 py-4 border-t border-gray-100 flex items-center gap-3">
          <Avatar initials={user.avatar} size="md" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-400 truncate">{user.nim}</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ activePage, user, onToggleRole, onLogout, onMobileMenuOpen }) {
  const pageNames = {
    dashboard: "Dashboard",
    booking: "Peminjaman Ruang",
    lostfound: "Lost & Found",
    inventory: "Inventaris",
  };

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
          <h1 className="text-base font-bold text-gray-900">{pageNames[activePage]}</h1>
          <p className="text-xs text-gray-400 hidden sm:block">
            {new Date().toLocaleDateString("id-ID", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
      </div>

      {/* Right: Role toggle + User */}
      <div className="flex items-center gap-3">
        {/* Dev toggle for role switching */}
        <button
          onClick={onToggleRole}
          title="Toggle Role (Dev Mode)"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs text-gray-500 hover:bg-gray-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Ganti Role
        </button>

        {/* Logout Button */}
        <button
          onClick={onLogout}
          title="Keluar"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Keluar
        </button>

        <div className="flex items-center gap-2.5">
          <Avatar initials={user.avatar} size="sm" />
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 leading-tight">{user.name.split(" ").slice(0, 2).join(" ")}</p>
            <p className="text-[10px] text-gray-400 capitalize">{user.role}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
