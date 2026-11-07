import React from "react";
import { Check, Clock, AlertTriangle, FileCheck } from "lucide-react";
import { TicketStatus } from "@/types/database";

interface TicketTimelineProps {
  status: TicketStatus;
  surveyFilled?: boolean;
}

interface Step {
  id: string;
  label: string;
  desc: string;
}

const STEPS: Step[] = [
  { id: "diajukan", label: "Diajukan", desc: "Berkas masuk" },
  { id: "diverifikasi", label: "Diverifikasi", desc: "Kelengkapan berkas" },
  { id: "disposisi", label: "Disposisi", desc: "Diteruskan ke unit" },
  { id: "diproses", label: "Diproses", desc: "Penanganan layanan" },
  { id: "selesai", label: "Selesai", desc: "Dokumen diterbitkan" },
  { id: "survei", label: "Survei SKM", desc: "Penilaian pelayanan" },
];

const ORDER_MAP: Record<string, number> = {
  diajukan: 0,
  perlu_perbaikan: 1, // Branch / pause state
  diverifikasi: 1,
  disposisi: 2,
  diproses: 3,
  selesai: 4,
};

export function TicketTimeline({ status, surveyFilled = false }: TicketTimelineProps) {
  const currentStepIndex = ORDER_MAP[status] ?? 0;
  const isRevision = status === "perlu_perbaikan";

  return (
    <div className="space-y-4 rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            ALUR PENYELESAIAN
          </span>
          <h3 className="text-base font-bold text-[#191c19]">Status Tahapan Layanan</h3>
        </div>
        {isRevision && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fffbeb] border border-[#fde68a] px-3 py-1 text-xs font-semibold text-[#92400e]">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Perlu Perbaikan Berkas (SLA Dijeda)</span>
          </span>
        )}
      </div>

      {/* Responsive Step Track */}
      <div className="relative pt-2">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STEPS.map((step, idx) => {
            const isCompleted =
              idx < currentStepIndex ||
              (idx === 4 && status === "selesai") ||
              (idx === 5 && surveyFilled);
            const isCurrent = idx === currentStepIndex && !isCompleted;

            let badgeStyle = "bg-[#f8faf4] border-[#d1ded0] text-[#475447]";
            if (isCompleted) {
              badgeStyle = "bg-[#1e4f28] border-[#1e4f28] text-white";
            } else if (isCurrent) {
              badgeStyle = isRevision
                ? "bg-[#fffbeb] border-[#fde68a] text-[#92400e] ring-2 ring-[#fde68a]"
                : "bg-[#f0fdf4] border-[#bbf7d0] text-[#1e4f28] ring-2 ring-[#bbf7d0]";
            }

            return (
              <div
                key={step.id}
                className={`flex flex-col justify-between rounded-lg border p-3 text-left transition-all ${
                  isCurrent
                    ? "border-[#1e4f28] bg-[#f8faf4] shadow-xs"
                    : "border-[#e2e8f0] bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono tabular-nums text-[11px] font-bold text-[#52792b]">
                    0{idx + 1}
                  </span>
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold ${badgeStyle}`}
                  >
                    {isCompleted ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : isCurrent ? (
                      isRevision ? (
                        <AlertTriangle className="h-3.5 w-3.5" />
                      ) : (
                        <Clock className="h-3.5 w-3.5" />
                      )
                    ) : (
                      <span className="text-[10px]">{idx + 1}</span>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <p
                    className={`text-xs font-bold ${
                      isCurrent
                        ? "text-[#1e4f28]"
                        : isCompleted
                        ? "text-[#191c19]"
                        : "text-[#475447]"
                    }`}
                  >
                    {step.label}
                  </p>
                  <p className="text-[10px] text-[#475447] mt-0.5 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {status === "selesai" && !surveyFilled && (
        <div className="rounded-lg border border-[#bfdbfe] bg-[#eff6ff] p-3 text-xs text-[#1e40af] flex items-start gap-2">
          <FileCheck className="h-4 w-4 shrink-0 mt-0.5" />
          <span>
            <strong>Tahap 6 (Survei SKM):</strong> Mohon luangkan waktu 2 menit untuk mengisi survei kepuasan masyarakat agar dokumen hasil layanan dapat diunduh.
          </span>
        </div>
      )}
    </div>
  );
}
