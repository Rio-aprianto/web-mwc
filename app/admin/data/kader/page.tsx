"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";

import {
  confirmDelete,
  notifyBulkSaved,
  notifyDeleted,
  notifyError,
  notifySaved,
  readErrorMessage,
} from "@/lib/admin-alert";
import {
  downloadWorkbook,
  readFirstSheetRows,
  toWorkbookSheet,
} from "@/lib/excel-admin";
import KaderFormModal, {
  type KaderFormState,
  type KaderGender,
  type KaderStatus,
  type SelectOption,
} from "./_components/KaderFormModal";
import ExcelImportModal from "../_components/ExcelImportModal";

type KaderItem = {
  id: number;
  nama: string;
  ranting: string;
  anggota: string;
  jenisKelamin: KaderGender;
  status: KaderStatus;
};

const statusBadgeClassName: Record<KaderStatus, string> = {
  Aktif: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pembinaan: "bg-amber-50 text-amber-700 ring-amber-200",
  Nonaktif: "bg-rose-50 text-rose-700 ring-rose-200",
};

const emptyForm: KaderFormState = {
  nama: "",
  ranting: "",
  anggota: "",
  jenisKelamin: "Laki-laki",
  status: "Aktif",
};

type RantingOptionItem = {
  id: number;
  namaRanting: string;
};

type BanomOptionItem = {
  id: number;
  namaBanom: string;
};

type KaderImportRow = {
  Nama?: string;
  Ranting?: string;
  Anggota?: string;
  "Jenis Kelamin"?: string;
  Status?: string;
};

export default function AdminDataKaderPage() {
  const [kaderData, setKaderData] = useState<KaderItem[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rantingOptions, setRantingOptions] = useState<SelectOption[]>([]);
  const [banomOptions, setBanomOptions] = useState<SelectOption[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<KaderFormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const pageSize = 10;

  const initialForm = useMemo<KaderFormState>(
    () => ({
      ...emptyForm,
      ranting: rantingOptions[0]?.value ?? "",
      anggota: banomOptions[0]?.value ?? "",
    }),
    [rantingOptions, banomOptions],
  );

  async function loadKader() {
    const response = await fetch("/api/admin/kader", { cache: "no-store" });
    const data = (await response.json()) as KaderItem[];
    setKaderData(data);
    setIsLoading(false);
  }

  useEffect(() => {
    let isMounted = true;

    void (async () => {
      const [rantingResponse, banomResponse, kaderResponse] = await Promise.all(
        [
          fetch("/api/admin/ranting", { cache: "no-store" }),
          fetch("/api/admin/banom", { cache: "no-store" }),
          fetch("/api/admin/kader", { cache: "no-store" }),
        ],
      );

      const ranting = (await rantingResponse.json()) as RantingOptionItem[];
      const banom = (await banomResponse.json()) as BanomOptionItem[];
      const kader = (await kaderResponse.json()) as KaderItem[];

      if (isMounted) {
        setRantingOptions(
          ranting.map((item) => ({
            label: item.namaRanting,
            value: item.namaRanting,
          })),
        );
        setBanomOptions(
          banom.map((item) => ({
            label: item.namaBanom,
            value: item.namaBanom,
          })),
        );
        setKaderData(kader);
        setIsLoading(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleFormChange = <K extends keyof KaderFormState>(
    field: K,
    value: KaderFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmitKader = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);

    if (!form.nama.trim() || !form.ranting.trim() || !form.anggota.trim()) {
      return;
    }

    try {
      const isEdit = editingId !== null;
      const response = await fetch(
        isEdit ? `/api/admin/kader/${editingId}` : "/api/admin/kader",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nama: form.nama.trim(),
            ranting: form.ranting,
            anggota: form.anggota,
            jenisKelamin: form.jenisKelamin,
            status: form.status,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menyimpan kader"),
        );
      }

      await loadKader();

      setForm(initialForm);
      setEditingId(null);
      setIsModalOpen(false);
      await notifySaved(isEdit ? "update" : "create", "kader");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan kader",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditKader = (item: KaderItem) => {
    setEditingId(item.id);
    setForm({
      nama: item.nama,
      ranting: item.ranting,
      anggota: item.anggota,
      jenisKelamin: item.jenisKelamin,
      status: item.status,
    });
    setIsModalOpen(true);
  };

  const handleDeleteKader = async (id: number) => {
    const confirmed = await confirmDelete("kader");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/admin/kader/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error(
          await readErrorMessage(response, "Gagal menghapus kader"),
        );
      }

      await loadKader();
      await notifyDeleted("kader");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menghapus kader",
      );
    }
  };

  const handleDownloadKaderData = () => {
    const workbook = XLSX.utils.book_new();
    const sheet = XLSX.utils.json_to_sheet(
      kaderData.map((item) => ({
        Nama: item.nama,
        Ranting: item.ranting,
        Anggota: item.anggota,
        "Jenis Kelamin": item.jenisKelamin,
        Status: item.status,
      })),
    );

    XLSX.utils.book_append_sheet(workbook, sheet, "Data Kader");
    downloadWorkbook(workbook, "data-kader.xlsx");
  };

  const handleDownloadKaderTemplate = () => {
    const workbook = XLSX.utils.book_new();
    const sheet = toWorkbookSheet([
      "Nama",
      "Ranting",
      "Anggota",
      "Jenis Kelamin",
      "Status",
    ]);

    XLSX.utils.sheet_add_aoa(sheet, [["", "", "", "", ""]], {
      origin: -1,
    });
    XLSX.utils.book_append_sheet(workbook, sheet, "Template Kader");
    downloadWorkbook(workbook, "template-import-kader.xlsx");
  };

  const handleImportKader = async (file: File) => {
    setIsSubmitting(true);

    try {
      const rows = await readFirstSheetRows<KaderImportRow>(file);
      const normalizedRows = rows
        .map((row) => ({
          nama: String(row.Nama ?? "").trim(),
          ranting: String(row.Ranting ?? "").trim(),
          anggota: String(row.Anggota ?? "").trim(),
          jenisKelamin: String(row["Jenis Kelamin"] ?? "Laki-laki").trim(),
          status: String(row.Status ?? "Aktif").trim(),
        }))
        .filter((row) => row.nama && row.ranting && row.anggota);

      if (normalizedRows.length === 0) {
        throw new Error("File Excel belum berisi data yang valid.");
      }

      const payloads = normalizedRows.map((row) => ({
        nama: row.nama,
        ranting: row.ranting,
        anggota: row.anggota,
        jenisKelamin: row.jenisKelamin,
        status: row.status,
      }));

      for (const payload of payloads) {
        const response = await fetch("/api/admin/kader", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(
            await readErrorMessage(response, "Gagal mengimpor data kader"),
          );
        }
      }

      await loadKader();
      setIsImportModalOpen(false);
      await notifyBulkSaved("kader", payloads.length);
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal mengimpor data kader",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalPages = Math.ceil(kaderData.length / pageSize);
  const safeCurrentPage =
    totalPages === 0 ? 1 : Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const paginatedKaderData = kaderData.slice(startIndex, startIndex + pageSize);

  const visiblePageNumbers = (() => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const startPage = Math.max(
      1,
      Math.min(safeCurrentPage - 2, totalPages - 4),
    );
    return Array.from({ length: 5 }, (_, index) => startPage + index);
  })();

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Data Kader</h2>
            <p className='text-sm text-slate-500'>
              Kelola data kader, ranting, anggota, status, serta impor/ekspor
              Excel.
            </p>
          </div>
          <div className='flex flex-wrap gap-2'>
            <button
              type='button'
              onClick={handleDownloadKaderData}
              className='rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50'>
              Unduh Data
            </button>
            <button
              type='button'
              onClick={() => setIsImportModalOpen(true)}
              className='rounded-lg border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50'>
              Import Kader
            </button>
            <button
              type='button'
              onClick={() => {
                setEditingId(null);
                setForm(initialForm);
                setIsModalOpen(true);
              }}
              className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500'>
              Tambah Kader
            </button>
          </div>
        </div>

        <div className='overflow-x-auto'>
          <table className='min-w-full text-left text-sm'>
            <thead className='bg-emerald-50 text-slate-600'>
              <tr>
                <th className='px-3 py-2 font-semibold'>Nama</th>
                <th className='px-3 py-2 font-semibold'>Jenis Kelamin</th>
                <th className='px-3 py-2 font-semibold'>Ranting</th>
                <th className='px-3 py-2 font-semibold'>Anggota</th>
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
              {paginatedKaderData.map((item) => (
                <tr key={item.id} className='border-b border-emerald-100'>
                  <td className='px-3 py-2 text-slate-800'>{item.nama}</td>
                  <td className='px-3 py-2 text-slate-600'>
                    {item.jenisKelamin}
                  </td>
                  <td className='px-3 py-2 text-slate-600'>{item.ranting}</td>
                  <td className='px-3 py-2 text-slate-600'>{item.anggota}</td>
                  <td className='px-3 py-2'>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusBadgeClassName[item.status]}`}>
                      {item.status}
                    </span>
                  </td>
                  <td className='px-3 py-2'>
                    <div className='flex flex-wrap items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => handleEditKader(item)}
                        className='rounded-md border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 transition hover:bg-amber-50'>
                        Edit
                      </button>
                      <button
                        type='button'
                        onClick={() => handleDeleteKader(item.id)}
                        className='rounded-md border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50'>
                        Hapus
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!isLoading && kaderData.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className='px-3 py-6 text-center text-slate-500'>
                    Belum ada data kader.
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
              {Math.min(startIndex + pageSize, kaderData.length)} dari{" "}
              {kaderData.length} kader
            </p>

            <div className='flex flex-wrap gap-2'>
              <button
                type='button'
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                disabled={safeCurrentPage === 1}
                className='rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'>
                Prev
              </button>

              {visiblePageNumbers.map((pageNumber) => (
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
              ))}

              {!visiblePageNumbers.includes(totalPages) && (
                <>
                  <span className='px-1 py-2 text-sm text-slate-500'>...</span>
                  <button
                    type='button'
                    onClick={() => setCurrentPage(totalPages)}
                    className='min-w-10 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50'>
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type='button'
                onClick={() => setCurrentPage(totalPages)}
                disabled={safeCurrentPage === totalPages}
                className='rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50'>
                Last
              </button>
            </div>
          </div>
        )}
      </article>

      <KaderFormModal
        open={isModalOpen}
        title={editingId !== null ? "Edit Data Kader" : "Tambah Data Kader"}
        submitLabel={
          isSubmitting
            ? "Menyimpan..."
            : editingId !== null
              ? "Simpan Perubahan"
              : "Simpan Kader"
        }
        form={form}
        rantingOptions={rantingOptions}
        banomOptions={banomOptions}
        onFormChange={handleFormChange}
        onClose={() => {
          setIsModalOpen(false);
          setEditingId(null);
          setForm(initialForm);
        }}
        onSubmit={handleSubmitKader}
      />

      <ExcelImportModal
        open={isImportModalOpen}
        title='Import Kader dengan Excel'
        description='Drop file Excel untuk menambahkan data kader secara massal.'
        requiredColumns={[
          "Nama",
          "Ranting",
          "Anggota",
          "Jenis Kelamin",
          "Status",
        ]}
        onClose={() => setIsImportModalOpen(false)}
        onDownloadTemplate={handleDownloadKaderTemplate}
        onImport={handleImportKader}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
