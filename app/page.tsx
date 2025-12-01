import Image from "next/image";
import Hero from "./components/Hero";
import About from "./components/About";
import Footer from "./components/Footer";
import Product from "./components/Product";

export default function Home() {
  return (
    <div className="overflow-hidden">
      <Hero/>
      <About/>
      <Footer/>
    </div>
  );
}
