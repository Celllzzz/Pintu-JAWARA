"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OverdueTicketItem } from "@/lib/services/pimpinan";
import { DataTable, Column } from "@/components/ui/DataTable";

interface OverdueTicketTableProps {
  tickets: OverdueTicketItem[];
}

export function OverdueTicketTable({ tickets }: OverdueTicketTableProps) {
  if (tickets.length === 0) {
    return (
      <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-6 text-center space-y-2">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
          <CheckCircle2 className="h-5 w-5" />
        </div>
        <h4 className="text-sm font-bold text-[#1e4f28]">
          Kepatuhan SLA Sempurna
        </h4>
        <p className="text-xs text-[#475447] max-w-md mx-auto">
          Tidak ada tiket yang melewati batas waktu. Seluruh permohonan layanan publik saat ini ditangani sesuai standar waktu hari kerja.
        </p>
      </div>
    );
  }

  const columns: Column<OverdueTicketItem>[] = [
    {
      key: "ticket_number",
      header: "Nomor E-Tiket",
      render: (t) => (
        <span className="font-mono tabular-nums font-bold text-[#191c19]">
          {t.ticket_number}
        </span>
      ),
    },
    {
      key: "applicant_name",
      header: "Pemohon",
      render: (t) => <span className="font-semibold text-[#191c19]">{t.applicant_name}</span>,
    },
    {
      key: "category_name",
      header: "Layanan",
      render: (t) => <span className="text-[#475447]">{t.category_name}</span>,
    },
    {
      key: "team_name",
      header: "Tim Penanganan",
      render: (t) => <span className="text-[#475447]">{t.team_name}</span>,
    },
    {
      key: "overdueDays",
      header: "Keterlambatan",
      align: "center",
      render: (t) => (
        <span className="font-mono tabular-nums font-bold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 rounded-full text-[11px]">
          +{t.overdueDays} Hari Terlambat
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t) => <StatusBadge status={t.status} />,
    },
    {
      key: "action",
      header: "Aksi",
      align: "right",
      render: (t) => (
        <Link
          href={`/admin/tickets?q=${t.ticket_number}`}
          className="inline-flex h-8 min-h-[32px] items-center rounded-lg border border-[#d1ded0] bg-white px-3 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
        >
          Tinjau
        </Link>
      ),
    },
  ];

  return (
    <DataTable
      title={`PERHATIAN: ${tickets.length} Tiket Melewati Batas Waktu (Overdue)`}
      totalLabel={
        <span className="text-[11px] text-[#991b1b] font-semibold">
          Prioritas Akselerasi Penanganan
        </span>
      }
      className="border-[#fecaca]"
      data={tickets}
      columns={columns}
      keyExtractor={(t) => t.id}
      searchPlaceholder="Cari tiket overdue..."
      emptyMessage="Tidak ada tiket overdue."
      renderMobileCard={(t, idx) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#52792b] uppercase">
              No. #{idx + 1}
            </span>
            <span className="font-mono tabular-nums font-bold text-[#991b1b] bg-[#fef2f2] border border-[#fecaca] px-2 py-0.5 rounded-full text-[10px]">
              +{t.overdueDays} Hari Terlambat
            </span>
          </div>
          <p className="font-mono tabular-nums font-bold text-[#191c19]">{t.ticket_number}</p>
          <p className="font-semibold text-[#191c19]">{t.applicant_name}</p>
          <p className="text-[11px] text-[#475447]">{t.category_name} · {t.team_name}</p>
          <div className="flex items-center justify-between pt-1">
            <StatusBadge status={t.status} />
            <Link
              href={`/admin/tickets?q=${t.ticket_number}`}
              className="inline-flex h-8 items-center rounded-lg border border-[#d1ded0] bg-white px-3 font-semibold text-[#191c19]"
            >
              Tinjau
            </Link>
          </div>
        </div>
      )}
    />
  );
}
