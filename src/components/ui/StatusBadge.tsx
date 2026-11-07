import React from "react";
import { TicketStatus } from "@/types/database";

export interface StatusBadgeProps {
  status: TicketStatus | "overdue" | string;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const normalized = status.toLowerCase();

  const config: Record<
    string,
    { label: string; style: string; dot: string }
  > = {
    diajukan: {
      label: "Diajukan",
      style: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
      dot: "bg-[#2563eb]",
    },
    diverifikasi: {
      label: "Diverifikasi",
      style: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
      dot: "bg-[#2563eb]",
    },
    disposisi: {
      label: "Didisposisi",
      style: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
      dot: "bg-[#2563eb]",
    },
    diproses: {
      label: "Diproses",
      style: "bg-[#f0fdf4] text-[#1e4f28] border-[#bbf7d0]",
      dot: "bg-[#16a34a]",
    },
    perlu_perbaikan: {
      label: "Perlu Perbaikan",
      style: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
      dot: "bg-[#d97706]",
    },
    overdue: {
      label: "Overdue",
      style: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
      dot: "bg-[#dc2626]",
    },
    selesai: {
      label: "Selesai",
      style: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
      dot: "bg-[#059669]",
    },
  };

  const current = config[normalized] || {
    label: status,
    style: "bg-gray-100 text-gray-700 border-gray-200",
    dot: "bg-gray-500",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${current.style} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${current.dot}`} />
      <span>{current.label}</span>
    </span>
  );
}
