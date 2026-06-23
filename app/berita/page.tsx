import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { toBeritaSlug } from "@/lib/slug";

export const revalidate = 0;

function truncateWords(text: string, maxWords: number) {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) {
    return text;
  }

  return `${words.slice(0, maxWords).join(" ")}...`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default async function SemuaBeritaPage() {
  const beritaItems = await prisma.berita.findMany({
    orderBy: { tanggalUpload: "desc" },
  });

  return (
    <main className='bg-white py-16'>
      <section className='mx-auto max-w-6xl px-4'>
        <div className='mb-6 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-emerald-900'>Semua Berita</h1>
          <Link
            href='/'
            className='text-sm font-semibold text-emerald-700 transition hover:text-emerald-500'>
            &larr; Kembali ke Beranda
          </Link>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {beritaItems.map((item) => (
            <article
              key={item.id}
              className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm'>
              <img
                src={item.imageUrl}
                alt={item.judul}
                className='h-52 w-full object-cover'
                loading='lazy'
              />

              <div className='p-5'>
                <p className='mb-2 text-sm text-emerald-700'>
                  {formatDate(item.tanggalUpload)}
                </p>
                <h2 className='text-xl font-bold text-emerald-900'>
                  {item.judul}
                </h2>
                <p className='mt-2 text-emerald-950/75'>
                  {truncateWords(item.konten, 24)}
                </p>
                <Link
                  href={`/berita/${toBeritaSlug(item.judul, item.id)}`}
                  className='mt-3 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-500'>
                  Lihat Selengkapnya...
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
