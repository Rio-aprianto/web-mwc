"use client";

import { useEffect, useRef, useState } from "react";

type StatusPengurus = "Aktif" | "Nonaktif";

type FormState = {
  nama: string;
  jabatan: string;
  bidang: string;
  periode: string;
  nomorWa: string;
  status: StatusPengurus;
};

// Interface baru untuk menampung opsi Banom dari DB
type BanomOptionItem = {
  id: number;
  namaBanom: string;
};

type PengurusFormModalProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  form: FormState;
  fotoPreviewUrl: string;
  fotoFileName: string;
  onFormChange: <K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) => void;
  onPickFile: (file: File | null) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
};

export default function PengurusFormModal({
  open,
  title,
  submitLabel,
  form,
  fotoPreviewUrl,
  fotoFileName,
  onFormChange,
  onPickFile,
  onClose,
  onSubmit,
}: PengurusFormModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  // State baru untuk menyimpan opsi list banom
  const [banomOptions, setBanomOptions] = useState<BanomOptionItem[]>([]);
  const [isLoadingBanom, setIsLoadingBanom] = useState(false);

  // Mengambil data banom dari API DB saat modal dibuka
  useEffect(() => {
    if (!open) return;

    async function fetchBanom() {
      setIsLoadingBanom(true);
      try {
        const res = await fetch("/api/admin/banom", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          setBanomOptions(data);
        }
      } catch (error) {
        console.error("Gagal memuat data banom:", error);
      } finally {
        setIsLoadingBanom(false);
      }
    }

    void fetchBanom();
  }, [open]);

  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
      <div className='flex min-h-full items-center justify-center py-6'>
        <div className='w-full max-w-3xl rounded-2xl bg-white shadow-2xl'>
          <div className='flex items-center justify-between border-b border-emerald-100 px-5 py-4'>
            <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
            <button
              type='button'
              onClick={onClose}
              aria-label='Tutup modal'
              className='grid h-8 w-8 place-items-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'>
              <svg
                viewBox='0 0 24 24'
                fill='none'
                stroke='currentColor'
                strokeWidth='2'
                className='h-4 w-4'
                aria-hidden='true'>
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  d='M6 6l12 12M18 6L6 18'
                />
              </svg>
            </button>
          </div>

          <form onSubmit={onSubmit} className='space-y-5 px-5 py-5'>
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Nama
                </label>
                <input
                  value={form.nama}
                  onChange={(event) => onFormChange("nama", event.target.value)}
                  placeholder='Nama pengurus'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Jabatan
                </label>
                <input
                  value={form.jabatan}
                  onChange={(event) =>
                    onFormChange("jabatan", event.target.value)
                  }
                  placeholder='Contoh: Ketua'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              {/* PERUBAHAN DI SINI: Input bidang diganti menjadi select dropdown */}
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Banom/Lembaga
                </label>
                <select
                  required
                  value={form.bidang}
                  onChange={(event) =>
                    onFormChange("bidang", event.target.value)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  <option value=''>
                    {isLoadingBanom
                      ? "Memuat banom..."
                      : "Pilih Banom / Lembaga"}
                  </option>
                  {banomOptions.map((b) => (
                    <option key={b.id} value={b.namaBanom}>
                      {b.namaBanom}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Periode
                </label>
                <input
                  value={form.periode}
                  onChange={(event) =>
                    onFormChange("periode", event.target.value)
                  }
                  placeholder='Contoh: 2025-2030'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Nomor WA
                </label>
                <input
                  value={form.nomorWa}
                  onChange={(event) =>
                    onFormChange("nomorWa", event.target.value)
                  }
                  placeholder='Contoh: 081234567890'
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    onFormChange("status", event.target.value as StatusPengurus)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  <option value='Aktif'>Aktif</option>
                  <option value='Nonaktif'>Nonaktif</option>
                </select>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-700'>
                Foto Pengurus
              </p>
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDragActive(true);
                }}
                onDragLeave={() => setIsDragActive(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDragActive(false);
                  onPickFile(event.dataTransfer.files?.[0] ?? null);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-6 text-center transition ${
                  isDragActive
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-emerald-200 bg-white hover:border-emerald-400"
                }`}>
                <input
                  ref={fileInputRef}
                  type='file'
                  accept='image/*'
                  className='hidden'
                  onChange={(event) =>
                    onPickFile(event.target.files?.[0] ?? null)
                  }
                />
                <p className='text-sm font-medium text-slate-700'>
                  Drop foto di sini atau klik untuk pilih file
                </p>
                <p className='mt-1 text-xs text-slate-500'>
                  Gunakan format JPG, PNG, atau WEBP.
                </p>
              </div>

              {fotoPreviewUrl && (
                <div className='flex items-center gap-3 rounded-lg border border-emerald-100 bg-emerald-50/40 p-3'>
                  <img
                    src={fotoPreviewUrl}
                    alt='Preview foto pengurus'
                    className='h-14 w-14 rounded-full border border-emerald-100 object-cover'
                  />
                  <p className='text-sm text-slate-600'>
                    {fotoFileName || "Foto tersimpan akan digunakan"}
                  </p>
                </div>
              )}
            </div>

            <div className='flex flex-wrap justify-end gap-2 border-t border-emerald-100 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'>
                Batal
              </button>
              <button
                type='submit'
                className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
                {submitLabel}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
