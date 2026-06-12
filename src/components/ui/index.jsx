// =============================================
// SIGAP - Reusable UI Components
// =============================================

import { useState } from "react";

// ---- Badge ----
export function Badge({ status }) {
  const map = {
    available:    { label: "Tersedia",      bg: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    occupied:     { label: "Digunakan",     bg: "bg-red-100 text-red-700 border border-red-200" },
    ending_soon:  { label: "Segera Selesai",bg: "bg-amber-100 text-amber-700 border border-amber-200" },
    pending:      { label: "Menunggu",      bg: "bg-yellow-100 text-yellow-700 border border-yellow-200" },
    approved:     { label: "Disetujui",     bg: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
    rejected:     { label: "Ditolak",       bg: "bg-red-100 text-red-700 border border-red-200" },
    found:        { label: "Ditemukan",     bg: "bg-blue-100 text-blue-700 border border-blue-200" },
    lost:         { label: "Hilang",        bg: "bg-red-100 text-red-700 border border-red-200" },
    claimed:      { label: "Sudah Diklaim", bg: "bg-gray-100 text-gray-500 border border-gray-200" },
    borrowed:     { label: "Dipinjam",      bg: "bg-orange-100 text-orange-700 border border-orange-200" },
    completed:    { label: "Selesai",       bg: "bg-blue-50 text-blue-600 border border-blue-100" },
  };
  const { label, bg } = map[status] || { label: status, bg: "bg-gray-100 text-gray-600" };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${bg}`}>
      {label}
    </span>
  );
}

export function StatusDot({ status }) {
  const colors = {
    available:   "bg-emerald-500",
    occupied:    "bg-red-500",
    ending_soon: "bg-amber-500 animate-pulse",
  };
  return <span className={`inline-block w-2.5 h-2.5 rounded-full ${colors[status] || "bg-gray-400"}`} />;
}

export function Button({ children, variant = "primary", size = "md", onClick, disabled, type = "button", className = "" }) {
  const base = "inline-flex items-center gap-2 font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const variants = {
    primary:   "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm hover:shadow-md",
    secondary: "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-400",
    danger:    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm",
    ghost:     "text-gray-600 hover:bg-gray-100 focus:ring-gray-300",
    success:   "bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-sm",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  return (
    <button type={type} onClick={onClick} disabled={disabled}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </button>
  );
}

export function Input({ label, id, error, required, className = "", type = "text", ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  const isPasswordType = type === "password";
  const inputType = isPasswordType ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <input
          id={id}
          type={inputType}
          className={`w-full px-3.5 py-2.5 rounded-xl border text-sm transition-colors duration-150 pr-10
            ${error ? "border-red-400 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}
            focus:outline-none focus:ring-2 bg-white placeholder:text-gray-400 ${className}`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Select({ label, id, error, required, children, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        id={id}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm bg-white transition-colors duration-150
          ${error ? "border-red-400 focus:ring-red-300" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}
          focus:outline-none focus:ring-2 ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Textarea({ label, id, error, required, className = "", ...props }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        id={id}
        rows={3}
        className={`w-full px-3.5 py-2.5 rounded-xl border text-sm resize-none transition-colors duration-150
          ${error ? "border-red-400 focus:ring-red-300 bg-red-50" : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"}
          focus:outline-none focus:ring-2 placeholder:text-gray-400 ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function Modal({ isOpen, onClose, title, children, size = "md" }) {
  if (!isOpen) return null;
  const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 id="modal-title" className="text-lg font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
      <p className="text-sm text-gray-500 max-w-xs">{description}</p>
    </div>
  );
}

export function Avatar({ initials, size = "md" }) {
  const sizes = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" };
  return (
    <div className={`${sizes[size]} rounded-full bg-linear-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold`}>
      {initials}
    </div>
  );
}

export function Toast({ message, type = "success", onClose }) {
  const styles = {
    success: "bg-emerald-600",
    error:   "bg-red-600",
    info:    "bg-blue-600",
    warning: "bg-amber-500",
  };
  return (
    <div className={`fixed bottom-6 right-6 z-100 flex items-center gap-3 ${styles[type]} text-white px-5 py-3.5 rounded-xl shadow-xl text-sm font-medium max-w-sm`}>
      <span className="flex-1">{message}</span>
      <button onClick={onClose} className="opacity-80 hover:opacity-100 ml-2">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}