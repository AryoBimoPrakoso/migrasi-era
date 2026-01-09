import type { Metadata } from "next";

// Komponen
import Navbar from "../components/client/Navbar";
import Footer from "../components/client/Footer";
import Chatbot from "../components/client/Chatbot";

export const metadata: Metadata = {
  title: "Era Banyu Segara",
  description: "Pt. Era Banyu Segara",
  icons: {
    icon: "/icon.svg"
  }
};

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <Navbar />
      {children}
      <Chatbot />
      <Footer />
    </>
  );
}

