"use client";

import type { FormEvent } from "react";

export type BanomStatus = "Aktif" | "Nonaktif";

// Jaga struktur tipe data agar tetap sinkron dengan state halaman utama (page.tsx)
export type BanomFormState = {
  namaBanom: string;
  ketua: string;
  masaJabatan: string;
  status: BanomStatus;
};

type BanomFormModalProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  form: BanomFormState;
  onFormChange: <K extends keyof BanomFormState>(
    field: K,
    value: BanomFormState[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function BanomFormModal({
  open,
  title,
  submitLabel,
  form,
  onFormChange,
  onClose,
  onSubmit,
}: BanomFormModalProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
      <div className='flex min-h-full items-center justify-center py-6'>
        <div className='w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
          {/* Header Modal */}
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

          {/* Form Utama */}
          <form onSubmit={onSubmit} className='space-y-5 px-5 py-5'>
            <div className='grid gap-4 grid-cols-1'>
              {/* Input Nama Banom */}
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Nama Banom
                </label>
                <input
                  value={form.namaBanom}
                  onChange={(event) =>
                    onFormChange("namaBanom", event.target.value)
                  }
                  placeholder='Nama badan otonom (Contoh: Muslimat, Ansor, IPNU)'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              {/* Input Status */}
              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    onFormChange("status", event.target.value as BanomStatus)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  <option value='Aktif'>Aktif</option>
                  <option value='Nonaktif'>Nonaktif</option>
                </select>
              </div>
            </div>

            {/* Bagian Tombol Aksi */}
            <div className='flex justify-end gap-3 border-t border-emerald-100 pt-4'>
              <button
                type='button'
                onClick={onClose}
                className='rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'>
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
