import type { Metadata } from "next";
import ClientShell from "../components/client/ClientShell";


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
      <ClientShell>{children}</ClientShell>
    </>
  );
}

