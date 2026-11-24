"use client";

import { useEffect, useState, useCallback, useTransition } from "react";
import Link from "next/link";
import {
  Search,
  Plus,
  Edit3,
  Trash2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  X,
  PackageCheck,
  MapPin,
  Phone,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import { formatRupiah, formatDateShort, STATUS_LIST } from "@/lib/utils";
import type { Pengiriman } from "@/types";

export default function PengirimanPage() {
  const [data, setData] = useState<Pengiriman[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showStatusModal, setShowStatusModal] = useState<Pengiriman | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [copiedResi, setCopiedResi] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const loadData = useCallback(
    async (targetPage: number, query: string, status: string) => {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: targetPage.toString(),
          limit: "10",
        });
        if (query.trim()) params.set("search", query.trim());
        if (status) params.set("status", status);

        const res = await fetch(`/api/pengiriman?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json.data || []);
          setTotalPages(json.totalPages || 1);
          setTotal(json.total || 0);
        }
      } catch (error) {
        console.error("Gagal memuat data pengiriman:", error);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    let ignore = false;
    const fetchAsync = async () => {
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          limit: "10",
        });
        if (search.trim()) params.set("search", search.trim());
        if (statusFilter) params.set("status", statusFilter);

        const res = await fetch(`/api/pengiriman?${params.toString()}`);
        if (res.ok && !ignore) {
          const json = await res.json();
          setData(json.data || []);
          setTotalPages(json.totalPages || 1);
          setTotal(json.total || 0);
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error(err);
          setLoading(false);
        }
      }
    };

    fetchAsync();

    return () => {
      ignore = true;
    };
  }, [page, search, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData(1, search, statusFilter);
  };

  const handleReset = () => {
    setSearch("");
    setStatusFilter("");
    setPage(1);
    loadData(1, "", "");
  };

  const copyToClipboard = (resi: string) => {
    navigator.clipboard.writeText(resi);
    setCopiedResi(resi);
    setToastMessage(`Nomor resi ${resi} berhasil disalin!`);
    setTimeout(() => setCopiedResi(null), 2000);
  };

  const handleDelete = async (id: string) => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/pengiriman/${id}`, { method: "DELETE" });
      if (res.ok) {
        setShowDeleteModal(null);
        setToastMessage("Data pengiriman berhasil dihapus!");
        loadData(page, search, statusFilter);
      }
    } catch (error) {
      console.error("Gagal menghapus:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const pengiriman = data.find((p) => p.id === id);
      if (!pengiriman) return;

      const res = await fetch(`/api/pengiriman/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pengiriman, status: newStatus }),
      });

      if (res.ok) {
        setShowStatusModal(null);
        setToastMessage(`Status resi diperbarui menjadi "${newStatus}"!`);
        startTransition(() => {
          loadData(page, search, statusFilter);
        });
      }
    } catch (error) {
      console.error("Gagal update status:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">
              Daftar Pengiriman Barang
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {total} Data
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Kelola, monitor, dan perbarui data resi kiriman Kantor Pos Kediri
          </p>
        </div>

        <Link
          href="/dashboard/pengiriman/tambah"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-semibold rounded-2xl shadow-md shadow-orange-600/20 text-xs sm:text-sm transition-all active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Pengiriman Baru</span>
        </Link>
      </div>

      {/* Search & Quick Status Filters */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari berdasarkan resi, pengirim, penerima, atau kota tujuan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-2.5 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white text-slate-800 placeholder-slate-400"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  loadData(1, "", statusFilter);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-2xl text-xs sm:text-sm font-semibold cursor-pointer transition-colors"
          >
            Cari
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="p-2.5 border border-slate-200 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors cursor-pointer"
            title="Reset pencarian dan filter"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </form>

        {/* Quick Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 shrink-0">
            Filter Status:
          </span>
          <button
            type="button"
            onClick={() => {
              setStatusFilter("");
              setPage(1);
            }}
            className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
              statusFilter === ""
                ? "bg-slate-800 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            Semua
          </button>

          {STATUS_LIST.map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => {
                setStatusFilter(status);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-xl font-bold cursor-pointer transition-all shrink-0 ${
                statusFilter === status
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="px-5 py-3.5">No. Resi</th>
                <th className="px-5 py-3.5">Pengirim</th>
                <th className="px-5 py-3.5">Penerima</th>
                <th className="px-5 py-3.5 hidden lg:table-cell">Tujuan</th>
                <th className="px-5 py-3.5">Berat</th>
                <th className="px-5 py-3.5">Biaya</th>
                <th className="px-5 py-3.5">Tanggal</th>
                <th className="px-5 py-3.5 text-center">Status (Klik Ubah)</th>
                <th className="px-5 py-3.5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(9)].map((_, j) => (
                      <td key={j} className="px-5 py-4">
                        <div className="h-4 bg-slate-100 rounded-lg w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-5 py-16 text-center text-slate-400">
                    <div className="max-w-xs mx-auto">
                      <PackageCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="font-bold text-slate-700 text-sm">
                        Tidak Ada Data Pengiriman
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        Coba sesuaikan kata kunci pencarian atau ubah filter status di atas.
                      </p>
                      {(search || statusFilter) && (
                        <button
                          onClick={handleReset}
                          className="mt-3 text-xs font-bold text-orange-600 hover:underline cursor-pointer"
                        >
                          Bersihkan Filter
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item) => {
                  const isCopied = copiedResi === item.nomorResi;
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 transition-colors group"
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200/50">
                            {item.nomorResi}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.nomorResi)}
                            className="p-1 hover:bg-slate-200 rounded-md text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                            title="Salin Resi"
                          >
                            {isCopied ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800 text-xs">
                          {item.namaPengirim}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.telpPengirim}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-800 text-xs">
                          {item.namaPenerima}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          {item.telpPenerima}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell max-w-[200px]">
                        <span className="inline-flex items-center gap-1 text-slate-600 text-xs truncate">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{item.alamatTujuan}</span>
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-700 text-xs">
                        {item.berat} kg
                      </td>
                      <td className="px-5 py-3.5 font-extrabold text-slate-800 text-xs">
                        {formatRupiah(item.biaya)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                        {formatDateShort(item.tanggalKirim)}
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => setShowStatusModal(item)}
                          className="cursor-pointer group/btn"
                          title="Klik untuk ubah status secara instan"
                        >
                          <StatusBadge status={item.status} size="sm" />
                        </button>
                      </td>
                      <td className="px-5 py-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/dashboard/tracking?resi=${encodeURIComponent(
                              item.nomorResi
                            )}`}
                            className="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors cursor-pointer"
                            title="Lacak Paket"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Link>
                          <Link
                            href={`/dashboard/pengiriman/${item.id}/edit`}
                            className="p-1.5 hover:bg-orange-50 text-slate-400 hover:text-orange-600 rounded-lg transition-colors cursor-pointer"
                            title="Edit Data"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Link>
                          <button
                            type="button"
                            onClick={() => setShowDeleteModal(item.id)}
                            className="p-1.5 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Data"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500 font-medium">
              Menampilkan halaman <span className="font-bold">{page}</span> dari{" "}
              <span className="font-bold">{totalPages}</span> (Total {total} paket)
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Halaman sebelumnya"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNumber = i + 1;
                // Only show around current page
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= page - 1 && pageNumber <= page + 1)
                ) {
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setPage(pageNumber)}
                      className={`w-8 h-8 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                        page === pageNumber
                          ? "bg-orange-600 text-white shadow-xs"
                          : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === page - 2 ||
                  pageNumber === page + 2
                ) {
                  return (
                    <span key={i} className="px-1 text-slate-400 text-xs">
                      ...
                    </span>
                  );
                }
                return null;
              })}

              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 border border-slate-200 bg-white hover:bg-slate-100 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                aria-label="Halaman berikutnya"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-slide-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-800">
                  Perbarui Status Kiriman
                </h3>
                <p className="text-xs text-blue-600 font-mono font-bold mt-0.5">
                  {showStatusModal.nomorResi}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowStatusModal(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              Pilih status tahapan terbaru untuk paket ini:
            </p>

            <div className="space-y-2">
              {STATUS_LIST.map((status) => {
                const isCurrent = showStatusModal.status === status;
                return (
                  <button
                    key={status}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() =>
                      handleStatusUpdate(showStatusModal.id, status)
                    }
                    className={`w-full text-left px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                      isCurrent
                        ? "bg-orange-50 text-orange-700 border-2 border-orange-300 shadow-xs"
                        : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60"
                    }`}
                  >
                    <span>{status}</span>
                    {isCurrent && (
                      <span className="text-[10px] bg-orange-200/70 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                        Aktif
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => setShowStatusModal(null)}
              className="w-full mt-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-rose-100 text-rose-600">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-800">
              Hapus Data Pengiriman?
            </h3>
            <p className="text-xs text-center text-slate-500 mt-2 leading-relaxed">
              Tindakan ini akan menghapus catatan resi secara permanen dari basis data sistem POS Kediri.
            </p>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowDeleteModal(null)}
                className="flex-1 py-2.5 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => handleDelete(showDeleteModal)}
                disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-2xl text-xs font-semibold hover:bg-rose-700 disabled:opacity-50 cursor-pointer shadow-md shadow-rose-600/20 transition-colors"
              >
                {deleting ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
