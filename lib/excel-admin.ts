import * as XLSX from "xlsx";

const EXCEL_MIME_TYPE =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function downloadWorkbook(workbook: XLSX.WorkBook, fileName: string) {
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([buffer], { type: EXCEL_MIME_TYPE });
  const url = window.URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  window.URL.revokeObjectURL(url);
}

export async function readFirstSheetRows<T extends Record<string, unknown>>(
  file: File,
) {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
  const sheetName = workbook.SheetNames[0];

  if (!sheetName) {
    return [] as T[];
  }

  const worksheet = workbook.Sheets[sheetName];
  if (!worksheet) {
    return [] as T[];
  }

  return XLSX.utils.sheet_to_json<T>(worksheet, { defval: "" });
}

export function toWorkbookSheet(headers: string[]) {
  return XLSX.utils.aoa_to_sheet([headers]);
}