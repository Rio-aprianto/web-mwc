import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  fromJenisKelamin,
  fromTriStatus,
  toJenisKelamin,
  toTriStatus,
} from "../../_utils/mappers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    nama?: string;
    ranting?: string;
    anggota?: string;
    jenisKelamin?: string;
    status?: string;
  };

  if (!body.nama || !body.ranting || !body.anggota || !body.jenisKelamin) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const updated = await prisma.kader.update({
    where: { id: Number(id) },
    data: {
      nama: body.nama.trim(),
      ranting: body.ranting,
      anggota: body.anggota,
      jenisKelamin: toJenisKelamin(body.jenisKelamin),
      status: toTriStatus(body.status ?? "Aktif"),
    },
  });

  return NextResponse.json({
    id: updated.id,
    nama: updated.nama,
    ranting: updated.ranting,
    anggota: updated.anggota,
    jenisKelamin: fromJenisKelamin(updated.jenisKelamin),
    status: fromTriStatus(updated.status),
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  await prisma.kader.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
