import Image from "next/image";
import { prisma } from "@/lib/prisma";

export default async function SambutanTanfidziyah() {
  let sambutan = null;

  try {
    sambutan = await prisma.sambutanTanfidziyah.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch sambutan tanfidziyah:", error);
  }

  const namaKetua = sambutan?.namaKetua || "KH. Ahmad Fauzi, M.Ag";
  const isi = sambutan?.isi || "Assalamu’alaikum Warahmatullahi Wabarakatuh...";
  const imageUrl = sambutan?.imageUrl || "/images/IMG_5436-removebg-preview.png";

  console.log("🔍 Image URL from DB:", imageUrl?.substring(0, 150) + "...");

  return (
    <section className='bg-gradient-to-br from-slate-50 via-emerald-50 to-white py-20 md:py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <div className='grid items-center gap-12 md:grid-cols-[1.25fr_0.75fr]'>
          {/* Sambutan Content - Kiri */}
          <div>
            <div className='inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-100 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-emerald-800'>
              <span className='text-emerald-600'>✦</span> SAMBUTAN TANFIDZIYAH
            </div>

            <div className='prose prose-emerald mt-8 max-w-none text-[17px] leading-relaxed text-emerald-950/90'>
              <p className='mb-6 font-medium'>
                Assalamu’alaikum Warahmatullahi Wabarakatuh
              </p>
              <p className='mb-6'>{isi}</p>
              <p className='text-emerald-800/80'>
                Wallahul muwaffiq ila aqwamith thoriq,
              </p>
              <br />
              <p className='text-emerald-800/80'>
                Wassalamu’alaikum Warahmatullahi Wabarakatuh
              </p>
            </div>
          </div>

          {/* Photo Card - Kanan */}
          <div className='group relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-emerald-200 bg-white p-3 shadow-2xl shadow-emerald-900/10'>
            <div className='relative h-[380px] overflow-hidden rounded-2xl bg-emerald-100'>
              <img
                src={imageUrl}
                alt={namaKetua}
                className='h-full w-full object-cover transition-all duration-700 group-hover:scale-105'
              />
            </div>

            {/* Name Plate */}
            <div className='absolute -bottom-1 left-6 right-6 rounded-2xl border border-emerald-200 bg-white px-5 py-4 shadow-lg'>
              <p className='text-xs font-semibold uppercase tracking-[1.5px] text-emerald-700'>
                KETUA TANFIDZIYAH
              </p>
              <p className='mt-1 text-xl font-semibold text-emerald-900'>
                {namaKetua}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
