import { useState } from "react";

const FAQ_ITEMS = [
  {
    question: "Apa username dan password default saya untuk login pertama kali?",
    answer: "Gunakan NIM Anda baik sebagai username maupun password default. Segera ubah password Anda di menu \"Profil Saya\" demi keamanan."
  },
  {
    question: "Bagaimana cara mengajukan peminjaman ruangan kuliah atau rapat?",
    answer: "Masuk ke akun Anda, buka menu Manajemen Ruangan, pilih slot kosong (tombol ➕) pada kalender visual, isi formulir perkuliahan, unggah berkas bukti pendukung, dan klik \"Ajukan Peminjaman\"."
  },
  {
    question: "Bagaimana jika jadwal peminjaman saya bentrok atau batal dan ingin dipindah ke hari lain?",
    answer: "Buka menu Manajemen Ruangan -> Riwayat Peminjaman Saya. Pada peminjaman yang sudah disetujui, klik tombol \"Pindah\" (Reschedule), lalu pilih slot tanggal/ruangan baru yang kosong pada kalender visual."
  },
  {
    question: "Apakah ada jaminan yang harus diserahkan saat meminjam inventaris (seperti kabel/pointer)?",
    answer: "Ya. Saat mengambil barang di Admin Gedung SG, Anda wajib menyerahkan kartu identitas fisik asli (KTM atau KTP) yang masih berlaku sebagai jaminan peminjaman."
  },
  {
    question: "Bagaimana cara meminjam proyektor/infokus sekalian saat memesan ruangan?",
    answer: "Pada formulir peminjaman ruangan (di kolom kanan), cukup centang opsi \"Pinjam Infokus / Proyektor Sekaligus\". Sistem akan otomatis memesankan proyektor yang tersedia saat permohonan ruangan disetujui oleh admin."
  },
  {
    question: "Saya melihat barang saya yang hilang ada di daftar mading, bagaimana cara mengambilnya?",
    answer: "Klik \"Detail\" pada barang tersebut di mading, lalu klik \"Itu Milik Saya\". Isi pesan penjelasan/bukti kepemilikan. Setelah disetujui admin, silakan temui petugas di ruang piket Gedung SG untuk mengambil barang tersebut."
  }
];

export default function StudentHelpCenter() {
  const [activeIndex, setActiveIndex] = useState(0); // First one open by default

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="space-y-6">
      
      {/* FAQ Main Card */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-gray-100 dark:border-slate-700/80 shadow-md transition-all duration-200">
        
        {/* Card Header */}
        <div className="flex items-center gap-2.5 text-gray-900 dark:text-white font-bold text-base mb-6 border-b border-gray-100 dark:border-slate-700/60 pb-4">
          <span className="text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </span>
          <h3>Pertanyaan Umum (FAQ)</h3>
        </div>        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {FAQ_ITEMS.map((faq, index) => {
            const isOpen = activeIndex === index;
            return (
              <div 
                key={index} 
                className={`border rounded-lg overflow-hidden transition-all duration-200
                  ${isOpen 
                    ? "border-blue-900/60 dark:border-blue-500 bg-white dark:bg-slate-800 shadow-sm" 
                    : "border-slate-200/80 dark:border-slate-700 bg-slate-50/80 hover:bg-slate-100/60 dark:bg-slate-900/40 dark:hover:bg-slate-900/60"}`}
              >
                
                {/* Accordion Header */}
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex items-center justify-between py-4.5 px-5 text-left font-bold text-sm lg:text-base transition-colors duration-150 cursor-pointer select-none"
                >
                  <span className={isOpen ? "text-blue-950 dark:text-blue-400" : "text-slate-800 dark:text-slate-200"}>
                    {faq.question}
                  </span>
                  <span className={`transition-transform duration-200 ${isOpen ? "rotate-180 text-blue-950 dark:text-blue-400" : "text-slate-500"}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                {/* Accordion Body */}
                {isOpen && (
                  <div className="px-5 pb-5 pt-3 text-xs lg:text-sm text-gray-500 dark:text-slate-350 leading-relaxed border-t border-slate-100 dark:border-slate-700/60 bg-white dark:bg-slate-850">
                    {faq.answer}
                  </div>
                )}

              </div>
            );
          })}
        </div>

      </div>

      {/* No Answer Card */}
      <div className="bg-[#eef2f9] dark:bg-blue-950/15 rounded-2xl p-6 border border-blue-100/50 dark:border-blue-900/30 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        
        {/* Info */}
        <div className="space-y-2">
          <h4 className="text-lg font-bold text-blue-950 dark:text-blue-450 tracking-tight">
            Tidak menemukan jawaban?
          </h4>
          <p className="text-xs lg:text-sm text-gray-500 dark:text-slate-400 max-w-2xl leading-relaxed">
            Tim administrasi kami siap membantu Anda menyelesaikan kendala teknis maupun administratif setiap hari kerja pukul 08.00 - 16.00.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          
          {/* Email button */}
          <a
            href="mailto:ramadhanivia489@gmail.com?subject=Tanya%20SIGAP"
            className="btn-primary-blue flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-xs lg:text-sm transition-colors shadow-sm cursor-pointer select-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Hubungi Admin
          </a>

          {/* WhatsApp button */}
          <a
            href="https://wa.me/6285398643661"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-blue-200 dark:border-blue-800/80 bg-white/50 hover:bg-white/80 dark:bg-slate-800/50 dark:hover:bg-slate-850 text-blue-950 dark:text-blue-400 font-bold text-xs lg:text-sm transition-colors shadow-sm cursor-pointer select-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            WhatsApp (Pusat)
          </a>

        </div>

      </div>

    </div>
  );
}
