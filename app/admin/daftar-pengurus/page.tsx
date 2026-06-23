"use client";

import { useEffect, useMemo, useState } from "react";

import {
  confirmDelete,
  notifyDeleted,
  notifyError,
  notifySaved,
  notifyWarning,
  readErrorMessage,
} from "@/lib/admin-alert";
import { uploadAdminImage } from "@/lib/upload-client";
import PengurusFormModal from "./_components/PengurusFormModal";

type StatusPengurus = "Aktif" | "Nonaktif";

type PengurusItem = {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string;
  periode: string;
  nomorWa: string;
  status: StatusPengurus;
  fotoUrl: string;
};

type FormState = {
  nama: string;
  jabatan: string;
  bidang: string;
  periode: string;
  nomorWa: string;
  status: StatusPengurus;
};

const initialForm: FormState = {
  nama: "",
  jabatan: "",
  bidang: "",
  periode: "",
  nomorWa: "",
  status: "Aktif",
};

export default function AdminDaftarPengurusPage() {
  const [dataPengurus, setDataPengurus] = useState<PengurusItem[]>([]);
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(initialForm);
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreviewUrl, setFotoPreviewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPengurus() {
    const response = await fetch("/api/admin/pengurus", { cache: "no-store" });
    const data = (await response.json()) as PengurusItem[];
    setDataPengurus(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch("/api/admin/pengurus", {
        cache: "no-store",
      });
      const data = (await response.json()) as PengurusItem[];
      if (isMounted) {
        setDataPengurus(data);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredData = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return dataPengurus;

    return dataPengurus.filter((item) => {
      return [item.nama, item.jabatan, item.bidang, item.periode, item.nomorWa]
        .join(" ")
        .toLowerCase()
        .includes(keyword);
    });
  }, [dataPengurus, query]);

  function resetForm() {
    setForm(initialForm);
    setFotoFile(null);
    setFotoPreviewUrl("");
    setEditingId(null);
  }

  function openAddForm() {
    resetForm();
    setShowForm(true);
  }

  function closeForm() {
    resetForm();
    setShowForm(false);
  }

  function handleFormChange<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handlePickFile(file: File | null) {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFotoPreviewUrl(typeof reader.result === "string" ? reader.result : "");
      setFotoFile(file);
    };
    reader.readAsDataURL(file);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmitting(true);

    try {
      const isEdit = editingId !== null;
      const currentItem = dataPengurus.find((item) => item.id === editingId);

      let uploadedUrl: string | null = null;
      if (fotoFile) {
        try {
          const uploaded = await uploadAdminImage(fotoFile, "pengurus");
          uploadedUrl = uploaded.url;
        } catch {
          await notifyWarning(
            "Upload foto gagal. Data tetap disimpan menggunakan preview/default.",
          );
        }
      }

      const fotoUrl =
        uploadedUrl ||
        fotoPreviewUrl ||
        currentItem?.fotoUrl ||
        "https://i.pravatar.cc/120?img=1";

      const response = await fetch(
        isEdit ? `/api/admin/pengurus/${editingId}` : "/api/admin/pengurus",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...form, fotoUrl }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan pengurus"),
        );
      }

      await loadPengurus();
      closeForm();
      await notifySaved(isEdit ? "update" : "create", "pengurus");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan pengurus",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleEdit(item: PengurusItem) {
    setForm({
      nama: item.nama,
      jabatan: item.jabatan,
      bidang: item.bidang,
      periode: item.periode,
      nomorWa: item.nomorWa,
      status: item.status,
    });
    setEditingId(item.id);
    setFotoFile(null);
    setFotoPreviewUrl(item.fotoUrl);
    setShowForm(true);
  }

  async function handleDelete(id: number) {
    const confirmed = await confirmDelete("pengurus");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/pengurus/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menghapus pengurus"),
        );
      }

      await loadPengurus();
      await notifyDeleted("pengurus");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menghapus pengurus",
      );
    }
  }

  const modalTitle =
    editingId !== null ? "Edit Data Pengurus" : "Tambah Pengurus";
  const modalSubmitLabel =
    editingId !== null ? "Simpan Perubahan" : "Simpan Pengurus";

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-5 rounded-xl bg-emerald-50 p-4'>
          <h2 className='text-xl font-semibold text-slate-900'>
            Tabel Pengurus
          </h2>
          <p className='mt-1 text-sm text-slate-500'>
            Kelola data pengurus, foto profil, dan aksi edit/hapus langsung dari
            satu halaman.
          </p>
        </div>

        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <button
            type='button'
            onClick={openAddForm}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
            + Tambah Pengurus
          </button>

          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder='Cari nama, jabatan, bidang, periode, atau nomor WA...'
            className='w-full max-w-sm rounded-lg border border-emerald-100 px-4 py-2 text-sm text-slate-700 outline-none ring-0 transition placeholder:text-slate-400 focus:border-emerald-300'
          />
        </div>

        <div className='overflow-x-auto rounded-xl border border-emerald-100'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-700'>
              <tr>
                <th className='px-4 py-3 font-semibold'>Nama</th>
                <th className='px-4 py-3 font-semibold'>Jabatan</th>
                <th className='px-4 py-3 font-semibold'>Bidang</th>
                <th className='px-4 py-3 font-semibold'>Periode</th>
                <th className='px-4 py-3 font-semibold'>Nomor WA</th>
                <th className='px-4 py-3 font-semibold'>Status</th>
                <th className='px-4 py-3 text-center font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-6 text-center text-sm text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              )}
              {filteredData.map((item) => (
                <tr key={item.id} className='border-t border-emerald-100'>
                  <td className='px-4 py-3'>
                    <div className='flex items-center gap-3'>
                      <img
                        src={item.fotoUrl}
                        alt={item.nama}
                        className='h-10 w-10 rounded-full border border-emerald-100 object-cover'
                      />
                      <span className='font-medium text-slate-800'>
                        {item.nama}
                      </span>
                    </div>
                  </td>
                  <td className='px-4 py-3 text-slate-700'>{item.jabatan}</td>
                  <td className='px-4 py-3 text-slate-700'>{item.bidang}</td>
                  <td className='px-4 py-3 text-slate-700'>{item.periode}</td>
                  <td className='px-4 py-3 text-slate-700'>
                    {item.nomorWa || "-"}
                  </td>
                  <td className='px-4 py-3'>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        item.status === "Aktif"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className='px-4 py-3'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEdit(item)}
                        aria-label='Edit pengurus'
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
                        aria-label='Hapus pengurus'
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

              {!isLoading && filteredData.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className='px-4 py-6 text-center text-sm text-slate-500'>
                    Data tidak ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <PengurusFormModal
        open={showForm}
        title={modalTitle}
        form={form}
        fotoPreviewUrl={fotoPreviewUrl}
        fotoFileName={fotoFile?.name ?? ""}
        onFormChange={handleFormChange}
        onPickFile={handlePickFile}
        onClose={closeForm}
        onSubmit={handleSubmit}
        submitLabel={isSubmitting ? "Menyimpan..." : modalSubmitLabel}
      />
    </>
  );
}
