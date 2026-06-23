"use client";

import { useEffect, useRef, useState } from "react";

import {
  notifyError,
  notifySaved,
  notifyWarning,
  readErrorMessage,
} from "@/lib/admin-alert";
import { uploadAdminImage } from "@/lib/upload-client";

type SambutanState = {
  title: string;
  namaKetua: string;
  isi: string;
  imageUrl: string;
};

const initialSambutan: SambutanState = {
  title: "Sambutan Ketua Cabang",
  namaKetua: "Drs. Ahmad Mulyana",
  isi: "Assalamu'alaikum warahmatullahi wabarakatuh. Selamat datang di website resmi kami. Semoga informasi yang disajikan dapat memperkuat silaturahmi, memperluas manfaat, dan menjadi sarana pelayanan untuk umat.",
  imageUrl: "/images/ketua_mwc1.png",
};

export default function AdminSambutanKetuaPage() {
  const [form, setForm] = useState<SambutanState>(initialSambutan);
  const [previewImage, setPreviewImage] = useState(initialSambutan.imageUrl);
  const [imageFileName, setImageFileName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch("/api/admin/sambutan", {
        cache: "no-store",
      });
      const data = (await response.json()) as SambutanState | null;

      if (isMounted) {
        if (data) {
          setForm(data);
          setPreviewImage(data.imageUrl);
        }

        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  function onFieldChange<K extends keyof SambutanState>(
    field: K,
    value: SambutanState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePickImage(file: File | null) {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      const nextPreview =
        typeof reader.result === "string" ? reader.result : "";
      setPreviewImage(nextPreview || initialSambutan.imageUrl);
      setImageFileName(file.name);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      let uploadedUrl: string | null = null;
      if (imageFile) {
        try {
          const uploaded = await uploadAdminImage(imageFile, "sambutan");
          uploadedUrl = uploaded.url;
        } catch {
          await notifyWarning(
            "Upload gambar gagal. Data tetap disimpan menggunakan gambar preview/default.",
          );
        }
      }

      const payload = {
        ...form,
        imageUrl: uploadedUrl || previewImage || form.imageUrl,
      };

      const response = await fetch("/api/admin/sambutan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan sambutan"),
        );
      }

      setForm(payload);
      setImageFile(null);
      await notifySaved("update", "sambutan ketua");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan sambutan",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className='grid gap-4 lg:grid-cols-[1.25fr_1fr]'>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <h2 className='text-lg font-semibold text-slate-900'>
          Sambutan Ketua Rois Syuriah
        </h2>
        <p className='mt-1 text-sm text-slate-500'>
          Atur judul, isi, dan gambar sambutan ketua yang tampil pada halaman
          publik.
        </p>

        {isLoading && (
          <p className='mt-2 text-sm text-slate-500'>Memuat data sambutan...</p>
        )}

        <form onSubmit={handleSubmit} className='mt-4 space-y-3'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>
              Judul Sambutan
            </label>
            <input
              type='text'
              value={form.title}
              onChange={(event) => onFieldChange("title", event.target.value)}
              className='w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>
              Nama Ketua
            </label>
            <input
              type='text'
              value={form.namaKetua}
              onChange={(event) =>
                onFieldChange("namaKetua", event.target.value)
              }
              className='w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>
              Isi Sambutan
            </label>
            <textarea
              rows={8}
              value={form.isi}
              onChange={(event) => onFieldChange("isi", event.target.value)}
              className='w-full rounded-lg border border-emerald-100 px-3 py-2 text-sm focus:border-emerald-400 focus:outline-none'
            />
          </div>

          <div className='space-y-2'>
            <label className='mb-1 block text-sm font-medium text-slate-700'>
              Gambar Ketua
            </label>

            <div
              onClick={() => fileInputRef.current?.click()}
              className='cursor-pointer rounded-xl border-2 border-dashed border-emerald-200 px-4 py-6 text-center transition hover:border-emerald-400 hover:bg-emerald-50'>
              <input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(event) =>
                  handlePickImage(event.target.files?.[0] ?? null)
                }
              />
              <p className='text-sm font-medium text-slate-700'>
                Klik untuk upload/ganti gambar ketua
              </p>
              <p className='mt-1 text-xs text-slate-500'>
                Format yang disarankan: JPG, PNG, WEBP.
              </p>
            </div>

            <div className='flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3'>
              <img
                src={previewImage || form.imageUrl}
                alt='Preview gambar ketua'
                className='h-16 w-16 rounded-lg border border-emerald-100 object-cover'
              />
              <p className='text-sm text-slate-600'>
                {imageFileName || "Menggunakan gambar sambutan yang tersimpan"}
              </p>
            </div>
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
            {isSubmitting ? "Menyimpan..." : "Simpan Sambutan"}
          </button>
        </form>
      </article>

      <article className='rounded-2xl bg-linear-to-b from-emerald-950 via-emerald-900 to-emerald-800 p-5 text-white shadow-sm'>
        <h2 className='text-lg font-semibold'>Catatan Editor</h2>
        <ul className='mt-3 space-y-2 text-sm text-emerald-100'>
          <li className='rounded-lg border border-white/10 bg-white/8 p-2.5'>
            Pastikan isi sambutan tidak terlalu panjang.
          </li>
          <li className='rounded-lg border border-white/10 bg-white/8 p-2.5'>
            Gunakan bahasa resmi namun tetap hangat.
          </li>
          <li className='rounded-lg border border-white/10 bg-white/8 p-2.5'>
            Perbarui saat pergantian periode kepengurusan.
          </li>
          <li className='rounded-lg border border-white/10 bg-white/8 p-2.5'>
            Gunakan foto dengan rasio proporsional agar tampilan tetap rapi.
          </li>
        </ul>
      </article>
    </div>
  );
}
