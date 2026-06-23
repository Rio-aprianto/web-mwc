"use client";

import { useEffect, useRef, useState } from "react";

import {
  confirmDelete,
  notifyDeleted,
  notifyError,
  notifySaved,
  notifyWarning,
  readErrorMessage,
} from "@/lib/admin-alert";
import { uploadAdminImage } from "@/lib/upload-client";

type BannerItem = {
  id: number;
  imageUrl: string;
  keterangan: string;
};

type FormState = {
  keterangan: string;
};

export default function AdminBannerImagePage() {
  const [bannerList, setBannerList] = useState<BannerItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({ keterangan: "" });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadBanner() {
    const response = await fetch("/api/admin/banner", { cache: "no-store" });
    const data = (await response.json()) as BannerItem[];
    setBannerList(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch("/api/admin/banner", { cache: "no-store" });
      const data = (await response.json()) as BannerItem[];
      if (isMounted) {
        setBannerList(data);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  function resetForm() {
    setEditingId(null);
    setForm({ keterangan: "" });
    setImagePreviewUrl("");
    setImageFileName("");
    setImageFile(null);
    setIsDragActive(false);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    resetForm();
  }

  function handlePickFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImagePreviewUrl(
        typeof reader.result === "string" ? reader.result : "",
      );
      setImageFileName(file.name);
      setImageFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const isEdit = editingId !== null;
      const currentItem = bannerList.find((item) => item.id === editingId);

      let uploadedUrl: string | null = null;
      if (imageFile) {
        try {
          const uploaded = await uploadAdminImage(imageFile, "banner");
          uploadedUrl = uploaded.url;
        } catch {
          await notifyWarning(
            "Upload gambar gagal. Data tetap disimpan menggunakan gambar preview/default.",
          );
        }
      }

      const imageUrl =
        uploadedUrl ||
        imagePreviewUrl ||
        currentItem?.imageUrl ||
        "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=960&q=80";

      const response = await fetch(
        isEdit ? `/api/admin/banner/${editingId}` : "/api/admin/banner",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl, keterangan: form.keterangan }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan banner"),
        );
      }

      await loadBanner();
      closeForm();
      await notifySaved(isEdit ? "update" : "create", "banner");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan banner",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(item: BannerItem) {
    setEditingId(item.id);
    setForm({ keterangan: item.keterangan });
    setImagePreviewUrl(item.imageUrl);
    setImageFileName("");
    setImageFile(null);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    const confirmed = await confirmDelete("banner");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/banner/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menghapus banner"),
        );
      }

      await loadBanner();
      await notifyDeleted("banner");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menghapus banner",
      );
    }
  }

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-5 rounded-xl bg-emerald-50 p-4'>
          <h2 className='text-xl font-semibold text-slate-900'>Tabel Banner</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Kelola gambar banner beserta keterangannya dan aksi edit/hapus.
          </p>
        </div>

        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <button
            type='button'
            onClick={openAddForm}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
            + Tambah Banner
          </button>
        </div>

        <div className='overflow-x-auto rounded-xl border border-emerald-100'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-700'>
              <tr>
                <th className='px-4 py-3 font-semibold'>Image</th>
                <th className='px-4 py-3 font-semibold'>Keterangan</th>
                <th className='px-4 py-3 text-center font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={3}
                    className='px-4 py-6 text-center text-sm text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              )}
              {bannerList.map((item) => (
                <tr key={item.id} className='border-t border-emerald-100'>
                  <td className='px-4 py-3'>
                    <img
                      src={item.imageUrl}
                      alt='Banner'
                      className='h-16 w-32 rounded-md border border-emerald-100 object-cover'
                    />
                  </td>
                  <td className='px-4 py-3 text-slate-700'>
                    {item.keterangan}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEdit(item)}
                        aria-label='Edit banner'
                        title='Edit'
                        className='grid h-8 w-8 place-items-center rounded-full bg-blue-100 text-blue-700 transition hover:bg-blue-200'>
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
                            d='M16.862 3.487a2.1 2.1 0 113 2.97L8.25 18.07l-4.5 1.5 1.5-4.5L16.862 3.487z'
                          />
                        </svg>
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDelete(item.id)}
                        aria-label='Hapus banner'
                        title='Hapus'
                        className='grid h-8 w-8 place-items-center rounded-full bg-rose-100 text-rose-700 transition hover:bg-rose-200'>
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
                            d='M5 7h14M10 11v6m4-6v6M7 7l1-2h8l1 2m-1 0v11a2 2 0 01-2 2H10a2 2 0 01-2-2V7'
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {!isLoading && bannerList.length === 0 && (
                <tr>
                  <td
                    colSpan={3}
                    className='px-4 py-6 text-center text-sm text-slate-500'>
                    Belum ada banner.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      {showForm && (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
          <div className='flex min-h-full items-center justify-center py-6'>
            <div className='w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
              <div className='flex items-center justify-between border-b border-emerald-100 px-5 py-4'>
                <h3 className='text-lg font-semibold text-slate-900'>
                  {editingId !== null ? "Edit Banner" : "Tambah Banner"}
                </h3>
                <button
                  type='button'
                  onClick={closeForm}
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

              <form onSubmit={handleSubmit} className='space-y-5 px-5 py-5'>
                <div className='space-y-2'>
                  <p className='text-sm font-medium text-slate-700'>
                    Image Banner
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
                      handlePickFile(event.dataTransfer.files?.[0] ?? null);
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
                        handlePickFile(event.target.files?.[0] ?? null)
                      }
                    />
                    <p className='text-sm font-medium text-slate-700'>
                      Drop image di sini atau klik untuk pilih file
                    </p>
                    <p className='mt-1 text-xs text-slate-500'>
                      Gunakan format JPG, PNG, atau WEBP.
                    </p>
                  </div>

                  {imagePreviewUrl && (
                    <div className='rounded-lg border border-emerald-100 bg-emerald-50/40 p-3'>
                      <img
                        src={imagePreviewUrl}
                        alt='Preview banner'
                        className='h-24 w-full rounded-md border border-emerald-100 object-cover sm:w-56'
                      />
                      <p className='mt-2 text-sm text-slate-600'>
                        {imageFileName || "Image tersimpan akan digunakan"}
                      </p>
                    </div>
                  )}
                </div>

                <div className='space-y-1.5'>
                  <label className='text-sm font-medium text-slate-700'>
                    Keterangan
                  </label>
                  <textarea
                    value={form.keterangan}
                    onChange={(event) =>
                      setForm({ keterangan: event.target.value })
                    }
                    placeholder='Masukkan keterangan banner...'
                    required
                    rows={4}
                    className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                  />
                </div>

                <div className='flex flex-wrap justify-end gap-2 border-t border-emerald-100 pt-4'>
                  <button
                    type='button'
                    onClick={closeForm}
                    className='rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'>
                    Batal
                  </button>
                  <button
                    type='submit'
                    disabled={isSubmitting}
                    className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
                    {isSubmitting
                      ? "Menyimpan..."
                      : editingId !== null
                        ? "Simpan Perubahan"
                        : "Simpan Banner"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
