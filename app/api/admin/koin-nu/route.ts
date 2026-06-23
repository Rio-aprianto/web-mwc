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

export async function GET() {
  const items = await prisma.koinNu.findMany({
    orderBy: [{ tahun: "desc" }, { bulan: "desc" }, { id: "desc" }],
    include: {
      ranting: {
        select: {
          id: true,
          namaRanting: true,
        },
      },
    },
  });

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      rantingId: item.rantingId,
      rantingNama: item.ranting.namaRanting,
      bulan: item.bulan,
      tahun: item.tahun,
      penanggungJawab: item.penanggungJawab,
      jumlahKoinBulanIni: item.jumlahKoinBulanIni,
      jumlahKoinKeseluruhan: item.jumlahKoinKeseluruhan,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
  );
}

export async function POST(request: Request) {
  const body = (await request.json()) as KoinNuPayload;

  if (isInvalidPayload(body)) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const created = await prisma.koinNu.create({
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

  return NextResponse.json(
    {
      id: created.id,
      rantingId: created.rantingId,
      rantingNama: created.ranting.namaRanting,
      bulan: created.bulan,
      tahun: created.tahun,
      penanggungJawab: created.penanggungJawab,
      jumlahKoinBulanIni: created.jumlahKoinBulanIni,
      jumlahKoinKeseluruhan: created.jumlahKoinKeseluruhan,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    },
    { status: 201 },
  );
}
