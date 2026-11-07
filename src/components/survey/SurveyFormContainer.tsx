"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import { SurveyDemographySection, DemographyData } from "./SurveyDemographySection";
import { SurveyLikertSection } from "./SurveyLikertSection";
import { SurveyFeedbackSection } from "./SurveyFeedbackSection";
import { SurveySuccessModal } from "./SurveySuccessModal";
import { IKMCalculationResult } from "@/lib/services/survey";

interface SurveyFormContainerProps {
  ticket: {
    id: string;
    ticket_number: string;
    applicant_name: string;
    whatsapp_number: string;
    whatsapp_pin_last4: string;
    default_service_type: string;
    is_already_filled: boolean;
  };
}

export function SurveyFormContainer({ ticket }: SurveyFormContainerProps) {
  const { showToast } = useToast();

  const [demography, setDemography] = useState<DemographyData>({
    contact_number: ticket.whatsapp_number || "",
    service_type: ticket.default_service_type || "UPBS Padi",
    gender: "",
    education: "",
    age_range: "",
    occupation: "",
    is_disabled: false,
    disability_type: "",
  });

  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [calculationResult, setCalculationResult] = useState<IKMCalculationResult | null>(null);

  if (ticket.is_already_filled) {
    return (
      <div className="rounded-2xl border border-[#bbf7d0] bg-[#f0fdf4] p-8 text-center space-y-3">
        <h2 className="text-xl font-bold text-[#1e4f28]">
          Survei Telah Terisi
        </h2>
        <p className="text-xs text-[#475447] max-w-md mx-auto leading-relaxed">
          Survei kepuasan masyarakat untuk permohonan dengan nomor e-tiket{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">{ticket.ticket_number}</strong>{" "}
          telah berhasil disimpan. Anda dapat langsung mengunduh berkas hasil permohonan.
        </p>
        <div className="pt-2">
          <Link
            href={`/lacak?ticket=${ticket.ticket_number}&pin=${ticket.whatsapp_pin_last4}`}
            className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
          >
            Kembali ke Halaman Lacak &amp; Unduh Hasil
          </Link>
        </div>
      </div>
    );
  }

  function handleDemographyChange<K extends keyof DemographyData>(
    field: K,
    val: DemographyData[K]
  ) {
    setDemography((prev) => ({ ...prev, [field]: val }));
  }

  function handleAnswerChange(key: string, score: number) {
    setAnswers((prev) => ({ ...prev, [key]: score }));
  }

  const totalAnswered = Object.keys(answers).length;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!demography.gender || !demography.education || !demography.age_range || !demography.occupation) {
      showToast("Lengkapi seluruh identitas demografi pada Bagian 1.", "warning");
      return;
    }

    if (totalAnswered < 16) {
      showToast("Harap isi seluruh 16 butir instrumen pertanyaan survei.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        ticket_id: ticket.id,
        contact_number: demography.contact_number,
        service_type: demography.service_type,
        gender: demography.gender,
        education: demography.education,
        age_range: demography.age_range,
        occupation: demography.occupation,
        is_disabled: demography.is_disabled,
        disability_type: demography.disability_type,
        ...answers,
        feedback: feedback.trim() || null,
      };

      const res = await fetch("/api/surveys/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mengirim survei.", "error");
        return;
      }

      showToast("Survei kepuasan berhasil disimpan.", "success");
      setCalculationResult(data.calculation || null);
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-6">
        <SurveyDemographySection
          data={demography}
          onChange={handleDemographyChange}
        />

        <SurveyLikertSection
          answers={answers}
          onAnswerChange={handleAnswerChange}
        />

        <SurveyFeedbackSection
          feedback={feedback}
          onFeedbackChange={setFeedback}
          isSubmitting={isSubmitting}
          totalAnswered={totalAnswered}
        />
      </form>

      <SurveySuccessModal
        isOpen={Boolean(calculationResult)}
        ticketNumber={ticket.ticket_number}
        pinLast4={ticket.whatsapp_pin_last4}
        calculation={calculationResult}
      />
    </>
  );
}
