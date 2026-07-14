import { Suspense } from "react";

import Hero from "./publik/component/Hero";
import Stats from "./publik/component/Stats";
import Sambutan from "./publik/component/Sambutan";
import About from "./publik/component/About";
import Programs from "./publik/component/Programs";
import News from "./publik/component/News";
import CTA from "./publik/component/CTA";
import Footer from "./publik/component/Footer";
import TopNav from "./publik/component/TopNav";
import FadeInOnScroll from "./publik/component/FadeInOnScroll";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

async function HeroSection() {
  let banners: Array<{ imageUrl: string }> = [];

  try {
    banners = await prisma.bannerImage.findMany({
      orderBy: { id: "desc" },
      take: 3,
    });
  } catch {
    // Render hero dengan banner default bila DB belum siap.
  }

  const slides = banners.map((item) => item.imageUrl);

  return <Hero slides={slides} />;
}

async function StatsSection() {
  let rantingCount = 0;
  let banomCount = 0;
  let kaderCount = 0;
  let viewCount = 0;

  try {
    [rantingCount, banomCount, kaderCount] = await prisma.$transaction([
      prisma.ranting.count(),
      prisma.banom.count(),
      prisma.kader.count(),
    ]);
  } catch {
    // Tetap tampilkan 0 bila DB belum siap.
  }

  try {
    viewCount = await prisma.healthcheck.count();
  } catch {
    viewCount = 0;
  }

  return (
    <Stats
      rantingCount={rantingCount}
      banomCount={banomCount}
      kaderCount={kaderCount}
      viewCount={viewCount}
    />
  );
}

async function ProgramsSection() {
  let pengurus: Array<{
    id: number;
    nama: string;
    jabatan: string;
    bidang: string | null;
    fotoUrl: string;
    nomorWa: string | null;
  }> = [];

  try {
    pengurus = await prisma.pengurus.findMany({
      where: { status: "Aktif" },
      orderBy: { id: "asc" },
      select: {
        id: true,
        nama: true,
        jabatan: true,
        bidang: true,
        fotoUrl: true,
        nomorWa: true,
      },
    });
  } catch {
    // Slider kosong bila DB belum siap.
  }

  return <Programs initialMembers={pengurus} />;
}

function HeroSkeleton() {
  return (
    <section className='relative isolate h-screen overflow-hidden bg-emerald-900'>
      <div className='absolute inset-0 animate-pulse bg-gradient-to-br from-emerald-800 to-emerald-950' />
      <div className='relative z-10 flex h-full flex-col items-center justify-center gap-4 px-4 text-center'>
        <div className='h-14 w-3/4 max-w-2xl animate-pulse rounded bg-white/20' />
        <div className='h-4 w-2/3 max-w-md animate-pulse rounded bg-white/15' />
      </div>
    </section>
  );
}

function StatsSkeleton() {
  return (
    <section className='relative z-20 -mt-24 pb-10 md:-mt-28'>
      <div className='w-full'>
        <div className='grid grid-cols-2 overflow-hidden border border-white/20 bg-emerald-900/55 md:grid-cols-4'>
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className='flex min-h-28 flex-col items-center justify-center gap-2 border border-white/10 px-4 py-6'>
              <div className='h-8 w-16 animate-pulse rounded bg-white/20' />
              <div className='h-3 w-12 animate-pulse rounded bg-white/15' />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ProgramsSkeleton() {
  return (
    <section className='overflow-hidden bg-emerald-950 py-20'>
      <div className='mx-auto max-w-7xl px-4'>
        <div className='mx-auto h-9 w-72 animate-pulse rounded bg-white/15' />
        <div className='mt-12 flex gap-4 overflow-hidden'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='w-full flex-shrink-0 rounded-3xl border border-white/10 bg-white/10 p-6'>
              <div className='mx-auto h-36 w-36 animate-pulse rounded-full bg-white/15' />
              <div className='mx-auto mt-5 h-4 w-2/3 animate-pulse rounded bg-white/15' />
              <div className='mx-auto mt-2 h-3 w-1/2 animate-pulse rounded bg-white/10' />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function NewsSkeleton() {
  return (
    <section className='bg-emerald-50/70 py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='mx-auto mb-12 h-10 w-64 animate-pulse rounded bg-emerald-200/60' />
        <div className='grid gap-8 md:grid-cols-3'>
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className='overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/10'>
              <div className='h-60 w-full animate-pulse bg-emerald-100' />
              <div className='space-y-3 p-6'>
                <div className='h-5 w-3/4 animate-pulse rounded bg-emerald-100' />
                <div className='h-3 w-full animate-pulse rounded bg-emerald-100/70' />
                <div className='h-3 w-5/6 animate-pulse rounded bg-emerald-100/70' />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  return (
    <main className='scroll-smooth'>
      <TopNav />

      <div id='beranda'>
        <Suspense fallback={<HeroSkeleton />}>
          <HeroSection />
        </Suspense>
      </div>

      <div id='statistik' className='scroll-mt-20'>
        <Suspense fallback={<StatsSkeleton />}>
          <StatsSection />
        </Suspense>
      </div>

      <div id='tentang' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={80}>
          <Sambutan />
          <About />
        </FadeInOnScroll>
      </div>

      <div id='program' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={120}>
          <Suspense fallback={<ProgramsSkeleton />}>
            <ProgramsSection />
          </Suspense>
        </FadeInOnScroll>
      </div>

      <div id='berita' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={150}>
          <Suspense fallback={<NewsSkeleton />}>
            <News />
          </Suspense>
        </FadeInOnScroll>
      </div>

      <div id='kontak' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={180}>
          <CTA />
        </FadeInOnScroll>
      </div>

      <FadeInOnScroll delayMs={220}>
        <Footer />
      </FadeInOnScroll>
    </main>
  );
}
