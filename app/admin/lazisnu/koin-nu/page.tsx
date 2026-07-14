"use client";

import { type FormEvent, useEffect, useMemo, useState } from "react";
import jsPDF from "jspdf";

import {
  confirmDelete,
  notifyDeleted,
  notifyError,
  notifySaved,
  readErrorMessage,
} from "@/lib/admin-alert";

type RantingOptionItem = {
  id: number;
  namaRanting: string;
};

type KoinNuItem = {
  id: number;
  rantingId: number;
  rantingNama: string;
  bulan: number;
  tahun: number;
  penanggungJawab: string;
  jumlahKoinBulanIni: number;
  jumlahKoinKeseluruhan: number;
};

type FormState = {
  rantingId: string;
  bulan: string;
  tahun: string;
  penanggungJawab: string;
  jumlahKoinBulanIni: string;
};

const monthOptions = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

const idrFormatter = new Intl.NumberFormat("id-ID");

function toPeriodValue(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

function parsePeriod(value: string) {
  const [yearPart, monthPart] = value.split("-");
  const year = Number(yearPart);
  const month = Number(monthPart);
  if (!year || !month) {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
  return { year, month };
}

function monthName(month: number) {
  return monthOptions.find((item) => item.value === month)?.label ?? "-";
}

function defaultFormFromPeriod(): FormState {
  const now = new Date();
  return {
    rantingId: "",
    bulan: String(now.getMonth() + 1),
    tahun: String(now.getFullYear()),
    penanggungJawab: "",
    jumlahKoinBulanIni: "0",
  };
}

function formatRupiah(value: string): string {
  const num = value.replace(/\D/g, "");
  return num ? idrFormatter.format(Number(num)) : "";
}

function parseRupiah(value: string): number {
  return Number(value.replace(/\D/g, "")) || 0;
}

export default function AdminKoinNuPage() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const [selectedPeriod, setSelectedPeriod] = useState(
    toPeriodValue(currentYear, currentMonth),
  );
  const [reportPeriod, setReportPeriod] = useState(selectedPeriod);

  const [rantingOptions, setRantingOptions] = useState<RantingOptionItem[]>([]);
  const [koinData, setKoinData] = useState<KoinNuItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(defaultFormFromPeriod());

  const [isReportOpen, setIsReportOpen] = useState(false);

  async function loadData() {
    try {
      const [rantingRes, koinRes] = await Promise.all([
        fetch("/api/admin/ranting", { cache: "no-store" }),
        fetch("/api/admin/koin-nu", { cache: "no-store" }),
      ]);
      setRantingOptions(await rantingRes.json());
      setKoinData(await koinRes.json());
    } catch {
      await notifyError("Gagal memuat data");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void (async () => {
      await loadData();
    })();
  }, []);

  const selectedPeriodData = useMemo(() => {
    const { year, month } = parsePeriod(selectedPeriod);
    return koinData.filter(
      (item) => item.tahun === year && item.bulan === month,
    );
  }, [koinData, selectedPeriod]);

  // Periode yang hanya memiliki data (terbaru diurutkan ke atas)
  const dataPeriods = useMemo(() => {
    const periodSet = new Set<string>();
    koinData.forEach((item) =>
      periodSet.add(toPeriodValue(item.tahun, item.bulan)),
    );
    return Array.from(periodSet).sort((a, b) => (a < b ? 1 : -1));
  }, [koinData]);

  // Sinkronkan periode terpilih ke periode terbaru yang ada datanya
  useEffect(() => {
    if (dataPeriods.length === 0) return;
    if (!dataPeriods.includes(selectedPeriod)) {
      const latest = dataPeriods[0];
      setSelectedPeriod(latest);
      setReportPeriod(latest);
    }
  }, [dataPeriods, selectedPeriod]);

  const totalKeseluruhan = useMemo(
    () =>
      koinData.reduce((sum, item) => sum + (item.jumlahKoinBulanIni || 0), 0),
    [koinData],
  );

  const totalBulanTerpilih = useMemo(
    () =>
      selectedPeriodData.reduce(
        (sum, item) => sum + (item.jumlahKoinBulanIni || 0),
        0,
      ),
    [selectedPeriodData],
  );

  // === PERUBAHAN: Menghitung akumulasi total koin per Ranting ===
  const rantingTotals = useMemo(() => {
    const totalsMap = new Map<number, number>();
    koinData.forEach((item) => {
      const currentTotal = totalsMap.get(item.rantingId) || 0;
      totalsMap.set(
        item.rantingId,
        currentTotal + (item.jumlahKoinBulanIni || 0),
      );
    });
    return totalsMap;
  }, [koinData]);

  function handlePeriodChange(period: string) {
    setSelectedPeriod(period);
    setReportPeriod(period);
  }

  function openCreateForm() {
    setEditingId(null);
    setForm(defaultFormFromPeriod());
    setIsFormOpen(true);
  }

  function openEditForm(item: KoinNuItem) {
    setEditingId(item.id);
    setForm({
      rantingId: String(item.rantingId),
      bulan: String(item.bulan),
      tahun: String(item.tahun),
      penanggungJawab: item.penanggungJawab,
      jumlahKoinBulanIni: String(item.jumlahKoinBulanIni),
    });
    setIsFormOpen(true);
  }

  function closeForm() {
    setIsFormOpen(false);
    setEditingId(null);
  }

  function onFormChange<K extends keyof FormState>(
    field: K,
    value: FormState[K],
  ) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.rantingId || !form.penanggungJawab.trim()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        rantingId: Number(form.rantingId),
        bulan: currentMonth,
        tahun: currentYear,
        penanggungJawab: form.penanggungJawab.trim(),
        jumlahKoinBulanIni: parseRupiah(form.jumlahKoinBulanIni),
        jumlahKoinKeseluruhan: 0,
      };

      const isEdit = editingId !== null;
      const res = await fetch(
        isEdit ? `/api/admin/koin-nu/${editingId}` : "/api/admin/koin-nu",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok)
        throw new Error(await readErrorMessage(res, "Gagal menyimpan data"));

      await loadData();
      closeForm();
      await notifySaved(isEdit ? "update" : "create", "Koin NU");
    } catch (error) {
      await notifyError(
        error instanceof Error ? error.message : "Gagal menyimpan data Koin NU",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    const confirmed = await confirmDelete("data Koin NU");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/admin/koin-nu/${id}`, { method: "DELETE" });
      if (!res.ok)
        throw new Error(await readErrorMessage(res, "Gagal menghapus"));
      await loadData();
      await notifyDeleted("data Koin NU");
    } catch {
      await notifyError("Gagal menghapus data");
    }
  }

  function handleDownloadReportPdf() {
    const { year, month } = parsePeriod(reportPeriod);
    const reportRows = koinData.filter(
      (item) => item.tahun === year && item.bulan === month,
    );

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 18;

    doc.setFontSize(16);
    doc.text("LAZISNU KARANGANYAR", pageWidth / 2, y, { align: "center" });
    y += 7;

    doc.setFontSize(18);
    doc.text("LAPORAN KOIN NU", pageWidth / 2, y, { align: "center" });
    y += 8;

    doc.setFontSize(12);
    doc.text(`Periode: ${monthName(month)} ${year}`, pageWidth / 2, y, {
      align: "center",
    });
    y += 18;

    if (reportRows.length === 0) {
      doc.setFontSize(14);
      doc.text("Tidak ada data pada periode ini.", pageWidth / 2, y, {
        align: "center",
      });
      doc.save(`laporan-koin-nu-${year}-${String(month).padStart(2, "0")}.pdf`);
      setIsReportOpen(false);
      return;
    }

    const totalBulan = reportRows.reduce(
      (sum, item) => sum + item.jumlahKoinBulanIni,
      0,
    );

    doc.setFontSize(11);
    doc.text(`Total Bulan Ini : Rp ${idrFormatter.format(totalBulan)}`, 20, y);
    y += 18;

    // Table Header
    doc.setFillColor(230, 230, 230);
    doc.rect(18, y, pageWidth - 36, 9, "F");
    doc.setFontSize(10);
    doc.text("No", 23, y + 6.5);
    doc.text("Ranting", 45, y + 6.5);
    doc.text("Penanggung Jawab", 105, y + 6.5);
    doc.text("Jumlah Bulan Ini", 175, y + 6.5);
    y += 11;

    reportRows.forEach((item, index) => {
      if (y > 265) {
        doc.addPage();
        y = 25;
      }

      doc.setFontSize(10);
      doc.text((index + 1).toString(), 23, y);
      doc.text(item.rantingNama, 45, y);
      doc.text(item.penanggungJawab, 105, y);
      doc.text(idrFormatter.format(item.jumlahKoinBulanIni), 175, y);

      y += 9;
    });

    // Tanda Tangan
    const tanggal = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    y += 20;
    doc.text(`Pekalongan, ${tanggal}`, 135, y);
    y += 5;
    doc.text("Ketua Lazisnu Karanganyar", 135, y);
    y += 22;
    doc.text("___________________________", 135, y);

    doc.save(`laporan-koin-nu-${year}-${String(month).padStart(2, "0")}.pdf`);
    setIsReportOpen(false);
  }

  return (
    <>
      <article className='rounded-2xl border border-emerald-100 bg-white p-5 shadow-sm shadow-emerald-900/5'>
        <div className='mb-4 flex flex-wrap items-center justify-between gap-3'>
          <div>
            <h2 className='text-lg font-semibold text-slate-900'>Koin NU</h2>
            <p className='text-sm text-slate-500'>
              Kelola data pemasukan Koin NU per ranting
            </p>
          </div>

          <div className='flex flex-wrap gap-2'>
              <select
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className='rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm'>
                {dataPeriods.length === 0 ? (
                  <option value=''>Tidak ada data</option>
                ) : (
                  dataPeriods.map((period) => {
                    const { year, month } = parsePeriod(period);
                    return (
                      <option key={period} value={period}>
                        {monthName(month)} {year}
                      </option>
                    );
                  })
                )}
              </select>

            <button
              onClick={() => setIsReportOpen(true)}
              className='rounded-lg border border-sky-200 bg-white px-4 py-2 text-sm font-semibold text-sky-700 hover:bg-sky-50'>
              Unduh Laporan
            </button>
            <button
              onClick={openCreateForm}
              className='rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500'>
              Tambah Manual
            </button>
          </div>
        </div>

        <div className='mb-5 grid gap-4 md:grid-cols-2'>
          <div className='rounded-xl border border-emerald-200 bg-emerald-50 p-4'>
            <p className='text-xs font-semibold tracking-widest text-emerald-700 uppercase'>
              TOTAL KESELURUHAN
            </p>
            <p className='mt-2 text-3xl font-bold text-emerald-900'>
              {idrFormatter.format(totalKeseluruhan)}
            </p>
          </div>
          <div className='rounded-xl border border-sky-200 bg-sky-50 p-4'>
            <p className='text-xs font-semibold tracking-widest text-sky-700 uppercase'>
              {monthName(parsePeriod(selectedPeriod).month)}{" "}
              {parsePeriod(selectedPeriod).year}
            </p>
            <p className='mt-2 text-3xl font-bold text-sky-900'>
              {idrFormatter.format(totalBulanTerpilih)}
            </p>
          </div>
        </div>

        <div className='overflow-x-auto rounded-xl border border-emerald-100'>
          <table className='min-w-full text-sm text-left'>
            <thead className='bg-emerald-50 text-slate-700'>
              <tr>
                <th className='px-3 py-3 font-semibold'>Ranting</th>
                <th className='px-3 py-3 font-semibold'>Penanggung Jawab</th>
                <th className='px-3 py-3 font-semibold'>Jumlah Bulan Ini</th>
                <th className='px-3 py-3 font-semibold'>Jumlah Keseluruhan</th>
                <th className='px-3 py-3 font-semibold'>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className='py-8 text-center text-slate-500'>
                    Memuat data...
                  </td>
                </tr>
              ) : selectedPeriodData.length === 0 ? (
                <tr>
                  <td colSpan={5} className='py-8 text-center text-slate-500'>
                    Belum ada data untuk periode ini.
                  </td>
                </tr>
              ) : (
                selectedPeriodData.map((item) => {
                  const keseluruhan = rantingTotals.get(item.rantingId) || 0;
                  return (
                    <tr key={item.id} className='border-t border-emerald-100'>
                      <td className='px-3 py-3'>{item.rantingNama}</td>
                      <td className='px-3 py-3'>{item.penanggungJawab}</td>
                      <td className='px-3 py-3 font-medium text-emerald-700'>
                        {idrFormatter.format(item.jumlahKoinBulanIni)}
                      </td>
                      <td className='px-3 py-3 font-medium'>
                        {idrFormatter.format(keseluruhan)}
                      </td>
                      <td className='px-3 py-3'>
                        <div className='flex gap-2'>
                          <button
                            onClick={() => openEditForm(item)}
                            className='rounded border border-amber-200 px-3 py-1 text-xs text-amber-700 hover:bg-amber-50'>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className='rounded border border-rose-200 px-3 py-1 text-xs text-rose-700 hover:bg-rose-50'>
                            Hapus
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </article>

      {/* Modal Report */}
      {isReportOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4'>
          <div className='w-full max-w-md rounded-2xl bg-white shadow-2xl'>
            <div className='flex items-center justify-between border-b px-6 py-4'>
              <h3 className='text-lg font-semibold'>Unduh Laporan Koin NU</h3>
              <button
                onClick={() => setIsReportOpen(false)}
                className='text-3xl text-slate-400 hover:text-slate-600'>
                ×
              </button>
            </div>

            <div className='p-6'>
              <label className='block text-sm font-medium mb-2'>
                Pilih Periode
              </label>
              <select
                value={reportPeriod}
                onChange={(e) => setReportPeriod(e.target.value)}
                className='w-full border border-emerald-200 rounded-lg px-4 py-3 text-sm'>
                {dataPeriods.length === 0 ? (
                  <option value=''>Tidak ada data</option>
                ) : (
                  dataPeriods.map((period) => {
                    const { year, month } = parsePeriod(period);
                    return (
                      <option key={period} value={period}>
                        {monthName(month)} {year}
                      </option>
                    );
                  })
                )}
              </select>

              <div className='flex justify-end gap-3 mt-6'>
                <button
                  onClick={() => setIsReportOpen(false)}
                  className='px-6 py-2 border border-emerald-200 rounded-lg'>
                  Batal
                </button>
                <button
                  onClick={handleDownloadReportPdf}
                  className='px-6 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700'>
                  Cetak PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Form */}
      {isFormOpen && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4'>
          <div className='w-full max-w-2xl rounded-2xl bg-white shadow-2xl'>
            <div className='flex items-center justify-between border-b px-6 py-4'>
              <h3 className='text-lg font-semibold'>
                {editingId ? "Edit" : "Tambah"} Koin NU
              </h3>
              <button
                onClick={closeForm}
                className='text-3xl text-slate-400 hover:text-slate-600'>
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className='p-6 space-y-5'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Ranting
                  </label>
                  <select
                    required
                    value={form.rantingId}
                    onChange={(e) => onFormChange("rantingId", e.target.value)}
                    className='w-full border border-emerald-200 rounded-lg px-3 py-2.5'>
                    <option value=''>Pilih Ranting</option>
                    {rantingOptions.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.namaRanting}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Penanggung Jawab
                  </label>
                  <input
                    required
                    value={form.penanggungJawab}
                    onChange={(e) =>
                      onFormChange("penanggungJawab", e.target.value)
                    }
                    className='w-full border border-emerald-200 rounded-lg px-3 py-2.5'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Bulan
                  </label>
                  <input
                    value={monthName(currentMonth)}
                    readOnly
                    className='w-full border border-emerald-200 rounded-lg px-3 py-2.5 bg-gray-100'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium mb-1'>
                    Tahun
                  </label>
                  <input
                    value={currentYear}
                    readOnly
                    className='w-full border border-emerald-200 rounded-lg px-3 py-2.5 bg-gray-100'
                  />
                </div>

                <div className='md:col-span-2'>
                  <label className='block text-sm font-medium mb-1'>
                    Jumlah Koin Bulan Ini (Rp)
                  </label>
                  <input
                    type='text'
                    inputMode='numeric'
                    value={formatRupiah(form.jumlahKoinBulanIni)}
                    onChange={(e) =>
                      onFormChange("jumlahKoinBulanIni", e.target.value)
                    }
                    className='w-full border border-emerald-200 rounded-lg px-3 py-2.5 text-right text-lg'
                    placeholder='0'
                  />
                </div>
              </div>

              <div className='flex justify-end gap-3 pt-4 border-t'>
                <button
                  type='button'
                  onClick={closeForm}
                  className='px-6 py-2 border border-emerald-200 rounded-lg'>
                  Batal
                </button>
                <button
                  type='submit'
                  disabled={isSubmitting}
                  className='px-6 py-2 bg-emerald-600 text-white rounded-lg disabled:opacity-70'>
                  {isSubmitting
                    ? "Menyimpan..."
                    : editingId
                      ? "Simpan Perubahan"
                      : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
