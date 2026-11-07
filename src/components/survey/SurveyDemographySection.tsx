"use client";

import React from "react";
import { ChevronDown } from "lucide-react";
import {
  SERVICE_OPTIONS,
  EDUCATION_OPTIONS,
  AGE_OPTIONS,
  OCCUPATION_OPTIONS,
  DISABILITY_OPTIONS,
} from "./survey-options";

export interface DemographyData {
  contact_number: string;
  service_type: string;
  gender: "Laki-Laki" | "Perempuan" | "";
  education: string;
  age_range: string;
  occupation: string;
  is_disabled: boolean;
  disability_type: string;
}

interface SurveyDemographySectionProps {
  data: DemographyData;
  onChange: <K extends keyof DemographyData>(field: K, val: DemographyData[K]) => void;
}

export function SurveyDemographySection({
  data,
  onChange,
}: SurveyDemographySectionProps) {
  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-5">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          BAGIAN 1 DARI 3
        </span>
        <h3 className="text-base font-bold text-[#191c19]">
          Identitas &amp; Demografi Responden
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        {/* 1. Contact Number */}
        <div>
          <label
            htmlFor="surv_contact"
            className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
          >
            Nomor Kontak WhatsApp (Auto-Fill)
          </label>
          <input
            id="surv_contact"
            type="tel"
            inputMode="numeric"
            pattern="[0-9]*"
            value={data.contact_number}
            onChange={(e) => onChange("contact_number", e.target.value.replace(/\D/g, ""))}
            placeholder="081234567890"
            className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
          />
        </div>

        {/* 2. Service Type */}
        <div>
          <label
            htmlFor="surv_service"
            className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
          >
            Jenis Layanan yang Diterima *
          </label>
          <div className="relative">
            <select
              id="surv_service"
              required
              value={data.service_type}
              onChange={(e) => onChange("service_type", e.target.value)}
              className="w-full h-11 min-h-[44px] appearance-none rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Jenis Layanan --</option>
              {SERVICE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 3. Gender */}
        <div>
          <label className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]">
            Jenis Kelamin *
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["Laki-Laki", "Perempuan"] as const).map((g) => (
              <label
                key={g}
                className={`flex h-11 min-h-[44px] items-center gap-2 rounded-lg border px-3 cursor-pointer transition-colors ${
                  data.gender === g
                    ? "border-[#1e4f28] bg-[#f0fdf4] font-semibold text-[#1e4f28]"
                    : "border-[#d1ded0] bg-white text-[#191c19] hover:bg-[#f8faf4]"
                }`}
              >
                <input
                  type="radio"
                  name="gender"
                  value={g}
                  checked={data.gender === g}
                  onChange={() => onChange("gender", g)}
                  className="text-[#1e4f28] focus:ring-[#1e4f28]"
                />
                <span>{g}</span>
              </label>
            ))}
          </div>
        </div>

        {/* 4. Education */}
        <div>
          <label
            htmlFor="surv_edu"
            className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
          >
            Pendidikan Terakhir *
          </label>
          <div className="relative">
            <select
              id="surv_edu"
              required
              value={data.education}
              onChange={(e) => onChange("education", e.target.value)}
              className="w-full h-11 min-h-[44px] appearance-none rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Tingkat Pendidikan --</option>
              {EDUCATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 5. Age */}
        <div>
          <label
            htmlFor="surv_age"
            className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
          >
            Rentang Usia *
          </label>
          <div className="relative">
            <select
              id="surv_age"
              required
              value={data.age_range}
              onChange={(e) => onChange("age_range", e.target.value)}
              className="w-full h-11 min-h-[44px] appearance-none rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Rentang Usia --</option>
              {AGE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* 6. Occupation */}
        <div>
          <label
            htmlFor="surv_job"
            className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
          >
            Pekerjaan Utama *
          </label>
          <div className="relative">
            <select
              id="surv_job"
              required
              value={data.occupation}
              onChange={(e) => onChange("occupation", e.target.value)}
              className="w-full h-11 min-h-[44px] appearance-none rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              <option value="">-- Pilih Pekerjaan --</option>
              {OCCUPATION_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>

      {/* 7 & 8. Disability Status & Type */}
      <div className="pt-2 border-t border-[#e2e8f0] space-y-3 text-xs">
        <div>
          <label className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]">
            Penyandang Disabilitas / Memerlukan Pendamping Khusus?
          </label>
          <div className="flex gap-4">
            {[false, true].map((val) => (
              <label
                key={String(val)}
                className={`flex h-11 min-h-[44px] items-center gap-2 rounded-lg border px-4 cursor-pointer transition-colors ${
                  data.is_disabled === val
                    ? "border-[#1e4f28] bg-[#f0fdf4] font-semibold text-[#1e4f28]"
                    : "border-[#d1ded0] bg-white text-[#191c19] hover:bg-[#f8faf4]"
                }`}
              >
                <input
                  type="radio"
                  name="is_disabled"
                  checked={data.is_disabled === val}
                  onChange={() => onChange("is_disabled", val)}
                  className="text-[#1e4f28] focus:ring-[#1e4f28]"
                />
                <span>{val ? "Ya" : "Tidak"}</span>
              </label>
            ))}
          </div>
        </div>

        {data.is_disabled && (
          <div>
            <label
              htmlFor="surv_disability_type"
              className="block font-bold uppercase tracking-wider text-[#191c19] mb-1.5 text-[10px]"
            >
              Jenis Disabilitas (Pilih yang Sesuai)
            </label>
            <div className="relative">
              <select
                id="surv_disability_type"
                value={data.disability_type}
                onChange={(e) => onChange("disability_type", e.target.value)}
                className="w-full sm:w-80 h-11 min-h-[44px] appearance-none rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
              >
                <option value="">-- Pilih Ragam Disabilitas --</option>
                {DISABILITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
