import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const DEFAULT_BUCKET = "assets-mwckra";

const RASTER_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);

const MAX_WIDTH = 1600;
const WEBP_QUALITY = 82;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const folder = String(formData.get("folder") || "misc").trim() || "misc";

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "File tidak ditemukan" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ message: "File harus berupa gambar" }, { status: 400 });
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const bytes = await file.arrayBuffer();

    let buffer = Buffer.from(bytes);
    let contentType = file.type;
    let finalExt = ext;

    // Kompres semua gambar raster (post/banner/foto) agar tidak terlalu lambat dimuat.
    if (RASTER_MIME_TYPES.has(file.type)) {
      try {
        const image = sharp(buffer, { animated: false });
        const meta = await image.metadata();
        const resize =
          meta.width && meta.width > MAX_WIDTH ? { width: MAX_WIDTH } : undefined;

        const compressed = await image
          .rotate()
          .resize(resize)
          .webp({ quality: WEBP_QUALITY, effort: 5 })
          .toBuffer();

        if (compressed.length > 0) {
          buffer = Buffer.from(compressed);
          contentType = "image/webp";
          finalExt = "webp";
        }
      } catch {
        // Bila kompresi gagal, unggah file asli apa adanya.
      }
    }

    const path = `${folder}/${Date.now()}-${randomUUID()}.${finalExt}`;
    const supabase = getSupabaseAdminClient();
    const { data: bucket } = await supabase.storage.getBucket(DEFAULT_BUCKET);

    if (!bucket) {
      const { error: createBucketError } = await supabase.storage.createBucket(
        DEFAULT_BUCKET,
        {
          public: true,
          fileSizeLimit: "5MB",
        },
      );

      if (createBucketError) {
        return NextResponse.json(
          { message: createBucketError.message },
          { status: 500 },
        );
      }
    }

    const { error: uploadError } = await supabase.storage
      .from(DEFAULT_BUCKET)
      .upload(path, buffer, {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      return NextResponse.json({ message: uploadError.message }, { status: 500 });
    }

    const { data } = supabase.storage.from(DEFAULT_BUCKET).getPublicUrl(path);

    return NextResponse.json({
      path,
      url: data.publicUrl,
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Upload gagal",
      },
      { status: 500 },
    );
  }
}
