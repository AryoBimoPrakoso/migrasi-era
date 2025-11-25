import type { Metadata } from "next";
import "./globals.css";
import "./firebase";
import localFont from "next/font/local";
import Navbar from "./components/Navbar";

const helveticaNow = localFont({
  src:[
    {
      path: './font/HelveticaNowDisplay-Light.ttf',
      weight: '300',
      style: 'normal',
    },
    {
      path: './font/HelveticaNowDisplay-Regular.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: './font/HelveticaNowDisplay-Medium.ttf',
      weight: '500',
      style: 'normal',
    },
    {
      path: './font/HelveticaNowDisplay-Bold.ttf',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-helvetica-now'
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${helveticaNow.className}`}
      >
        <Navbar/>
        {children}
      </body>
    </html>
  );
}
