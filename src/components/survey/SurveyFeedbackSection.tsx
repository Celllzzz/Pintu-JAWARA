"use client";

import React from "react";

interface SurveyFeedbackSectionProps {
  feedback: string;
  onFeedbackChange: (val: string) => void;
  isSubmitting: boolean;
  totalAnswered: number;
}

export function SurveyFeedbackSection({
  feedback,
  onFeedbackChange,
  isSubmitting,
  totalAnswered,
}: SurveyFeedbackSectionProps) {
  const isComplete = totalAnswered === 16;

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-4">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          BAGIAN 3 DARI 3
        </span>
        <h3 className="text-base font-bold text-[#191c19]">
          Kritik, Saran &amp; Masukan Terbuka
        </h3>
      </div>

      <div>
        <label
          htmlFor="surv_feedback"
          className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
        >
          Kritik dan Saran Konstruktif (Opsional)
        </label>
        <textarea
          id="surv_feedback"
          rows={3}
          value={feedback}
          onChange={(e) => onFeedbackChange(e.target.value)}
          placeholder="Berikan saran perbaikan fasilitas, kecepatan respon, atau hal lain untuk peningkatan mutu pelayanan kami..."
          className="block w-full rounded-lg border border-[#d1ded0] bg-white p-3 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none leading-relaxed"
        />
      </div>

      <div className="pt-2 border-t border-[#e2e8f0] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <p className="text-xs text-[#475447]">
          Progres Pertanyaan:{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">
            {totalAnswered} dari 16
          </strong>{" "}
          instrumen terisi.
        </p>

        <button
          type="submit"
          disabled={isSubmitting || !isComplete}
          className="flex h-12 min-h-[48px] items-center justify-center rounded-lg bg-[#1e4f28] px-6 text-sm font-bold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-40 transition-colors"
        >
          <span>{isSubmitting ? "Mengirim Evaluasi..." : "Kirim Survei Kepuasan"}</span>
        </button>
      </div>
    </div>
  );
}
