import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_IMAGE = "/images/ketua_mwc1.png";

export async function GET() {
  try {
    let sambutan = await prisma.sambutanTanfidziyah.findFirst({
      orderBy: { updatedAt: "desc" }, // lebih baik pakai updatedAt
    });

    // Kalau belum ada data, buat default
    if (!sambutan) {
      sambutan = await prisma.sambutanTanfidziyah.create({
        data: {
          title: "Sambutan Ketua Cabang",
          namaKetua: "Drs. Ahmad Mulyana",
          isi: "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di website resmi kami. Semoga informasi yang disajikan dapat memperkuat silaturahmi, memperluas manfaat, dan menjadi sarana pelayanan untuk umat.",
          imageUrl: DEFAULT_IMAGE,
        },
      });
    }

    return NextResponse.json(sambutan);
  } catch (error) {
    console.error("Error GET sambutan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data sambutan" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as {
      title?: string;
      namaKetua?: string;
      isi?: string;
      imageUrl?: string;
    };

    if (!body.title?.trim() || !body.namaKetua?.trim() || !body.isi?.trim()) {
      return NextResponse.json(
        { message: "Judul, Nama Ketua, dan Isi wajib diisi" },
        { status: 400 }
      );
    }

    let sambutan = await prisma.sambutanTanfidziyah.findFirst();

    if (!sambutan) {
      // Create baru
      sambutan = await prisma.sambutanTanfidziyah.create({
        data: {
          title: body.title.trim(),
          namaKetua: body.namaKetua.trim(),
          isi: body.isi.trim(),
          imageUrl: body.imageUrl || DEFAULT_IMAGE,
        },
      });
    } else {
      // Update existing
      sambutan = await prisma.sambutanTanfidziyah.update({
        where: { id: sambutan.id },
        data: {
          title: body.title.trim(),
          namaKetua: body.namaKetua.trim(),
          isi: body.isi.trim(),
          imageUrl: body.imageUrl || sambutan.imageUrl,
        },
      });
    }

    return NextResponse.json(sambutan);
  } catch (error) {
    console.error("Error PUT sambutan:", error);
    return NextResponse.json(
      { error: "Gagal menyimpan sambutan" },
      { status: 500 }
    );
  }
}