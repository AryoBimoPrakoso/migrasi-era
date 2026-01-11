// components/Sidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logoDashboard from "@/public/assets/svg/dashboard-icon.svg";
import logoKatalog from "@/public/assets/svg/katalog-icon.svg";
import logoLaporan from "@/public/assets/svg/laporan-icon.svg";

import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

const Sidebar = () => {
  // Ini yang bikin active state akurat!
  const pathname = usePathname();
  // buat logout
  const router = useRouter();

const handleLogout = () => {
  Swal.fire({
    title: 'Logout Admin?',
    text: 'Anda akan keluar dari panel admin. Pastikan sudah menyimpan perubahan!',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Ya, Logout!',
    cancelButtonText: 'Batal',
    customClass: {
      popup: 'animate__animated animate__fadeInDown',
      confirmButton: 'btn-logout',
      cancelButton: 'btn-cancel',
    },
  }).then((result) => {
    if (result.isConfirmed) {
      // Hapus token & data admin dari sessionStorage
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("adminData");

      // Optional: SweetAlert success
      Swal.fire({
        title: 'Logout Berhasil!',
        text: 'Sampai jumpa lagi, Admin!',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/login");
    }
  });
};

  const menuItems = [
    { href: "/dashboard", label: "Dashboard", icon: logoDashboard },
    { href: "/katalog", label: "Katalog", icon: logoKatalog },
    { href: "/laporan", label: "Laporan", icon: logoLaporan },
  ];

  return (
    <aside className="w-64 h-screen bg-white shadow-lg flex flex-col justify-between py-8">
      {/* Menu */}
      <nav className="flex flex-col gap-2 px-6">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-4 px-5 py-3 rounded-xl transition-all duration-200 group
                ${
                  isActive
                    ? "bg-gray-100 text-gray-900 font-semibold shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
            >
              <Image
                src={item.icon}
                alt={item.label}
                width={22}
                height={22}
                className={`${
                  isActive
                    ? "brightness-0"
                    : "brightness-75 group-hover:brightness-0"
                } transition-all`}
              />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-4 px-5 py-3 w-full text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 group"
        >
          <svg
            className="w-5 h-5 group-hover:scale-110 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          <span className="text-base font-medium">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
