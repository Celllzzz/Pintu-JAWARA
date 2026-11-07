"use client";

import React, { useState } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";

export interface CategoryOption {
  code: string;
  name: string;
}

interface ExportActionBarProps {
  categories: CategoryOption[];
  onFilterChange: (range: string, categoryCode: string) => void;
}

export function ExportActionBar({
  categories,
  onFilterChange,
}: ExportActionBarProps) {
  const [selectedRange, setSelectedRange] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  function handleRangeChange(r: string) {
    setSelectedRange(r);
    onFilterChange(r, selectedCategory);
  }

  function handleCategoryChange(c: string) {
    setSelectedCategory(c);
    onFilterChange(selectedRange, c);
  }

  function handleExportCsv() {
    const params = new URLSearchParams({
      range: selectedRange,
      kategori: selectedCategory,
    });
    const downloadUrl = `/api/pimpinan/export?${params.toString()}`;
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `laporan_pintu_jawara_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handlePrintPdf() {
    const params = new URLSearchParams({
      range: selectedRange,
      kategori: selectedCategory,
    });
    window.open(`/pimpinan/laporan/print?${params.toString()}`, "_blank");
  }

  const rangeOptions = [
    { value: "all", label: "Semua Waktu" },
    { value: "month", label: "Bulan Ini" },
    { value: "quarter", label: "Triwulan Ini" },
    { value: "year", label: "Tahun Ini (2026)" },
  ];

  const categoryOptions = [
    { value: "all", label: "Semua 8 Kategori Layanan" },
    ...categories.map((c) => ({
      value: c.code,
      label: `SL-${c.code} · ${c.name}`,
    })),
  ];

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-4 sm:p-5 shadow-none space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            FILTER &amp; EKSPOR LAPORAN RESMI
          </span>
          <h3 className="text-sm font-bold text-[#191c19]">
            Laporan Kinerja Tabel 8 Kolom Baku
          </h3>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filters with CustomSelect */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 text-xs">
          <CustomSelect
            value={selectedRange}
            onChange={(val) => handleRangeChange(String(val))}
            options={rangeOptions}
            buttonClassName="h-10 min-h-[40px]"
          />

          <CustomSelect
            value={selectedCategory}
            onChange={(val) => handleCategoryChange(String(val))}
            options={categoryOptions}
            buttonClassName="h-10 min-h-[40px] max-w-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
          >
            <span>Ekspor Excel (.csv)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="flex h-10 min-h-[40px] items-center justify-center rounded-lg border border-[#d1ded0] bg-white px-4 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            <span>Cetak Laporan / PDF</span>
          </button>
        </div>
      </div>
    </div>
  );
}
