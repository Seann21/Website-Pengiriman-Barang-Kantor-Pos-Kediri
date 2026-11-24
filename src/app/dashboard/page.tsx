"use client";

import { useEffect, useState } from "react";
import {
  Package,
  CalendarDays,
  Clock,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Plus,
  Search,
  RefreshCw,
  Copy,
  Check,
  FileText,
  Truck,
  MapPin,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import { formatRupiah, formatDateShort } from "@/lib/utils";
import type { DashboardData, Pengiriman } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  useEffect(() => {
    let ignore = false;

    async function loadInitialDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok && !ignore) {
          const json: DashboardData = await res.json();
          setData(json);
          setLastUpdated(
            new Date().toLocaleTimeString("id-ID", {
              hour: "2-digit",
              minute: "2-digit",
            })
          );
          setLoading(false);
        }
      } catch (error) {
        if (!ignore) {
          console.error("Gagal memuat data dashboard:", error);
          setLoading(false);
        }
      }
    }

    loadInitialDashboard();

    return () => {
      ignore = true;
    };
  }, []);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      const res = await fetch("/api/dashboard");
      if (res.ok) {
        const json: DashboardData = await res.json();
        setData(json);
        setLastUpdated(
          new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        );
        setToastMessage("Data dashboard berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Gagal menyegarkan dashboard:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setToastMessage(`Nomor resi ${resi} berhasil disalin!`);
    setTimeout(() => {
      setCopiedResi(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-slate-200/70 rounded-2xl w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 h-36" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 h-96" />
          <div className="bg-white rounded-3xl p-6 border border-slate-100 h-96" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const totalStatus =
    (data.statusCount.diproses || 0) +
    (data.statusCount.dikirim || 0) +
    (data.statusCount.dalamPerjalanan || 0) +
    (data.statusCount.sampaiTujuan || 0) +
    (data.statusCount.diterima || 0);

  const statsCards = [
    {
      label: "Total Seluruh Pengiriman",
      value: data.totalSemuaPengiriman,
      icon: Package,
      textColor: "text-blue-600",
      bgLight: "bg-blue-50",
      description: "Data paket terdaftar",
    },
    {
      label: "Pengiriman Hari Ini",
      value: data.totalHariIni,
      icon: CalendarDays,
      textColor: "text-orange-600",
      bgLight: "bg-orange-50",
      description: "Paket masuk hari ini",
    },
    {
      label: "Pengiriman Bulan Ini",
      value: data.totalBulanIni,
      icon: TrendingUp,
      textColor: "text-emerald-600",
      bgLight: "bg-emerald-50",
      description: "Total akumulasi bulan berjalan",
    },
    {
      label: "Sedang Diproses",
      value: data.statusCount.diproses,
      icon: Clock,
      textColor: "text-amber-600",
      bgLight: "bg-amber-50",
      description: "Menunggu pemberangkatan",
    },
  ];

  const statusProgressItems = [
    {
      label: "Diproses",
      count: data.statusCount.diproses,
      color: "bg-amber-500",
      bgLight: "bg-amber-50",
    },
    {
      label: "Dikirim",
      count: data.statusCount.dikirim,
      color: "bg-blue-500",
      bgLight: "bg-blue-50",
    },
    {
      label: "Dalam Perjalanan",
      count: data.statusCount.dalamPerjalanan,
      color: "bg-purple-500",
      bgLight: "bg-purple-50",
    },
    {
      label: "Sampai Tujuan",
      count: data.statusCount.sampaiTujuan,
      color: "bg-teal-500",
      bgLight: "bg-teal-50",
    },
    {
      label: "Diterima",
      count: data.statusCount.diterima,
      color: "bg-emerald-500",
      bgLight: "bg-emerald-50",
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Page Header with Interactive Refresh */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Dashboard Operasional
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
              Kantor Pos Kediri
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitoring arus barang dan status pengiriman secara real-time
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {lastUpdated && (
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              Pembaruan: {lastUpdated}
            </span>
          )}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer transition-colors active:scale-95 disabled:opacity-50"
            title="Segarkan data"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-orange-600" : ""}`}
            />
            <span>Segarkan</span>
          </button>

          <Link
            href="/dashboard/pengiriman/tambah"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-orange-600/20 cursor-pointer transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Kirim Paket Baru</span>
          </Link>
        </div>
      </div>

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link
          href="/dashboard/pengiriman/tambah"
          className="group flex items-center justify-between p-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-2xl shadow-sm transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold">Input Pengiriman</p>
              <p className="text-[11px] text-white/80">Cetak resi pengiriman baru</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-white/70 group-hover:translate-x-1 transition-transform" />
        </Link>

        <Link
          href="/dashboard/tracking"
          className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Lacak Nomor Resi</p>
              <p className="text-[11px] text-slate-500">Cari progres status kurir</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
        </Link>

        <Link
          href="/dashboard/laporan"
          className="group flex items-center justify-between p-4 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-2xl shadow-xs transition-all hover:-translate-y-0.5"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800">Rekapitulasi Laporan</p>
              <p className="text-[11px] text-slate-500">Cetak & unduh laporan berkala</p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition-all" />
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`w-11 h-11 ${stat.bgLight} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}
                >
                  <Icon className={`w-5 h-5 ${stat.textColor}`} />
                </div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Kediri
                </span>
              </div>
              <p className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stat.value.toLocaleString("id-ID")}
              </p>
              <p className="text-xs font-bold text-slate-700 mt-1">
                {stat.label}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                {stat.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Interactive Status Distribution Bar */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Distribusi Status Pengiriman
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Persentase proporsi seluruh paket aktif
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Total {totalStatus} Paket
          </span>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex mb-5">
          {totalStatus > 0 ? (
            statusProgressItems.map((item, idx) => {
              const pct = (item.count / totalStatus) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={idx}
                  style={{ width: `${pct}%` }}
                  title={`${item.label}: ${item.count} (${pct.toFixed(1)}%)`}
                  className={`${item.color} h-full transition-all duration-500 relative first:rounded-l-full last:rounded-r-full hover:brightness-95`}
                />
              );
            })
          ) : (
            <div className="h-full w-full bg-slate-200" />
          )}
        </div>

        {/* Status Counts Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {statusProgressItems.map((item, i) => {
            const percentage =
              totalStatus > 0 ? ((item.count / totalStatus) * 100).toFixed(0) : "0";
            return (
              <div
                key={i}
                className={`${item.bgLight} rounded-2xl p-3 border border-transparent hover:border-slate-200 transition-all text-center`}
              >
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className={`w-2 h-2 ${item.color} rounded-full`} />
                  <span className="text-[11px] font-bold text-slate-600 truncate">
                    {item.label}
                  </span>
                </div>
                <p className="text-xl font-extrabold text-slate-800">{item.count}</p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">
                  {percentage}% dari total
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Shipments Table with Interactive Resi Copying */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-orange-600" />
              <h2 className="text-base font-bold text-slate-800">
                Pengiriman Terbaru
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              10 transaksi resi terakhir yang dicatat dalam sistem
            </p>
          </div>
          <Link
            href="/dashboard/pengiriman"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group self-start sm:self-auto"
          >
            <span>Buka Semua Pengiriman</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">No. Resi</th>
                <th className="px-5 py-3.5">Pengirim</th>
                <th className="px-5 py-3.5">Penerima</th>
                <th className="px-5 py-3.5 hidden md:table-cell">Tujuan</th>
                <th className="px-5 py-3.5">Biaya</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {data.pengirimanTerbaru.map((item: Pengiriman) => {
                const isCopied = copiedResi === item.nomorResi;
                return (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/70 transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/50">
                          {item.nomorResi}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(item.nomorResi)}
                          className="p-1 hover:bg-slate-200 text-slate-400 hover:text-slate-700 rounded-md transition-colors cursor-pointer"
                          title="Salin nomor resi"
                        >
                          {isCopied ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-700 text-xs">
                      {item.namaPengirim}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-600">
                      {item.namaPenerima}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 hidden md:table-cell max-w-[200px] truncate">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{item.alamatTujuan}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-bold text-xs text-slate-800">
                      {formatRupiah(item.biaya)}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500">
                      {formatDateShort(item.tanggalKirim)}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <StatusBadge status={item.status} size="sm" />
                    </td>
                  </tr>
                );
              })}

              {data.pengirimanTerbaru.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm text-slate-600">
                      Belum Ada Pengiriman
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Mulai catat transaksi pengiriman baru sekarang.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
