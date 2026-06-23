import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type KoinNuPayload = {
  rantingId?: number;
  bulan?: number;
  tahun?: number;
  penanggungJawab?: string;
  jumlahKoinBulanIni?: number;
  jumlahKoinKeseluruhan?: number;
};

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isInvalidPayload(payload: KoinNuPayload) {
  return (
    !payload.rantingId ||
    !payload.bulan ||
    !payload.tahun ||
    !payload.penanggungJawab ||
    payload.jumlahKoinBulanIni === undefined ||
    payload.jumlahKoinKeseluruhan === undefined
  );
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as KoinNuPayload;

  if (isInvalidPayload(body)) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const updated = await prisma.koinNu.update({
    where: { id: Number(id) },
    data: {
      rantingId: Number(body.rantingId),
      bulan: Number(body.bulan),
      tahun: Number(body.tahun),
      penanggungJawab: String(body.penanggungJawab).trim(),
      jumlahKoinBulanIni: Number(body.jumlahKoinBulanIni),
      jumlahKoinKeseluruhan: Number(body.jumlahKoinKeseluruhan),
    },
    include: {
      ranting: {
        select: {
          namaRanting: true,
        },
      },
    },
  });

  return NextResponse.json({
    id: updated.id,
    rantingId: updated.rantingId,
    rantingNama: updated.ranting.namaRanting,
    bulan: updated.bulan,
    tahun: updated.tahun,
    penanggungJawab: updated.penanggungJawab,
    jumlahKoinBulanIni: updated.jumlahKoinBulanIni,
    jumlahKoinKeseluruhan: updated.jumlahKoinKeseluruhan,
    createdAt: updated.createdAt,
    updatedAt: updated.updatedAt,
  });
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.koinNu.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
