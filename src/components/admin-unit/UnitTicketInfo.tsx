import React from "react";
import { Calendar, Layers, FileText, Clock, Sprout } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminTicketDocuments } from "@/components/admin/AdminTicketDocuments";
import { FullUnitTicketData } from "./UnitTicketDetail";

interface UnitTicketInfoProps {
  ticket: FullUnitTicketData;
}

export function UnitTicketInfo({ ticket }: UnitTicketInfoProps) {
  const isUPBS = Boolean(ticket.variety_id && ticket.requested_quantity);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#e2e8f0] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono tabular-nums text-lg sm:text-xl font-bold text-[#191c19]">
              {ticket.ticket_number}
            </span>
            <StatusBadge status={ticket.status} />
          </div>
          <h3 className="text-base font-bold text-[#191c19] mt-1">{ticket.subject}</h3>
          <p className="text-xs text-[#475447]">
            Pemohon: <strong className="text-[#191c19]">{ticket.applicant_name}</strong> · WA:{" "}
            <span className="font-mono tabular-nums">{ticket.whatsapp_number}</span>
          </p>
        </div>

        <div className="text-right shrink-0 text-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b] block">
            STANDAR WAKTU (SLA)
          </span>
          <span className="font-mono tabular-nums font-bold text-[#191c19]">
            {ticket.sla_days} Hari Kerja
          </span>
          {ticket.is_sla_extended && (
            <span className="text-[10px] text-[#1e40af] font-semibold block">
              +7 Hari (Perpanjangan PPID)
            </span>
          )}
        </div>
      </div>

      {/* 2-column Meta Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Layers className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Kategori Layanan</span>
          </span>
          <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">{ticket.service_categories?.name || "—"}</p>
        </div>

        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <FileText className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Sub-Layanan</span>
          </span>
          <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">{ticket.sub_services?.name || "—"}</p>
        </div>

        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Tanggal Masuk</span>
          </span>
          <p className="font-bold font-mono tabular-nums text-xs sm:text-sm text-[#191c19] leading-snug">
            {new Date(ticket.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] flex items-center gap-1.5 font-bold uppercase tracking-wider">
            <Clock className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Status Argo SLA</span>
          </span>
          <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">
            {ticket.sla_started_at ? "Aktif Berjalan" : "Belum Dimulai"}
          </p>
        </div>
      </div>

      {/* UPBS Commodity Detail if applicable */}
      {isUPBS && ticket.varieties && (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-xs space-y-1">
          <div className="flex items-center justify-between font-bold text-[#1e4f28]">
            <span className="flex items-center gap-1.5">
              <Sprout className="h-4 w-4" />
              <span>Rincian Komoditas: {ticket.varieties.name}</span>
            </span>
            <span className="font-mono tabular-nums">
              {ticket.requested_quantity} {ticket.varieties.unit}
            </span>
          </div>
          <div className="flex items-center justify-between text-[#475447]">
            <span>Mekanisme: {ticket.mechanism === "komersial" ? "Penjualan Resmi" : "Permohonan Bantuan"}</span>
            {ticket.estimated_cost && (
              <span className="font-mono tabular-nums font-semibold text-[#1e4f28]">
                Est. Biaya: {formatRupiah(ticket.estimated_cost)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      <div className="rounded-lg border border-[#e2e8f0] p-3 text-xs space-y-1">
        <span className="font-bold text-[#191c19] text-[10px] uppercase tracking-wider">
          Uraian Kebutuhan Pemohon:
        </span>
        <p className="text-[#475447] whitespace-pre-line leading-relaxed">
          {ticket.description}
        </p>
      </div>

      {/* Uploaded Documents */}
      <AdminTicketDocuments documents={ticket.ticket_documents || []} />
    </div>
  );
}
