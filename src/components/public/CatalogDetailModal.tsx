"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { X, ShieldCheck, Calendar } from "lucide-react";
import { CatalogVarietyItem } from "@/lib/services/catalog";

interface CatalogDetailModalProps {
  variety: CatalogVarietyItem | null;
  onClose: () => void;
}

export function CatalogDetailModal({ variety, onClose }: CatalogDetailModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (variety) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [variety, onClose]);

  if (!variety) return null;

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const isAskStock = variety.stock_status === "tanyakan_stok";
  const waUrl = `https://wa.me/6285111216203?text=${encodeURIComponent(
    `Halo Admin UPBS BRMP Banten, saya ingin menanyakan ketersediaan stok untuk ${variety.name}.`
  )}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-[#d1ded0] space-y-5 animate-dialog-in">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-[#e2e8f0] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
                {variety.commodity_type === "padi" ? "Benih Padi" : "Bibit Ayam"}
              </span>
              {variety.seed_class && variety.seed_class !== "NONE" && (
                <span className="rounded bg-[#f8faf4] border border-[#d1ded0] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#191c19]">
                  Kelas {variety.seed_class}
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold text-[#191c19] mt-1">{variety.name}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup modal"
            className="flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-[#d1ded0] text-[#191c19] hover:bg-[#f8faf4]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Pricing & Stock Card */}
        <div className="grid grid-cols-2 gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8faf4] p-4 text-xs">
          <div>
            <span className="text-[#475447] block text-[11px]">Harga Resmi Satuan:</span>
            <span className="text-base font-bold font-mono tabular-nums text-[#1e4f28]">
              {formatRupiah(variety.price_per_unit)}
            </span>
            <span className="text-[#475447] text-[11px]"> /{variety.unit}</span>
          </div>

          <div>
            <span className="text-[#475447] block text-[11px]">Ketersediaan Stok:</span>
            <span className="text-base font-bold font-mono tabular-nums text-[#191c19]">
              {variety.total_stock > 0
                ? `${variety.total_stock.toLocaleString("id-ID")} ${variety.unit}`
                : "Tanyakan Stok"}
            </span>
          </div>
        </div>

        {/* Agronomic Description */}
        <div className="space-y-2 text-xs">
          <span className="font-bold text-[#191c19] uppercase tracking-wider text-[10px]">
            Deskripsi &amp; Keunggulan Varietas:
          </span>
          <p className="text-[#475447] leading-relaxed whitespace-pre-line">
            {variety.description || "Informasi deskripsi varietas belum tersedia."}
          </p>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-3 pt-1 text-xs text-[#475447]">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#1e4f28]" />
            <span>Sertifikasi Standar BPSB</span>
          </div>
          {variety.earliest_expiry && (
            <div className="flex items-center gap-1.5 font-mono tabular-nums">
              <Calendar className="h-4 w-4 text-[#52792b]" />
              <span>Kedaluwarsa Terdekat: {variety.earliest_expiry}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-2 border-t border-[#e2e8f0]">
          {isAskStock ? (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-11 min-h-[44px] flex items-center justify-center rounded-lg bg-[#25D366] px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#20ba59] transition-colors"
            >
              <span>Tanyakan via WhatsApp</span>
            </a>
          ) : (
            <Link
              href={`/ajukan?kategori=BS&varietas=${variety.id}`}
              className="flex-1 h-11 min-h-[44px] flex items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
            >
              <span>Ajukan Pemesanan</span>
            </Link>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-11 min-h-[44px] px-5 flex items-center justify-center rounded-lg border border-[#d1ded0] text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
