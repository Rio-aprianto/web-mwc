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

  // PERBAIKAN 1: Casting 'as any' untuk menghindari overload error pada properti _count
  const kaderAktifObj = kaderStatusRaw.find(
    (item: any) => item.status === "Aktif",
  ) as any;
  const jumlahKaderAktif = kaderAktifObj?._count?._all ?? 0;

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

  // PERBAIKAN 2: Menggunakan tipe 'any' pada map data Banom
  const banomMemberCountMap = new Map(
    banomKaderRaw.map((item: any) => [item.anggota, item._count?._all ?? 0]),
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

  // PERBAIKAN 3: Menggunakan tipe 'any' pada map data Ranting (Menghilangkan error baris 203)
  const rantingKaderCountMap = new Map(
    rantingKaderRaw.map((item: any) => [item.ranting, item._count?._all ?? 0]),
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

  // PERBAIKAN 4: Menggunakan tipe 'any' pada reduce loop Gender untuk mencegah error bawaan prisma
  const genderCountMap = kaderGenderRaw.reduce(
    (accumulator: Record<"LakiLaki" | "Perempuan", number>, item: any) => {
      if (item.jenisKelamin) {
        accumulator[item.jenisKelamin as "LakiLaki" | "Perempuan"] =
          item._count?._all ?? 0;
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

      <section className='grid gap-4 md:grid-cols-2'>
        {/* Kolom Koin NU (Kiri) */}
        <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5 flex flex-col justify-between'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>
              Koin NU Per Bulan
            </h2>
            <p className='mt-1 text-sm text-slate-500'>
              Total perolehan kotak infaq Koin NU pada bulan {namaBulanSekarang}
              .
            </p>
            <div className='mt-8 mb-6 p-6 rounded-xl bg-emerald-50 border border-emerald-100 text-center'>
              <p className='text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1'>
                Perolehan Sekarang
              </p>
              <p className='text-4xl font-black text-slate-900'>
                {koinNuBulanIniFormatted}
              </p>
            </div>
          </div>

          <div className='space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-700'>
            <div className='flex items-center justify-between'>
              <span>Status Pengisian</span>
              <span className='font-semibold text-emerald-700'>Aktif</span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Total Pengisian</span>
              <span className='font-semibold text-slate-900'>
                {totalIsiKoinNuTable} Kali
              </span>
            </div>
          </div>
        </article>

        {/* Kolom Persentase Gender (Kanan) */}
        <article className='rounded-2xl border border-emerald-800 bg-emerald-900 p-5 text-white shadow-sm flex flex-col justify-between'>
          <div>
            <h2 className='text-lg font-semibold'>Persentase Gender Anggota</h2>
            <p className='mt-1 text-sm text-slate-300'>
              Persentase kader laki-laki dan perempuan.
            </p>

            <div className='mt-6 mb-6 grid place-items-center'>
              <div
                className='relative h-44 w-44 rounded-full'
                style={{
                  background: `conic-gradient(#34d399 0 ${malePct}%, #bbf7d0 ${malePct}% 100%)`,
                }}>
                <div className='absolute inset-5 grid place-items-center rounded-full bg-emerald-950 text-center'>
                  <p className='text-3xl font-bold'>{malePct}%</p>
                  <p className='mt-1 text-xs text-emerald-300'>Laki-laki</p>
                </div>
              </div>
            </div>
          </div>

          <div className='space-y-2 rounded-xl border border-white/10 bg-white/10 p-3 text-sm'>
            <div className='flex items-center justify-between'>
              <span>Laki-laki</span>
              <span className='font-semibold'>
                {genderCountMap.LakiLaki} ({malePct}%)
              </span>
            </div>
            <div className='flex items-center justify-between'>
              <span>Perempuan</span>
              <span className='font-semibold'>
                {genderCountMap.Perempuan} ({femalePct}%)
              </span>
            </div>
          </div>
        </article>
      </section>

      <section>
        <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
          <h2 className='text-lg font-semibold text-slate-900'>
            Statistik Kader Tiap Ranting
          </h2>
          <p className='mt-1 text-sm text-slate-500'>
            Data jumlah kader tiap ranting berdasarkan database.
          </p>

          <div className='mt-3 overflow-x-auto rounded-xl border border-emerald-100 bg-emerald-50 p-4'>
            <div className='min-w-200'>
              <div
                className='grid h-64 items-end gap-2'
                style={{
                  gridTemplateColumns: `repeat(${Math.max(rantingStats.length, 1)}, minmax(0, 1fr))`,
                }}>
                {rantingStats.length === 0 ? (
                  <div className='col-span-full flex items-center justify-center text-sm text-slate-500'>
                    Belum ada data ranting.
                  </div>
                ) : (
                  rantingStats.map((item) => (
                    <div
                      key={item.id}
                      className='flex flex-col items-center justify-end gap-2'>
                      <div
                        className='w-full rounded-md bg-emerald-500'
                        style={{
                          height: `${Math.max((item.kader / maxRantingKader) * 200, 20)}px`,
                        }}
                      />
                      <span className='text-[11px] font-semibold text-slate-700'>
                        {item.kader}
                      </span>
                      <span className='text-[10px] text-slate-500'>
                        {item.name}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
