import React from "react";
import { DummyProduk } from "../produk/data/dummyProduk";
import dummyProdukImg from "@/public/assets/img/dummyProduk.jpg";
import Image from "next/image";

const Product = () => {
  return (
    <div className="flex flex-col w-max mx-auto gap-8 p-14">
      <div className="flex w-full justify-between">
        <h1 className="text-6xl font-medium">Produk Kami</h1>
        <button className="border rounded-full py-1 px-2 hover:bg-black hover:text-white duration-300 ">
            Lihat Selengkapnya
        </button>
      </div>
      <div className="flex gap-10">
        {DummyProduk.slice(0, 3).map((product) => (
          <div key={product.id}>
            <div className="bg-[#E6E6E6] rounded-xl shadow-sm p-5 flex flex-col gap-4">
              <Image
                src={dummyProdukImg}
                alt="Dummy Produk"
                className="w-full h-72 object-cover rounded-md"
              />
              <div>
                <h2>{product.title}</h2>
                <h2>Mulai Rp {product.price.toLocaleString()}</h2>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Product;
