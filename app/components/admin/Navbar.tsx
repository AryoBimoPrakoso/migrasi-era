"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// SVG
import logo from "@/public/assets/svg/logo.svg";
import logoMobile from "@/public/assets/svg/logo-mobile.svg";
import { Plus } from "lucide-react";

const NavbarAdmin = () => {
  const [role, setRole] = useState<string>("");

  useEffect(() => {
    // ambil data dari sessionStorage
    const adminDataString = sessionStorage.getItem("adminData");

    if (adminDataString) {
      try {
        const adminData = JSON.parse(adminDataString);
        // Pastikan ada fallback string kosong jika role undefined
        setRole(adminData.role || "");
      } catch (error) {
        console.error("Error parsing admin data", error);
      }
    }
  }, []);

  // PERBAIKAN DI SINI: Bandingkan dengan "superadmin" (huruf kecil semua)
  const isSuperAdmin = role.toLocaleLowerCase() === "superadmin";

  return (
    <div className="w-full sticky top-0 z-[999]">
      <div className="flex justify-between items-center px-4 py-2 drop-shadow-md bg-white">
        
        {/* Logo Section */}
        <div className="flex items-center gap-2">
            <Image
            src={logo}
            alt="Era Banyu Segara"
            className="w-64 hidden md:flex"
            priority
            />
            <Image
            src={logoMobile}
            alt="Era Banyu Segara"
            className="w-8 flex md:hidden"
            priority
            />
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
            {/* Tombol hanya muncul jika logika isSuperAdmin = true */}
            {isSuperAdmin && (
            <Link
                href="/register-admin" // Pastikan route ini sesuai dengan struktur folder Anda
                className="bg-black text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm hover:bg-gray-800 transition"
            >
                <Plus size={16} /> {/* Ukuran icon disesuaikan */}
                <span className="hidden sm:inline">Tambah Admin Baru</span>
            </Link>
            )}

            <div className="font-medium text-sm border-l pl-4 border-gray-300">
                {/* Menampilkan Role atau Username agar lebih informatif */}
                Halo, {role || "Admin"}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NavbarAdmin;