// components/client/ClientShell.tsx
"use client";

import Chatbot from "./Chatbot";
import Footer from "./Footer";
import Navbar from "./Navbar";


export default function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      {children}
      <Chatbot />
      <Footer />
    </>
  );
}
