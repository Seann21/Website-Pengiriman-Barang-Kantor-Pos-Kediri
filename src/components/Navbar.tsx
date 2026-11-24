"use client";

import { useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { Menu, LogOut, User, Search } from "lucide-react";
import Link from "next/link";

interface NavbarProps {
  onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  const { data: session } = useSession();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  return (
    <>
      <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 transition-all">
        {/* Left side */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="p-2 hover:bg-slate-100 rounded-xl lg:hidden text-slate-600 cursor-pointer"
            aria-label="Buka navigasi"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Tracking shortcut */}
          <Link
            href="/dashboard/tracking"
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 hover:bg-slate-100 text-slate-500 hover:text-slate-800 text-xs font-medium border border-slate-200/60 transition-colors"
          >
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Lacak Resi Cepat...</span>
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Profile & Logout */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-xs">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-bold text-slate-800 leading-tight">
                {session?.user?.name || "Administrator"}
              </p>
              <p className="text-[10px] text-orange-600 font-semibold uppercase tracking-wider">
                Petugas Pos
              </p>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 hover:bg-rose-50 rounded-xl text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
              title="Keluar dari akun"
              aria-label="Keluar dari akun"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4 border border-rose-100">
              <LogOut className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-center text-slate-800">
              Keluar Akun?
            </h3>
            <p className="text-xs text-center text-slate-500 mt-1.5 leading-relaxed">
              Anda akan diarahkan kembali ke halaman masuk. Sesi aktif Anda akan diakhiri.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-md shadow-rose-600/20 cursor-pointer transition-colors"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
