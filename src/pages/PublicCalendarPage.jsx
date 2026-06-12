import VisualCalendar from "../components/VisualCalendar.jsx";

export default function PublicCalendarPage({ onLoginClick }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 font-sans text-gray-900 dark:text-slate-100 transition-colors duration-200">
      
      {/* PUBLIC HEADER */}
      <header className="h-20 bg-white dark:bg-slate-800 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between px-6 sticky top-0 z-20 shadow-sm transition-colors duration-200">
        
        {/* LOGO */}
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SIGAP Logo" className="h-9 object-contain" />
          <div className="hidden sm:block border-l border-gray-200 dark:border-slate-700 h-6 pl-3">
            <p className="text-[10px] text-gray-400 dark:text-slate-400 font-bold uppercase leading-none">Gedung SG · Untad</p>
          </div>
        </div>

        {/* TITLE */}
        <h1 className="hidden md:block text-sm font-extrabold text-gray-700 dark:text-slate-200 uppercase tracking-widest bg-gray-100 dark:bg-slate-700/50 px-4 py-2 rounded-xl">
          Portal Mading & Jadwal Ruangan
        </h1>

        {/* LOGIN BUTTON */}
        <button
          onClick={onLoginClick}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-all duration-200 shadow-md hover:shadow-lg shadow-blue-600/20 flex items-center gap-2 cursor-pointer group"
        >
          Login
          <span className="group-hover:translate-x-1 transition-transform"></span>
        </button>
      </header>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden mb-8 shadow-lg shadow-blue-600/10">
          <div className="absolute top-0 right-0 w-80 h-full opacity-10">
            <svg viewBox="0 0 200 200" className="w-full h-full">
              <circle cx="150" cy="50" r="80" fill="white" />
              <circle cx="50" cy="150" r="60" fill="white" />
            </svg>
          </div>
          <div className="relative max-w-2xl">
            <span className="bg-blue-500/30 text-blue-100 text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              Informasi Umum
            </span>
            <h2 className="text-2xl md:text-3xl font-extrabold mt-3 mb-2 leading-tight">
              Sistem Informasi Gedung, Aset, & Peminjaman (SIGAP)
            </h2>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed mt-2 opacity-90">
              Selamat datang di portal jadwal mading Gedung SG Universitas Tadulako. Di sini, Anda dapat memantau jadwal penggunaan kelas pengganti, praktikum, atau rapat secara real-time. Untuk melakukan booking ruangan atau meminjam inventaris aset, silakan masuk ke sistem menggunakan akun Anda.
            </p>
          </div>
        </div>

        {/* VISUAL CALENDAR */}
        <VisualCalendar
          user={null}
          onPromptLogin={(roomId, timeString, dateString) => {
            onLoginClick({ roomId, jamMulai: timeString, tanggal: dateString });
          }}
        />

        {/* FOOTER */}
        <footer className="text-center text-xs text-gray-400 dark:text-slate-500 py-10 mt-10 border-t border-gray-100 dark:border-slate-800">
          <p>© 24 Capstone Project - SIGAP Team. Fakultas Teknik Universitas Tadulako.</p>
        </footer>

      </main>

    </div>
  );
}
