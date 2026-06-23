import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import {
  fromJenisKelamin,
  fromTriStatus,
  toJenisKelamin,
  toTriStatus,
} from "../_utils/mappers";

export async function GET() {
  const items = await prisma.kader.findMany({ orderBy: { id: "desc" } });

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      nama: item.nama,
      ranting: item.ranting,
      anggota: item.anggota,
      jenisKelamin: fromJenisKelamin(item.jenisKelamin),
      status: fromTriStatus(item.status),
    })),
  );
}

export async function POST(request: Request) {
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

  const created = await prisma.kader.create({
    data: {
      nama: body.nama.trim(),
      ranting: body.ranting,
      anggota: body.anggota,
      jenisKelamin: toJenisKelamin(body.jenisKelamin),
      status: toTriStatus(body.status ?? "Aktif"),
    },
  });

  return NextResponse.json(
    {
      id: created.id,
      nama: created.nama,
      ranting: created.ranting,
      anggota: created.anggota,
      jenisKelamin: fromJenisKelamin(created.jenisKelamin),
      status: fromTriStatus(created.status),
    },
    { status: 201 },
  );
}
