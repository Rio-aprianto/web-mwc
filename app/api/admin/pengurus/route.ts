import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { fromActiveStatus, toActiveStatus } from "../_utils/mappers";

export async function GET() {
  const items = await prisma.pengurus.findMany({ orderBy: { id: "asc" } });

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      nama: item.nama,
      jabatan: item.jabatan,
      bidang: item.bidang,
      periode: item.periode,
      nomorWa: item.nomorWa ?? "",
      status: fromActiveStatus(item.status),
      fotoUrl: item.fotoUrl,
    })),
  );
}

export async function POST(request: Request) {
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

  const created = await prisma.pengurus.create({
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

  return NextResponse.json(
    {
      id: created.id,
      nama: created.nama,
      jabatan: created.jabatan,
      bidang: created.bidang,
      periode: created.periode,
      nomorWa: created.nomorWa ?? "",
      status: fromActiveStatus(created.status),
      fotoUrl: created.fotoUrl,
    },
    { status: 201 },
  );
}
