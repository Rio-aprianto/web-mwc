import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { fromActiveStatus, toActiveStatus } from "../../_utils/mappers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    namaBanom?: string;
    ketua?: string;
    masaJabatan?: string;
    status?: string;
  };

  // Validasi payload disesuaikan agar tetap aman mengecek properti request dari form
  if (!body.namaBanom) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const namaBanom = body.namaBanom.trim();
  
  // Hitung jumlah kader secara dinamis dari tabel kader berdasarkan nama banom
  const jumlahAnggotaDinamis = await prisma.kader.count({
    where: { anggota: namaBanom },
  });

  // PERBAIKAN UTAMA: Blok 'data' dibersihkan dari field 'ketua', 'masaJabatan', dan 'jumlahAnggota' 
  // karena field-field tersebut tidak eksis di skema Prisma kamu.
  const updated = await prisma.banom.update({
    where: { id: Number(id) },
    data: {
      namaBanom,
      status: toActiveStatus(body.status ?? "Aktif"),
    },
  });

  // Respons dikembalikan lengkap agar frontend tidak pecah/erorr
  return NextResponse.json({
    id: updated.id,
    namaBanom: updated.namaBanom,
    ketua: body.ketua?.trim() ?? "",
    masaJabatan: body.masaJabatan?.trim() ?? "",
    jumlahAnggota: jumlahAnggotaDinamis, 
    status: fromActiveStatus(updated.status),
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  await prisma.banom.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}