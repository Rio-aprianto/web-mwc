"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Playfair_Display } from "next/font/google";

const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

type HeroProps = {
  slides?: string[];
};

export default function Hero({ slides = [] }: HeroProps) {
  const heroSlides =
    slides.length > 0 ? slides : ["/images/banner1.jpg", "/images/banner.jpg"];
  const mobileRescueWaLink =
    "https://wa.me/6281567641339?text=Assalamu%27alaikum%2C%20saya%20membutuhkan%20layanan%20darurat%20Mobil%20Siaga%20Lazisnu.";
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const sliderInterval = setInterval(() => {
      setActiveSlide((prevSlide) => (prevSlide + 1) % heroSlides.length);
    }, 5000);

    return () => clearInterval(sliderInterval);
  }, [heroSlides.length]);

  return (
    <section className='relative isolate h-screen overflow-hidden'>
      {heroSlides.map((slide, index) => (
        <div
          key={slide}
          className={`absolute inset-0 bg-cover bg-center transition-opacity duration-700 ${
            index === activeSlide ? "opacity-100" : "opacity-0"
          }`}
          style={{
            backgroundImage: `linear-gradient(135deg, rgba(8, 40, 28, 0.56), rgba(10, 78, 54, 0.36)), url('${slide}')`,
          }}
        />
      ))}

      <div className='absolute inset-0 bg-white/10'></div>
      <div className='absolute -left-24 top-10 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl'></div>
      <div className='absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-lime-300/10 blur-3xl'></div>

      <div className='relative z-10 flex h-full flex-col items-center justify-center px-4 text-center text-white'>
        <h1
          className={`${playfairDisplay.className} mb-5 max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[0.04em] md:text-7xl`}>
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
