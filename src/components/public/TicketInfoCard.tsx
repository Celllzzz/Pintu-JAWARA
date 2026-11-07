import React from "react";
import { Layers, FileText, Calendar, Clock } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { TicketDetailResult } from "@/lib/services/ticket";

interface TicketInfoCardProps {
  ticketData: TicketDetailResult;
}

export function TicketInfoCard({ ticketData }: TicketInfoCardProps) {
  return (
    <section className="rounded-2xl border border-[#d1ded0] bg-white p-6 sm:p-8 shadow-none space-y-6">
      {/* Top Header: Number, Status, Subject, Applicant & SLA Capsule */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-[#e2e8f0] pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono tabular-nums text-xl sm:text-2xl font-bold text-[#191c19]">
              {ticketData.ticket_number}
            </span>
            <StatusBadge status={ticketData.status} />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-[#191c19] mt-1.5">
            {ticketData.subject}
          </h2>
          <p className="text-xs text-[#475447]">
            Pemohon: <strong className="text-[#191c19]">{ticketData.applicant_name}</strong> · WA:{" "}
            <span className="font-mono tabular-nums">{ticketData.whatsapp_number}</span>
          </p>
        </div>

        {/* SLA Capsule Card */}
        <div className="rounded-xl border border-[#d1ded0] bg-[#f8faf4] p-4 text-xs space-y-1 sm:text-right shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b] block">
            STANDAR WAKTU (SLA)
          </span>
          <p className="text-sm font-bold font-mono tabular-nums text-[#191c19]">
            {ticketData.sla.formattedRemaining}
          </p>
          {ticketData.sla.deadlineIso && (
            <p className="text-[11px] text-[#475447]">
              Target:{" "}
              {new Date(ticketData.sla.deadlineIso).toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      {/* Meta Details 2-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Kategori Layanan</span>
          </span>
          <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">{ticketData.category?.name || "—"}</p>
        </div>

        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Sub-Layanan</span>
          </span>
          <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">{ticketData.sub_service?.name || "—"}</p>
        </div>

        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Tanggal Pengajuan</span>
          </span>
          <p className="font-bold font-mono tabular-nums text-xs sm:text-sm text-[#191c19] leading-snug">
            {new Date(ticketData.created_at).toLocaleDateString("id-ID", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>

        <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] p-3.5 space-y-1.5">
          <span className="text-[11px] text-[#52792b] font-bold uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-[#52792b]" />
            <span>Tim Penanganan</span>
          </span>
          <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">
            {ticketData.team?.name || "Menunggu Disposisi"}
          </p>
        </div>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-[#e2e8f0] p-4 text-xs space-y-1.5 bg-white">
        <span className="font-bold text-[#191c19] uppercase tracking-wider text-[10px]">
          Uraian Kebutuhan Pemohon:
        </span>
        <p className="text-[#475447] leading-relaxed whitespace-pre-line">
          {ticketData.description}
        </p>
      </div>
    </section>
  );
}
