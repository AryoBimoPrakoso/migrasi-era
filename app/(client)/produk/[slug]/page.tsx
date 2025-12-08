import React from "react";
import { DummyProduk } from "../data/dummyProduk";
import Image from "next/image";
import ImgProdukDummy from "@/public/assets/img/dummyProduk.jpg";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa6";

// SVG
import iconWhatsapp from "@/public/assets/svg/ic_round-whatsapp.svg";

interface DetailProps {
  params: {
    slug: string;
  };
}

const ProdukDetail = async ({ params }: DetailProps) => {
  // Pakai await, jika params slug adalah promise
  const { slug } = await params;

  // SLUG URL
  const idString = slug.split("-")[0];
  const id = Number(idString);

  //   Cari data berdasarkan ID
  const product = DummyProduk.find((p) => p.id === id);

  if (!product) {
    return <div>produk tidak ditemukan</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-12 pt-32">
      {/* Wrapper utama: full height (minus padding), center horizontally & vertically */}
      <div className="max-w-7xl mx-auto h-full flex items-center justify-center">
        {/* Card utama - sedikit shadow biar cantik */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden w-full">
          {/* Back button + isi */}
          <div className="p-8 lg:p-12">
            {/* BACK BUTTON */}
            <button
              
              className="flex items-center gap-3 text-lg font-medium mb-8 hover:text-gray-600 transition"
            >
              <FaArrowLeft /> {product.title}
            </button>

            {/* GRID LAYOUT - 2 KOLOM (image + content) */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              {/* LEFT - IMAGE */}
              <div className="flex justify-center">
                <img
                  src={ImgProdukDummy.src}
                  alt={product.title}
                  className="w-full max-w-md rounded-2xl object-cover shadow-md"
                />
              </div>

              {/* RIGHT - CONTENT */}
              <div className="flex flex-col gap-8">
                {/* Judul & Harga */}
                <div className="space-y-3">
                  <h1 className="text-2xl lg:text-3xl font-bold">
                    {product.title}
                  </h1>
                  <p className="text-3xl lg:text-4xl font-bold text-primary">
                    Rp {product.price.toLocaleString()}
                  </p>
                </div>

                {/* Deskripsi */}
                <p className="text-gray-600 text-base lg:text-lg leading-relaxed">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque
                  ex amet, illum molestias deserunt dolor architecto itaque
                  facere eligendi repudiandae nostrum est tempora temporibus...
                </p>

                {/* Keterangan Produk */}
                <div className="space-y-4">
                  <h2 className="text-xl font-semibold">Keterangan Produk</h2>
                  <div className="space-y-3 text-gray-700">
                    <div className="flex">
                      <span className="font-medium w-40">Bahan</span>
                      <span className="mr-4">:</span>
                      <span>{product.bahan}</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-40">Ukuran</span>
                      <span className="mr-4">:</span>
                      <span>Sesuai permintaan customer</span>
                    </div>
                    <div className="flex">
                      <span className="font-medium w-40">Min. Pesanan</span>
                      <span className="mr-4">:</span>
                      <span>{product.minimum} pcs</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp Button */}
                <a
                  href={`https://wa.me/628123456789?text=Halo,%20saya%20mau%20pesan%20${encodeURIComponent(
                    product.title
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] text-white px-6 py-4 rounded-xl font-medium text-lg hover:brightness-90 transition shadow-md w-fit"
                >
                  <Image src={iconWhatsapp} alt="WA" width={28} height={28} />
                  Pesan via WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdukDetail;
