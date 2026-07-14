import { NextResponse } from "next/server";

import { deleteExpiredBerita } from "@/lib/cleanupBerita";

export async function POST() {
  const deleted = await deleteExpiredBerita();

  return NextResponse.json({ deleted });
}
