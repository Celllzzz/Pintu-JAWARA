"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertTriangle,
} from "lucide-react";
import { AdminReviseModal } from "@/components/admin/AdminReviseModal";
import { UnitTicketInfo } from "./UnitTicketInfo";
import { UnitProcessModal } from "./UnitProcessModal";
import { UnitBillingAction, BillingData } from "./UnitBillingAction";
import { UnitExtendSlaModal } from "./UnitExtendSlaModal";
import { UnitCompleteModal } from "./UnitCompleteModal";

export interface FullUnitTicketData {
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
  sla_started_at: string | null;
  sla_paused_at: string | null;
  sla_total_paused_seconds: number;
  sla_deadline: string | null;
  is_sla_extended: boolean;
  sla_extension_reason: string | null;
  completion_note: string | null;
  created_at: string;
  service_categories?: {
    code: string;
    name: string;
    is_commercial: boolean;
  } | null;
  sub_services?: {
    name: string;
  } | null;
  varieties?: {
    name: string;
    commodity_type: string;
    unit: string;
  } | null;
  ticket_documents?: Array<{
    id: string;
    document_type: string;
    file_name: string;
    file_path: string;
    file_size_bytes: number | null;
    uploaded_by_role: string;
    created_at: string;
  }>;
  ticket_billings?: BillingData | null;
}

interface UnitTicketDetailProps {
  ticket: FullUnitTicketData | null;
  onSuccess: () => void;
  onBackMobile: () => void;
}

export function UnitTicketDetail({
  ticket,
  onSuccess,
  onBackMobile,
}: UnitTicketDetailProps) {
  const [isProcessModalOpen, setIsProcessModalOpen] = useState(false);
  const [isReviseModalOpen, setIsReviseModalOpen] = useState(false);
  const [isExtendModalOpen, setIsExtendModalOpen] = useState(false);
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);

  if (!ticket) {
    return (
      <div className="flex flex-col items-center justify-center h-96 rounded-xl border border-[#d1ded0] bg-white p-8 text-center text-xs text-[#475447]">
        <FileText className="h-8 w-8 text-[#d1ded0] mb-2" />
        <p className="font-semibold text-sm text-[#191c19]">Pilih Tiket dari Antrean Tim</p>
        <p className="mt-1 max-w-xs">
          Klik salah satu kartu tiket di sebelah kiri untuk melihat rincian permohonan dan melakukan pemrosesan layanan.
        </p>
      </div>
    );
  }

  const isPPID = ticket.service_categories?.code === "IP";
  const isCommercial = Boolean(ticket.service_categories?.is_commercial);

  const paymentDoc = (ticket.ticket_documents || []).find(
    (d) => d.document_type === "bukti_bayar"
  );

  return (
    <div className="space-y-5">
      {/* Mobile Back Button */}
      <button
        type="button"
        onClick={onBackMobile}
        className="md:hidden flex items-center text-xs font-semibold text-[#52792b] hover:underline mb-2"
      >
        <span>← Kembali ke Daftar Antrean</span>
      </button>

      {/* Main Ticket Info Card */}
      <UnitTicketInfo ticket={ticket} />

      {/* Action 1: Disposisi State -> Start Process */}
      {ticket.status === "disposisi" && (
        <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-3 shadow-none">
          <div className="border-b border-[#e2e8f0] pb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
              TINDAKAN UNIT PELAKSANA
            </span>
            <h4 className="text-sm font-bold text-[#191c19]">Mulai Penanganan Layanan</h4>
          </div>
          <p className="text-xs text-[#475447] leading-relaxed">
            Tiket telah didisposisikan ke tim Anda. Klik tombol di bawah untuk mulai memproses layanan dan mengaktifkan perhitungan hari kerja SLA.
          </p>
          <button
            type="button"
            onClick={() => setIsProcessModalOpen(true)}
            className="h-11 min-h-[44px] px-5 flex items-center justify-center rounded-lg bg-[#1e4f28] text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
          >
            Mulai Proses Layanan
          </button>
        </div>
      )}

      {/* Action 2: Diproses State -> Billing, Complete, Revise, PPID Extend */}
      {ticket.status === "diproses" && (
        <div className="space-y-4">
          {/* Billing module if commercial */}
          {isCommercial && (
            <UnitBillingAction
              ticketId={ticket.id}
              billing={ticket.ticket_billings || null}
              paymentReceiptDoc={paymentDoc}
              onSuccess={onSuccess}
            />
          )}

          {/* Action Toolbar */}
          <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-4 shadow-none">
            <div className="border-b border-[#e2e8f0] pb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
                TINDAKAN PENYELESAIAN &amp; KENDALA
              </span>
              <h4 className="text-sm font-bold text-[#191c19]">Tindak Lanjut Layanan</h4>
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="button"
                onClick={() => setIsCompleteModalOpen(true)}
                className="flex-1 h-11 min-h-[44px] flex items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
              >
                Selesaikan Layanan
              </button>

              <button
                type="button"
                onClick={() => setIsReviseModalOpen(true)}
                className="h-11 min-h-[44px] px-4 flex items-center justify-center rounded-lg border border-[#fde68a] bg-[#fffbeb] text-xs sm:text-sm font-semibold text-[#92400e] hover:bg-[#fef3c7] transition-colors"
              >
                Kendala Teknis (Jeda SLA)
              </button>

              {isPPID && !ticket.is_sla_extended && (
                <button
                  type="button"
                  onClick={() => setIsExtendModalOpen(true)}
                  className="h-11 min-h-[44px] px-4 flex items-center justify-center rounded-lg border border-[#bfdbfe] bg-[#eff6ff] text-xs sm:text-sm font-semibold text-[#1e40af] hover:bg-[#dbeafe] transition-colors"
                >
                  Perpanjang SLA (+7 Hari)
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Action 3: Perlu Perbaikan State -> Review & Resume */}
      {ticket.status === "perlu_perbaikan" && (
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-5 space-y-3 text-xs text-[#92400e]">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 text-[#d97706]" />
            <span>Permohonan Sedang Menunggu Perbaikan Pemohon (SLA Dijeda)</span>
          </div>
          {ticket.completion_note && (
            <p className="p-3 bg-white rounded-lg border border-[#fde68a] text-[#191c19] leading-relaxed">
              <strong>Catatan koreksi:</strong> {ticket.completion_note}
            </p>
          )}
          <button
            type="button"
            onClick={() => setIsProcessModalOpen(true)}
            className="h-11 min-h-[44px] px-4 flex items-center justify-center rounded-lg bg-[#1e4f28] text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
          >
            Tinjau &amp; Lanjutkan Proses
          </button>
        </div>
      )}

      {/* Modals */}
      <UnitProcessModal
        isOpen={isProcessModalOpen}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        isResuming={ticket.status === "perlu_perbaikan"}
        onClose={() => setIsProcessModalOpen(false)}
        onSuccess={onSuccess}
      />

      <AdminReviseModal
        isOpen={isReviseModalOpen}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        onClose={() => setIsReviseModalOpen(false)}
        onSuccess={onSuccess}
      />

      <UnitExtendSlaModal
        isOpen={isExtendModalOpen}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        onClose={() => setIsExtendModalOpen(false)}
        onSuccess={onSuccess}
      />

      <UnitCompleteModal
        isOpen={isCompleteModalOpen}
        ticketId={ticket.id}
        ticketNumber={ticket.ticket_number}
        varietyName={ticket.varieties?.name}
        quantity={ticket.requested_quantity}
        unit={ticket.varieties?.unit}
        onClose={() => setIsCompleteModalOpen(false)}
        onSuccess={onSuccess}
      />
    </div>
  );
}
