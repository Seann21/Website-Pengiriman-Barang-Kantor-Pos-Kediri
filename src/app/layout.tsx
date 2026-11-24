import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sistem Informasi Pengiriman - Kantor Pos Kediri",
  description:
    "Sistem Informasi Pencatatan & Monitoring Pengiriman Barang Kantor Pos Kota Kediri",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={inter.variable}>
      <body className={`${inter.className} antialiased bg-slate-50 text-slate-900 min-h-screen selection:bg-orange-500 selection:text-white`}>
        {children}
      </body>
    </html>
  );
}
