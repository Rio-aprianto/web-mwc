import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  const items = await prisma.bannerImage.findMany({ orderBy: { id: "desc" } });

  return NextResponse.json(items);
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    imageUrl?: string;
    keterangan?: string;
  };

  if (!body.keterangan) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const created = await prisma.bannerImage.create({
    data: {
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=960&q=80",
      keterangan: body.keterangan,
    },
  });

  return NextResponse.json(created, { status: 201 });
}
