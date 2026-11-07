"use client";

import React from "react";

export interface LikertQuestion {
  code: string;
  key: string;
  category: string;
  statement: string;
}

export const LIKERT_QUESTIONS: LikertQuestion[] = [
  {
    code: "Q1",
    key: "q1",
    category: "Persyaratan & Informasi",
    statement: "Informasi pelayanan tersedia melalui media elektronik maupun nonelektronik",
  },
  {
    code: "Q2",
    key: "q2",
    category: "Persyaratan",
    statement: "Kesesuaian persyaratan dengan standar pelayanan/informasi yang diberikan",
  },
  {
    code: "Q3",
    key: "q3",
    category: "Sistem & Prosedur",
    statement: "Standar dan prosedur layanan diinformasikan dengan jelas",
  },
  {
    code: "Q4",
    key: "q4",
    category: "Sistem & Prosedur",
    statement: "Prosedur dan alur layanan mudah dipahami dan dilakukan",
  },
  {
    code: "Q5",
    key: "q5",
    category: "Integritas Pelayanan",
    statement: "Layanan diberikan sesuai prosedur tanpa kecurangan",
  },
  {
    code: "Q6",
    key: "q6",
    category: "Waktu Penyelesaian",
    statement: "Jangka waktu penyelesaian layanan sesuai dengan standar pelayanan/yang diinformasikan",
  },
  {
    code: "Q7",
    key: "q7",
    category: "Biaya & Tarif",
    statement: "Biaya layanan sesuai dengan standar pelayanan yang diinformasikan",
  },
  {
    code: "Q8",
    key: "q8",
    category: "Integritas Anti-Pungli",
    statement: "Tidak ada pungutan liar (pungli) dalam pelayanan",
  },
  {
    code: "Q9",
    key: "q9",
    category: "Integritas Anti-Percaloan",
    statement: "Tidak ada percaloan atau perantara tidak resmi dalam pelayanan",
  },
  {
    code: "Q10",
    key: "q10",
    category: "Spesifikasi Produk",
    statement: "Produk layanan yang diterima sesuai dengan standar pelayanan yang dipublikasikan",
  },
  {
    code: "Q11",
    key: "q11",
    category: "Kompetensi Petugas",
    statement: "Petugas merespon kebutuhan layanan dengan cepat",
  },
  {
    code: "Q12",
    key: "q12",
    category: "Perilaku Petugas",
    statement: "Petugas melayani saya dengan ramah dan sopan",
  },
  {
    code: "Q13",
    key: "q13",
    category: "Keadilan Layanan",
    statement: "Seluruh pengguna layanan dilayani secara adil tanpa diskriminasi",
  },
  {
    code: "Q14",
    key: "q14",
    category: "Integritas Anti-Gratifikasi",
    statement: "Pelayanan diberikan tanpa imbalan uang, barang, atau fasilitas di luar aturan",
  },
  {
    code: "Q15",
    key: "q15",
    category: "Konsultasi & Pengaduan",
    statement: "Layanan konsultasi dan pengaduan mudah diakses",
  },
  {
    code: "Q16",
    key: "q16",
    category: "Sarana & Prasarana",
    statement: "Sarana dan prasarana pelayanan nyaman dan mudah digunakan",
  },
];

const LIKERT_OPTIONS = [
  { value: 4, label: "Sangat Setuju / Sesuai" },
  { value: 3, label: "Setuju / Sesuai" },
  { value: 2, label: "Tidak Setuju / Tidak Sesuai" },
  { value: 1, label: "Sangat Tidak Setuju" },
];

interface SurveyLikertSectionProps {
  answers: Record<string, number>;
  onAnswerChange: (key: string, score: number) => void;
}

export function SurveyLikertSection({
  answers,
  onAnswerChange,
}: SurveyLikertSectionProps) {
  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-5">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          BAGIAN 2 DARI 3
        </span>
        <h3 className="text-base font-bold text-[#191c19]">
          Pendapat Responden Tentang Pelayanan (16 Instrumen)
        </h3>
        <p className="mt-1 text-xs text-[#475447]">
          Pilih salah satu skor 1 s.d. 4 pada masing-masing butir pernyataan di bawah ini.
        </p>
      </div>

      <div className="space-y-4">
        {LIKERT_QUESTIONS.map((q, idx) => {
          const currentScore = answers[q.key];
          return (
            <div
              key={q.key}
              className="rounded-xl border border-[#e2e8f0] bg-[#f8faf4] p-4 text-xs space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
                    {q.code} · {q.category}
                  </span>
                  <p className="text-sm font-semibold text-[#191c19] leading-snug">
                    {q.statement}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-xs font-bold text-[#475447] shrink-0">
                  {idx + 1}/16
                </span>
              </div>

              {/* 4 Score Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1">
                {LIKERT_OPTIONS.map((opt) => {
                  const isSelected = currentScore === opt.value;
                  return (
                    <label
                      key={opt.value}
                      className={`flex h-11 min-h-[44px] items-center gap-2 rounded-lg border px-3 cursor-pointer transition-colors ${
                        isSelected
                          ? "border-[#1e4f28] bg-white font-bold text-[#1e4f28] shadow-xs"
                          : "border-[#d1ded0] bg-white text-[#191c19] hover:bg-white/80"
                      }`}
                    >
                      <input
                        type="radio"
                        name={q.key}
                        value={opt.value}
                        checked={isSelected}
                        onChange={() => onAnswerChange(q.key, opt.value)}
                        className="text-[#1e4f28] focus:ring-[#1e4f28]"
                      />
                      <span className="truncate">{opt.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
