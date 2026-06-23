export type RantingItem = {
  id: number;
  namaRanting: string;
  status: "Aktif" | "Pembinaan" | "Nonaktif";
  jumlahKader: number;
};

export type BanomItem = {
  id: number;
  namaBanom: string;
  fokus: string;
  anggota: number;
  status: "Aktif" | "Penguatan";
};

export const initialRantingData: RantingItem[] = [
  {
    id: 1,
    namaRanting: "Ranting Utara",
    status: "Aktif",
    jumlahKader: 26,
  },
  {
    id: 2,
    namaRanting: "Ranting Timur",
    status: "Aktif",
    jumlahKader: 18,
  },
  {
    id: 3,
    namaRanting: "Ranting Selatan",
    status: "Aktif",
    jumlahKader: 22,
  },
  {
    id: 4,
    namaRanting: "Ranting Barat",
    status: "Pembinaan",
    jumlahKader: 14,
  },
];

export const initialBanomData: BanomItem[] = [
  {
    id: 1,
    namaBanom: "Pemuda",
    fokus: "Kaderisasi",
    anggota: 42,
    status: "Aktif",
  },
  {
    id: 2,
    namaBanom: "Perempuan",
    fokus: "Pemberdayaan",
    anggota: 36,
    status: "Aktif",
  },
  {
    id: 3,
    namaBanom: "Pelajar",
    fokus: "Pendidikan",
    anggota: 51,
    status: "Aktif",
  },
  {
    id: 4,
    namaBanom: "Kesehatan",
    fokus: "Layanan Sosial",
    anggota: 19,
    status: "Penguatan",
  },
];

export const rantingSelectOptions = initialRantingData.map((item) => ({
  label: item.namaRanting,
  value: item.namaRanting,
}));

export const banomSelectOptions = initialBanomData.map((item) => ({
  label: item.namaBanom,
  value: item.namaBanom,
}));