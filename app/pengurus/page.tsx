import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const revalidate = 0;

function toWhatsAppLink(phone: string | null) {
  if (!phone) return null;

  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;

  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

export default async function SemuaPengurusPage() {
  const pengurusItems = (await prisma.pengurus.findMany({
    orderBy: { id: "asc" },
  })) as Array<{
    id: number;
    nama: string;
    jabatan: string;
    periode: string;
    fotoUrl: string;
    nomorWa?: string | null;
  }>;

  return (
    <main className='bg-white py-16'>
      <section className='mx-auto max-w-6xl px-4'>
        <div className='mb-8 flex items-center justify-between'>
          <h1 className='text-3xl font-bold text-emerald-900'>
            Pengurus MWC NU Karanganyar
          </h1>
          <Link
            href='/'
            className='text-sm font-semibold text-emerald-700 transition hover:text-emerald-500'>
            &larr; Kembali ke Beranda
          </Link>
        </div>

        <div className='grid gap-6 sm:grid-cols-2 xl:grid-cols-3'>
          {pengurusItems.map((member) => (
            <div
              key={member.id}
              className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm'>
              <div className='relative h-56 w-full bg-slate-200'>
                <Image
                  src={member.fotoUrl}
                  alt={member.nama}
                  fill
                  sizes='(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw'
                  className='object-contain p-4'
                />
              </div>

              <div className='p-5 text-center'>
                <h2 className='text-lg font-bold text-emerald-900'>
                  {member.nama}
                </h2>
                <p className='mt-1 text-sm font-medium text-emerald-700'>
                  {member.jabatan}
                </p>
                <p className='mt-1 text-xs text-slate-500'>
                  Periode {member.periode}
                </p>

                {member.nomorWa ? (
                  <a
                    href={toWhatsAppLink(member.nomorWa) ?? "#"}
                    target='_blank'
                    rel='noreferrer'
                    className='mt-4 inline-flex rounded-full border border-emerald-300 px-4 py-2 text-xs font-semibold tracking-[0.08em] text-emerald-700 transition hover:bg-emerald-50'>
                    Hubungi WA
                  </a>
                ) : (
                  <p className='mt-4 text-xs text-slate-500'>
                    Nomor WA belum tersedia
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
