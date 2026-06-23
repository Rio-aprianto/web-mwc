import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const latest = await prisma.sambutanKetua.findFirst({
    orderBy: { id: "desc" },
  });

  if (!latest) {
    return NextResponse.json(null);
  }

  return NextResponse.json(latest);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    namaKetua?: string;
    isi?: string;
    imageUrl?: string;
  };

  if (!body.title || !body.namaKetua || !body.isi) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const latest = await prisma.sambutanKetua.findFirst({
    orderBy: { id: "desc" },
    select: { id: true },
  });

  if (!latest) {
    const created = await prisma.sambutanKetua.create({
      data: {
        title: body.title,
        namaKetua: body.namaKetua,
        isi: body.isi,
        imageUrl: body.imageUrl || "/images/ketua_mwc1.png",
      },
    });

    return NextResponse.json(created);
  }

  const updated = await prisma.sambutanKetua.update({
    where: { id: latest.id },
    data: {
      title: body.title,
      namaKetua: body.namaKetua,
      isi: body.isi,
      imageUrl: body.imageUrl || "/images/ketua_mwc1.png",
    },
  });

  return NextResponse.json(updated);
}
