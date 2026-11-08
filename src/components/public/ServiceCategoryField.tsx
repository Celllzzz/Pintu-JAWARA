import React, { useMemo } from "react";
import { CustomSelect } from "@/components/ui/CustomSelect";
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
  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: c.id,
        label: `SL-${c.code} · ${c.name}`,
      })),
    [categories]
  );

  const subServiceOptions = useMemo(
    () =>
      subServices.map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [subServices]
  );

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
          <CustomSelect
            id="category_select"
            value={selectedCategoryId}
            onChange={(val) => onSelectCategoryId(String(val))}
            options={categoryOptions}
            placeholder="-- Pilih Kategori Layanan --"
          />
        </div>

        <div>
          <label
            htmlFor="sub_service_select"
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            Sub-Layanan Spesifik
          </label>
          <CustomSelect
            id="sub_service_select"
            value={selectedSubServiceId}
            onChange={(val) => onSelectSubServiceId(String(val))}
            options={subServiceOptions}
            placeholder={
              subServices.length === 0
                ? "-- Tidak ada sub-layanan --"
                : "-- Pilih Sub-Layanan --"
            }
            disabled={subServices.length === 0}
          />
        </div>
      </div>
    </div>
  );
}
