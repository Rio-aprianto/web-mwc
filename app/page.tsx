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

export default async function Home() {
  let banners: Array<{ imageUrl: string }> = [];
  let rantingCount = 0;
  let banomCount = 0;
  let kaderCount = 0;
  let pengurus: Array<{
    id: number;
    nama: string;
    jabatan: string;
    bidang: string | null; // Ditambahkan bidang
    fotoUrl: string;
    nomorWa: string | null;
  }> = [];

  try {
    [banners, rantingCount, banomCount, kaderCount, pengurus] =
      await prisma.$transaction([
        prisma.bannerImage.findMany({
          orderBy: { id: "desc" },
          take: 3,
        }),
        prisma.ranting.count(),
        prisma.banom.count(),
        prisma.kader.count(),
        prisma.pengurus.findMany({
          where: { status: "Aktif" },
          orderBy: { id: "asc" },
          // Note: `take: 4` dihapus agar semua pengurus aktif masuk ke slider otomatis
          select: {
            id: true,
            nama: true,
            jabatan: true,
            bidang: true, // === SEKARANG DI-SELECT ===
            fotoUrl: true,
            nomorWa: true,
          },
        }),
      ]);
  } catch {
    // Render landing with fallback values when DB is temporarily unreachable.
  }

  let viewCount = 0;

  try {
    viewCount = await prisma.healthcheck.count();
  } catch {
    // Keep landing page available even when Healthcheck table isn't migrated yet.
    viewCount = 0;
  }

  const heroSlides = banners.map((item: { imageUrl: string }) => item.imageUrl);

  return (
    <main className='scroll-smooth'>
      <TopNav />

      <div id='beranda'>
        <Hero slides={heroSlides} />
      </div>

      <div id='statistik' className='scroll-mt-20'>
        <Stats
          rantingCount={rantingCount}
          banomCount={banomCount}
          kaderCount={kaderCount}
          viewCount={viewCount}
        />
      </div>

      <div id='tentang' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={80}>
          <Sambutan />
          <About />
        </FadeInOnScroll>
      </div>

      <div id='program' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={120}>
          <Programs initialMembers={pengurus} />
        </FadeInOnScroll>
      </div>

      <div id='berita' className='scroll-mt-20'>
        <FadeInOnScroll delayMs={150}>
          <News />
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
