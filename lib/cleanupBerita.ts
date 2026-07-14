import { prisma } from "@/lib/prisma";

const BERITA_TTL_MONTHS = 2;

export function getBeritaExpiryDate(): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth() - BERITA_TTL_MONTHS,
    now.getDate(),
  );
}

export async function deleteExpiredBerita(): Promise<number> {
  const expiredBefore = getBeritaExpiryDate();

  const result = await prisma.berita.deleteMany({
    where: { tanggalUpload: { lt: expiredBefore } },
  });

  return result.count;
}
