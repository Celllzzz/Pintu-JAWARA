"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { SeedClass } from "@/types/database";

export interface VarietyItem {
  id: string;
  code: string;
  name: string;
  seed_class: SeedClass | null;
  commodity_type: "padi" | "ayam";
  description: string | null;
  price_per_unit: number;
  unit: string;
  is_active: boolean;
  total_current_stock: number;
  total_reserved_stock: number;
  net_available_stock: number;
  batches: Array<{
    id: string;
    batch_number: string;
    current_stock: number;
    reserved_stock: number;
    expiry_date: string;
  }>;
}

interface VarietyEditModalProps {
  variety: VarietyItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

const SEED_CLASS_OPTIONS = [
  { value: "NONE", label: "Tidak Ada (NONE / Umum)" },
  { value: "BS", label: "Breeder Seed (BS)" },
  { value: "FS", label: "Foundation Seed (FS / Benih Dasar)" },
  { value: "SS", label: "Stock Seed (SS / Benih Pokok)" },
  { value: "ES", label: "Extension Seed (ES / Benih Sebar)" },
];

export function VarietyEditModal(props: VarietyEditModalProps) {
  if (!props.variety) return null;
  return <VarietyEditModalContent key={props.variety.id} {...props} />;
}

function VarietyEditModalContent({
  variety,
  onClose,
  onSuccess,
}: VarietyEditModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState(() => variety?.name || "");
  const [seedClass, setSeedClass] = useState<string>(() => variety?.seed_class || "NONE");
  const [price, setPrice] = useState(() => String(variety?.price_per_unit || 0));
  const [description, setDescription] = useState(() => variety?.description || "");
  const [isActive, setIsActive] = useState(() => (variety ? variety.is_active : true));
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!variety) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!variety) return;
    if (!name.trim()) {
      showToast("Nama varietas wajib diisi.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/unit/catalog/${variety.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          seed_class: seedClass,
          price_per_unit: Number(price) || 0,
          description: description.trim(),
          is_active: isActive,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal memperbarui varietas.", "error");
        return;
      }

      showToast("Varietas berhasil diperbarui.", "success");
      onSuccess();
      onClose();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-7 shadow-xl border border-[#d1ded0] space-y-5 animate-dialog-in max-h-[90vh] overflow-y-auto">
        <div className="border-b border-[#e2e8f0] pb-3.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            KELOLA SPESIFIKASI VARIETAS
          </span>
          <h3 className="text-base font-bold text-[#191c19] mt-0.5">
            Edit Varietas: {variety.name}
          </h3>
          <p className="text-xs text-[#475447]">Kode: {variety.code}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
              Nama Varietas
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
              Kelas Benih
            </label>
            <CustomSelect
              value={seedClass}
              onChange={(val) => setSeedClass(String(val))}
              options={SEED_CLASS_OPTIONS}
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
              Harga Resmi Satuan (Rp/{variety.unit})
            </label>
            <input
              type="number"
              min={0}
              required
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
              Deskripsi &amp; Spesifikasi Agronomis
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan potensi hasil, umur tanaman, ketahanan hama/penyakit, rasa nasi, dsb..."
              className="w-full rounded-lg border border-[#d1ded0] bg-white p-3 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-1">
            <input
              id="var_active_toggle"
              type="checkbox"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="h-4 w-4 rounded border-[#d1ded0] text-[#1e4f28] focus:ring-[#1e4f28] cursor-pointer"
            />
            <label htmlFor="var_active_toggle" className="text-xs font-semibold text-[#191c19] cursor-pointer">
              Tampilkan di Katalog Publik (Status Aktif)
            </label>
          </div>

          <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 border-t border-[#e2e8f0]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-lg border border-[#d1ded0] px-4 text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
