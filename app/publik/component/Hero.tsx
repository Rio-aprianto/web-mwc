"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const DEFAULT_WA_LINK = "https://wa.me";

interface HeroSectionProps {
  heroSlides?: string[];
  mobileRescueWaLink?: string;
}

export default function HeroSection({
  heroSlides = [],
  mobileRescueWaLink = DEFAULT_WA_LINK,
}: HeroSectionProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slides = (heroSlides ?? []).filter(Boolean);

  // Efek otomatis berpindah slide (Auto-play slider) setiap 5 detik
  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // 5000ms = 5 detik

    return () => clearInterval(timer);
  }, [slides]);

  return (
    <section className='relative isolate h-screen overflow-hidden bg-slate-950'>
      {/* SLIDER BANNER MENGGUNAKAN NEXT.JS IMAGE */}
      {slides.map((slide, index) => (
        <div
          key={slide}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            index === activeSlide ? "opacity-100 z-0" : "opacity-0 -z-10"
          }`}>
          {/* Menggunakan Image Next.js untuk optimasi performa maksimal */}
          <Image
            src={slide}
            alt={`Hero Banner ${index + 1}`}
            fill // Memaksa gambar memenuhi kontainer div induknya
            sizes='100vw' // Memberitahu browser bahwa gambar akan memenuhi lebar layar
            className='object-cover object-center' // Pengganti bg-cover bg-center
            priority={index === 0} // HANYA preload gambar pertama yang aktif agar LCP cepat
            loading={index === 0 ? "eager" : "lazy"} // Gambar pertama dimuat instan, sisanya menyusul
            quality={80} // Mengompres gambar Supabase agar ukurannya lebih ringan tanpa merusak visual
          />

          {/* Layer linear-gradient dipisah sebagai overlay di atas gambar */}
          <div
            className='absolute inset-0 z-10'
            style={{
              backgroundImage:
                "linear-gradient(135deg, rgba(8, 40, 28, 0.56), rgba(10, 78, 54, 0.36))",
            }}
          />
        </div>
      ))}

      {/* Efektifitas Ornamen Blur dan Latar Belakang */}
      <div className='absolute inset-0 bg-white/10 z-10'></div>
      <div className='absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl z-10'></div>
      <div className='absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl z-10'></div>

      {/* Konten Teks dinaikkan z-index-nya agar selalu berada di atas gambar */}
      <div className='relative z-20 flex h-full flex-col items-center justify-center px-4 text-center text-white'>
        <h1
          className={`${playfairDisplay.className} mb-5 max-w-4xl text-4xl font-semibold leading-[0.95] tracking-[0.04em] sm:text-5xl md:text-7xl`}>
          MWC NU KARANGANYAR
        </h1>

        <p className='mb-8 max-w-2xl text-base font-medium leading-8 text-white/85 md:text-xl'>
          Melayani Umat, Menguatkan Jam&apos;iyyah dan Menebar Manfaat untuk
          Masyarakat.
        </p>

        <div className='flex flex-col gap-4 sm:flex-row'>
          <a
            href={mobileRescueWaLink}
            target='_blank'
            rel='noreferrer'
            className='group flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-red-500 bg-transparent px-10 py-4 text-lg font-bold text-white transition-all hover:bg-red-600 hover:text-white hover:shadow-2xl hover:shadow-red-500/50 active:scale-95'>
            🚨 DARURAT - Mobil Siaga Lazisnu
          </a>
        </div>
      </div>
    </section>
  );
}
