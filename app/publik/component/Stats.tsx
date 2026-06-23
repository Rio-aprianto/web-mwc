type StatsProps = {
  rantingCount: number;
  banomCount: number;
  kaderCount: number;
  viewCount: number;
};

export default function Stats({
  rantingCount,
  banomCount,
  kaderCount,
  viewCount,
}: StatsProps) {
  const stats = [
    {
      value: rantingCount.toLocaleString("id-ID"),
      title: "Ranting",
    },
    {
      value: banomCount.toLocaleString("id-ID"),
      title: "Banom",
    },
    {
      value: kaderCount.toLocaleString("id-ID"),
      title: "Kader",
    },
    {
      value: `${viewCount.toLocaleString("id-ID")}+`,
      title: "Views",
    },
  ];

  return (
    <section className='relative z-20 -mt-24 pb-10 md:-mt-28'>
      <div className='w-full'>
        <div className='overflow-hidden border border-white/20 bg-emerald-900/55 shadow-2xl shadow-emerald-950/35 backdrop-blur-md'>
          <div className='grid grid-cols-2 md:grid-cols-4'>
            {stats.map((item) => (
              <div
                key={item.title}
                className='flex min-h-28 flex-col items-center justify-center gap-1 border border-white/10 px-4 py-6 text-center text-white/95 transition hover:bg-emerald-400/15 md:min-h-32 md:px-3 md:py-7'>
                <h3 className='text-3xl font-bold leading-none md:text-4xl'>
                  {item.value}
                </h3>
                <p className='text-sm font-semibold tracking-wide md:text-base'>
                  {item.title}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
