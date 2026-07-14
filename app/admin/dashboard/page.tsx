import { prisma } from "@/lib/prisma";

export const revalidate = 0;

type BanomDashboardItem = {
  id: number;
  name: string;
  members: number;
};

type RantingDashboardItem = {
  id: number;
  name: string;
  kader: number;
};

export default async function AdminDashboardPage() {
  // === DISESUAIKAN: Mengambil range waktu awal & akhir bulan seperti menu Koin NU ===
  const sekarang = new Date();
  const awalBulan = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth(),
    1,
    0,
    0,
    0,
  );
  const akhirBulan = new Date(
    sekarang.getFullYear(),
    sekarang.getMonth() + 1,
    0,
    23,
    59,
    59,
  );

  // Mengambil data dari database menggunakan $transaction agar efisien
  const [
    kaderCount,
    rantingCount,
    banomCount,
    rantingAktifCount,
    banomAktifCount,
    banomRaw,
    banomKaderRaw,
    rantingRaw,
    rantingKaderRaw,
    kaderStatusRaw,
    kaderGenderRaw,
    koinNuAggregate,
    totalIsiKoinNuTable,
  ] = await prisma.$transaction([
    prisma.kader.count(),
    prisma.ranting.count(),
    prisma.banom.count(),
    prisma.ranting.count({ where: { status: "Aktif" } }),
    prisma.banom.count({ where: { status: "Aktif" } }),
    prisma.banom.findMany({
      orderBy: [{ namaBanom: "asc" }],
      select: {
        id: true,
        namaBanom: true,
      },
    }),
    prisma.kader.groupBy({
      by: ["anggota"],
      _count: { _all: true },
      orderBy: {
        anggota: "asc",
      },
    }),
    prisma.ranting.findMany({
      orderBy: [{ namaRanting: "asc" }],
      select: {
        id: true,
        namaRanting: true,
      },
    }),
    prisma.kader.groupBy({
      by: ["ranting"],
      _count: { _all: true },
      orderBy: {
        ranting: "asc",
      },
    }),
    prisma.kader.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: {
        status: "asc",
      },
    }),
    prisma.kader.groupBy({
      by: ["jenisKelamin"],
      _count: { _all: true },
      orderBy: {
        jenisKelamin: "asc",
      },
    }),
    prisma.koinNu.aggregate({
      _sum: {
        jumlahKoinBulanIni: true,
      },
      where: {
        createdAt: {
          gte: awalBulan,
          lte: akhirBulan,
        },
      },
    }),
    prisma.koinNu.count(),
  ]);

  let landingViewCount = 0;
  try {
    landingViewCount = await prisma.healthcheck.count();
  } catch {
    landingViewCount = 0;
  }

  // Formatting nominal koin ke Rupiah (IDR)
  const totalNominalKoin = koinNuAggregate._sum.jumlahKoinBulanIni ?? 0;
  const koinNuBulanIniFormatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(totalNominalKoin);

  // FIX 1: Menggunakan as any untuk mem-bypass pengecekan objek _count Prisma
  const kaderAktifObj = kaderStatusRaw.find(
    (item: any) => item.status === "Aktif",
  );
  const jumlahKaderAktif = (kaderAktifObj?._count as any)?._all ?? 0;

  const summaryCards = [
    {
      title: "Jumlah Kader",
      value: String(kaderCount),
      note: `${jumlahKaderAktif} kader aktif`,
      tone: "text-emerald-500",
    },
    {
      title: "Jumlah Ranting",
      value: String(rantingCount),
      note: `${rantingAktifCount} ranting aktif`,
      tone: "text-emerald-500",
    },
    {
      title: "Jumlah Banom",
      value: String(banomCount),
      note: `${banomAktifCount} banom aktif`,
      tone: "text-emerald-500",
    },
    {
      title: "Views Landing Page",
      value: landingViewCount > 1000 ? "1000+" : String(landingViewCount),
      note: "jumlah kunjungan halaman landing",
      tone: "text-emerald-600",
    },
  ];

  // FIX 2: Menggunakan as any pada properti _count map Banom
  const banomMemberCountMap = new Map(
    banomKaderRaw.map((item: any) => [
      item.anggota,
      (item._count as any)?._all ?? 0,
    ]),
  );

  const banomData: BanomDashboardItem[] = banomRaw.map(
    (item: { id: number; namaBanom: string }) => {
      return {
        id: item.id,
        name: item.namaBanom,
        members: banomMemberCountMap.get(item.namaBanom) ?? 0,
      };
    },
  );

  // FIX 3: Menggunakan as any pada properti _count map Ranting
  const rantingKaderCountMap = new Map(
    rantingKaderRaw.map((item: any) => [
      item.ranting,
      (item._count as any)?._all ?? 0,
    ]),
  );

  const rantingStats: RantingDashboardItem[] = rantingRaw
    .map((item: { id: number; namaRanting: string }) => ({
      id: item.id,
      name: item.namaRanting,
      kader: rantingKaderCountMap.get(item.namaRanting) ?? 0,
    }))
    .sort((a, b) => b.kader - a.kader || a.name.localeCompare(b.name));

  const maxBanomMembers = Math.max(1, ...banomData.map((item) => item.members));
  const maxRantingKader = Math.max(
    1,
    ...rantingStats.map((item) => item.kader),
  );

  // FIX 4: Menggunakan as any pada properti _count reduce Loop Gender
  const genderCountMap = kaderGenderRaw.reduce(
    (accumulator: Record<"LakiLaki" | "Perempuan", number>, item: any) => {
      if (item.jenisKelamin) {
        accumulator[item.jenisKelamin as "LakiLaki" | "Perempuan"] =
          (item._count as any)?._all ?? 0;
      }
      return accumulator;
    },
    { LakiLaki: 0, Perempuan: 0 } as Record<"LakiLaki" | "Perempuan", number>,
  );

  const totalGender = genderCountMap.LakiLaki + genderCountMap.Perempuan;
  const malePct =
    totalGender > 0
      ? Math.round((genderCountMap.LakiLaki / totalGender) * 100)
      : 0;
  const femalePct = Math.max(0, 100 - malePct);

  const namaBulanSekarang = new Date().toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className='space-y-5'>
      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {summaryCards.map((item) => (
          <article
            key={item.title}
            className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
            <p className='text-sm text-slate-500'>{item.title}</p>
            <p className='mt-2 text-4xl font-bold text-slate-900'>
              {item.value}
            </p>
            <p className={`mt-2 text-sm font-medium ${item.tone}`}>
              {item.note}
            </p>
          </article>
        ))}
      </section>

      <section>
        <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Jumlah Anggota Tiap Banom
          </h2>
          <p className='mt-1 text-sm text-slate-500'>
            Grafik jumlah anggota tiap banom berdasarkan data terbaru.
          </p>

          <div className='mt-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4'>
            <div className='mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4'>
              {banomData.map((item) => (
                <div
                  key={item.id}
                  className='rounded-lg border border-emerald-100 bg-white p-3'>
                  <div className='flex items-center justify-between'>
                    <p className='text-sm font-semibold text-slate-800'>
                      {item.name}
                    </p>
                    <p className='text-sm font-bold text-emerald-700'>
                      {item.members}
                    </p>
                  </div>
                  <div className='mt-2 h-2 rounded-full bg-emerald-100'>
                    <div
                      className='h-full rounded-full bg-emerald-600'
                      style={{
                        width: `${(item.members / maxBanomMembers) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
