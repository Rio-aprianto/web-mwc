import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = (await request.json()) as {
    imageUrl?: string;
    keterangan?: string;
  };

  if (!body.keterangan) {
    return NextResponse.json({ message: "Payload tidak valid" }, { status: 400 });
  }

  const updated = await prisma.bannerImage.update({
    where: { id: Number(id) },
    data: {
      imageUrl:
        body.imageUrl ||
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=960&q=80",
      keterangan: body.keterangan,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.bannerImage.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
