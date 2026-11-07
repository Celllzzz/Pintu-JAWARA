import React from "react";
import { KPIMetricsResult } from "@/lib/services/pimpinan";
import {
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  CalendarCheck,
  SmilePlus,
  MessageSquareWarning,
} from "lucide-react";

interface KPISummaryCardsProps {
  metrics: KPIMetricsResult;
}

export function KPISummaryCards({ metrics }: KPISummaryCardsProps) {
  const cards = [
    {
      label: "Total Permohonan Masuk",
      value: metrics.totalTickets,
      unit: "tiket",
      desc: "Seluruh permohonan tercatat di sistem",
      icon: Inbox,
      iconColor: "text-[#1e4f28] bg-[#f0fdf4]",
    },
    {
      label: "Permohonan Selesai",
      value: metrics.completedTickets,
      unit: "tiket",
      desc: "Layanan telah dituntaskan",
      icon: CheckCircle2,
      iconColor: "text-[#065f46] bg-[#ecfdf5]",
    },
    {
      label: "Sedang Ditangani",
      value: metrics.inProgressTickets,
      unit: "tiket",
      desc: "Status diproses & disposisi aktif",
      icon: Clock,
      iconColor: "text-[#1e40af] bg-[#eff6ff]",
    },
    {
      label: "Melewati Tenggat (Overdue)",
      value: metrics.overdueTickets,
      unit: "tiket",
      desc: "Memerlukan percepatan tindak lanjut",
      icon: AlertTriangle,
      iconColor:
        metrics.overdueTickets > 0
          ? "text-[#991b1b] bg-[#fef2f2]"
          : "text-[#475447] bg-[#f8faf4]",
      isWarning: metrics.overdueTickets > 0,
    },
    {
      label: "Tingkat Kepatuhan SLA",
      value: `${metrics.slaComplianceRate}%`,
      unit: "",
      desc: "Penyelesaian sesuai standar waktu",
      icon: Award,
      iconColor: "text-[#1e4f28] bg-[#f0fdf4]",
    },
    {
      label: "Rata-rata Waktu Selesai",
      value: metrics.averageCompletionDays,
      unit: "hari kerja",
      desc: "Kecepatan pemenuhan layanan",
      icon: CalendarCheck,
      iconColor: "text-[#52792b] bg-[#f8faf4]",
    },
    {
      label: "Indeks Kepuasan Masyarakat",
      value: metrics.currentIKM ? metrics.currentIKM.toFixed(2) : "—",
      unit: metrics.currentGrade ? `(${metrics.currentGrade})` : "",
      desc: `${metrics.totalSurveys} responden survei tercatat`,
      icon: SmilePlus,
      iconColor: "text-[#c99212] bg-[#fffbeb]",
      highlight: true,
    },
    {
      label: "Rasio Penanganan Pengaduan",
      value: `${metrics.complaintResolutionRate}%`,
      unit: "",
      desc: "Penyelesaian aduan & aspirasi",
      icon: MessageSquareWarning,
      iconColor: "text-[#1e40af] bg-[#eff6ff]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className={`rounded-xl border p-5 bg-white transition-all ${
              c.highlight
                ? "border-[#e5a91a] shadow-xs"
                : c.isWarning
                ? "border-[#fecaca] bg-[#fffaf0]"
                : "border-[#d1ded0] shadow-none"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#475447] truncate">
                {c.label}
              </span>
              <div className={`p-2 rounded-lg shrink-0 ${c.iconColor}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div className="mt-3 flex items-baseline gap-1.5">
              <span
                className={`font-mono tabular-nums text-3xl font-extrabold tracking-tight ${
                  c.highlight
                    ? "text-[#1e4f28]"
                    : c.isWarning
                    ? "text-[#991b1b]"
                    : "text-[#191c19]"
                }`}
              >
                {c.value}
              </span>
              {c.unit && (
                <span className="text-xs font-semibold text-[#475447]">
                  {c.unit}
                </span>
              )}
            </div>

            <p className="mt-1 text-[11px] text-[#475447] leading-relaxed truncate">
              {c.desc}
            </p>
          </div>
        );
      })}
    </div>
  );
}
