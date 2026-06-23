import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toBeritaSlug } from "@/lib/slug";

function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

export default async function News() {
  let beritaItems: Array<{
    id: number;
    judul: string;
    konten: string;
    imageUrl: string;
  }> = [];

  try {
    beritaItems = await prisma.berita.findMany({
      orderBy: { tanggalUpload: "desc" },
      take: 3,
    });
  } catch {
    // Keep homepage rendering even when berita query cannot reach DB.
  }

  return (
    <section className='bg-emerald-50/70 py-24'>
      <div className='mx-auto max-w-6xl px-4'>
        <h2 className='mb-12 text-center text-4xl font-bold text-emerald-900'>
          Berita Terbaru
        </h2>

        <div className='grid gap-8 md:grid-cols-3'>
          {beritaItems.map((item) => (
            <div
              key={item.id}
              className='overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-lg shadow-emerald-950/10'>
              <img
                src={item.imageUrl}
                alt={item.judul}
                className='h-60 w-full object-cover'
              />

              <div className='p-6'>
                <h3 className='mb-3 text-xl font-bold text-emerald-900'>
                  {item.judul}
                </h3>

                <p className='text-emerald-950/75'>
                  {truncateWords(item.konten, 24)}
                </p>

                <Link
                  href={`/berita/${toBeritaSlug(item.judul, item.id)}`}
                  className='mt-4 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-500'>
                  Lihat Selengkapnya...
                </Link>
              </div>
            </div>
          ))}

          {beritaItems.length === 0 && (
            <div className='md:col-span-3 rounded-3xl border border-emerald-200 bg-white p-8 text-center text-emerald-900'>
              Berita belum tersedia.
            </div>
          )}
        </div>

        <div className='mt-10 text-center'>
          <Link
            href='/berita'
            className='inline-flex rounded-full bg-emerald-700 px-7 py-3 text-sm font-semibold text-white transition hover:bg-emerald-600'>
            Lihat Semua Berita
          </Link>
        </div>
      </div>
    </section>
  );
}
