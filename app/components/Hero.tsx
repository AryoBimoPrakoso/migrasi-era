import Image from "next/image";
import React from "react";
import HeroLanding from "@/public/assets/img/hero.jpg";
import { GoArrowUpRight } from "react-icons/go";

const Hero = () => {
  return (
    <section
      className="p-14 relative h-screen bg-cover bg-center z-0"
      style={{ backgroundImage: `url(${HeroLanding.src})` }}
    >
      <div className="flex flex-col justify-center gap-[24px] h-full px-[56px]">
        <h1 className="text-9xl font-bold text-white mb-[24px]">
          Packaging <br /> Beyond the <span className="text-primary">Box!</span>
        </h1>
        <div className="flex items-center gap-1">
          <button className="bg-primary flex px-6 py-2 text-2xl font-reguler rounded-xl hover:drop-shadow-md duration-300 hover:brightness-75 items-center text-white">
            Pesan Sekarang <GoArrowUpRight />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
