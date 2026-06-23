import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { fromActiveStatus, toActiveStatus } from "../_utils/mappers";

export async function GET() {
  const items = await prisma.banom.findMany({ orderBy: { id: "desc" } });
  const banomNames = items.map((item) => item.namaBanom);
  const kaderCounts =
    banomNames.length > 0
      ? await prisma.kader.groupBy({
          by: ["anggota"],
          where: { anggota: { in: banomNames } },
          _count: { _all: true },
        })
      : [];

  const jumlahAnggotaByBanom = new Map(
    kaderCounts.map((item) => [item.anggota, item._count._all]),
  );

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      namaBanom: item.namaBanom,
      jumlahAnggota: jumlahAnggotaByBanom.get(item.namaBanom) ?? 0,
      status: fromActiveStatus(item.status),
    })),
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    namaBanom?: string;
    status?: string;
  };

  // Validasi payload hanya untuk field yang benar-benar dikirim dari modal baru
  if (!body.namaBanom) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const namaBanom = body.namaBanom.trim();
  
  // Hitung jumlah kader secara dinamis dari tabel kader berdasarkan nama banom
  const jumlahAnggota = await prisma.kader.count({
    where: { anggota: namaBanom },
  });

  // Pembuatan data banom baru (Murni bersih dari ketua, masaJabatan, dan jumlahAnggota)
  const created = await prisma.banom.create({
    data: {
      namaBanom,
      status: toActiveStatus(body.status ?? "Aktif"),
    },
  });

  // Gabungkan properti database dengan hitungan dinamis untuk kebutuhan respons frontend
  return NextResponse.json(
    {
      id: created.id,
      namaBanom: created.namaBanom,
      jumlahAnggota, 
      status: fromActiveStatus(created.status),
    },
    { status: 201 },
  );
}