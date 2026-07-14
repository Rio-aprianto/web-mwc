"use client";

import Image from "next/image";
import { useEffect, useState, useRef, useCallback, useMemo } from "react";

type ProgramDonasi = {
  title: string;
  description: string;
};

type MemberInput = {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string | null;
  fotoUrl: string;
  nomorWa: string | null;
};

type ManagementMember = {
  id: number;
  name: string;
  position: string;
  bidang: string;
  image: string;
  waLink: string | null;
};

const lazisnuPrograms: ProgramDonasi[] = [
  {
    title: "Santunan Anak Yatim",
    description:
      "Dukungan biaya sekolah, kebutuhan harian, dan pendampingan rutin untuk anak yatim di wilayah MWC.",
  },
  {
    title: "Beasiswa Santri dan Pelajar",
    description:
      "Program beasiswa untuk santri berprestasi dan pelajar dari keluarga dhuafa agar tetap melanjutkan pendidikan.",
  },
  {
    title: "Bantuan Kesehatan Umat",
    description:
      "Bantuan obat, transport berobat, dan aksi kemanusiaan untuk warga yang membutuhkan penanganan cepat.",
  },
];

function toWhatsAppLink(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, "");
  if (!digits) return null;
  const normalized = digits.startsWith("0") ? `62${digits.slice(1)}` : digits;
  return `https://wa.me/${normalized}`;
}

export default function Programs({
  initialMembers = [],
}: {
  initialMembers?: MemberInput[];
}) {
  const management = useMemo<ManagementMember[]>(
    () =>
      (initialMembers ?? []).map((member) => ({
        id: member.id,
        name: member.nama,
        position: member.jabatan,
        bidang: member.bidang || "MWC NU",
        image: member.fotoUrl || "/images/ketua_mwc.png",
        waLink: toWhatsAppLink(member.nomorWa),
      })),
    [initialMembers],
  );
  const [currentIndex, setCurrentIndex] = useState(() => management.length);
  const [translate, setTranslate] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  const extendedMembers = [...management, ...management, ...management];

  // Responsif: jumlah card yang terlihat
  const getVisibleCards = () => {
    if (typeof window === "undefined") return 3;
    const width = window.innerWidth;
    if (width < 640) return 1; // Mobile
    if (width < 1024) return 2; // Tablet
    return 3; // Desktop
  };

  const [visibleCards, setVisibleCards] = useState(3);

  useEffect(() => {
    const handleResize = () => setVisibleCards(getVisibleCards());
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const shiftIndex = useCallback((delta: number) => {
    setCurrentIndex((prev) => {
      const total = management.length;
      if (total === 0) return prev;
      let next = prev + delta;
      if (next >= total * 2) next -= total;
      else if (next < total) next += total;
      return next;
    });
  }, [management.length]);

  // Auto Play
  useEffect(() => {
    if (management.length === 0) return;
    const interval = setInterval(() => {
      shiftIndex(1);
    }, 3200);
    return () => clearInterval(interval);
  }, [management.length, shiftIndex]);

  const cardWidth = 100 / visibleCards;
  const finalTranslate = -(currentIndex * cardWidth) + translate;

  // ==================== DRAG LOGIC ====================
  const handleStart = useCallback((clientX: number) => {
    setIsDragging(true);
    setStartX(clientX);
    setTranslate(0);
  }, []);

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging) return;
      const diff = clientX - startX;
      setTranslate(diff * 0.85); // Sensitivity yang lebih natural
    },
    [isDragging, startX],
  );

  const handleEnd = useCallback(() => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 60; // px
    if (translate > threshold) {
      shiftIndex(-1);
    } else if (translate < -threshold) {
      shiftIndex(1);
    }
    setTranslate(0);
  }, [translate, shiftIndex]);

  return (
    <>
      <section
        className='relative overflow-hidden bg-cover bg-center py-20 text-white'
        style={{
          backgroundImage:
            "linear-gradient(135deg, rgba(3, 37, 24, 0.92), rgba(5, 60, 40, 0.82))",
        }}>
        <div className='mx-auto w-full overflow-hidden'>
          <h2 className='mb-4 text-center text-3xl font-bold tracking-tight text-emerald-50 md:text-4xl'>
            Ketua Banom MWC NU Karanganyar
          </h2>
          <p className='mb-12 text-center text-sm text-emerald-200/70'></p>

          {management.length > 0 ? (
            <div className='relative mx-auto max-w-7xl px-4'>
              <div
                className='overflow-hidden touch-pan-y'
                onMouseDown={(e) => handleStart(e.clientX)}
                onMouseMove={(e) => handleMove(e.clientX)}
                onMouseUp={handleEnd}
                onMouseLeave={handleEnd}
                onTouchStart={(e) => handleStart(e.touches[0].clientX)}
                onTouchMove={(e) => handleMove(e.touches[0].clientX)}
                onTouchEnd={handleEnd}>
                <div
                  ref={sliderRef}
                  className='flex transition-transform duration-700 ease-out'
                  style={{ transform: `translateX(${finalTranslate}%)` }}>
                  {extendedMembers.map((member, idx) => {
                    const isCenter =
                      idx === currentIndex + Math.floor(visibleCards / 2);

                    return (
                      <div
                        key={`${member.id}-${idx}`}
                        className='flex-shrink-0 px-2 md:px-4'
                        style={{ width: `${cardWidth}%` }}>
                        <div
                          className={`w-full overflow-hidden rounded-3xl border border-white/10 bg-white/10 p-6 text-center shadow-xl backdrop-blur-sm h-full flex flex-col justify-between transition-all duration-700 ${
                            isCenter
                              ? "sm:scale-110 bg-white/20 shadow-2xl z-20"
                              : "sm:scale-95 opacity-75 hover:opacity-90"
                          }`}>
                          <div>
                            <div className='mx-auto relative h-36 w-36 overflow-hidden rounded-full border-4 border-emerald-400/50 bg-emerald-50/10 shadow-inner'>
                              <Image
                                src={member.image}
                                alt={member.name}
                                fill
                                sizes='144px'
                                className='object-cover'
                              />
                            </div>

                            <div className='mt-5'>
                              <h3 className='line-clamp-1 text-lg font-bold text-white'>
                                {member.name}
                              </h3>
                              <p className='mt-1 text-sm font-semibold uppercase tracking-wider text-emerald-300'>
                                {member.position}
                              </p>
                              <span className='mt-3 inline-block rounded-full bg-emerald-500/20 px-4 py-1 text-xs font-medium uppercase tracking-widest text-emerald-200 border border-emerald-500/30'>
                                {member.bidang}
                              </span>
                            </div>
                          </div>

                          <div className='mt-6'>
                            {member.waLink ? (
                              <a
                                href={member.waLink}
                                target='_blank'
                                rel='noreferrer'
                                className='inline-flex w-full justify-center rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-400 active:scale-95 transition'>
                                Hubungi WA
                              </a>
                            ) : (
                              <button
                                disabled
                                className='w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm text-white/40 cursor-not-allowed'>
                                No WA Kosong
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className='text-center py-12 text-emerald-200/70'>
              Data pengurus belum tersedia.
            </div>
          )}
        </div>
      </section>

      {/* SECTION 2: PROGRAM LAZISNU */}
      <section className='bg-white py-24 text-slate-800'>
        <div className='mx-auto max-w-6xl px-4'>
          <div className='grid gap-8 rounded-3xl border border-slate-100 bg-slate-50/50 p-6 md:grid-cols-[1.25fr_0.75fr] md:p-10 shadow-sm'>
            {/* Bagian Kiri: List Program */}
            <div>
              <h3 className='text-2xl font-bold tracking-tight text-emerald-900 md:text-3xl'>
                Program Lazisnu MWC Untuk Umat
              </h3>
              <p className='mt-3 max-w-2xl text-sm leading-relaxed text-slate-600'>
                Salurkan donasi terbaik untuk menguatkan gerakan sosial MWC.
                Program dirancang agar manfaat langsung dirasakan masyarakat,
                terutama keluarga dhuafa, anak yatim, dan warga sakit.
              </p>

              <div className='mt-8 grid gap-4'>
                {lazisnuPrograms.map((program) => (
                  <div
                    key={program.title}
                    className='group rounded-2xl border border-emerald-600/10 bg-emerald-500/[0.04] p-5 transition hover:bg-emerald-500/[0.08] hover:border-emerald-600/20'>
                    <h4 className='text-sm font-bold tracking-wider text-emerald-800 uppercase'>
                      {program.title}
                    </h4>
                    <p className='mt-2 text-sm leading-relaxed text-slate-600'>
                      {program.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bagian Kanan: Rekening Donasi BRI */}
            <div className='flex flex-col justify-between rounded-2xl border border-emerald-600/10 bg-emerald-500/[0.06] p-6 text-center'>
              <div>
                <p className='text-xs font-bold tracking-widest text-emerald-800 uppercase'>
                  Donasi via Transfer BRI
                </p>

                {/* Logo BRI */}
                <div className='mx-auto mt-4 w-fit rounded-2xl bg-white p-4 shadow-md shadow-emerald-900/5'>
                  <Image
                    src='/images/logo-bri.png' // Ganti dengan path logo BRI Anda
                    alt='Logo BRI'
                    width={180}
                    height={80}
                    className='mx-auto'
                  />
                </div>

                {/* Nomor Rekening */}
                <div className='mt-5'>
                  <p className='text-sm text-slate-600 mb-2'>Nomor Rekening</p>
                  <div className='flex items-center justify-center gap-3 bg-white rounded-xl p-4 border border-slate-200'>
                    <code className='font-mono text-lg font-semibold text-emerald-700'>
                      3691-01-056895-53-0
                    </code>

                    <button
                      onClick={() => {
                        const rekening = "369101056895530"; // tanpa strip
                        navigator.clipboard.writeText(rekening);
                        alert("Nomor rekening berhasil disalin!");
                      }}
                      className='rounded-lg bg-emerald-100 p-2 text-emerald-700 hover:bg-emerald-200 transition active:scale-95'
                      title='Salin nomor rekening'>
                      📋
                    </button>
                  </div>
                  <p className='mt-3 text-xs leading-relaxed text-slate-600 px-2'>
                    Transfer ke rekening di atas, kemudian lakukan konfirmasi ke
                    admin Lazisnu melalui WhatsApp.
                  </p>
                </div>
              </div>

              <div className='mt-6'>
                <a
                  href='https://wa.me/6281548076345?text=Assalamu%27alaikum%2C%20saya%20ingin%20berdonasi%20untuk%20program%20Lazisnu%20MWC%20Karanganyar.'
                  target='_blank'
                  rel='noreferrer'
                  className='inline-flex w-full justify-center rounded-full bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-700/20 transition hover:bg-emerald-500 active:scale-95'>
                  Konfirmasi Donasi
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
