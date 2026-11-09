"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SERVICE_OPTIONS } from "@/components/survey/survey-options";

export interface SurveyRowItem {
  id: string;
  created_at: string;
  contact_number: string | null;
  service_type: string;
  gender: string;
  education: string;
  age_range: string;
  occupation: string;
  is_disabled: boolean;
  disability_type: string | null;
  average_score: number;
  ikm_score: number;
  service_grade: string;
  feedback: string | null;
  tickets: {
    ticket_number: string;
    applicant_name: string;
    whatsapp_number: string;
  } | Array<{
    ticket_number: string;
    applicant_name: string;
    whatsapp_number: string;
  }> | null;
}

interface SurveyExportWorkspaceProps {
  initialSurveys: SurveyRowItem[];
  initialTotal: number;
  initialAverageIkm: number | null;
  initialGrade: string;
}

export function SurveyExportWorkspace({
  initialSurveys,
  initialTotal,
  initialAverageIkm,
  initialGrade,
}: SurveyExportWorkspaceProps) {
  const { showToast } = useToast();

  const [surveys, setSurveys] = useState<SurveyRowItem[]>(initialSurveys);
  const [total, setTotal] = useState(initialTotal);
  const [averageIkm, setAverageIkm] = useState<number | null>(initialAverageIkm);
  const [overallGrade, setOverallGrade] = useState(initialGrade);

  const [selectedRange, setSelectedRange] = useState("all");
  const [selectedService, setSelectedService] = useState("all");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const fetchFilteredSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        range: selectedRange,
        layanan: selectedService,
        mutu: selectedGrade,
        format: "json",
      });

      const res = await fetch(`/api/admin/surveys/export?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setSurveys(data.surveys || []);
        setTotal(data.total || 0);
        setAverageIkm(data.averageIkm);
        setOverallGrade(data.overallGrade || "—");
      }
    } catch {
      showToast("Gagal memuat pratinjau data survei.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [selectedRange, selectedService, selectedGrade, showToast]);

  useEffect(() => {
    fetchFilteredSurveys();
  }, [fetchFilteredSurveys]);

  function handleExportExcel() {
    setIsExporting(true);
    const params = new URLSearchParams({
      range: selectedRange,
      layanan: selectedService,
      mutu: selectedGrade,
      format: "xlsx",
    });

    const downloadUrl = `/api/admin/surveys/export?${params.toString()}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `rekapitulasi_survei_skm_${Date.now()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Mengunduh berkas laporan survei (.xlsx)...", "info");
    setTimeout(() => setIsExporting(false), 1500);
  }

  const rangeOptions = [
    { value: "all", label: "Semua Waktu" },
    { value: "month", label: "Bulan Ini" },
    { value: "quarter", label: "Triwulan Ini" },
    { value: "year", label: "Tahun Ini (2026)" },
  ];

  const serviceOptions = [
    { value: "all", label: "Semua Jenis Layanan" },
    ...SERVICE_OPTIONS.map((s) => ({ value: s, label: s })),
  ];

  const gradeOptions = [
    { value: "all", label: "Semua Mutu Pelayanan" },
    { value: "A", label: "Mutu A (Sangat Baik)" },
    { value: "B", label: "Mutu B (Baik)" },
    { value: "C", label: "Mutu C (Kurang Baik)" },
    { value: "D", label: "Mutu D (Tidak Baik)" },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0] pb-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            EVALUASI PELAYANAN PUBLIK
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191c19] mt-0.5">
            Rekapitulasi &amp; Ekspor Survei SKM
          </h1>
          <p className="text-xs text-[#475447]">
            Rekapitulasi kuesioner kepuasan masyarakat dari pemohon layanan BRMP Banten yang telah selesai ditangani.
          </p>
        </div>
      </div>

      {/* 3 KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
            Total Responden Terdata
          </span>
          <p className="font-mono tabular-nums text-3xl font-extrabold text-[#191c19]">
            {total}
          </p>
          <p className="text-[11px] text-[#475447]">Responden mengisi kuesioner resmi</p>
        </div>

        <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#1e4f28]">
            Rata-rata Skor IKM
          </span>
          <p className="font-mono tabular-nums text-3xl font-extrabold text-[#1e4f28]">
            {averageIkm !== null ? averageIkm : "—"}
          </p>
          <p className="text-[11px] text-[#475447]">Skala 25,00 s.d. 100,00</p>
        </div>

        <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-[#52792b]">
            Mutu Pelayanan Saat Ini
          </span>
          <p className="text-xl font-extrabold text-[#191c19] pt-1">
            {overallGrade}
          </p>
        </div>
      </div>

      {/* Filter and Export Action Bar */}
      <div className="rounded-xl border border-[#d1ded0] bg-white p-4 sm:p-5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
              FILTER &amp; UNDUH LAPORAN
            </span>
            <h3 className="text-sm font-bold text-[#191c19]">
              Kriteria Data Survei
            </h3>
          </div>
          <span className="text-xs text-[#475447]">
            Menampilkan: <strong className="font-mono tabular-nums text-[#191c19]">{surveys.length}</strong> data
          </span>
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Custom Select Filters */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2.5 text-xs">
            <CustomSelect
              value={selectedRange}
              onChange={(val) => setSelectedRange(String(val))}
              options={rangeOptions}
              buttonClassName="h-10 min-h-[40px]"
            />

            <CustomSelect
              value={selectedService}
              onChange={(val) => setSelectedService(String(val))}
              options={serviceOptions}
              buttonClassName="h-10 min-h-[40px] max-w-xs"
            />

            <CustomSelect
              value={selectedGrade}
              onChange={(val) => setSelectedGrade(String(val))}
              options={gradeOptions}
              buttonClassName="h-10 min-h-[40px]"
            />
          </div>

          {/* Clean Text Buttons (No Excessive Icons) */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              disabled={isExporting || surveys.length === 0}
              onClick={handleExportExcel}
              className="flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
            >
              {isExporting ? "Menyiapkan Berkas..." : "Ekspor Excel (.xlsx)"}
            </button>

            <button
              type="button"
              onClick={fetchFilteredSurveys}
              disabled={isLoading}
              className="flex h-10 min-h-[40px] items-center justify-center rounded-lg border border-[#d1ded0] bg-white px-4 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              {isLoading ? "Memuat..." : "Segarkan"}
            </button>
          </div>
        </div>
      </div>

      {/* Preview Table */}
      <div className="rounded-xl border border-[#d1ded0] bg-white overflow-hidden shadow-none">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#f8faf4] border-b border-[#d1ded0] text-[11px] font-bold uppercase tracking-wider text-[#191c19]">
                <th className="p-3 text-center w-10">No</th>
                <th className="p-3 text-center">Waktu Isi (WIB)</th>
                <th className="p-3 text-center">Nomor E-Tiket</th>
                <th className="p-3">Nama Pemohon</th>
                <th className="p-3">Jenis Layanan</th>
                <th className="p-3 text-center">Rata-rata</th>
                <th className="p-3 text-center">Skor IKM</th>
                <th className="p-3 text-center">Mutu</th>
                <th className="p-3 min-w-[200px]">Kritik &amp; Saran</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e2e8f0]">
              {surveys.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="p-8 text-center text-xs italic text-[#475447]"
                  >
                    Tidak ada data survei yang memenuhi kriteria filter ini.
                  </td>
                </tr>
              ) : (
                surveys.map((s, idx) => {
                  const ticket = Array.isArray(s.tickets) ? s.tickets[0] : s.tickets;
                  const ticketNumber = ticket?.ticket_number || "—";
                  const applicantName = ticket?.applicant_name || "—";

                  const fillDate = new Date(s.created_at);
                  const dateStr = fillDate.toLocaleDateString("id-ID", {
                    timeZone: "Asia/Jakarta",
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  });
                  const timeStr = fillDate
                    .toLocaleTimeString("id-ID", {
                      timeZone: "Asia/Jakarta",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })
                    .replace(":", ".");

                  return (
                    <tr
                      key={s.id}
                      className="hover:bg-[#f8faf4] transition-colors"
                    >
                      <td className="p-3 text-center font-mono tabular-nums text-[#475447]">
                        {idx + 1}
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums text-[#475447] whitespace-nowrap">
                        {dateStr} {timeStr}
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums font-bold text-[#191c19] whitespace-nowrap">
                        {ticketNumber}
                      </td>
                      <td className="p-3 font-semibold text-[#191c19]">
                        {applicantName}
                      </td>
                      <td className="p-3 text-[#191c19]">
                        {s.service_type}
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums">
                        {Number(s.average_score).toFixed(2)}
                      </td>
                      <td className="p-3 text-center font-mono tabular-nums font-bold text-[#1e4f28]">
                        {Number(s.ikm_score).toFixed(2)}
                      </td>
                      <td className="p-3 text-center whitespace-nowrap">
                        <span className="inline-block rounded-full bg-[#f0fdf4] border border-[#bbf7d0] px-2.5 py-0.5 text-[11px] font-bold text-[#1e4f28]">
                          Mutu {s.service_grade}
                        </span>
                      </td>
                      <td className="p-3 text-[#475447] leading-relaxed">
                        {s.feedback || "—"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
