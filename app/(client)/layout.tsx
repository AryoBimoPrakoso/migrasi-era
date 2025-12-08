import type { Metadata } from "next";
import localFont from "next/font/local"; 
import "./globals.css";

// Komponen 

import Navbar from "../components/client/Navbar";
import Chatbot from "../components/client/Chatbot";
import Footer from "../components/client/Footer";


const helveticaNow = localFont({
  src:[
    {
      path: '../../public/font/HelveticaNowDisplay-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: '../../public/font/HelveticaNowDisplay-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/font/HelveticaNowDisplay-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/font/HelveticaNowDisplay-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-helvetica-now'
})

export const metadata: Metadata = {
  title: "Era Banyu Segara",
  description: "Pt. Era Banyu Segara",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${helveticaNow.className}`}
      >
        <Navbar/>
        {children}
        <Chatbot/>
        <Footer/>
      </body>
    </html>
  );
}
