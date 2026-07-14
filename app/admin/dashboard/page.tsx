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
  ] = await prisma.$transaction([
    prisma.kader.count(),
    prisma.ranting.count(),
    prisma.banom.count(),
    prisma.ranting.count({ where: { status: "Aktif" } }),
    prisma.banom.count({ where: { status: "Aktif" } }),
    prisma.banom.findMany({
      orderBy: [{ namaBanom: "asc" }],
      select: { id: true, namaBanom: true },
    }),
    prisma.kader.groupBy({
      by: ["anggota"],
      _count: { _all: true },
      orderBy: { anggota: "asc" },
    }),
    prisma.ranting.findMany({
      orderBy: [{ namaRanting: "asc" }],
      select: { id: true, namaRanting: true },
    }),
    prisma.kader.groupBy({
      by: ["ranting"],
      _count: { _all: true },
      orderBy: { ranting: "asc" },
    }),
    prisma.kader.groupBy({
      by: ["status"],
      _count: { _all: true },
      orderBy: { status: "asc" },
    }),
    prisma.kader.groupBy({
      by: ["jenisKelamin"],
      _count: { _all: true },
      orderBy: { jenisKelamin: "asc" },
    }),
    prisma.koinNu.aggregate({
      _sum: { jumlahKoinBulanIni: true },
      where: {
        createdAt: { gte: awalBulan, lte: akhirBulan },
      },
    }),
  ]);

  const totalKoinNu = koinNuAggregate._sum.jumlahKoinBulanIni ?? 0;
  const koinNuBulanIniFormatted = new Intl.NumberFormat("id-ID").format(
    totalKoinNu,
  );

  const namaBulanSekarang = new Date().toLocaleString("id-ID", {
    month: "long",
    year: "numeric",
  });

  // Type safety
  const kaderStatusTyped = kaderStatusRaw as unknown as Array<{
    status: string;
    _count: { _all: number };
  }>;
  const jumlahKaderAktif =
    kaderStatusTyped.find((item) => item.status === "Aktif")?._count._all ?? 0;

  const summaryCards = [
    {
      title: "Jumlah Kader",
      value: String(kaderCount),
      note: `${jumlahKaderAktif} kader aktif`,
      bg: "bg-emerald-600",
      text: "text-white",
      border: "border-emerald-500",
      accent: "text-emerald-100",
    },
    {
      title: "Jumlah Ranting",
      value: String(rantingCount),
      note: `${rantingAktifCount} ranting aktif`,
      bg: "bg-blue-600",
      text: "text-white",
      border: "border-blue-500",
      accent: "text-blue-100",
    },
    {
      title: "Jumlah Banom",
      value: String(banomCount),
      note: `${banomAktifCount} banom aktif`,
      bg: "bg-violet-600",
      text: "text-white",
      border: "border-violet-500",
      accent: "text-violet-100",
    },
    {
      title: "Jumlah Koin NU Bulan Ini",
      value: koinNuBulanIniFormatted,
      note: `Koin NU bulan ${namaBulanSekarang}`,
      bg: "bg-orange-600",
      text: "text-white",
      border: "border-orange-500",
      accent: "text-orange-100",
    },
  ];

  // Banom Data
  const banomKaderTyped = banomKaderRaw as unknown as Array<{
    anggota: string;
    _count: { _all: number };
  }>;
  const banomMemberCountMap = new Map(
    banomKaderTyped.map((item) => [item.anggota, item._count._all]),
  );

  const banomData: BanomDashboardItem[] = banomRaw.map(
    (item: { id: number; namaBanom: string }) => ({
      id: item.id,
      name: item.namaBanom,
      members: banomMemberCountMap.get(item.namaBanom) ?? 0,
    }),
  );

  // Ranting Data
  const rantingKaderTyped = rantingKaderRaw as unknown as Array<{
    ranting: string;
    _count: { _all: number };
  }>;
  const rantingKaderCountMap = new Map(
    rantingKaderTyped.map((item) => [item.ranting, item._count._all]),
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

  // Gender Data
  const kaderGenderTyped = kaderGenderRaw as unknown as Array<{
    jenisKelamin: string;
    _count: { _all: number };
  }>;
  const genderCountMap = kaderGenderTyped.reduce(
    (acc: Record<"LakiLaki" | "Perempuan", number>, item) => {
      if (item.jenisKelamin) {
        acc[item.jenisKelamin as "LakiLaki" | "Perempuan"] = item._count._all;
      }
      return acc;
    },
    { LakiLaki: 0, Perempuan: 0 },
  );

  const totalGender = genderCountMap.LakiLaki + genderCountMap.Perempuan;
  const malePct =
    totalGender > 0
      ? Math.round((genderCountMap.LakiLaki / totalGender) * 100)
      : 0;
  const femalePct = Math.max(0, 100 - malePct);

  const pieRadius = 60;
  const pieCircumference = 2 * Math.PI * pieRadius;
  const maleLength = (malePct / 100) * pieCircumference;
  const femaleLength = (femalePct / 100) * pieCircumference;

  return (
    <div className='space-y-5'>
      {/* Summary Cards - Ukuran lebih kecil */}
      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        {summaryCards.map((item) => (
          <article
            key={item.title}
            className={`rounded-2xl border ${item.border} ${item.bg} p-5 shadow-sm transition-all hover:shadow-md h-full`}>
            <p className={`text-sm opacity-90 ${item.text}`}>{item.title}</p>
            <p className={`mt-2 text-4xl font-bold ${item.text}`}>
              {item.value}
            </p>
            <p className={`mt-2 text-xs font-medium ${item.accent}`}>
              {item.note}
            </p>
          </article>
        ))}
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        {/* Banom Section */}
        <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm lg:col-span-2'>
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

        {/* Pie Chart Section */}
        <article className='rounded-2xl border border-pink-100 bg-white p-5 shadow-sm'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Presentase Kader
          </h2>
          <p className='mt-1 text-sm text-slate-500'>
            Perbandingan kader laki-laki dan perempuan.
          </p>

          <div className='mt-4 flex flex-col items-center gap-4'>
            <div className='relative h-44 w-44'>
              <svg
                viewBox='0 0 160 160'
                className='h-full w-full -rotate-90'
                role='img'
                aria-label='Pie chart presentase kader laki-laki dan perempuan'>
                <circle
                  cx='80'
                  cy='80'
                  r={pieRadius}
                  fill='none'
                  stroke='#f1f5f9'
                  strokeWidth='24'
                />
                <circle
                  cx='80'
                  cy='80'
                  r={pieRadius}
                  fill='none'
                  stroke='#3b82f6'
                  strokeWidth='24'
                  strokeDasharray={`${maleLength} ${pieCircumference - maleLength}`}
                  strokeDashoffset='0'
                />
                <circle
                  cx='80'
                  cy='80'
                  r={pieRadius}
                  fill='none'
                  stroke='#ec4899'
                  strokeWidth='24'
                  strokeDasharray={`${femaleLength} ${pieCircumference - femaleLength}`}
                  strokeDashoffset={-maleLength}
                />
              </svg>
              <div className='absolute inset-0 flex flex-col items-center justify-center'>
                <span className='text-2xl font-bold text-slate-900'>
                  {totalGender}
                </span>
                <span className='text-xs text-slate-500'>kader</span>
              </div>
            </div>

            <div className='w-full space-y-2'>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2 text-slate-600'>
                  <span className='inline-block h-3 w-3 rounded-full bg-blue-500' />
                  Laki-laki
                </span>
                <span className='font-semibold text-slate-800'>{malePct}%</span>
              </div>
              <div className='flex items-center justify-between text-sm'>
                <span className='flex items-center gap-2 text-slate-600'>
                  <span className='inline-block h-3 w-3 rounded-full bg-pink-500' />
                  Perempuan
                </span>
                <span className='font-semibold text-slate-800'>
                  {femalePct}%
                </span>
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
