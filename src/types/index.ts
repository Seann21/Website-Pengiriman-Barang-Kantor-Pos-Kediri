export type StatusType =
  | "Diproses"
  | "Dikirim"
  | "Dalam Perjalanan"
  | "Sampai Tujuan"
  | "Diterima";

export interface Pengiriman {
  id: string;
  nomorResi: string;
  namaPengirim: string;
  namaPenerima: string;
  alamatTujuan: string;
  telpPengirim: string;
  telpPenerima: string;
  berat: number;
  biaya: number;
  tanggalKirim: string | Date;
  status: StatusType | string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DashboardData {
  totalHariIni: number;
  totalBulanIni: number;
  totalSemuaPengiriman: number;
  statusCount: {
    diproses: number;
    dikirim: number;
    dalamPerjalanan: number;
    sampaiTujuan: number;
    diterima: number;
  };
  pengirimanTerbaru: Pengiriman[];
}

export interface LaporanSummary {
  totalPengiriman: number;
  totalBiaya: number;
  totalBerat: number;
}

export interface LaporanResponse {
  data: Pengiriman[];
  summary: LaporanSummary;
}

export interface TrackingResult extends Pengiriman {
  riwayat?: Array<{
    status: string;
    waktu: string;
    keterangan: string;
    lokasi: string;
  }>;
}

