"use client";
import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoIosArrowUp } from "react-icons/io";

export interface Pertanyaan {
  id: number;
  pertanyaan: string;
  jawaban: string;
}

// Static pertanyaan FAQ
export const StaticQuestions: Pertanyaan[] = [
  {
    id: 1,
    pertanyaan: "Menjual Apa Saja?",
    jawaban: "Menjual berbagai macam produk kemasan, seperti Packing Carton Box, Strapping Band, Paper Pallet, Slip Sheet, Paper Angle Board, Strecth Film, Tape, dan Impra Board Box.",
  },
  {
    id: 2,
    pertanyaan: "Minimum Pesanan?",
    jawaban: "Minimum pesanan tergantung pada setiap produk, yang dapat dilihat pada deskripsi produk.",
  },
  {
    id: 3,
    pertanyaan: "Apakah bisa COD?",
    jawaban: "Bisa! Kami support pembayaran COD.",
  },
  {
    id: 4,
    pertanyaan: "Berapa lama proses pengerjaan?",
    jawaban: "Waktu pengerjaan 10 hari kerja.",
  },
  {
    id: 5,
    pertanyaan: "Metode pembayaran apa saja yang didukung?",
    jawaban: "Anda bisa mengisi bagian ini dengan metode pembayaran yang sebenarnya digunakan, misalnya transfer bank atau e-wallet",
  },
  {
    id: 6,
    pertanyaan: "Apakah saya bisa membatalkan pesanan?",
    jawaban: "Ya, di contoh ini pesanan bisa dibatalkan sebelum proses produk dimulai. Silakan sesuai dengan kebijakan asli anda",
  },
];

const Accordion = () => {
  const [open, setOpen] = useState<number | null>(null);
  const toggle = (index: number) => {
    setOpen(open === index ? null : index);
  };

  return (
    <div className="w-full">
      {StaticQuestions.map((ask, index) => (
        <div key={index} className="py-3">
          <button
            onClick={() => toggle(index)}
            className="flex items-center justify-between w-full text-left bg-[#F2F0EF] py-2 px-4 rounded-t-md drop-shadow-sm font-light text-sm lg:text-lg" 
          >
            {ask.pertanyaan}
            <span>
              {open === index ? <IoIosArrowUp /> : <IoIosArrowDown />}
            </span>
          </button>
          <div
            className={`overflow-hidden transition-all w-full duration-300 bg-[#d9d9d9] rounded-b-md ${
              open === index ? "max-h-40" : "max-h-0"
            }`}
          >
            <p className="py-2 px-4 font-light text-sm lg:text-lg">{ask.jawaban}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Accordion;
