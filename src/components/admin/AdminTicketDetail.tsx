"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Layers,
  FileText,
  Clock,
  AlertCircle,
  Sprout,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { AdminVerifyAction } from "./AdminVerifyAction";
import { AdminReviseModal } from "./AdminReviseModal";
import { AdminDisposeAction } from "./AdminDisposeAction";
import { AdminTicketDocuments, TicketDocumentItem } from "./AdminTicketDocuments";

export interface FullTicketData {
  id: string;
  ticket_number: string;
  applicant_name: string;
  whatsapp_number: string;
  subject: string;
  description: string;
  status: string;
  mechanism: string | null;
  variety_id: string | null;
  requested_quantity: number | null;
  estimated_cost: number | null;
  sla_days: number;
  completion_note: string | null;
  created_at: string;
  service_categories?: {
    code: string;
    name: string;
  } | null;
  sub_services?: {
    name: string;
  } | null;
  teams?: {
    id: string;
    name: string;
    code: string;
  } | null;
  varieties?: {
    name: string;
    commodity_type: string;
    unit: string;
    price_per_unit: number;
  } | null;
  ticket_documents?: TicketDocumentItem[];
}

interface AdminTicketDetailProps {
  ticket: FullTicketData | null;
  teams: Array<{ id: string; code: string; name: string; description: string | null }>;
  onSuccess: () => void;
  onBackMobile: () => void;
}

export function AdminTicketDetail({
  ticket,
  teams,
  onSuccess,
  onBackMobile,
}: AdminTicketDetailProps) {
  const [isReviseOpen, setIsReviseOpen] = useState(false);
  const [isEditingDisposisi, setIsEditingDisposisi] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-xl border border-[#d1ded0] bg-white p-8 text-center text-xs text-[#475447]">
        <FileText className="h-8 w-8 text-[#d1ded0] mb-2" />
        <p className="font-semibold text-sm text-[#191c19]">Pilih Tiket dari Antrean</p>
        <p className="mt-1 max-w-xs">
          Klik salah satu kartu tiket di sebelah kiri untuk melihat rincian permohonan dan melakukan tindakan verifikasi atau disposisi.
        </p>
      </div>
    );
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const isUPBS = Boolean(ticket.variety_id && ticket.requested_quantity);

  return (
    <div className="space-y-5">
      {/* Mobile/Tablet Back Button */}
      <button
        type="button"
        onClick={onBackMobile}
        className="lg:hidden flex items-center gap-1.5 text-xs font-semibold text-[#52792b] hover:underline mb-2"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Kembali ke Daftar Antrean</span>
      </button>

      {/* Main Info Card */}
      <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-5">
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
              STANDAR WAKTU
            </span>
            <span className="font-mono tabular-nums font-bold text-[#191c19]">
              {ticket.sla_days} Hari Kerja
            </span>
          </div>
        </div>

        {/* 2-column meta grid */}
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
              <span>Tanggal Pengajuan</span>
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
              <span>Tim Disposisi</span>
            </span>
            <p className="font-bold text-xs sm:text-sm text-[#191c19] leading-snug">{ticket.teams?.name || "Belum Didisposisi"}</p>
          </div>
        </div>

        {/* UPBS Commodity Detail if applicable */}
        {isUPBS && ticket.varieties && (
          <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-xs space-y-1">
            <div className="flex items-center justify-between font-bold text-[#1e4f28]">
              <span className="flex items-center gap-1.5">
                <Sprout className="h-4 w-4" />
                <span>Rincian UPBS: {ticket.varieties.name}</span>
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

        {/* Applicant Description */}
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

      {/* Action Panels based on Status */}
      {ticket.status === "diajukan" && (
        <AdminVerifyAction
          ticket={ticket}
          onSuccess={onSuccess}
          onOpenReviseModal={() => setIsReviseOpen(true)}
        />
      )}

      {ticket.status === "diverifikasi" && (
        <AdminDisposeAction
          ticketId={ticket.id}
          currentTeamId={ticket.teams?.id}
          teams={teams}
          onSuccess={onSuccess}
        />
      )}

      {ticket.status === "disposisi" && (
        !isEditingDisposisi ? (
          <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-3 shadow-none">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
                  STATUS PENUGASAN DISPOSISI
                </span>
                <h4 className="text-sm font-bold text-[#191c19]">
                  Telah Didisposisikan
                </h4>
              </div>
              <span className="inline-flex items-center rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-3 py-1 text-xs font-semibold text-[#1e4f28]">
                Terkunci
              </span>
            </div>
            <p className="text-xs text-[#475447] leading-relaxed">
              Tiket ini telah diteruskan ke <strong>{ticket.teams?.name || "Tim Penanganan"}</strong>. Jika terdapat kekeliruan disposisi, gunakan tombol di bawah untuk mengubah unit tujuan.
            </p>
            <button
              type="button"
              onClick={() => setIsEditingDisposisi(true)}
              className="h-10 min-h-[40px] px-4 rounded-lg border border-[#d1ded0] text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Ubah Tim Disposisi
            </button>
          </div>
        ) : (
          <AdminDisposeAction
            ticketId={ticket.id}
            currentTeamId={ticket.teams?.id}
            teams={teams}
            isChanging={true}
            onCancel={() => setIsEditingDisposisi(false)}
            onSuccess={() => {
              setIsEditingDisposisi(false);
              onSuccess();
            }}
          />
        )
      )}

      {ticket.status === "perlu_perbaikan" && (
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-5 text-xs text-[#92400e] space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertCircle className="h-4 w-4 text-[#d97706]" />
            <span>Menunggu Pemohon Mengunggah Perbaikan Berkas</span>
          </div>
          {ticket.completion_note && (
            <p className="leading-relaxed bg-white p-3 rounded-lg border border-[#fde68a] text-[#191c19]">
              <strong>Catatan untuk pemohon:</strong> {ticket.completion_note}
            </p>
          )}
        </div>
      )}

      {/* Revise Modal */}
      <AdminReviseModal
        isOpen={isReviseOpen}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        onClose={() => setIsReviseOpen(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
}
