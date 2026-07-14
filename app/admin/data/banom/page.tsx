"use client";

import { type FormEvent, useEffect, useState, useMemo } from "react";

import {
  confirmDelete,
  notifyDeleted,
  notifyError,
  notifySaved,
  readErrorMessage,
} from "@/lib/admin-alert";
import BanomFormModal, {
  type BanomFormState,
  type BanomStatus,
} from "./_components/BanomFormModal";

// === Properti ketua dan masaJabatan dihapus dari skema BanomItem ===
type BanomItem = {
  id: number;
  namaBanom: string;
  jumlahAnggota: number;
  status: BanomStatus;
};

type PengurusItem = {
  id: number;
  nama: string;
  jabatan: string;
  bidang: string;
  periode: string;
  status: string;
};

const statusBadgeClassName: Record<BanomStatus, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Nonaktif: "bg-rose-50 text-rose-700 ring-rose-200",
};

// === bersihkan initialForm hanya untuk field form modal yang aktif ===
const initialForm: BanomFormState = {
  namaBanom: "",
  ketua: "", // Tetap jaga properti ini agar type BanomFormState dari modal tidak error
  masaJabatan: "", // Tetap jaga properti ini agar type BanomFormState dari modal tidak error
  status: "Aktif",
};

export default function AdminDataBanomPage() {
  const [banomData, setBanomData] = useState<BanomItem[]>([]);
  const [pengurusData, setPengurusData] = useState<PengurusItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<BanomFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadAllData() {
    try {
      const [banomRes, pengurusRes] = await Promise.all([
        fetch("/api/admin/banom", { cache: "no-store" }),
        fetch("/api/admin/pengurus", { cache: "no-store" }),
      ]);

      if (banomRes.ok) setBanomData((await banomRes.json()) as BanomItem[]);
      if (pengurusRes.ok)
        setPengurusData((await pengurusRes.json()) as PengurusItem[]);
    } catch (error) {
      console.error("Gagal memuat data:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadAllData();
    })();
  }, []);

  const ketuaMap = useMemo(() => {
    const map = new Map<string, { nama: string; periode: string }>();
    pengurusData.forEach((p) => {
      if (
        p.status === "Aktif" &&
        p.jabatan.toLowerCase().includes("ketua") &&
        p.bidang
      ) {
        map.set(p.bidang.toLowerCase().trim(), {
          nama: p.nama,
          periode: p.periode || "-",
        });
      }
    });
    return map;
  }, [pengurusData]);

  const handleFormChange = <K extends keyof BanomFormState>(
    field: K,
    value: BanomFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!form.namaBanom.trim()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const isEdit = editingId !== null;

      const payload = {
        namaBanom: form.namaBanom.trim(),
        status: form.status,
      };

      const response = await fetch(
        isEdit ? `/api/admin/banom/${editingId}` : "/api/admin/banom",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan banom"),
        );
      }

      await loadAllData();

      setForm(initialForm);
      setEditingId(null);
      setIsModalOpen(false);
      await notifySaved(isEdit ? "update" : "create", "banom");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan banom",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("banom");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/banom/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menghapus banom"),
        );
      }

      await loadAllData();
      await notifyDeleted("banom");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menghapus banom",
      );
    }
  };

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Data Banom</h2>
            <p className='text-sm text-slate-500'>
              Kelola data badan otonom, ketua, anggota, dan status.
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
            Tambah Banom
          </button>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-600'>
              <tr>
                <th className='px-3 py-2 font-semibold'>Nama Banom</th>
                <th className='px-3 py-2 font-semibold'>Ketua</th>
                <th className='px-3 py-2 font-semibold'>Masa Jabatan</th>
                <th className='px-3 py-2 font-semibold'>Jumlah Anggota</th>
                <th className='px-3 py-2 font-semibold'>Status</th>
                <th className='px-3 py-2 font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-3 py-6 text-center text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              )}
              {!isLoading &&
                banomData.map((item) => {
                  const infoKetua = ketuaMap.get(
                    item.namaBanom.toLowerCase().trim(),
                  );
                  const namaKetua = infoKetua?.nama ?? "-";
                  const masaJabatan = infoKetua?.periode ?? "-";

                  return (
                    <tr key={item.id} className='border-b border-emerald-100'>
                      <td className='px-3 py-2 text-slate-800'>
                        {item.namaBanom}
                      </td>
                      <td className='px-3 py-2 font-medium text-slate-700'>
                        {namaKetua}
                      </td>
                      <td className='px-3 py-2 text-slate-600'>
                        {masaJabatan}
                      </td>
                      <td className='px-3 py-2 text-slate-600'>
                        {item.jumlahAnggota}
                      </td>
                      <td className='px-3 py-2'>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClassName[item.status]}`}>
                          {item.status}
                        </span>
                      </td>
                      <td className='px-3 py-2'>
                        <div className='flex flex-wrap items-center gap-2'>
                          {/* === PERUBAHAN: Tombol Edit telah dihapus dari sini === */}
                          <button
                            type='button'
                            onClick={() => handleDelete(item.id)}
                            className='rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50'>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              {!isLoading && banomData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-3 py-6 text-center text-slate-500'>
                    Belum ada data banom.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <BanomFormModal
        open={isModalOpen}
        title={editingId !== null ? "Edit Data Banom" : "Tambah Data Banom"}
        submitLabel={
          isSubmitting
            ? "Menyimpan..."
            : editingId !== null
              ? "Simpan Perubahan"
              : "Tambah Banom"
        }
        form={form}
        onFormChange={handleFormChange}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setForm(initialForm);
        }}
        onSubmit={handleSubmit}
      />
    </>
  );
}
