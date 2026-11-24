"use client";

import { useState } from "react";
import {
  Search,
  Calendar,
  FileText,
  Printer,
  Package,
  CreditCard,
  Weight,
  Loader2,
  Download,
  Sparkles,
} from "lucide-react";
import {
  formatRupiah,
  formatDate,
  formatDateShort,
  formatDateInput,
  exportToCSV,
} from "@/lib/utils";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import type { LaporanResponse } from "@/types";

export default function LaporanPage() {
  const todayStr = formatDateInput(new Date());
  const [startDate, setStartDate] = useState(todayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<LaporanResponse | null>(null);
  const [error, setError] = useState("");
  const [searched, setSearched] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fetchLaporan = async (start: string, end: string) => {
    if (!start || !end) return;

    setLoading(true);
    setError("");
    setSearched(true);

    try {
      const params = new URLSearchParams({
        startDate: start,
        endDate: end,
      });
      const res = await fetch(`/api/laporan?${params.toString()}`);

      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const data = await res.json();
        setError(data.error || "Gagal memuat rekap laporan");
      }
    } catch {
      setError("Terjadi kesalahan jaringan saat memuat laporan");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLaporan(startDate, endDate);
  };

  // Quick Preset Handlers
  const handlePreset = (type: "today" | "last7" | "thisMonth" | "thisYear") => {
    const now = new Date();
    let start = new Date();
    const end = new Date();

    if (type === "today") {
      start = new Date();
    } else if (type === "last7") {
      start.setDate(now.getDate() - 7);
    } else if (type === "thisMonth") {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else if (type === "thisYear") {
      start = new Date(now.getFullYear(), 0, 1);
    }

    const startFormatted = formatDateInput(start);
    const endFormatted = formatDateInput(end);

    setStartDate(startFormatted);
    setEndDate(endFormatted);
    fetchLaporan(startFormatted, endFormatted);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    if (!result || result.data.length === 0) return;

    const headers = [
      "Nomor Resi",
      "Tanggal Kirim",
      "Nama Pengirim",
      "No Telp Pengirim",
      "Nama Penerima",
      "No Telp Penerima",
      "Alamat Tujuan",
      "Berat (kg)",
      "Biaya (Rp)",
      "Status",
    ];

    const rows = result.data.map((item) => [
      item.nomorResi,
      formatDateShort(item.tanggalKirim),
      item.namaPengirim,
      item.telpPengirim || "",
      item.namaPenerima,
      item.telpPenerima || "",
      item.alamatTujuan,
      item.berat,
      item.biaya,
      item.status,
    ]);

    exportToCSV(`Laporan-Pengiriman-POS-${startDate}-sd-${endDate}`, headers, rows);
    setToastMessage("File CSV laporan berhasil diunduh!");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in print:max-w-none print:m-0 print:space-y-4">
      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header - Hidden on Print */}
      <div className="print:hidden">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
          Laporan Rekapitulasi Pengiriman
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Rekapitulasi volume paket, berat akumulatif, dan pendapatan kiriman Kantor Pos Kediri
        </p>
      </div>

      {/* Official Print Header - Visible only when printing */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-5 mb-6">
        <h1 className="text-xl font-bold uppercase tracking-wider text-slate-900">
          PT POS INDONESIA (PERSERO)
        </h1>
        <h2 className="text-sm font-bold text-slate-700">
          KANTOR POS CABANG KOTA KEDIRI - 64100
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Laporan Rekapitulasi Transaksi Pengiriman Barang
        </p>
        <p className="text-xs font-semibold text-slate-800 mt-2">
          Periode: {startDate ? formatDate(startDate) : "-"} s/d{" "}
          {endDate ? formatDate(endDate) : "-"}
        </p>
      </div>

      {/* Filter Section - Hidden on Print */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 print:hidden">
        {/* Quick Range Presets */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Pilihan Periode:
          </span>
          <button
            type="button"
            onClick={() => handlePreset("today")}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => handlePreset("last7")}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            7 Hari Terakhir
          </button>
          <button
            type="button"
            onClick={() => handlePreset("thisMonth")}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            Bulan Ini
          </button>
          <button
            type="button"
            onClick={() => handlePreset("thisYear")}
            className="px-3 py-1 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-slate-700 font-bold cursor-pointer transition-colors"
          >
            Tahun Ini
          </button>
        </div>

        {/* Date Inputs Form */}
        <form
          onSubmit={handleSearch}
          className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end pt-1"
        >
          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>Dari Tanggal</span>
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-orange-600" />
              <span>Sampai Tanggal</span>
            </label>
            <input
              type="date"
              value={endDate}
              min={startDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading || !startDate || !endDate}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-xl shadow-md shadow-orange-600/20 text-xs sm:text-sm disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Tampilkan Laporan</span>
          </button>
        </form>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-slide-up print:hidden">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Report Result */}
      {result && (
        <div className="space-y-6 animate-slide-up print:space-y-4">
          {/* Action Bar (Print & Export CSV) - Hidden on print */}
          <div className="flex items-center justify-between gap-3 print:hidden">
            <p className="text-xs font-semibold text-slate-500">
              Ditemukan <span className="font-bold text-slate-800">{result.summary.totalPengiriman}</span> transaksi pada rentang terpilih
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportCSV}
                className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Unduh CSV (Excel)</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:grid-cols-3 print:gap-2">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs print:rounded-none print:border print:border-slate-300">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center print:hidden">
                  <Package className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800">
                  Total Paket
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {result.summary.totalPengiriman}{" "}
                <span className="text-xs text-slate-400 font-semibold print:hidden">
                  resi
                </span>
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs print:rounded-none print:border print:border-slate-300">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center print:hidden">
                  <Weight className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800">
                  Total Berat Barang
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {result.summary.totalBerat}{" "}
                <span className="text-xs text-slate-400 font-semibold print:hidden">
                  kg
                </span>
              </p>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs print:rounded-none print:border print:border-slate-300">
              <div className="flex items-center gap-2.5 mb-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center print:hidden">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider print:text-slate-800">
                  Total Pendapatan
                </h3>
              </div>
              <p className="text-2xl font-extrabold text-orange-600 tracking-tight">
                {formatRupiah(result.summary.totalBiaya)}
              </p>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden print:rounded-none print:border print:border-slate-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left print:text-xs">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 print:bg-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider print:text-slate-800">
                    <th className="px-5 py-3">No. Resi</th>
                    <th className="px-5 py-3">Tanggal</th>
                    <th className="px-5 py-3">Pengirim</th>
                    <th className="px-5 py-3">Penerima</th>
                    <th className="px-5 py-3 text-right">Berat</th>
                    <th className="px-5 py-3 text-right">Biaya Kirim</th>
                    <th className="px-5 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs sm:text-sm print:text-xs">
                  {result.data.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-5 py-12 text-center text-slate-400"
                      >
                        Tidak ada catatan pengiriman pada rentang tanggal tersebut.
                      </td>
                    </tr>
                  ) : (
                    result.data.map((item) => (
                      <tr
                        key={item.id}
                        className="hover:bg-slate-50/70 transition-colors"
                      >
                        <td className="px-5 py-3 font-mono font-bold text-blue-700 text-xs">
                          {item.nomorResi}
                        </td>
                        <td className="px-5 py-3 text-slate-500 text-xs">
                          {formatDateShort(item.tanggalKirim)}
                        </td>
                        <td className="px-5 py-3 font-semibold text-slate-700 text-xs">
                          {item.namaPengirim}
                        </td>
                        <td className="px-5 py-3 text-slate-600 text-xs">
                          {item.namaPenerima}
                        </td>
                        <td className="px-5 py-3 font-bold text-slate-800 text-right text-xs">
                          {item.berat} kg
                        </td>
                        <td className="px-5 py-3 font-extrabold text-slate-900 text-right text-xs">
                          {formatRupiah(item.biaya)}
                        </td>
                        <td className="px-5 py-3 text-center">
                          <div className="print:hidden">
                            <StatusBadge status={item.status} size="sm" />
                          </div>
                          <span className="hidden print:inline text-[11px] font-bold uppercase">
                            {item.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                {result.data.length > 0 && (
                  <tfoot className="bg-slate-50/80 font-bold text-slate-800 border-t-2 border-slate-200">
                    <tr>
                      <td colSpan={4} className="px-5 py-3 text-right text-xs">
                        TOTAL AKUMULASI
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-extrabold">
                        {result.summary.totalBerat} kg
                      </td>
                      <td className="px-5 py-3 text-right text-xs font-extrabold text-orange-600">
                        {formatRupiah(result.summary.totalBiaya)}
                      </td>
                      <td />
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Official Signature Box - Visible only on Print */}
          <div className="hidden print:flex justify-end mt-12 pt-6">
            <div className="text-center w-64">
              <p className="text-xs mb-16">
                Kediri, {formatDate(new Date())}
                <br />
                Petugas Verifikasi Laporan,
              </p>
              <p className="text-xs font-bold underline">
                Administrator Kantor Pos Kediri
              </p>
              <p className="text-[10px] text-slate-500">NIP / ID: POS-KDR-64100</p>
            </div>
          </div>
        </div>
      )}

      {/* Initial Empty State - Hidden on Print */}
      {!result && !error && !loading && !searched && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center print:hidden shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            Pilih Rentang Tanggal Laporan
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Gunakan tombol pilihan periode di atas atau tentukan tanggal sendiri, lalu klik &quot;Tampilkan Laporan&quot;.
          </p>
        </div>
      )}
    </div>
  );
}
