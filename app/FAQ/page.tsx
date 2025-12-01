import React from "react";
import Accordion from "../components/Accordion";
import emailLogo from "@/public/assets/svg/email.svg"
import teleponLogo from "@/public/assets/svg/telepon.svg"
import lokasiLogo from "@/public/assets/svg/lokasi.svg"
import Image from "next/image";

const FAQ = () => {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex p-14 justify-between">
        <div className="w-full flex flex-col gap-4">
          <h1 className="font-medium text-6xl">
            Sering <br />
            Ditanyakan
          </h1>
          <p className="text-xl font-light">
            Jika ada pertanyaan lain bisa menggunakan fitur Chatbot atau hubungi
            <br /> kontak Whatsapp kami
          </p>
          <ul className="flex flex-col gap-4">
            <li className="flex gap-2 items-center">
              <Image src={emailLogo} alt="email" />
              erabanyusegara@gmail.com
            </li>
            <li className="flex gap-2 items-center">
              <Image src={teleponLogo} alt="telepon" />
              081234567899
            </li>
          </ul>
        </div>
        <Accordion />
      </div>
    </div>
  );
};

export default FAQ;
