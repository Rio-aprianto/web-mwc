"use client";

import { useRef, useState } from "react";

type ExcelImportModalProps = {
  open: boolean;
  title: string;
  description: string;
  requiredColumns: string[];
  onClose: () => void;
  onDownloadTemplate: () => void;
  onImport: (file: File) => Promise<void>;
  isSubmitting: boolean;
};

export default function ExcelImportModal({
  open,
  title,
  description,
  requiredColumns,
  onClose,
  onDownloadTemplate,
  onImport,
  isSubmitting,
}: ExcelImportModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);

  if (!open) return null;

  const selectFile = (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isExcelFile =
      file.name.toLowerCase().endsWith(".xlsx") ||
      file.name.toLowerCase().endsWith(".xls");

    if (!isExcelFile) {
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleImportClick = async () => {
    if (!selectedFile) return;
    await onImport(selectedFile);
  };

  return (
    <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
      <div className='flex min-h-full items-center justify-center py-6'>
        <div className='w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
          <div className='flex items-center justify-between border-b border-emerald-100 px-5 py-4'>
            <div>
              <h3 className='text-lg font-semibold text-slate-900'>{title}</h3>
              <p className='mt-1 text-sm text-slate-500'>{description}</p>
            </div>
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

          <div className='space-y-5 px-5 py-5'>
            <div className='rounded-xl border border-emerald-100 bg-emerald-50/50 p-4'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div>
                  <p className='text-sm font-semibold text-slate-900'>
                    Download format Excel
                  </p>
                  <p className='mt-1 text-sm text-slate-600'>
                    Gunakan template ini agar nama kolom sesuai dan proses
                    upload tidak error.
                  </p>
                </div>
                <button
                  type='button'
                  onClick={onDownloadTemplate}
                  className='rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50'>
                  Unduh Format Excel
                </button>
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-700'>Kolom wajib</p>
              <div className='flex flex-wrap gap-2'>
                {requiredColumns.map((column) => (
                  <span
                    key={column}
                    className='rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700'>
                    {column}
                  </span>
                ))}
              </div>
            </div>

            <div className='space-y-2'>
              <p className='text-sm font-medium text-slate-700'>
                Pilih file Excel
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
                  selectFile(event.dataTransfer.files?.[0] ?? null);
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
                  accept='.xlsx,.xls'
                  className='hidden'
                  onChange={(event) =>
                    selectFile(event.target.files?.[0] ?? null)
                  }
                />
                <p className='text-sm font-medium text-slate-700'>
                  Drop file Excel di sini atau klik untuk pilih file
                </p>
                <p className='mt-1 text-xs text-slate-500'>
                  Format yang didukung: XLSX dan XLS.
                </p>
              </div>

              <div className='rounded-lg border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-slate-600'>
                {selectedFile ? selectedFile.name : "Belum ada file dipilih."}
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
                type='button'
                disabled={!selectedFile || isSubmitting}
                onClick={handleImportClick}
                className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60'>
                {isSubmitting ? "Mengimpor..." : "Import Data"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
