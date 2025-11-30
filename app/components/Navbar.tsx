import Image from "next/image";
import React from "react";
import Link from "next/link";

// Import logo
import EraBanyuLogo from "@/public/assets/svg/logo.svg";

const Navbar = () => {
  return (
    <div className="fixed w-full bg-white z-999">
      <div className="flex px-14 py-2 justify-between items-center">
        <Image src={EraBanyuLogo} alt="Era Banyu Segara"  className="w-[250px]"/>
        <div className="flex gap-5 text-[20px]">
          <Link href="/" className="hover:opacity-75">Beranda</Link>
          <Link href="/#tentang-kami" className="hover:opacity-75">Tentang</Link>
          <Link href="/produk" className="hover:opacity-75">Produk</Link>
          <Link href="/FAQ" className="hover:opacity-75">FAQ</Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
