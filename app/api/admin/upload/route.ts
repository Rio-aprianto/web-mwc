import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

import { getSupabaseAdminClient } from "@/lib/supabase-admin";

const DEFAULT_BUCKET = "assets-mwckra";

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
    const path = `${folder}/${Date.now()}-${randomUUID()}.${ext}`;
    const bytes = await file.arrayBuffer();

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
      .upload(path, bytes, {
        contentType: file.type,
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
