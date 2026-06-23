"use client";

import { type FormEvent, useEffect, useState } from "react";

import {
  confirmDelete,
  notifyDeleted,
  notifyError,
  notifySaved,
  readErrorMessage,
} from "@/lib/admin-alert";
import RantingFormModal, {
  type RantingFormState,
  type RantingStatus,
} from "./_components/RantingFormModal";

type RantingItem = {
  id: number;
  namaRanting: string;
  status: RantingStatus;
  jumlahKader: number;
};

const statusBadgeClassName: Record<RantingStatus, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pembinaan: "bg-amber-50 text-amber-700 ring-amber-200",
  Nonaktif: "bg-rose-50 text-rose-700 ring-rose-200",
};

const statusSelectClassName: Record<RantingStatus, string> = {
  Aktif: "text-emerald-700",
  Pembinaan: "text-amber-700",
  Nonaktif: "text-rose-700",
};

const initialForm: RantingFormState = {
  namaRanting: "",
  status: "Aktif",
};

export default function AdminDataRantingPage() {
  const [rantingData, setRantingData] = useState<RantingItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadRanting() {
    const response = await fetch("/api/admin/ranting", { cache: "no-store" });
    const data = (await response.json()) as RantingItem[];
    setRantingData(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch("/api/admin/ranting", { cache: "no-store" });
      const data = (await response.json()) as RantingItem[];
      if (isMounted) {
        setRantingData(data);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormChange = <K extends keyof RantingFormState>(
    field: K,
    value: RantingFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitRanting = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!form.namaRanting.trim()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const isEdit = editingId !== null;
      const response = await fetch(
        isEdit ? `/api/admin/ranting/${editingId}` : "/api/admin/ranting",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            namaRanting: form.namaRanting.trim(),
            status: form.status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan ranting"),
        );
      }

      await loadRanting();
      setForm(initialForm);
      setEditingId(null);
      setIsModalOpen(false);
      await notifySaved(isEdit ? "update" : "create", "ranting");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan ranting",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditRanting = (item: RantingItem) => {
    setEditingId(item.id);
    setForm({
      namaRanting: item.namaRanting,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteRanting = async (id: number) => {
    const confirmed = await confirmDelete("ranting");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/ranting/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menghapus ranting"),
        );
      }

      await loadRanting();
      await notifyDeleted("ranting");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menghapus ranting",
      );
    }
  };

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>
              Data Ranting
            </h2>
            <p className='text-sm text-slate-500'>
              Daftar unit ranting yang terdaftar dalam sistem.
            </p>
          </div>
          <button
            type='button'
            onClick={() => {
              setEditingId(null);
              setForm(initialForm);
              setIsModalOpen(true);
            }}
            className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
            Tambah Ranting
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-600'>
              <tr>
                <th className='px-3 py-2 font-semibold'>Nama Ranting</th>
                <th className='px-3 py-2 font-semibold'>Status</th>
                <th className='px-3 py-2 font-semibold'>Jumlah Kader</th>
                <th className='px-3 py-2 font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={4}
                    className='px-3 py-6 text-center text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              )}
              {rantingData.map((item) => (
                <tr key={item.id} className='border-b border-emerald-100'>
                  <td className='px-3 py-2 text-slate-800'>
                    {item.namaRanting}
                  </td>
                  <td className='px-3 py-2'>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClassName[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className='px-3 py-2 text-slate-600'>
                    {item.jumlahKader}
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEditRanting(item)}
                        className='rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50'>
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDeleteRanting(item.id)}
                        className='rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50'>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && rantingData.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className='px-3 py-6 text-center text-slate-500'>
                    Belum ada data ranting.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <RantingFormModal
        open={isModalOpen}
        title={editingId !== null ? "Edit Data Ranting" : "Tambah Data Ranting"}
        submitLabel={
          isSubmitting
            ? "Menyimpan..."
            : editingId !== null
              ? "Simpan Perubahan"
              : "Simpan Ranting"
        }
        form={form}
        statusClassName={statusSelectClassName[form.status]}
        onFormChange={handleFormChange}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setForm(initialForm);
        }}
        onSubmit={handleSubmitRanting}
      />
    </>
  );
}
