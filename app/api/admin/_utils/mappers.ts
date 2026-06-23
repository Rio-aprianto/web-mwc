import {
  ActiveStatus,
  JenisKelamin,
  PenggunaRole,
  TriStatus,
} from "@prisma/client";

export function toActiveStatus(value: string): ActiveStatus {
  return value === "Nonaktif" ? ActiveStatus.Nonaktif : ActiveStatus.Aktif;
}

export function toTriStatus(value: string): TriStatus {
  if (value === "Pembinaan") return TriStatus.Pembinaan;
  if (value === "Nonaktif") return TriStatus.Nonaktif;
  return TriStatus.Aktif;
}

export function fromActiveStatus(value: ActiveStatus): "Aktif" | "Nonaktif" {
  return value === ActiveStatus.Nonaktif ? "Nonaktif" : "Aktif";
}

export function fromTriStatus(
  value: TriStatus,
): "Aktif" | "Pembinaan" | "Nonaktif" {
  if (value === TriStatus.Pembinaan) return "Pembinaan";
  if (value === TriStatus.Nonaktif) return "Nonaktif";
  return "Aktif";
}

export function toJenisKelamin(value: string): JenisKelamin {
  return value === "Perempuan" ? JenisKelamin.Perempuan : JenisKelamin.LakiLaki;
}

export function fromJenisKelamin(
  value: JenisKelamin,
): "Laki-laki" | "Perempuan" {
  return value === JenisKelamin.Perempuan ? "Perempuan" : "Laki-laki";
}

export function toPenggunaRole(value: string): PenggunaRole {
  if (value === "Super Admin") return PenggunaRole.SuperAdmin;
  if (value === "Editor Konten") return PenggunaRole.EditorKonten;
  if (value === "Operator Data") return PenggunaRole.OperatorData;
  return PenggunaRole.Kontributor;
}

export function fromPenggunaRole(
  value: PenggunaRole,
): "Super Admin" | "Editor Konten" | "Operator Data" | "Kontributor" {
  if (value === PenggunaRole.SuperAdmin) return "Super Admin";
  if (value === PenggunaRole.EditorKonten) return "Editor Konten";
  if (value === PenggunaRole.OperatorData) return "Operator Data";
  return "Kontributor";
}
