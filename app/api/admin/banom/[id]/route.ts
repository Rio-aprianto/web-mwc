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

  if (!body.namaBanom || !body.ketua || !body.masaJabatan) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const namaBanom = body.namaBanom.trim();
  const jumlahAnggota = await prisma.kader.count({
    where: { anggota: namaBanom },
  });

  const updated = await prisma.banom.update({
    where: { id: Number(id) },
    data: {
      namaBanom,
      ketua: body.ketua.trim(),
      masaJabatan: body.masaJabatan.trim(),
      jumlahAnggota,
      status: toActiveStatus(body.status ?? "Aktif"),
    },
  });

  return NextResponse.json({
    id: updated.id,
    namaBanom: updated.namaBanom,
    ketua: updated.ketua,
    masaJabatan: updated.masaJabatan,
    jumlahAnggota: updated.jumlahAnggota,
    status: fromActiveStatus(updated.status),
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  await prisma.banom.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
