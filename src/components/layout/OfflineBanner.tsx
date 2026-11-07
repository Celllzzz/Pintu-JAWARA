"use client";

import React from "react";
import { WifiOff } from "lucide-react";
import { useOnlineStatus } from "@/lib/pwa/useOnlineStatus";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="bg-[#fffbeb] border-b border-[#fde68a] text-[#92400e] text-xs font-semibold px-4 py-2 text-center flex items-center justify-center gap-2"
    >
      <WifiOff className="h-3.5 w-3.5 shrink-0 text-[#d97706]" />
      <span>
        Mode Offline: Anda tidak terhubung ke internet. Data tiket yang pernah dibuka tetap dapat dilacak dari penyimpanan perangkat.
      </span>
    </div>
  );
}
