import {
  PrismaClient,
  ActiveStatus,
  JenisKelamin,
  PenggunaRole,
  TriStatus,
} from "@prisma/client";
import { createHash } from "crypto";

const prisma = new PrismaClient();

function hashPassword(password) {
  return createHash("sha256").update(password).digest("hex");
}

async function seedRanting() {
  const data = [
    { namaRanting: "Ranting Utara", status: TriStatus.Aktif, jumlahKader: 26 },
    { namaRanting: "Ranting Timur", status: TriStatus.Aktif, jumlahKader: 18 },
    { namaRanting: "Ranting Selatan", status: TriStatus.Aktif, jumlahKader: 22 },
    { namaRanting: "Ranting Barat", status: TriStatus.Pembinaan, jumlahKader: 14 },
  ];

  for (const item of data) {
    await prisma.ranting.upsert({
      where: { namaRanting: item.namaRanting },
      update: item,
      create: item,
    });
  }
}

async function seedBanom() {
  const data = [
    { namaBanom: "Pemuda", ketua: "Ahmad Fajar", masaJabatan: "2025-2030", jumlahAnggota: 42, status: ActiveStatus.Aktif },
    { namaBanom: "Perempuan", ketua: "Siti Halimah", masaJabatan: "2025-2030", jumlahAnggota: 36, status: ActiveStatus.Aktif },
    { namaBanom: "Pelajar", ketua: "Rizky Maulana", masaJabatan: "2025-2030", jumlahAnggota: 51, status: ActiveStatus.Aktif },
    { namaBanom: "Kesehatan", ketua: "Nisa Rahma", masaJabatan: "2024-2029", jumlahAnggota: 19, status: ActiveStatus.Nonaktif },
  ];

  for (const item of data) {
    await prisma.banom.upsert({
      where: { namaBanom: item.namaBanom },
      update: item,
      create: item,
    });
  }
}

async function seedKader() {
  const data = [
    { nama: "Ahmad Fauzi", ranting: "Ranting Utara", anggota: "Pemuda", jenisKelamin: JenisKelamin.LakiLaki, status: TriStatus.Aktif },
    { nama: "Siti Aminah", ranting: "Ranting Selatan", anggota: "Perempuan", jenisKelamin: JenisKelamin.Perempuan, status: TriStatus.Aktif },
    { nama: "Rizky Pratama", ranting: "Ranting Timur", anggota: "Pelajar", jenisKelamin: JenisKelamin.LakiLaki, status: TriStatus.Aktif },
    { nama: "Nisa Rahma", ranting: "Ranting Barat", anggota: "Kesehatan", jenisKelamin: JenisKelamin.Perempuan, status: TriStatus.Pembinaan },
  ];

  const count = await prisma.kader.count();
  if (count > 0) return;

  await prisma.kader.createMany({ data });
}

async function seedPengguna() {
  const data = [
    {
      nama: "Muhammad Umar",
      role: PenggunaRole.SuperAdmin,
      email: "umar@organisasi.id",
      passwordHash: hashPassword("password123"),
      status: ActiveStatus.Aktif,
    },
    {
      nama: "Nabila Aulia",
      role: PenggunaRole.EditorKonten,
      email: "nabila@organisasi.id",
      passwordHash: hashPassword("password123"),
      status: ActiveStatus.Aktif,
    },
  ];

  for (const item of data) {
    await prisma.pengguna.upsert({
      where: { email: item.email },
      update: item,
      create: item,
    });
  }
}

async function seedPengurus() {
  const data = [
    {
      nama: "Ahmad Mulyana",
      jabatan: "Ketua",
      bidang: "Pimpinan Harian",
      periode: "2025-2030",
      status: ActiveStatus.Aktif,
      fotoUrl: "https://i.pravatar.cc/120?img=12",
    },
    {
      nama: "Nur Aisyah",
      jabatan: "Sekretaris",
      bidang: "Administrasi",
      periode: "2025-2030",
      status: ActiveStatus.Aktif,
      fotoUrl: "https://i.pravatar.cc/120?img=47",
    },
  ];

  const count = await prisma.pengurus.count();
  if (count > 0) return;

  await prisma.pengurus.createMany({ data });
}

async function seedBerita() {
  const data = [
    {
      imageUrl: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=960&q=80",
      judul: "Kegiatan Santunan Anak Yatim",
      konten: "Kegiatan santunan berlangsung bersama pengurus dan warga sekitar dengan agenda doa serta penyerahan bantuan.",
      tanggalUpload: new Date("2026-06-10"),
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=960&q=80",
      judul: "Pelatihan Literasi Digital Kader",
      konten: "Pelatihan difokuskan pada kemampuan produksi konten edukasi dan strategi publikasi informasi organisasi.",
      tanggalUpload: new Date("2026-06-05"),
    },
  ];

  const count = await prisma.berita.count();
  if (count > 0) return;

  await prisma.berita.createMany({ data });
}

async function seedBanner() {
  const data = [
    {
      imageUrl: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=960&q=80",
      keterangan: "Banner utama kegiatan sosial untuk halaman beranda.",
    },
    {
      imageUrl: "https://images.unsplash.com/photo-1515169067868-5387ec356754?auto=format&fit=crop&w=960&q=80",
      keterangan: "Banner promosi program kaderisasi periode terbaru.",
    },
  ];

  const count = await prisma.bannerImage.count();
  if (count > 0) return;

  await prisma.bannerImage.createMany({ data });
}

async function seedSambutan() {
  const count = await prisma.sambutanKetua.count();
  if (count > 0) return;

  await prisma.sambutanKetua.create({
    data: {
      title: "Sambutan Ketua Cabang",
      namaKetua: "Drs. Ahmad Mulyana",
      isi: "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di website resmi kami. Semoga informasi yang disajikan dapat memperkuat silaturahmi, memperluas manfaat, dan menjadi sarana pelayanan untuk umat.",
      imageUrl: "/images/ketua_mwc1.png",
    },
  });
}

async function main() {
  await seedRanting();
  await seedBanom();
  await seedKader();
  await seedPengguna();
  await seedPengurus();
  await seedBerita();
  await seedBanner();
  await seedSambutan();
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed selesai.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
