"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { postApi } from "@/lib/apiClient";
import {
  FaUserPlus,
  FaArrowLeft,
  FaRegEye,
  FaRegEyeSlash,
} from "react-icons/fa";

export default function RegisterAdminPage() {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  // State untuk form
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "editor",
  });
  // State untuk feedback user
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const toggleShowPassword = () => setShowPassword((prev) => !prev);

  useEffect(() => {
    const adminDataString = sessionStorage.getItem("adminData");

    if (!adminDataString) {
      router.push("/login");
      return;
    }

    const adminData = JSON.parse(adminDataString);

    // Cek Role
    if (adminData.role.toLowerCase() !== "superadmin") {
      // Jika bukan SuperAdmin, tendang ke dashboard
      alert("Akses Ditolak: Halaman ini hanya untuk SuperAdmin.");
      router.push("/dashboard");
    } else {
      // Jika SuperAdmin, izinkan render halaman
      setIsAuthorized(true);
    }
  }, [router]);

  // Jangan render konten form sampai verifikasi selesai
  if (!isAuthorized) {
    return null; // Atau return <p>Loading...</p>
  }

  // Handle perubahan input
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Submit Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      // 1. Panggil endpoint backend menggunakan postApi
      // Parameter ke-3 'true' artinya endpoint ini butuh Token (Authorization)
      await postApi("admin/auth/register", formData, true);

      // 2. Jika sukses
      setMessage({ type: "success", text: "Admin baru berhasil didaftarkan!" });

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        role: "editor",
      });
    } catch (error: any) {
      console.error("Gagal mendaftar:", error);
      setMessage({
        type: "error",
        text:
          error.message ||
          "Gagal mendaftarkan admin. Periksa koneksi atau hak akses Anda.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUserPlus /> Tambah Admin Baru
          </h1>
          <button
            onClick={() => router.back()}
            className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
          >
            <FaArrowLeft /> Kembali
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          {/* Notifikasi Pesan */}
          {message && (
            <div
              className={`p-4 mb-6 text-sm rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-700 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Contoh: admin_gudang"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="email@erabanyu.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition"
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-700"
                >
                  {showPassword ? (
                    <FaRegEye className="text-xl" />
                  ) : (
                    <FaRegEyeSlash className="text-xl" />
                  )}
                </button>
              </div>
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Peran (Role)
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition bg-white"
              >
                <option value="editor">Editor (Admin Biasa)</option>
                <option value="SuperAdmin">SuperAdmin (Akses Penuh)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                *Hanya SuperAdmin yang dapat membuat SuperAdmin lain.
              </p>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black hover:bg-gray-800 shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? "Memproses..." : "Daftarkan Admin"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
