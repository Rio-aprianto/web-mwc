"use client";

import type { FormEvent } from "react";

export type KaderStatus = "Aktif" | "Pembinaan" | "Nonaktif";
export type KaderGender = "Laki-laki" | "Perempuan";

export type SelectOption = {
  label: string;
  value: string;
};

export type KaderFormState = {
  nama: string;
  ranting: string;
  anggota: string;
  jenisKelamin: KaderGender;
  status: KaderStatus;
};

type KaderFormModalProps = {
  open: boolean;
  title: string;
  submitLabel: string;
  form: KaderFormState;
  rantingOptions: SelectOption[];
  banomOptions: SelectOption[];
  onFormChange: <K extends keyof KaderFormState>(
    field: K,
    value: KaderFormState[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function KaderFormModal({
  open,
  title,
  submitLabel,
  form,
  rantingOptions,
  banomOptions,
  onFormChange,
  onClose,
  onSubmit,
}: KaderFormModalProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
      <div className='flex min-h-full items-center justify-center py-6'>
        <div className='w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
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
              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Nama
                </label>
                <input
                  value={form.nama}
                  onChange={(event) => onFormChange("nama", event.target.value)}
                  placeholder='Nama kader'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Ranting
                </label>
                <select
                  value={form.ranting}
                  onChange={(event) =>
                    onFormChange("ranting", event.target.value)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  {rantingOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Anggota
                </label>
                <select
                  value={form.anggota}
                  onChange={(event) =>
                    onFormChange("anggota", event.target.value)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  {banomOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Jenis Kelamin
                </label>
                <select
                  value={form.jenisKelamin}
                  onChange={(event) =>
                    onFormChange(
                      "jenisKelamin",
                      event.target.value as KaderGender,
                    )
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  <option value='Laki-laki'>Laki-laki</option>
                  <option value='Perempuan'>Perempuan</option>
                </select>
              </div>

              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(event) =>
                    onFormChange("status", event.target.value as KaderStatus)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  <option value='Aktif'>Aktif</option>
                  <option value='Pembinaan'>Pembinaan</option>
                  <option value='Nonaktif'>Nonaktif</option>
                </select>
              </div>
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
