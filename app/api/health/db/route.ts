import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        ok: true,
        message: "Database connected",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Database connection failed", error);

    return NextResponse.json(
      {
        ok: false,
        message: "Database not connected",
      },
      { status: 500 }
    );
  }
}
