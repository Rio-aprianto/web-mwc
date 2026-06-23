"use client";

import { type FormEvent, useEffect, useState } from "react";
import * as XLSX from "xlsx";

import {
  confirmDelete,
  notifyBulkSaved,
  notifyDeleted,
  notifyError,
  readErrorMessage,
} from "@/lib/admin-alert";
import {
  downloadWorkbook,
  readFirstSheetRows,
  toWorkbookSheet,
} from "@/lib/excel-admin";
import PenggunaFormModal, {
  type PenggunaFormState,
  type PenggunaRole,
} from "./_components/PenggunaFormModal";
import ExcelImportModal from "../_components/ExcelImportModal";

type PenggunaStatus = "Aktif" | "Nonaktif";

type PenggunaItem = {
  id: number;
  nama: string;
  role: PenggunaRole;
  email: string;
  status: PenggunaStatus;
};

type PenggunaImportRow = {
  Nama?: string;
  Role?: string;
  Email?: string;
  Password?: string;
  Status?: string;
};

const statusBadgeClassName: Record<PenggunaStatus, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Nonaktif: "bg-rose-50 text-rose-700 ring-rose-200",
};

const initialForm: PenggunaFormState = {
  nama: "",
  role: "Super Admin",
  email: "",
  password: "",
};

export default function AdminDataPenggunaPage() {
  const [penggunaData, setPenggunaData] = useState<PenggunaItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<PenggunaFormState>(initialForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadPengguna() {
    const response = await fetch("/api/admin/pengguna", { cache: "no-store" });
    const data = (await response.json()) as PenggunaItem[];
    setPenggunaData(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const response = await fetch("/api/admin/pengguna", {
        cache: "no-store",
      });
      const data = (await response.json()) as PenggunaItem[];
      if (isMounted) {
        setPenggunaData(data);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormChange = <K extends keyof PenggunaFormState>(
    field: K,
    value: PenggunaFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!form.nama.trim() || !form.email.trim() || !form.password.trim()) {
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/admin/pengguna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nama: form.nama.trim(),
          role: form.role,
          email: form.email.trim(),
          password: form.password,
        }),
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan pengguna"),
        );
      }

      await loadPengguna();

      setForm(initialForm);
      setIsModalOpen(false);
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan pengguna",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    const confirmed = await confirmDelete("pengguna");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/pengguna/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menghapus pengguna"),
        );
      }

      await loadPengguna();
      await notifyDeleted("pengguna");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menghapus pengguna",
      );
    }
  };

  const handleDownloadPenggunaTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const sheet = toWorkbookSheet(["Nama", "Role", "Email", "Password"]);

    XLSX.utils.sheet_add_aoa(sheet, [["", "", "", ""]], { origin: -1 });
    XLSX.utils.book_append_sheet(workbook, sheet, "Template Pengguna");
    downloadWorkbook(workbook, "template-import-pengguna.xlsx");
  };

  const handleImportPengguna = async (file: File) => {
    setIsSubmitting(true);

    try {
      const rows = await readFirstSheetRows<PenggunaImportRow>(file);
      const normalizedRows = rows
        .map((row) => ({
          nama: String(row.Nama ?? "").trim(),
          role: String(row.Role ?? "Kontributor").trim(),
          email: String(row.Email ?? "").trim(),
          password: String(row.Password ?? "").trim(),
          status: String(row.Status ?? "Aktif").trim(),
        }))
        .filter((row) => row.nama && row.email && row.password);

      if (normalizedRows.length === 0) {
        throw new Error("File Excel belum berisi data yang valid.");
      }

      for (const row of normalizedRows) {
        const response = await fetch("/api/admin/pengguna", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(row),
        });

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, "Gagal mengimpor data pengguna"),
          );
        }
      }

      await loadPengguna();
      await notifyBulkSaved("pengguna", normalizedRows.length);
    } catch (error) {
      await notifyError(
        error instanceof Error
          ? error.message
          : "Gagal mengimpor data pengguna",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>
              Data Pengguna
            </h2>
            <p className='text-sm text-slate-500'>
              Daftar akun yang memiliki akses ke panel admin, termasuk impor dan
              ekspor Excel.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={() => {
                setForm(initialForm);
                setIsModalOpen(true);
              }}
              className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
              Tambah Pengguna
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-600'>
              <tr>
                <th className='px-3 py-2 font-semibold'>Nama</th>
                <th className='px-3 py-2 font-semibold'>Role</th>
                <th className='px-3 py-2 font-semibold'>Email</th>
                <th className='px-3 py-2 font-semibold'>Status</th>
                <th className='px-3 py-2 font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-3 py-6 text-center text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              )}
              {penggunaData.map((item) => (
                <tr key={item.id} className='border-b border-emerald-100'>
                  <td className='px-3 py-2 text-slate-800'>{item.nama}</td>
                  <td className='px-3 py-2 text-slate-600'>{item.role}</td>
                  <td className='px-3 py-2 text-slate-600'>{item.email}</td>
                  <td className='px-3 py-2'>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClassName[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className='px-3 py-2'>
                    <button
                      type='button'
                      onClick={() => handleDelete(item.id)}
                      className='rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50'>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && penggunaData.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className='px-3 py-6 text-center text-slate-500'>
                    Belum ada data pengguna.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </article>

      <PenggunaFormModal
        open={isModalOpen}
        form={form}
        onFormChange={handleFormChange}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </>
  );
}
