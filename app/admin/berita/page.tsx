"use client";

import { useEffect, useRef, useState } from "react";

import { uploadAdminImage } from "@/lib/upload-client";

type NewsItem = {
  id: number;
  imageUrl: string;
  judul: string;
  konten: string;
  tanggalUpload: string;
};

type FormState = {
  judul: string;
  konten: string;
  tanggalUpload: string;
};

function formatTanggalUpload(dateValue: string) {
  if (!dateValue) return "-";

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return dateValue;

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function AdminBeritaPage() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>({
    judul: "",
    konten: "",
    tanggalUpload: "",
  });
  const [imagePreviewUrl, setImagePreviewUrl] = useState("");
  const [imageFileName, setImageFileName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;

  async function loadBerita() {
    const response = await fetch("/api/admin/berita", { cache: "no-store" });
    const data = (await response.json()) as NewsItem[];
    setNewsList(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch("/api/admin/berita", { cache: "no-store" });
      const data = (await response.json()) as NewsItem[];
      if (isMounted) {
        setNewsList(data);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedNewsList = [...newsList].sort((firstItem, secondItem) => {
    const firstDate = new Date(firstItem.tanggalUpload).getTime();
    const secondDate = new Date(secondItem.tanggalUpload).getTime();

    if (secondDate !== firstDate) {
      return secondDate - firstDate;
    }

    return secondItem.id - firstItem.id;
  });

  const totalPages = Math.ceil(sortedNewsList.length / pageSize);
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedNewsList = sortedNewsList.slice(
    startIndex,
    startIndex + pageSize,
  );

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  function resetForm() {
    setEditingId(null);
    setForm({
      judul: "",
      konten: "",
      tanggalUpload: "",
    });
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
      const currentItem = newsList.find((item) => item.id === editingId);

      let uploadedUrl: string | null = null;
      if (imageFile) {
        try {
          const uploaded = await uploadAdminImage(imageFile, "berita");
          uploadedUrl = uploaded.url;
        } catch {
          // Tetap lanjut simpan berita dengan URL preview/default jika upload gagal.
        }
      }

      const imageUrl =
        uploadedUrl ||
        imagePreviewUrl ||
        currentItem?.imageUrl ||
        "https://images.unsplash.com/photo-1469571486292-b53601020fcb?auto=format&fit=crop&w=960&q=80";

      const response = await fetch(
        editingId !== null
          ? `/api/admin/berita/${editingId}`
          : "/api/admin/berita",
        {
          method: editingId !== null ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            imageUrl,
            judul: form.judul,
            konten: form.konten,
            tanggalUpload: form.tanggalUpload,
          }),
        },
      );

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as {
          message?: string;
        } | null;
        throw new Error(payload?.message || "Gagal menyimpan berita");
      }

      await loadBerita();
      setCurrentPage(1);
      closeForm();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gagal menyimpan berita");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(item: NewsItem) {
    setEditingId(item.id);
    setForm({
      judul: item.judul,
      konten: item.konten,
      tanggalUpload: item.tanggalUpload,
    });
    setImagePreviewUrl(item.imageUrl);
    setImageFileName("");
    setImageFile(null);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    await fetch(`/api/admin/berita/${id}`, { method: "DELETE" });
    await loadBerita();
  }

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-5 rounded-xl bg-emerald-50 p-4'>
          <h2 className='text-xl font-semibold text-slate-900'>Tabel Berita</h2>
          <p className='mt-1 text-sm text-slate-500'>
            Kelola data berita dengan gambar, judul, konten, tanggal upload, dan
            aksi edit/hapus.
          </p>
        </div>

        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <button
            type='button'
            onClick={openAddForm}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
            + Tambah Berita
          </button>
        </div>

        <div className='overflow-x-auto rounded-xl border border-emerald-100'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-700'>
              <tr>
                <th className='px-4 py-3 font-semibold'>Image</th>
                <th className='px-4 py-3 font-semibold'>Judul</th>
                <th className='px-4 py-3 font-semibold'>Konten</th>
                <th className='px-4 py-3 font-semibold'>Tanggal Upload</th>
                <th className='px-4 py-3 text-center font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-6 text-center text-sm text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              )}
              {paginatedNewsList.map((item) => (
                <tr key={item.id} className='border-t border-emerald-100'>
                  <td className='px-4 py-3'>
                    <img
                      src={item.imageUrl}
                      alt={item.judul}
                      className='h-16 w-32 rounded-md border border-emerald-100 object-cover'
                    />
                  </td>
                  <td className='px-4 py-3 text-slate-700'>{item.judul}</td>
                  <td className='max-w-sm px-4 py-3 text-slate-700'>
                    <p className='line-clamp-2'>{item.konten}</p>
                  </td>
                  <td className='px-4 py-3 text-slate-700'>
                    {formatTanggalUpload(item.tanggalUpload)}
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEdit(item)}
                        aria-label='Edit berita'
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
                        aria-label='Hapus berita'
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

              {!isLoading && newsList.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-4 py-6 text-center text-sm text-slate-500'>
                    Belum ada berita.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && totalPages > 1 && (
          <div className='mt-4 flex flex-wrap items-center justify-between gap-3'>
            <p className='text-sm text-slate-500'>
              Menampilkan {startIndex + 1}-
              {Math.min(startIndex + pageSize, sortedNewsList.length)} dari{" "}
              {sortedNewsList.length} berita
            </p>

            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className='rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'>
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type='button'
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`min-w-10 rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      pageNumber === safeCurrentPage
                        ? "bg-emerald-600 text-white"
                        : "border border-emerald-200 bg-white text-slate-600 hover:bg-slate-50"
                    }`}>
                    {pageNumber}
                  </button>
                ),
              )}

              <button
                type='button'
                onClick={() =>
                  setCurrentPage((page) => Math.min(totalPages, page + 1))
                }
                disabled={safeCurrentPage === totalPages}
                className='rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'>
                Next
              </button>
            </div>
          </div>
        )}
      </article>

      {showForm && (
        <div className='fixed inset-0 z-50 overflow-y-auto bg-slate-900/45 p-4 lg:left-(--admin-sidebar-width)'>
          <div className='flex min-h-full items-center justify-center py-6'>
            <div className='w-full max-w-3xl rounded-2xl bg-white shadow-2xl'>
              <div className='flex items-center justify-between border-b border-emerald-100 px-5 py-4'>
                <h3 className='text-lg font-semibold text-slate-900'>
                  {editingId !== null ? "Edit Berita" : "Tambah Berita"}
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
                    Image Berita
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
                        alt='Preview berita'
                        className='h-24 w-full rounded-md border border-emerald-100 object-cover sm:w-56'
                      />
                      <p className='mt-2 text-sm text-slate-600'>
                        {imageFileName || "Gambar tersimpan akan digunakan"}
                      </p>
                    </div>
                  )}
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-1.5 md:col-span-2'>
                    <label className='text-sm font-medium text-slate-700'>
                      Judul
                    </label>
                    <input
                      value={form.judul}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          judul: event.target.value,
                        }))
                      }
                      placeholder='Judul berita'
                      required
                      className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                    />
                  </div>

                  <div className='space-y-1.5 md:col-span-2'>
                    <label className='text-sm font-medium text-slate-700'>
                      Konten
                    </label>
                    <textarea
                      value={form.konten}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          konten: event.target.value,
                        }))
                      }
                      placeholder='Isi konten berita'
                      rows={5}
                      required
                      className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                    />
                  </div>

                  <div className='space-y-1.5 md:col-span-2'>
                    <label className='text-sm font-medium text-slate-700'>
                      Tanggal Upload
                    </label>
                    <input
                      type='date'
                      value={form.tanggalUpload}
                      onChange={(event) =>
                        setForm((prev) => ({
                          ...prev,
                          tanggalUpload: event.target.value,
                        }))
                      }
                      required
                      className='w-full rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-emerald-300'
                    />
                  </div>
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
                        : "Simpan Berita"}
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
