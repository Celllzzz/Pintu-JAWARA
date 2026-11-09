"use client";

import React from "react";
import { Search } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FilterPills, FilterPillItem } from "@/components/ui/FilterPills";

export interface UnitQueueItem {
  id: string;
  ticket_number: string;
  applicant_name: string;
  whatsapp_number: string;
  subject: string;
  status: string;
  created_at: string;
  sla_days: number;
  service_categories?: {
    code: string;
    name: string;
  } | null;
  sub_services?: {
    name: string;
  } | null;
}

interface UnitTicketQueueProps {
  tickets: UnitQueueItem[];
  selectedTicketId: string | null;
  onSelectTicket: (id: string) => void;
  statusFilter: string;
  onStatusFilterChange: (s: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  isLoading: boolean;
}

const UNIT_FILTER_ITEMS: FilterPillItem[] = [
  { id: "all", label: "Semua" },
  { id: "disposisi", label: "Disposisi Masuk" },
  { id: "diproses", label: "Sedang Diproses" },
  { id: "perlu_perbaikan", label: "Perlu Perbaikan" },
  { id: "selesai", label: "Selesai" },
];

export function UnitTicketQueue({
  tickets,
  selectedTicketId,
  onSelectTicket,
  statusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  isLoading,
}: UnitTicketQueueProps) {
  return (
    <div className="flex flex-col h-full space-y-3.5 px-0.5">
      {/* Search Input */}
      <div className="relative">
        <Search className="h-4 w-4 text-[#475447] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari No. Tiket, Pemohon, Perihal..."
          className="w-full h-10 min-h-[40px] rounded-lg border border-[#d1ded0] bg-white pl-9 pr-3 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
        />
      </div>

      {/* Filter Pills */}
      <div className="-mx-0.5">
        <FilterPills
          items={UNIT_FILTER_ITEMS}
          activeId={statusFilter}
          onChange={onStatusFilterChange}
        />
      </div>

      {/* Counter */}
      <div className="flex items-center justify-between text-xs text-[#475447] px-1 pt-1">
        <span>Antrean Tim Saya</span>
        <span>
          Total: <strong className="font-mono tabular-nums text-[#191c19]">{tickets.length}</strong> tiket
        </span>
      </div>

      {/* Queue List */}
      <div className="space-y-2.5 overflow-y-auto max-h-[calc(100vh-260px)] pr-1">
        {isLoading ? (
          <div className="space-y-2.5 animate-pulse" role="status" aria-busy="true">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-[#d1ded0] bg-white p-4 space-y-2.5 shadow-none"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-28 bg-[#e2e8f0] rounded" />
                  <div className="h-5 w-16 bg-[#e2e8f0] rounded-full" />
                </div>
                <div className="h-4 w-36 bg-[#e2e8f0] rounded" />
                <div className="h-3 w-48 bg-[#e2e8f0] rounded" />
                <div className="pt-2 border-t border-[#e2e8f0] flex justify-between">
                  <div className="h-3 w-20 bg-[#e2e8f0] rounded" />
                  <div className="h-3 w-12 bg-[#e2e8f0] rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : tickets.length === 0 ? (
          <div className="rounded-xl border border-[#d1ded0] bg-white p-8 text-center text-xs text-[#475447]">
            Tidak ada tiket dalam antrean ini.
          </div>
        ) : (
          tickets.map((t) => {
            const isSelected = t.id === selectedTicketId;
            return (
              <div
                key={t.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectTicket(t.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelectTicket(t.id);
                }}
                className={`rounded-xl border p-4 text-left cursor-pointer transition-all ${
                  isSelected
                    ? "border-[#1e4f28] border-2 bg-[#f8faf4] shadow-xs"
                    : "border-[#d1ded0] bg-white hover:border-[#52792b]"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono tabular-nums text-xs font-bold text-[#191c19]">
                    {t.ticket_number}
                  </span>
                  <StatusBadge status={t.status} />
                </div>

                <p className="mt-1.5 text-xs font-bold text-[#191c19] truncate">
                  {t.applicant_name}
                </p>
                <p className="text-xs text-[#475447] truncate mt-0.5">
                  {t.subject}
                </p>

                <div className="mt-3 pt-2.5 border-t border-[#e2e8f0] flex items-center justify-between text-[11px] text-[#475447]">
                  <span className="truncate max-w-[150px]">
                    {t.sub_services?.name || t.service_categories?.name || "Layanan"}
                  </span>
                  <span className="font-mono tabular-nums shrink-0">
                    {new Date(t.created_at).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
