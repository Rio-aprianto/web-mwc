import Swal from "sweetalert2";

const base = {
  confirmButtonColor: "#059669",
  cancelButtonColor: "#e11d48",
  background: "#ffffff",
};

export async function confirmDelete(entityLabel: string): Promise<boolean> {
  const result = await Swal.fire({
    ...base,
    title: "Hapus data?",
    text: `Data ${entityLabel} akan dihapus permanen.`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Ya, hapus",
    cancelButtonText: "Batal",
    reverseButtons: true,
  });

  return result.isConfirmed;
}

export async function notifySaved(action: "create" | "update", entityLabel: string) {
  await Swal.fire({
    ...base,
    title: action === "create" ? "Berhasil ditambahkan" : "Berhasil diperbarui",
    text:
      action === "create"
        ? `Data ${entityLabel} berhasil disimpan.`
        : `Perubahan data ${entityLabel} berhasil disimpan.`,
    icon: "success",
    timer: 1600,
    showConfirmButton: false,
  });
}

export async function notifyDeleted(entityLabel: string) {
  await Swal.fire({
    ...base,
    title: "Berhasil dihapus",
    text: `Data ${entityLabel} berhasil dihapus.`,
    icon: "success",
    timer: 1600,
    showConfirmButton: false,
  });
}

export async function notifyBulkSaved(entityLabel: string, count: number) {
  await Swal.fire({
    ...base,
    title: "Impor selesai",
    text: `${count} data ${entityLabel} berhasil diimpor.`,
    icon: "success",
    timer: 1600,
    showConfirmButton: false,
  });
}

export async function notifyError(message: string) {
  await Swal.fire({
    ...base,
    title: "Terjadi masalah",
    text: message,
    icon: "error",
    confirmButtonText: "Tutup",
  });
}

export async function notifyWarning(message: string) {
  await Swal.fire({
    ...base,
    title: "Perhatian",
    text: message,
    icon: "warning",
    confirmButtonText: "Mengerti",
  });
}

export async function readErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string }
    | null;
  return payload?.message || fallback;
}
