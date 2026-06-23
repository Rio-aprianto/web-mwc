export type BeritaItem = {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  content: string;
  date: string;
};

export const beritaItems: BeritaItem[] = [
  {
    id: 1,
    slug: 'kegiatan-pengajian-rutin',
    title: 'Kegiatan Pengajian Rutin',
    excerpt: 'Kegiatan pengajian rutin MWC NU Karanganyar bersama masyarakat.',
    image: '/images/banner.jpg',
    content:
      'Kegiatan pengajian rutin diselenggarakan setiap pekan sebagai ruang silaturahmi dan penguatan pemahaman keislaman warga. Acara diisi dengan pembacaan kitab, tausiyah, serta diskusi keummatan yang relevan dengan kondisi masyarakat.',
    date: '13 Juni 2026',
  },
  {
    id: 2,
    slug: 'santunan-anak-yatim-mwc-nu',
    title: 'Santunan Anak Yatim MWC NU',
    excerpt:
      'Program santunan bulanan sebagai bentuk kepedulian sosial kepada anak yatim.',
    image: '/images/banner1.jpg',
    content:
      'Program santunan anak yatim dilaksanakan secara berkala untuk membantu kebutuhan pendidikan dan keseharian penerima manfaat. Kegiatan ini melibatkan kolaborasi pengurus, jamaah, dan donatur lokal.',
    date: '12 Juni 2026',
  },
  {
    id: 3,
    slug: 'pelatihan-literasi-digital-kader',
    title: 'Pelatihan Literasi Digital Kader',
    excerpt:
      'Penguatan kapasitas kader melalui pelatihan literasi digital dan media dakwah.',
    image: '/images/banner.jpg',
    content:
      'Pelatihan ini membekali kader dengan kemampuan membuat konten edukatif, mengelola kanal media sosial organisasi, dan menyampaikan dakwah yang relevan untuk generasi muda melalui media digital.',
    date: '10 Juni 2026',
  },
];
