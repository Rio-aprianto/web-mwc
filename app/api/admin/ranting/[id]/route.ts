import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { fromTriStatus, toTriStatus } from "../../_utils/mappers";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    namaRanting?: string;
    status?: string;
  };

  if (!body.namaRanting) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const namaRanting = body.namaRanting.trim();
  const jumlahKader = await prisma.kader.count({
    where: { ranting: namaRanting },
  });

  const updated = await prisma.ranting.update({
    where: { id: Number(id) },
    data: {
      namaRanting,
      status: toTriStatus(body.status ?? "Aktif"),
      jumlahKader,
    },
  });

  return NextResponse.json({
    id: updated.id,
    namaRanting: updated.namaRanting,
    status: fromTriStatus(updated.status),
    jumlahKader: updated.jumlahKader,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.ranting.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
