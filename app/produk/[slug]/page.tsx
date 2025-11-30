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
    <div className="flex flex-col p-14 h-screen justify-center">
      {/* TITLE */}
      <h2 className="flex items-center gap-4 text-lg font-medium mb-6"><span><FaArrowLeft /></span>{product.title}</h2>

      <div className="flex w-full gap-10">
        {/* LEFT IMAGE */}
        <img
          src={ImgProdukDummy.src}
          alt={product.title}
          className="w-[35%] h-full rounded-2xl object-cover"
        />

        {/* RIGHT CONTENT */}
        <div className="flex flex-col gap-8 w-[55%]">
          {/* PRODUCT TEXT */}
          <div className="flex flex-col gap-4">
            <h2 className="text-xl font-medium">{product.title}</h2>
            <h1 className="font-bold text-2xl">Rp {product.price.toLocaleString()}</h1>
            

            <p className="text-lg text-gray-600 leading-relaxed">
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Atque ex amet, illum molestias deserunt dolor architecto itaque facere eligendi repudiandae nostrum est tempora temporibus. Repellendus neque repudiandae nobis aperiam aut!
              Necessitatibus quod consectetur porro magni, esse tenetur dolores nihil! Veritatis pariatur tempore atque eaque fugit! Fuga culpa harum minus illum assumenda maiores sed accusamus autem cumque asperiores atque, voluptas nobis.
              Iure nisi laboriosam error fuga rerum ullam culpa ex quos fugiat nesciunt commodi id labore, aliquam minima, iusto maxime magnam laborum consequuntur animi temporibus repellat pariatur unde. Dolorem, quia illum.
              Earum nesciunt modi nemo! Asperiores placeat incidunt fugit quam, voluptatem molestiae. Autem voluptates fuga consequatur quam nesciunt aliquid repellendus nisi ex natus soluta unde facilis commodi praesentium placeat, esse perferendis.
              Cumque ipsum, pariatur itaque vel aut, ex, voluptas fuga molestias sapiente officiis quia nesciunt vitae mollitia ab animi! Asperiores eum placeat rerum quos debitis amet repudiandae, dicta consectetur commodi pariatur!
            </p>
          </div>

          {/* KETERANGAN PRODUK */}
          <div className="flex flex-col gap-4">
            <h1 className="text-xl font-semibold">Keterangan Produk</h1>

            <div className="space-y-2 text-gray-700 text-lg">
              <div className="flex gap-2">
                <span className="font-medium w-40">Bahan</span>
                <span>:</span>
                <span>{product.bahan}</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Ukuran</span>
                <span>:</span>
                <span>Sesuai permintaan kustomer</span>
              </div>

              <div className="flex gap-2">
                <span className="font-medium w-40">Minimum Pesanan</span>
                <span>:</span>
                <span>{product.minimum} pcs</span>
              </div>
            </div>
          </div>

          {/* WHATSAPP BUTTON */}
          <a
            href="#"
            className="bg-[#25D366] flex items-center gap-2 text-white px-5 py-2 rounded-lg w-fit shadow-sm hover:brightness-90 transition"
          >
            Pesan
            <Image src={iconWhatsapp} alt="Whatsapp" width={20} height={20} />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ProdukDetail;
