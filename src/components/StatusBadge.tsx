"use client";

import { getStatusColor, getStatusDotColor } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
  showDot?: boolean;
  className?: string;
}

export default function StatusBadge({
  status,
  size = "md",
  showDot = true,
  className = "",
}: StatusBadgeProps) {
  const isPending = status === "Diproses" || status === "Dalam Perjalanan";

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ring-1 transition-all ${
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs"
      } ${getStatusColor(status)} ${className}`}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          {isPending && (
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${getStatusDotColor(
                status
              )}`}
            />
          )}
          <span
            className={`relative inline-flex rounded-full h-2 w-2 ${getStatusDotColor(
              status
            )}`}
          />
        </span>
      )}
      <span>{status}</span>
    </span>
  );
}
