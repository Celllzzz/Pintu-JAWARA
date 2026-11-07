"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { IKMCalculationResult } from "@/lib/services/survey";

interface SurveySuccessModalProps {
  isOpen: boolean;
  ticketNumber: string;
  pinLast4: string;
  calculation: IKMCalculationResult | null;
}

export function SurveySuccessModal({
  isOpen,
  ticketNumber,
  pinLast4,
  calculation,
}: SurveySuccessModalProps) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-[#d1ded0] space-y-5 text-center animate-dialog-in">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] mx-auto">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-1">
          <h2 className="text-xl font-bold tracking-tight text-[#191c19]">
            Terima Kasih Atas Partisipasi Anda
          </h2>
          <p className="text-xs text-[#475447] leading-relaxed">
            Penilaian Anda telah tersimpan dan berkontribusi langsung pada peningkatan mutu pelayanan publik BRMP Banten.
          </p>
        </div>

        {calculation && (
          <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-xs space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e4f28]">
              INDEKS KEPUASAN HASIL PENILAIAN ANDA
            </span>
            <div className="flex items-center justify-center gap-2">
              <span className="font-mono tabular-nums text-2xl font-bold text-[#1e4f28]">
                {calculation.ikmScore}
              </span>
              <span className="rounded-full bg-[#1e4f28] text-white px-2 py-0.5 text-[11px] font-semibold">
                Mutu {calculation.serviceGrade} ({calculation.gradeLabel})
              </span>
            </div>
          </div>
        )}

        <div className="pt-2">
          <Link
            href={`/lacak?ticket=${ticketNumber}&pin=${pinLast4}`}
            className="flex h-11 min-h-[44px] w-full items-center justify-center rounded-lg bg-[#e5a91a] px-4 text-xs sm:text-sm font-bold text-[#191c19] shadow-sm hover:bg-[#c99212] transition-colors"
          >
            Unduh Berkas Hasil Permohonan
          </Link>
        </div>
      </div>
    </div>
  );
}
