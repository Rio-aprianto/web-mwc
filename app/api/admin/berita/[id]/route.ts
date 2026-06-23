import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
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

    const updated = await prisma.berita.update({
      where: { id: Number(id) },
      data: {
        imageUrl:
          body.imageUrl ||
          "https://images.unsplash.com/photo-1469571486292-b53601020fcb?auto=format&fit=crop&w=960&q=80",
        judul: body.judul,
        konten: body.konten,
        tanggalUpload: parsedDate,
      },
    });

    return NextResponse.json({
      id: updated.id,
      imageUrl: updated.imageUrl,
      judul: updated.judul,
      konten: updated.konten,
      tanggalUpload: updated.tanggalUpload.toISOString().slice(0, 10),
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Gagal memperbarui berita",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.berita.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
