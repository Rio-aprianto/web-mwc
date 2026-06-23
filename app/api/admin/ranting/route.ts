import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { fromTriStatus, toTriStatus } from "../_utils/mappers";

export async function GET() {
  const [items, kaderCountPerRanting] = await Promise.all([
    prisma.ranting.findMany({ orderBy: { id: "desc" } }),
    prisma.kader.groupBy({
      by: ["ranting"],
      _count: { _all: true },
    }),
  ]);

  const kaderCountMap = new Map(
    kaderCountPerRanting.map((item) => [item.ranting, item._count._all]),
  );

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      namaRanting: item.namaRanting,
      status: fromTriStatus(item.status),
      jumlahKader: kaderCountMap.get(item.namaRanting) ?? 0,
    })),
  );
}

export async function POST(request: Request) {
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

  const created = await prisma.ranting.create({
    data: {
      namaRanting,
      status: toTriStatus(body.status ?? "Aktif"),
      jumlahKader,
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      namaRanting: created.namaRanting,
      status: fromTriStatus(created.status),
      jumlahKader: created.jumlahKader,
    },
    { status: 201 },
  );
}
