import { useState } from "react";
import { Button, Input } from "../../components/ui/index.jsx";
import { loginRequest, clearAuthSession } from "../../utils/api.js";

export default function LoginPage({ onLogin, onCancel }) {
  const [loginType, setLoginType] = useState("mahasiswa");
  const [formData, setFormData] = useState({
    nim: "",
    password: "",
    username: "",
    adminPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const identifier = loginType === "mahasiswa" ? formData.nim : formData.username;
      const password = loginType === "mahasiswa" ? formData.password : formData.adminPassword;

      const data = await loginRequest(identifier, password);

      if (loginType === "admin" && data.user.role !== "admin") {
        clearAuthSession();
        throw new Error("Akun Anda tidak memiliki hak akses sebagai Administrator.");
      }

      if (loginType === "mahasiswa" && data.user.role !== "mahasiswa") {
        clearAuthSession();
        throw new Error("Akun Anda tidak terdaftar sebagai Mahasiswa.");
      }

      onLogin({
        id: data.user.id,
        name: data.user.name,
        nim: data.user.nim,
        email: data.user.email,
        role: data.user.role,
        prodi: data.user.prodi || (loginType === "admin" ? "Command Center" : "Teknik Informatika"),
        avatar: data.user.name?.substring(0, 2).toUpperCase() || (loginType === "admin" ? "AD" : "SR"),
      });
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Terjadi kesalahan koneksi jaringan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* LEFT IMAGE */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src="/gedungteknik.jpeg"
          alt="Gedung"
          className="w-full h-full object-cover"
        />
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50 flex items-center px-12">
          <div className="text-white max-w-lg">
            <h1 className="text-3xl font-bold mb-4">
              Sistem Informasi Gedung, Aset, dan Peminjaman (SIGAP)
            </h1>
            <p className="text-sm leading-relaxed">
              (SIGAP) adalah platform digital terintegrasi yang dirancang untuk membantu pengelolaan data gedung, inventaris aset, serta proses peminjaman fasilitas dan barang secara efektif, cepat, dan transparan.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-1 cursor-pointer"
            >
              ← Kembali ke Portal Mading & Jadwal Ruangan
            </button>
          )}
          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Portal Login
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Manajemen Pengguna Sigap
          </p>

          {/* Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLoginType("mahasiswa")}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                loginType === "mahasiswa"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`flex-1 py-2.5 px-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                loginType === "admin"
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-700"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-xs text-red-600 font-medium">{error}</p>
              </div>
            )}

            {loginType === "mahasiswa" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Masukkan NIM Anda"
                    value={formData.nim}
                    onChange={(e) => handleInputChange("nim", e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Password
                  </label>
                  <Input
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {loginType === "admin" && (
              <>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Username
                  </label>
                  <Input
                    type="text"
                    placeholder="Masukkan username Anda"
                    value={formData.username}
                    onChange={(e) => handleInputChange("username", e.target.value)}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1.5 block">
                    Password 
                  </label>
                  <Input
                    type="password"
                    placeholder="Masukkan password Anda"
                    value={formData.adminPassword}
                    onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                    disabled={loading}
                  />
                </div>
              </>
            )}

            {/* Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full justify-center"
              disabled={loading}
            >
              {loading ? "⏳ Menyambungkan..." : "Masuk"}
            </Button>
          </form>

          {/* Footer */}
          <p className="text-[11px] text-gray-400 text-center mt-4">
            © 2026 SIGAP [24 - Capstone Project] • Universitas Tadulako • Gedung SG
          </p>
        </div>
      </div>
    </div>
  );
}
