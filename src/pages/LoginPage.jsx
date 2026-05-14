import { useState } from "react";
import { Button, Input } from "../components/ui/index.jsx";

export default function LoginPage({ onLogin }) {
  const [loginType, setLoginType] = useState("mahasiswa");
  const [formData, setFormData] = useState({
    nim: "",
    password: "",
    username: "",
    adminPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    await new Promise(resolve => setTimeout(resolve, 1000));

    try {
      if (loginType === "mahasiswa") {
        if (formData.nim === "F55123015" && formData.password === "123456") {
          onLogin({
            id: "U001",
            name: "Octavia Ramadhani",
            nim: "F55123015",
            role: "mahasiswa",
            prodi: "Teknik Informatika",
            avatar: "SR",
          });
        } else {
          setError("NIM atau password salah");
        }
      } else {
        if (formData.username === "admin" && formData.adminPassword === "admin123") {
          onLogin({
            id: "A001",
            name: "Penjaga SG Gedung",
            role: "admin",
            avatar: "PS",
          });
        } else {
          setError("Username atau password salah");
        }
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      
      {/* LEFT IMAGE */}
      <div className="hidden md:block w-1/2 relative">
        <img
          src="/public/gedungteknik.jpg"
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
              SIGAP adalah platform digital terintegrasi yang membantu pengelolaan data gedung,
              inventaris aset, serta proses peminjaman fasilitas secara efektif, cepat, dan transparan.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT FORM */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">
            Portal Login
          </h2>
          <p className="text-sm text-gray-500 mb-6">
            Access the Facility Management Command Center
          </p>

          {/* Toggle */}
          <div className="flex mb-6 bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setLoginType("mahasiswa")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                loginType === "mahasiswa"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500"
              }`}
            >
              Mahasiswa
            </button>
            <button
              type="button"
              onClick={() => setLoginType("admin")}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                loginType === "admin"
                  ? "bg-white text-blue-600 shadow"
                  : "text-gray-500"
              }`}
            >
              Admin
            </button>
          </div>

          {/* FORM */}
          <form onSubmit={handleSubmit} className="space-y-4">

            {loginType === "mahasiswa" ? (
              <>
                <Input
                  label="NIM / Email"
                  id="nim"
                  type="text"
                  placeholder="20241001 / student@email.com"
                  value={formData.nim}
                  onChange={(e) => handleInputChange("nim", e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  required
                />
              </>
            ) : (
              <>
                <Input
                  label="Email / Username"
                  id="username"
                  type="text"
                  placeholder="admin@sgfacility.edu"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  required
                />
                <Input
                  label="Password"
                  id="adminPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.adminPassword}
                  onChange={(e) => handleInputChange("adminPassword", e.target.value)}
                  required
                />
              </>
            )}

            {/* ERROR */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* BUTTON */}
            <Button
              type="submit"
              variant="primary"
              className="w-full py-2"
              disabled={loading}
            >
              {loading ? "Sedang Masuk..." : "Sign In to Dashboard →"}
            </Button>
          </form>

          {/* FOOTER */}
          <p className="text-center text-xs text-gray-400 mt-10">
            © 24 Capstone Project - SIGAP Team. 
          </p>

        </div>
      </div>
    </div>
  );
}