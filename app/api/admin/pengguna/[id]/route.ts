import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;

  await prisma.pengguna.delete({ where: { id: Number(id) } });

  return NextResponse.json({ ok: true });
}
