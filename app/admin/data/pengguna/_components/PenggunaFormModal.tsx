"use client";

import type { FormEvent } from "react";

export type PenggunaRole = "Super Admin";

export type PenggunaFormState = {
  nama: string;
  role: PenggunaRole;
  email: string;
  password: string;
};

const roleOptions: PenggunaRole[] = ["Super Admin"];

type PenggunaFormModalProps = {
  open: boolean;
  form: PenggunaFormState;
  onFormChange: <K extends keyof PenggunaFormState>(
    field: K,
    value: PenggunaFormState[K],
  ) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export default function PenggunaFormModal({
  open,
  form,
  onFormChange,
  onClose,
  onSubmit,
}: PenggunaFormModalProps) {
  if (!open) return null;

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
      <div className='flex min-h-full items-center justify-center py-6'>
        <div className='w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
          <div className='flex items-center justify-between border-b border-emerald-100 px-5 py-4'>
            <h3 className='text-lg font-semibold text-slate-900'>
              Tambah Pengguna
            </h3>
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
                  placeholder='Nama lengkap'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Role
                </label>
                <select
                  value={form.role}
                  onChange={(event) =>
                    onFormChange("role", event.target.value as PenggunaRole)
                  }
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'>
                  {roleOptions.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <div className='space-y-1.5'>
                <label className='text-sm font-medium text-slate-700'>
                  Email
                </label>
                <input
                  type='email'
                  value={form.email}
                  onChange={(event) =>
                    onFormChange("email", event.target.value)
                  }
                  placeholder='email@organisasi.id'
                  required
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>

              <div className='space-y-1.5 md:col-span-2'>
                <label className='text-sm font-medium text-slate-700'>
                  Password
                </label>
                <input
                  type='password'
                  value={form.password}
                  onChange={(event) =>
                    onFormChange("password", event.target.value)
                  }
                  placeholder='Password'
                  required
                  minLength={8}
                  className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                />
              </div>
            </div>

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
                Tambah Pengguna
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
