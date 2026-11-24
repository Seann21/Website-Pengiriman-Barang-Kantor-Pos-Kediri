"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  MapPin,
  Phone,
  Package,
  Calendar,
  Hash,
  Calculator,
  RefreshCw,
  Sparkles,
  Save,
} from "lucide-react";
import Link from "next/link";
import StatusBadge from "@/components/StatusBadge";
import Toast from "@/components/Toast";
import {
  generateResi,
  STATUS_LIST,
  formatDateInput,
  formatRupiah,
  calculateEstimatedCost,
} from "@/lib/utils";

export default function TambahPengirimanPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [form, setForm] = useState({
    nomorResi: generateResi(),
    namaPengirim: "",
    namaPenerima: "",
    alamatTujuan: "",
    telpPengirim: "",
    telpPenerima: "",
    berat: "1.0",
    biaya: "10000",
    tanggalKirim: formatDateInput(new Date()),
    status: "Diproses",
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };
      // Auto-suggest fee when weight changes
      if (name === "berat") {
        const weightNum = parseFloat(value);
        if (!isNaN(weightNum) && weightNum > 0) {
          updated.biaya = calculateEstimatedCost(weightNum).toString();
        }
      }
      return updated;
    });
  };

  const regenerateResi = () => {
    const newResi = generateResi();
    setForm((prev) => ({ ...prev, nomorResi: newResi }));
    setToastMessage(`Resi baru dibuat: ${newResi}`);
  };

  const applyCalculatedCost = () => {
    const w = parseFloat(form.berat) || 1;
    const est = calculateEstimatedCost(w);
    setForm((prev) => ({ ...prev, biaya: est.toString() }));
    setToastMessage(`Biaya dihitung otomatis: ${formatRupiah(est)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.namaPengirim.trim() || !form.namaPenerima.trim()) {
      setError("Nama pengirim dan penerima wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/pengiriman", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setToastMessage("Data pengiriman berhasil disimpan!");
        setTimeout(() => {
          router.push("/dashboard/pengiriman");
        }, 800);
      } else {
        const data = await res.json();
        setError(data.error || "Gagal menyimpan data pengiriman");
        setLoading(false);
      }
    } catch {
      setError("Terjadi kesalahan jaringan. Silakan coba lagi.");
      setLoading(false);
    }
  };

  const weightNum = parseFloat(form.berat) || 0;
  const costNum = parseInt(form.biaya) || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Toast */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-4 bg-white/70 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/pengiriman"
            className="p-2 hover:bg-slate-100 rounded-2xl text-slate-600 transition-colors cursor-pointer"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-800 tracking-tight">
              Tambah Pengiriman Barang
            </h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Input data transaksi kiriman dan cetak bukti resi baru
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={regenerateResi}
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 hover:bg-orange-100 text-xs font-bold transition-colors cursor-pointer border border-orange-200"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Resi Acak Baru</span>
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs sm:text-sm font-semibold flex items-center gap-2 animate-slide-up">
          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Grid: Form on Left, Live Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form Column */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
          {/* Card 1: Informasi Resi */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Hash className="w-4 h-4 text-orange-600" />
                <span>Identitas Resi & Status Awal</span>
              </h2>
              <button
                type="button"
                onClick={regenerateResi}
                className="text-xs text-orange-600 font-bold hover:underline sm:hidden"
              >
                Ganti Resi
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nomor Resi
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="nomorResi"
                    value={form.nomorResi}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-mono font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Status Saat Ini
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  {STATUS_LIST.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card 2: Pengirim & Penerima */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-orange-600" />
              <span>Data Pengirim & Penerima</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Pengirim */}
              <div className="space-y-3 p-4 rounded-2xl bg-orange-50/40 border border-orange-100/60">
                <span className="text-[11px] font-extrabold text-orange-800 uppercase tracking-wider block">
                  Pihak Pengirim (Asal Kediri)
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Pengirim *
                  </label>
                  <input
                    type="text"
                    name="namaPengirim"
                    value={form.namaPengirim}
                    onChange={handleChange}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telepon Pengirim *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      name="telpPengirim"
                      value={form.telpPengirim}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Penerima */}
              <div className="space-y-3 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60">
                <span className="text-[11px] font-extrabold text-blue-800 uppercase tracking-wider block">
                  Pihak Penerima (Tujuan)
                </span>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Penerima *
                  </label>
                  <input
                    type="text"
                    name="namaPenerima"
                    value={form.namaPenerima}
                    onChange={handleChange}
                    placeholder="Contoh: Siti Rahayu"
                    className="w-full px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    No. Telepon Penerima *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="tel"
                      name="telpPenerima"
                      value={form.telpPenerima}
                      onChange={handleChange}
                      placeholder="08xxxxxxxxxx"
                      className="w-full pl-9 pr-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 font-mono"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Alamat Lengkap */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>Alamat Lengkap Tujuan Pengiriman *</span>
              </label>
              <textarea
                name="alamatTujuan"
                value={form.alamatTujuan}
                onChange={handleChange}
                rows={3}
                placeholder="Jl. Merdeka No. 12, Kel. Banjaran, Kota Surabaya, Jawa Timur 60241"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                required
              />
            </div>
          </div>

          {/* Card 3: Paket, Berat & Biaya */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Package className="w-4 h-4 text-orange-600" />
                <span>Rincian Berat & Ongkos Kirim</span>
              </h2>
              <button
                type="button"
                onClick={applyCalculatedCost}
                className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                <Calculator className="w-3.5 h-3.5" />
                <span>Hitung Otomatis</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Berat Barang (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  name="berat"
                  value={form.berat}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Tarif: Rp 10.000/kg pertama
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Biaya Kirim (Rp)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="0"
                  name="biaya"
                  value={form.biaya}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  {formatRupiah(costNum)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Tanggal Kirim</span>
                </label>
                <input
                  type="date"
                  name="tanggalKirim"
                  value={form.tanggalKirim}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
                  required
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Link
              href="/dashboard/pengiriman"
              className="flex-1 sm:flex-none px-6 py-3 border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-2xl text-xs sm:text-sm font-bold text-center transition-colors cursor-pointer"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={loading}
              className="flex-1 sm:flex-initial sm:min-w-[200px] px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-orange-600/25 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 transition-all active:scale-95 text-xs sm:text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Simpan Pengiriman</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Live Receipt Preview Card (Sticky on desktop) */}
        <div className="space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                Live Preview Resi
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                Pratinjau
              </span>
            </div>

            {/* Receipt Mock */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-orange-50/30 border border-slate-200/80 space-y-3">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="text-xs font-extrabold tracking-tight text-slate-800">
                  PT POS INDONESIA (PERSERO)
                </p>
                <p className="text-[10px] text-slate-500 font-medium">
                  Kantor Pos Cabang Kediri
                </p>
                <p className="text-xs font-mono font-extrabold text-blue-700 mt-1">
                  {form.nomorResi}
                </p>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Pengirim:
                  </span>
                  <span className="font-bold text-slate-800">
                    {form.namaPengirim || "(Nama Pengirim)"}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {form.telpPengirim || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Penerima:
                  </span>
                  <span className="font-bold text-slate-800">
                    {form.namaPenerima || "(Nama Penerima)"}
                  </span>
                  <p className="text-[10px] text-slate-500 font-mono">
                    {form.telpPenerima || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">
                    Tujuan:
                  </span>
                  <p className="text-xs text-slate-600 leading-snug">
                    {form.alamatTujuan || "(Alamat Tujuan)"}
                  </p>
                </div>

                <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Berat</span>
                    <span className="font-bold text-slate-800">{weightNum} kg</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Total Biaya</span>
                    <span className="font-extrabold text-orange-600 text-sm">
                      {formatRupiah(costNum)}
                    </span>
                  </div>
                </div>

                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">Status:</span>
                  <StatusBadge status={form.status} size="sm" />
                </div>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
              Data resi di atas akan disimpan dan dapat dilacak langsung oleh pengirim & penerima.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
