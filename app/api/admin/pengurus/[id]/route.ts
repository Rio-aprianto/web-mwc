import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { fromActiveStatus, toActiveStatus } from "../../_utils/mappers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    nama?: string;
    jabatan?: string;
    bidang?: string;
    periode?: string;
    nomorWa?: string;
    status?: string;
    fotoUrl?: string;
  };

  if (!body.nama || !body.jabatan || !body.bidang || !body.periode) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const updated = await prisma.pengurus.update({
    where: { id: Number(id) },
    data: {
      nama: body.nama.trim(),
      jabatan: body.jabatan.trim(),
      bidang: body.bidang.trim(),
      periode: body.periode.trim(),
      nomorWa: body.nomorWa?.trim() || null,
      status: toActiveStatus(body.status ?? "Aktif"),
      fotoUrl: body.fotoUrl || "https://i.pravatar.cc/120?img=1",
    },
  });

  return NextResponse.json({
    id: updated.id,
    nama: updated.nama,
    jabatan: updated.jabatan,
    bidang: updated.bidang,
    periode: updated.periode,
    nomorWa: updated.nomorWa ?? "",
    status: fromActiveStatus(updated.status),
    fotoUrl: updated.fotoUrl,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.pengurus.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
