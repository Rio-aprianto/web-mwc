import { prisma } from "@/lib/prisma";

export default async function Sambutan() {
  let sambutan = null;

  try {
    sambutan = await prisma.sambutanKetua.findFirst({
      orderBy: { updatedAt: "desc" },
    });
  } catch (error) {
    console.error("Failed to fetch sambutan:", error);
  }

  const namaKetua = sambutan?.namaKetua || "SUTARNO, S.H";
  const isi = sambutan?.isi || "Assalamu'alaikum warahmatullahi wabarakatuh...";

  const imageUrl = sambutan?.imageUrl || "/images/IMG_5436-removebg-preview.png";

  console.log(
    "🔍 [Rois Syuriah] Image URL from DB:",
    imageUrl?.substring(0, 150) + "...",
  );

  return (
    <section className='relative overflow-hidden bg-gradient-to-br from-emerald-950 via-slate-950 to-emerald-950 py-20 md:py-24 text-white'>
      {/* Decorative blobs */}
      <div className='pointer-events-none absolute -left-20 top-10 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl'></div>
      <div className='pointer-events-none absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl'></div>

      <div className='relative mx-auto max-w-6xl px-4'>
        <div className='grid items-center gap-12 md:grid-cols-[0.75fr_1.25fr]'>
          {/* Photo Card */}
          <div className='group relative mx-auto max-w-sm overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-3 shadow-2xl shadow-black/50 backdrop-blur-xl'>
            <div className='relative h-[380px] overflow-hidden rounded-2xl bg-emerald-900/30'>
              <img
                src={imageUrl}
                alt='Ketua Rois Syuriah'
                className='h-full w-full object-cover transition-all duration-700 group-hover:scale-105'
              />
            </div>

            {/* Name Plate */}
            <div className='absolute -bottom-1 left-6 right-6 rounded-2xl border border-white/20 bg-emerald-950/70 px-5 py-4 backdrop-blur-md'>
              <p className='text-xs font-semibold uppercase tracking-[1.5px] text-emerald-200/80'>
                Ketua Rois Syuriah
              </p>
              <p className='mt-1 text-xl font-semibold text-white'>
                {namaKetua}
              </p>
            </div>
          </div>

          {/* Sambutan Content */}
          <div>
            <div className='inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-white/5 px-5 py-2 text-sm font-semibold uppercase tracking-widest text-emerald-100'>
              <span className='text-emerald-400'>✦</span> SAMBUTAN ROIS SYURIAH
            </div>

            <div className='prose prose-invert mt-8 max-w-none text-[17px] leading-relaxed text-emerald-100/95'>
              <p className='mb-5'>
                Assalamu’alaikum Warahmatullahi Wabarakatuh
              </p>
              <p className='mb-5'>{isi}</p>
              <p className='text-emerald-100/80'>
                Wallahul muwaffiq ila aqwamith thoriq,
              </p>
              <p className='text-emerald-100/80'>
                Wassalamu’alaikum Warahmatullahi Wabarakatuh
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
