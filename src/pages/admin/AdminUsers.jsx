import { useState, useEffect } from "react";
import { Badge, Button, Input, Select, Modal, Toast } from "../../components/ui/index.jsx";
import { apiFetch, getToken } from "../../utils/api.js";

// ==========================================
// COMPONENT: UserCard (Kartu Pengguna)
// ==========================================
function UserCard({ user, onDelete, onResetPassword }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-gray-200 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-sm">
            {user.name?.substring(0, 2).toUpperCase() || "MA"}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.nim}</p>
          </div>
        </div>
        <Badge status={user.role} />
      </div>

      <div className="bg-gray-50 rounded-xl p-3 mb-3 space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Email:</span>
          <span className="font-semibold text-gray-800 break-all">{user.email}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Prodi:</span>
          <span className="font-semibold text-gray-800">{user.prodi || "-"}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-gray-600">Phone:</span>
          <span className="font-semibold text-gray-800">{user.phone || "-"}</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Button 
          variant="secondary" 
          size="sm" 
          className="flex-1 justify-center text-xs text-blue-600 border-blue-600 hover:bg-blue-50/50 dark:text-blue-400 dark:border-blue-500/80 dark:hover:bg-blue-950/20" 
          onClick={() => onResetPassword(user)}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v5h5" />
            <rect x="9" y="12" width="6" height="5" rx="1" strokeWidth={2} />
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 12V10a2 2 0 1 1 4 0v2" />
          </svg>
          Reset Pass
        </Button>
        <Button 
          variant="danger" 
          size="sm" 
          className="flex-1 justify-center text-xs gap-1.5" 
          onClick={() => onDelete(user.id)}
        >
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Hapus
        </Button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN COMPONENT: AdminUsers
// ==========================================
export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const initialFormState = {
    nim: "",
    email: "",
    name: "",
    password: "",
    phone: "",
    prodi: "",
    role: "mahasiswa",
  };

  const [form, setForm] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // 1. Ambil Data Pengguna
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!getToken()) {
          showToast("✗ Sesi login habis. Silakan login ulang sebagai admin.", "error");
          return;
        }

        const response = await apiFetch("/api/users");
        const data = await response.json();

        if (response.ok) {
          setUsers(data.users || []);
        } else {
          showToast(`✗ ${data.error || "Gagal mengambil data pengguna"}`, "error");
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        showToast("✗ Gagal mengambil data pengguna dari server", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // 2. Menangani Perubahan Setiap Elemen Input
  const handleInputChange = (field, value) => {
    setForm(prev => {
      const nextForm = { ...prev, [field]: value };
      if (field === "nim") {
        nextForm.password = value;
      }
      return nextForm;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
    if (field === "nim" && errors.password) {
      setErrors(prev => ({ ...prev, password: null }));
    }
  };

  // 4. Validasi Sisi Klien (Client-Side)
  const validate = () => {
    const newErrors = {};
    if (!form.nim.trim()) newErrors.nim = "NIM wajib diisi.";
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.email.trim()) {
      newErrors.email = "Email wajib diisi.";
    } else if (!emailRegex.test(form.email.trim())) {
      newErrors.email = "Format email tidak valid (contoh: nama@email.com).";
    }
    
    if (!form.name.trim()) newErrors.name = "Nama wajib diisi.";
    if (form.password.trim() && form.password.trim() !== form.nim.trim() && form.password.length < 6) {
      newErrors.password = "Password minimal harus 6 karakter.";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 5. Membuat Akun Baru
  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!validate()) return;

    try {
      if (!getToken()) {
        showToast("✗ Sesi login habis. Silakan login ulang sebagai admin.", "error");
        return;
      }

      const payload = { ...form };
      if (!payload.password.trim()) {
        payload.password = payload.nim;
      }

      const response = await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (response.ok) {
        setUsers(prev => [data.user || data, ...prev]);
        handleCloseModal();
        showToast(`✓ Akun ${form.name} berhasil dibuat!`, "success");
      } else {
        showToast(`✗ ${data.error || "Gagal membuat akun baru"}`, "error");
      }
    } catch (err) {
      console.error("Create user error:", err);
      showToast("✗ Terjadi kesalahan koneksi jaringan ke server", "error");
    }
  };

  // 6. Menghapus Akun Pengguna
  const handleDelete = async (userId) => {
    if (!window.confirm("Yakin ingin menghapus akun ini secara permanen?")) return;
    
    try {
      const response = await apiFetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
        showToast("✓ Akun berhasil dihapus.", "success");
      } else {
        showToast("✗ Gagal menghapus akun tersebut", "error");
      }
    } catch (err) {
      console.error("Delete user error:", err);
      showToast("✗ Terjadi kesalahan saat menghapus data", "error");
    }
  };

  const handleResetPassword = async (user) => {
    if (!window.confirm(`Yakin ingin mereset password ${user.name} ke default (NIM: ${user.nim})?`)) return;

    try {
      const response = await apiFetch(`/api/users/${user.id}/reset-password`, {
        method: "POST",
      });

      const text = await response.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        data = { error: text };
      }

      if (response.ok) {
        showToast(data.message || `✓ Password ${user.name} berhasil di-reset ke NIM.`, "success");
      } else {
        showToast(data.error || "✗ Gagal mereset password", "error");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      showToast("✗ Terjadi kesalahan koneksi saat mereset password", "error");
    }
  };

  // 7. Menutup Modal Sekaligus Mereset Error & Isi Form
  const handleCloseModal = () => {
    setShowForm(false);
    setErrors({});
    setForm(initialFormState);
  };

  // Filter out admin and apply search query
  const students = users.filter(u => u.role !== "admin");
  const filteredUsers = students.filter(u => {
    const query = searchQuery.toLowerCase();
    return (
      (u.name || "").toLowerCase().includes(query) ||
      (u.nim || "").toLowerCase().includes(query) ||
      (u.prodi || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* SECTION: Header & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Cari nama, NIM, atau program studi mahasiswa..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 font-semibold shadow-2xs placeholder-gray-400"
          />
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="h-4.5 w-4.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Action Button */}
        <button 
          onClick={() => setShowForm(true)} 
          className="bg-[#0052cc] hover:bg-[#0043a4] text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors duration-150 shadow-sm shrink-0 text-center"
        >
          + Buat Akun Baru
        </button>
      </div>

      {/* SECTION: Main Display Content */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-500 animate-pulse">Memuat data pengguna...</p>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-500 mb-1 font-medium">Belum ada pengguna terdaftar</p>
          <p className="text-xs text-gray-400">Klik tombol "+ Buat Akun Baru" di atas untuk menambahkan data baru.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map(u => (
            <UserCard key={u.id || u.nim} user={u} onDelete={handleDelete} onResetPassword={handleResetPassword} />
          ))}
        </div>
      )}

      {/* SECTION: Create User Modal */}
      <Modal 
        isOpen={showForm} 
        onClose={handleCloseModal}
        title="➕ Buat Akun Pengguna"
      >
        <div className="space-y-4 max-h-96 overflow-y-auto pr-1 text-left">
          {/* INPUT: NIM */}
          <Input
            label="📚 NIM / Username *"
            type="text"
            placeholder="Contoh: F55123015"
            value={form.nim}
            onChange={(e) => handleInputChange("nim", e.target.value)}
            error={errors.nim}
          />

          {/* INPUT: Email */}
          <Input
            label="📧 Email *"
            type="email"
            placeholder="Contoh: nama@student.untad.ac.id"
            value={form.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            error={errors.email}
          />

          {/* INPUT: Nama Lengkap */}
          <Input
            label="Nama Lengkap *"
            type="text"
            placeholder="Masukkan nama lengkap"
            value={form.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            error={errors.name}
          />

          {/* INPUT: Password (Locked to NIM as Default) */}
          <Input
            label="🔐 Password Default (Terkunci ke NIM)"
            type="text"
            value={form.nim || ""}
            disabled={true}
            className="bg-gray-150 cursor-not-allowed text-gray-500 font-semibold"
            placeholder="Otomatis menggunakan NIM"
          />

          {/* INPUT: Program Studi */}
          <Input
            label="🎓 Program Studi"
            type="text"
            placeholder="Contoh: Teknik Informatika"
            value={form.prodi}
            onChange={(e) => handleInputChange("prodi", e.target.value)}
          />

          {/* INPUT: Nomor Telepon */}
          <Input
            label="📱 Nomor Telepon"
            type="tel"
            placeholder="Contoh: 081234567890"
            value={form.phone}
            onChange={(e) => handleInputChange("phone", e.target.value)}
          />

          {/* INPUT: Role Select Option */}
          
        </div>

        {/* SECTION: Modal Action Buttons */}
        <div className="flex gap-3 mt-6 pt-4 border-t border-gray-100">
          <Button 
            variant="secondary" 
            className="flex-1 justify-center" 
            onClick={handleCloseModal}
          >
            Batal
          </Button>
          <Button 
            onClick={handleSubmit}
            className="flex-1 justify-center bg-blue-600 hover:bg-blue-700 text-white font-medium"
          >
            ✓ Buat Akun
          </Button>
        </div>
      </Modal>

      {/* SECTION: Global App Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}