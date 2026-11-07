"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { CustomSelect } from "@/components/ui/CustomSelect";

interface AddVarietyModalProps {
  isOpen: boolean;
  userCommodity: "padi" | "ayam";
  onClose: () => void;
  onSuccess: () => void;
}

const SEED_CLASS_OPTIONS = [
  { value: "NONE", label: "Tidak Ada (NONE / Umum)" },
  { value: "BS", label: "Breeder Seed (BS)" },
  { value: "FS", label: "Foundation Seed (FS)" },
  { value: "SS", label: "Stock Seed (SS)" },
  { value: "ES", label: "Extension Seed (ES)" },
];

export function AddVarietyModal({
  isOpen,
  userCommodity,
  onClose,
  onSuccess,
}: AddVarietyModalProps) {
  const { showToast } = useToast();

  const [name, setName] = useState("");
  const commodity = userCommodity;
  const [seedClass, setSeedClass] = useState("SS");
  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState(userCommodity === "ayam" ? "ekor" : "kg");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      showToast("Nama varietas wajib diisi.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/unit/catalog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          commodity_type: commodity,
          seed_class: seedClass,
          price_per_unit: Number(price) || 0,
          unit: unit.trim(),
          description: description.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menambah varietas baru.", "error");
        return;
      }

      showToast("Varietas baru berhasil didaftarkan.", "success");
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
            PENDAFTARAN KOMODITAS UPBS
          </span>
          <h3 className="text-base font-bold text-[#191c19] mt-0.5">
            Daftarkan Varietas Baru
          </h3>
          <p className="text-xs text-[#475447]">
            Komoditas: {commodity === "padi" ? "Benih Padi" : "Bibit Ayam"}
          </p>
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
              placeholder="Inpari 48 / Varietas Unggul"
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
                Harga Satuan (Rp)
              </label>
              <input
                type="number"
                min={0}
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="12500"
                className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
                Satuan Ukuran
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="kg / ekor"
                className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold uppercase tracking-wider text-[10px] text-[#191c19] mb-1.5">
              Deskripsi &amp; Keunggulan Varietas
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Jelaskan spesifikasi keunggulan benih/bibit..."
              className="w-full rounded-lg border border-[#d1ded0] bg-white p-3 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none leading-relaxed"
            />
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
              {isSubmitting ? "Menyimpan..." : "Daftarkan Varietas"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
