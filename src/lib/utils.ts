export const STATUS_LIST = [
  "Diproses",
  "Dikirim",
  "Dalam Perjalanan",
  "Sampai Tujuan",
  "Diterima",
] as const;

export type StatusType = (typeof STATUS_LIST)[number];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatDate(date: Date | string): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateShort(date: Date | string): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  if (!date) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function formatDateInput(date: Date | string): string {
  if (!date) return "";
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function generateResi(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9000) + 1000);
  return `POS-${year}${month}${day}-${random}`;
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Diproses":
      return "bg-amber-50 text-amber-700 border-amber-200 ring-amber-500/20";
    case "Dikirim":
      return "bg-blue-50 text-blue-700 border-blue-200 ring-blue-500/20";
    case "Dalam Perjalanan":
      return "bg-purple-50 text-purple-700 border-purple-200 ring-purple-500/20";
    case "Sampai Tujuan":
      return "bg-teal-50 text-teal-700 border-teal-200 ring-teal-500/20";
    case "Diterima":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 ring-emerald-500/20";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200 ring-slate-500/20";
  }
}

export function getStatusDotColor(status: string): string {
  switch (status) {
    case "Diproses":
      return "bg-amber-500";
    case "Dikirim":
      return "bg-blue-500";
    case "Dalam Perjalanan":
      return "bg-purple-500";
    case "Sampai Tujuan":
      return "bg-teal-500";
    case "Diterima":
      return "bg-emerald-500";
    default:
      return "bg-slate-400";
  }
}

export function getStatusIndex(status: string): number {
  return STATUS_LIST.indexOf(status as StatusType);
}

/**
 * Standard Pos Indonesia rate calculation:
 * Minimum 1 kg = Rp 10.000, each additional kg is Rp 8.000
 */
export function calculateEstimatedCost(weightKg: number): number {
  if (weightKg <= 0 || isNaN(weightKg)) return 0;
  if (weightKg <= 1) return 10000;
  return 10000 + Math.ceil(weightKg - 1) * 8000;
}

/**
 * Client-side CSV Exporter for reports
 */
export function exportToCSV(
  filename: string,
  headers: string[],
  rows: (string | number)[][]
): void {
  const csvContent =
    "data:text/csv;charset=utf-8," +
    [
      headers.join(";"),
      ...rows.map((row) =>
        row
          .map((item) => {
            const str = String(item ?? "");
            return str.includes(";") || str.includes(",") || str.includes("\n")
              ? `"${str.replace(/"/g, '""')}"`
              : str;
          })
          .join(";")
      ),
    ].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
