import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { toBeritaSlug } from "@/lib/slug";

type BeritaDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const revalidate = 0;

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(value);
}

export default async function BeritaDetailPage({
  params,
}: BeritaDetailPageProps) {
  const { slug } = await params;
  const beritaItems = await prisma.berita.findMany({
    orderBy: { tanggalUpload: "desc" },
  });

  const berita = beritaItems.find(
    (item) => toBeritaSlug(item.judul, item.id) === slug,
  );

  if (!berita) {
    notFound();
  }

  return (
    <main className='min-h-screen bg-white py-14'>
      <div className='mx-auto max-w-4xl px-4'>
        <Link
          href='/berita'
          className='mb-6 inline-flex text-sm font-semibold text-emerald-700 transition hover:text-emerald-500'>
          &larr; Lihat Semua Berita
        </Link>

        <article className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm'>
          <img
            src={berita.imageUrl}
            alt={berita.judul}
            className='h-64 w-full object-cover md:h-80'
            loading='eager'
          />

          <div className='p-6 md:p-8'>
            <p className='mb-3 text-sm text-emerald-700'>
              {formatDate(berita.tanggalUpload)}
            </p>
            <h1 className='text-3xl font-bold text-emerald-900'>
              {berita.judul}
            </h1>
            <p className='mt-5 leading-8 text-emerald-950/85'>
              {berita.konten}
            </p>
          </div>
        </article>
      </div>
    </main>
  );
}
