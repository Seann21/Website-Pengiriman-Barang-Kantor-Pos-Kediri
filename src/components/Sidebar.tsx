"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Search,
  FileText,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Daftar Pengiriman",
    href: "/dashboard/pengiriman",
    icon: Package,
  },
  {
    label: "Tambah Pengiriman",
    href: "/dashboard/pengiriman/tambah",
    icon: PlusCircle,
  },
  {
    label: "Tracking Resi",
    href: "/dashboard/tracking",
    icon: Search,
  },
  {
    label: "Laporan Rekap",
    href: "/dashboard/laporan",
    icon: FileText,
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

export default function Sidebar({
  isOpen,
  onClose,
  isCollapsed,
  onToggleCollapse,
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200/80 z-50 transform transition-all duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
        } ${isCollapsed ? "lg:w-20" : "lg:w-64"} shadow-xs flex flex-col`}
      >
        {/* Toggle Collapse Button for Desktop */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3.5 top-6 cursor-pointer bg-white border border-slate-200 rounded-full p-1 shadow-md hidden lg:flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-300 transition-colors z-50"
          title={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
          aria-label={isCollapsed ? "Buka Sidebar" : "Ciutkan Sidebar"}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>

        {/* Brand Logo Header */}
        <div
          className={`h-16 flex items-center ${
            isCollapsed ? "justify-center" : "gap-3 px-5"
          } border-b border-slate-100 transition-all shrink-0`}
        >
          <div className="relative w-9 h-9 shrink-0 flex items-center justify-center">
            <Image
              src="/logo.png"
              alt="Logo Pos"
              width={36}
              height={36}
              className="object-contain drop-shadow-xs"
              priority
            />
          </div>
          {!isCollapsed && (
            <div className="transition-all duration-300 whitespace-nowrap overflow-hidden">
              <span className="font-extrabold text-slate-800 text-sm tracking-tight block leading-tight">
                POS INDONESIA
              </span>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                Kantor Cabang Kediri
              </p>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {!isCollapsed && (
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 whitespace-nowrap">
              Menu Navigasi
            </p>
          )}

          {menuItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                title={isCollapsed ? item.label : undefined}
                className={`group relative flex items-center ${
                  isCollapsed ? "justify-center px-0 py-3" : "gap-3 px-3.5 py-2.5"
                } rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-orange-50 text-orange-700 shadow-xs border border-orange-200/60"
                    : "text-slate-600 hover:bg-slate-100/70 hover:text-slate-900"
                }`}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105 ${
                    isActive ? "text-orange-600" : "text-slate-400 group-hover:text-slate-600"
                  }`}
                />

                {!isCollapsed && (
                  <>
                    <span className="whitespace-nowrap">{item.label}</span>
                    {isActive && (
                      <span className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-500" />
                    )}
                  </>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Banner */}
        <div className="p-3 border-t border-slate-100 shrink-0">
          {!isCollapsed && (
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-3">
              <p className="text-xs font-bold text-slate-700">
                PT Pos Indonesia
              </p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Kantor Pos Cabang Kediri
              </p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
