import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import ScrollToTopButton from "./_components/ScrollToTopButton";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "MWC NU Karanganyar - Website Resmi Majelis Wakil Cabang",
  description:
    "Website resmi Majelis Wakil Cabang Nahdlatul Ulama (MWC NU) Kecamatan Karanganyar. Pusat informasi, berita terbaru, kegiatan, dan struktur kepengurusan NU Karanganyar.",
  keywords: [
    "MWC NU Karanganyar",
    "MWCNU Karanganyar",
    "NU Karanganyar",
    "Nahdlatul Ulama Karanganyar",
    "numediakaranganyar",
  ],
  authors: [{ name: "MWC NU Karanganyar" }],
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang='en'
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className='min-h-full flex flex-col'>
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
