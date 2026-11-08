"use client";

import React, { useMemo } from "react";
import { AlertCircle, Calculator } from "lucide-react";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { CatalogVarietyItem } from "@/lib/services/catalog";

interface UPBSSpecFieldProps {
  varieties: CatalogVarietyItem[];
  selectedVarietyId: string;
  onSelectVariety: (id: string) => void;
  mechanism: "komersial" | "bantuan";
  onChangeMechanism: (m: "komersial" | "bantuan") => void;
  quantity: string;
  onChangeQuantity: (val: string) => void;
  onCostCalculated: (cost: number | null) => void;
}

function formatRupiah(val: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(val);
}

export function UPBSSpecField({
  varieties,
  selectedVarietyId,
  onSelectVariety,
  mechanism,
  onChangeMechanism,
  quantity,
  onChangeQuantity,
  onCostCalculated,
}: UPBSSpecFieldProps) {
  const selectedVariety = useMemo(
    () => varieties.find((v) => v.id === selectedVarietyId) || null,
    [varieties, selectedVarietyId]
  );

  const numQuantity = parseFloat(quantity) || 0;

  const varietyOptions = useMemo(
    () =>
      varieties.map((v) => ({
        value: v.id,
        label: `${v.name} · ${formatRupiah(v.price_per_unit)}/${v.unit} · ${
          v.total_stock > 0 ? `Stok: ${v.total_stock} ${v.unit}` : "Tanyakan Stok"
        }`,
      })),
    [varieties]
  );

  const estimatedCost = useMemo(() => {
    if (mechanism !== "komersial" || !selectedVariety || numQuantity <= 0) {
      return null;
    }
    const total = numQuantity * selectedVariety.price_per_unit;
    return total;
  }, [mechanism, selectedVariety, numQuantity]);

  // Sync cost to parent
  React.useEffect(() => {
    onCostCalculated(estimatedCost);
  }, [estimatedCost, onCostCalculated]);

  const isExceedingStock =
    Boolean(selectedVariety) &&
    selectedVariety!.total_stock > 0 &&
    numQuantity > selectedVariety!.total_stock;

  return (
    <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 sm:p-5 space-y-4">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e4f28]">
          MODUL BENIH &amp; BIBIT SUMBER (UPBS)
        </span>
        <h4 className="text-sm font-bold text-[#191c19]">
          Spesifikasi Permohonan Benih / Bibit
        </h4>
      </div>

      {/* 1. Mekanisme Pengajuan */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5">
          Mekanisme Pengajuan
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <label
            className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${
              mechanism === "komersial"
                ? "border-[#1e4f28] bg-white font-semibold text-[#1e4f28] shadow-xs"
                : "border-[#d1ded0] bg-white/60 text-[#191c19] hover:bg-white"
            }`}
          >
            <input
              type="radio"
              name="mechanism"
              value="komersial"
              checked={mechanism === "komersial"}
              onChange={() => onChangeMechanism("komersial")}
              className="text-[#1e4f28] focus:ring-[#1e4f28]"
            />
            <span>Penjualan / Komersial (Sesuai Harga Resmi)</span>
          </label>

          <label
            className={`flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer transition-colors ${
              mechanism === "bantuan"
                ? "border-[#1e4f28] bg-white font-semibold text-[#1e4f28] shadow-xs"
                : "border-[#d1ded0] bg-white/60 text-[#191c19] hover:bg-white"
            }`}
          >
            <input
              type="radio"
              name="mechanism"
              value="bantuan"
              checked={mechanism === "bantuan"}
              onChange={() => onChangeMechanism("bantuan")}
              className="text-[#1e4f28] focus:ring-[#1e4f28]"
            />
            <span>Permohonan Bantuan Resmi Instansi / Poktan</span>
          </label>
        </div>
      </div>

      {/* 2. Pilihan Varietas & Kelas */}
      <div>
        <label
          htmlFor="upbs_variety"
          className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
        >
          Varietas &amp; Kelas Benih
        </label>
        <CustomSelect
          id="upbs_variety"
          value={selectedVarietyId}
          onChange={(val) => onSelectVariety(String(val))}
          options={varietyOptions}
          placeholder="-- Pilih Varietas Benih / Bibit --"
        />
      </div>

      {/* 3. Jumlah Kuantitas (kg / ekor) */}
      {selectedVariety && (
        <div className="space-y-3">
          <div>
            <label
              htmlFor="upbs_quantity"
              className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
            >
              Jumlah Kebutuhan ({selectedVariety.unit})
            </label>
            <input
              id="upbs_quantity"
              type="number"
              min={1}
              required
              value={quantity}
              onChange={(e) => onChangeQuantity(e.target.value)}
              placeholder={`Masukkan jumlah dalam satuan ${selectedVariety.unit}`}
              className="block w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-sm font-mono tabular-nums text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          {/* Real-time Calculation Display */}
          {mechanism === "komersial" && estimatedCost !== null && (
            <div className="rounded-lg border border-[#bbf7d0] bg-white p-3 text-xs flex items-center justify-between">
              <span className="text-[#475447] flex items-center gap-1.5">
                <Calculator className="h-4 w-4 text-[#1e4f28]" />
                <span>Perkiraan Total Biaya:</span>
              </span>
              <span className="font-bold font-mono tabular-nums text-[#1e4f28] text-sm">
                {formatRupiah(estimatedCost)}
              </span>
            </div>
          )}

          {/* Stock Warning Notice */}
          {isExceedingStock && (
            <div className="rounded-lg border border-[#fde68a] bg-[#fffbeb] p-2.5 text-xs text-[#92400e] flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-[#d97706]" />
              <span>
                Jumlah melebihi stok yang tersedia saat ini (
                <strong className="font-mono tabular-nums">
                  {selectedVariety.total_stock} {selectedVariety.unit}
                </strong>
                ). Petugas UPBS akan mengonfirmasi ketersediaan dan jadwal panen berikutnya.
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
