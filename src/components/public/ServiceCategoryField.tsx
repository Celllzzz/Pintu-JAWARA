import React from "react";
import { ChevronDown } from "lucide-react";
import { CategoryData, SubServiceData } from "./ServiceForm";

interface ServiceCategoryFieldProps {
  categories: CategoryData[];
  subServices: SubServiceData[];
  selectedCategoryId: string;
  onSelectCategoryId: (id: string) => void;
  selectedSubServiceId: string;
  onSelectSubServiceId: (id: string) => void;
}

export function ServiceCategoryField({
  categories,
  subServices,
  selectedCategoryId,
  onSelectCategoryId,
  selectedSubServiceId,
  onSelectSubServiceId,
}: ServiceCategoryFieldProps) {
  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-4">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          LANGKAH 1 DARI 3
        </span>
        <h3 className="text-base font-bold text-[#191c19]">Pilihan Jenis Layanan</h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="category_select"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            Kategori Layanan Utama
          </label>
          <div className="relative">
            <select
              id="category_select"
              required
              value={selectedCategoryId}
              onChange={(e) => onSelectCategoryId(e.target.value)}
              className="block w-full appearance-none h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  SL-{c.code} · {c.name}
                </option>
              ))}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div>
          <label
            htmlFor="sub_service_select"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            Sub-Layanan Spesifik
          </label>
          <div className="relative">
            <select
              id="sub_service_select"
              required
              value={selectedSubServiceId}
              onChange={(e) => onSelectSubServiceId(e.target.value)}
              className="block w-full appearance-none h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white pl-3.5 pr-12 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none cursor-pointer"
            >
              {subServices.length === 0 ? (
                <option value="">-- Tidak ada sub-layanan --</option>
              ) : (
                subServices.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="h-4 w-4 text-[#475447] pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" />
          </div>
        </div>
      </div>
    </div>
  );
}
