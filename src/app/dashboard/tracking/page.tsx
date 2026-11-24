"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  Package,
  MapPin,
  Calendar,
  Weight,
  CreditCard,
  CheckCircle2,
  Circle,
  Loader2,
  Copy,
  Check,
  Printer,
  Sparkles,
  Phone,
  Truck,
  Building,
} from "lucide-react";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import {
  formatRupiah,
  formatDate,
  getStatusIndex,
} from "@/lib/utils";
import type { TrackingResult } from "@/types";

const SAMPLE_RESIS = [
  "POS-20240101-0001",
  "POS-20240101-0002",
  "POS-20240101-0003",
  "POS-20240101-0004",
];

function TrackingContent() {
  const searchParams = useSearchParams();
  const initialResi = searchParams.get("resi") || "";

  const [resi, setResi] = useState(initialResi);
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    if (!initialResi) return;

    async function trackInitial() {
      setLoading(true);
      setError("");
      try {
        const res = await fetch(
          `/api/tracking?resi=${encodeURIComponent(initialResi.trim())}`
        );
        if (res.ok && !ignore) {
          const data = await res.json();
          setResult(data);
          setLoading(false);
        } else if (!ignore) {
          const data = await res.json();
          setError(
            data.error || "Pengiriman dengan nomor resi tersebut tidak ditemukan."
          );
          setLoading(false);
        }
      } catch (err) {
        if (!ignore) {
          console.error("Gagal melacak:", err);
          setError("Terjadi gangguan saat menghubungkan ke server.");
          setLoading(false);
        }
      }
    }

    trackInitial();

    return () => {
      ignore = true;
    };
  }, [initialResi]);

  const handleManualSearch = async (targetResi: string) => {
    if (!targetResi.trim()) return;

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await fetch(
        `/api/tracking?resi=${encodeURIComponent(targetResi.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setResult(data);
      } else {
        const data = await res.json();
        setError(data.error || "Pengiriman dengan nomor resi tersebut tidak ditemukan.");
      }
    } catch {
      setError("Terjadi gangguan saat menghubungkan ke server.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleManualSearch(resi);
  };

  const copyResi = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.nomorResi);
    setCopied(true);
    setToastMessage(`Nomor resi ${result.nomorResi} berhasil disalin!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const currentStatusIndex = result ? getStatusIndex(result.status) : -1;

  const timelineSteps = [
    {
      title: "Diproses di Loket",
      subtitle: "Kantor Pos Kediri (Pemeriksaan & Pengemasan)",
      icon: Building,
      index: 0,
    },
    {
      title: "Dikirim dari Pusat Sortir",
      subtitle: "Hub Pos Wilayah Jawa Timur (Sortir Wilayah)",
      icon: Package,
      index: 1,
    },
    {
      title: "Dalam Perjalanan Ekspedisi",
      subtitle: "Armada Logistik Pos Indonesia menuju kota tujuan",
      icon: Truck,
      index: 2,
    },
    {
      title: "Sampai di Kantor Tujuan",
      subtitle: "Paket diterima cabang tujuan & disiapkan kurir",
      icon: MapPin,
      index: 3,
    },
    {
      title: "Paket Diterima",
      subtitle: "Diserahkan langsung ke tangan penerima",
      icon: CheckCircle2,
      index: 4,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in print:max-w-none print:m-0">
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
          Pelacakan Resi Kiriman
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
          Pantau posisi dan status logistik paket Anda di seluruh jaringan Kantor Pos
        </p>
      </div>

      {/* Official Print Header */}
      <div className="hidden print:block text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h2 className="text-xl font-bold uppercase tracking-wider text-slate-900">
          PT POS INDONESIA (PERSERO)
        </h2>
        <p className="text-xs text-slate-600">
          Kantor Pos Cabang Kediri • Bukti Resmi Pelacakan Pengiriman
        </p>
      </div>

      {/* Search Input Box - Hidden on Print */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-3 print:hidden">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={resi}
              onChange={(e) => setResi(e.target.value)}
              placeholder="Masukkan nomor resi (contoh: POS-20240101-0001)"
              className="w-full pl-10 pr-4 py-3 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs sm:text-sm font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !resi.trim()}
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-2xl shadow-md shadow-orange-600/20 text-xs sm:text-sm disabled:opacity-50 cursor-pointer flex items-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            <span>Lacak</span>
          </button>
        </form>

        {/* Clickable Quick Sample Resi Tags */}
        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-orange-500" />
            Resi Contoh:
          </span>
          {SAMPLE_RESIS.map((sample) => (
            <button
              key={sample}
              type="button"
              onClick={() => {
                setResi(sample);
                handleManualSearch(sample);
              }}
              className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 hover:bg-orange-100 font-mono text-[11px] font-semibold border border-orange-200/50 cursor-pointer transition-colors"
            >
              {sample}
            </button>
          ))}
        </div>
      </div>

      {/* Error View */}
      {error && (
        <div className="bg-white rounded-3xl border border-rose-200 p-8 text-center animate-slide-up shadow-xs">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <Package className="w-7 h-7" />
          </div>
          <p className="text-base font-bold text-slate-800">{error}</p>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Pastikan format nomor resi benar (misal: POS-YYYYMMDD-XXXX) atau coba klik salah satu contoh resi di atas.
          </p>
        </div>
      )}

      {/* Tracking Result View */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          {/* Main Status & Resi Card */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Nomor Resi Pengiriman
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xl sm:text-2xl font-mono font-extrabold text-blue-700">
                    {result.nomorResi}
                  </span>
                  <button
                    type="button"
                    onClick={copyResi}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors cursor-pointer print:hidden"
                    title="Salin Resi"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <StatusBadge status={result.status} size="md" />
                <button
                  type="button"
                  onClick={handlePrint}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer print:hidden transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Cetak Status</span>
                </button>
              </div>
            </div>

            {/* Visual Delivery Stepper Timeline */}
            <div className="py-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-6">
                Tahapan Rute Perjalanan
              </h3>

              <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {timelineSteps.map((step) => {
                  const isDone = step.index <= currentStatusIndex;
                  const isCurrent = step.index === currentStatusIndex;

                  return (
                    <div key={step.index} className="relative flex items-start gap-4 group">
                      {/* Circle Dot on Timeline Line */}
                      <div
                        className={`absolute -left-6 sm:-left-8 top-0.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all ${
                          isDone
                            ? "bg-orange-600 text-white shadow-md shadow-orange-600/30 ring-4 ring-orange-100"
                            : "bg-white border-2 border-slate-300 text-slate-400"
                        } ${isCurrent ? "scale-110" : ""}`}
                      >
                        {isDone ? (
                          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        ) : (
                          <Circle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-300" />
                        )}
                      </div>

                      {/* Content */}
                      <div
                        className={`p-3.5 rounded-2xl flex-1 transition-all ${
                          isCurrent
                            ? "bg-orange-50/70 border border-orange-200"
                            : isDone
                            ? "bg-slate-50/70 border border-slate-100"
                            : "opacity-50"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-xs sm:text-sm font-bold ${
                              isDone ? "text-slate-800" : "text-slate-500"
                            }`}
                          >
                            {step.title}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] font-extrabold bg-orange-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                              Posisi Terkini
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {step.subtitle}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Detailed Info Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Sender & Receiver Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                Informasi Pengirim & Penerima
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Nama Pengirim:
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {result.namaPengirim}
                  </p>
                  <p className="text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {result.telpPengirim}
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Nama Penerima:
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {result.namaPenerima}
                  </p>
                  <p className="text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-slate-400" />
                    {result.telpPenerima}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">
                    Alamat Tujuan:
                  </span>
                  <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">
                    {result.alamatTujuan}
                  </p>
                </div>
              </div>
            </div>

            {/* Package Specifications Card */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Package className="w-3.5 h-3.5 text-orange-600" />
                Spesifikasi Paket & Biaya
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                    <Weight className="w-3 h-3 text-slate-400" />
                    Berat Paket
                  </span>
                  <p className="text-base font-extrabold text-slate-800 mt-1">
                    {result.berat} kg
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                    <CreditCard className="w-3 h-3 text-slate-400" />
                    Biaya Kirim
                  </span>
                  <p className="text-base font-extrabold text-orange-600 mt-1">
                    {formatRupiah(result.biaya)}
                  </p>
                </div>

                <div className="col-span-2 p-3 rounded-2xl bg-slate-50/80">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Tanggal Pengiriman
                  </span>
                  <p className="text-xs font-bold text-slate-800 mt-1">
                    {formatDate(result.tanggalKirim)}
                  </p>
                </div>
              </div>

              {/* Status Note */}
              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900 leading-relaxed font-medium">
                Paket terdaftar resmi di Kantor Pos Kediri. Pelacakan diupdate berkala sesuai pemindaian barcode petugas lapangan.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function TrackingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </div>
      }
    >
      <TrackingContent />
    </Suspense>
  );
}
