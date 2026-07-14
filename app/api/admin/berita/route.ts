import { NextResponse } from "next/server";

import { deleteExpiredBerita } from "@/lib/cleanupBerita";
import { prisma } from "@/lib/prisma";

export async function GET() {
  await deleteExpiredBerita();

  const items = await prisma.berita.findMany({
    orderBy: [{ tanggalUpload: "desc" }, { id: "desc" }],
  });

  return NextResponse.json(
    items.map((item) => ({
      id: item.id,
      imageUrl: item.imageUrl,
      judul: item.judul,
      konten: item.konten,
      tanggalUpload: item.tanggalUpload.toISOString().slice(0, 10),
    })),
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      imageUrl?: string;
      judul?: string;
      konten?: string;
      tanggalUpload?: string;
    };

    if (!body.judul || !body.konten || !body.tanggalUpload) {
      return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
    }

    const parsedDate = new Date(body.tanggalUpload);
    if (Number.isNaN(parsedDate.getTime())) {
      return NextResponse.json({ message: "Tanggal upload tidak valid" }, { status: 400 });
    }

    const created = await prisma.berita.create({
      data: {
        imageUrl:
          body.imageUrl ||
          "https://images.unsplash.com/photo-1469571486292-b53601020fcb?auto=format&fit=crop&w=960&q=80",
        judul: body.judul,
        konten: body.konten,
        tanggalUpload: parsedDate,
      },
    });

    return NextResponse.json(
      {
        id: created.id,
        imageUrl: created.imageUrl,
        judul: created.judul,
        konten: created.konten,
        tanggalUpload: created.tanggalUpload.toISOString().slice(0, 10),
      },
      { status: 201 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Gagal membuat berita",
      },
      { status: 500 },
    );
  }
}
