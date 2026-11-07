"use client";

import React from "react";
import Link from "next/link";
import { CatalogVarietyItem, StockStatus } from "@/lib/services/catalog";

interface CatalogGridProps {
  varieties: CatalogVarietyItem[];
  onOpenDetail: (variety: CatalogVarietyItem) => void;
}

export function CatalogGrid({ varieties, onOpenDetail }: CatalogGridProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const statusStyle: Record<StockStatus, { label: string; style: string }> = {
    tersedia: {
      label: "Tersedia",
      style: "bg-[#f0fdf4] text-[#1e4f28] border-[#bbf7d0]",
    },
    terbatas: {
      label: "Stok Terbatas",
      style: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
    },
    tanyakan_stok: {
      label: "Tanyakan Stok",
      style: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
    },
    habis: {
      label: "Habis",
      style: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
    },
  };

  if (varieties.length === 0) {
    return (
      <div className="rounded-xl border border-[#d1ded0] bg-white p-12 text-center text-sm text-[#475447]">
        Tidak ada varietas yang sesuai dengan kriteria filter atau pencarian Anda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {varieties.map((v) => {
        const status = statusStyle[v.stock_status];
        const isAskStock = v.stock_status === "tanyakan_stok";
        const waUrl = `https://wa.me/6285111216203?text=${encodeURIComponent(
          `Halo Admin UPBS BRMP Banten, saya ingin menanyakan ketersediaan stok untuk ${v.name}.`
        )}`;

        return (
          <div
            key={v.id}
            className="flex flex-col justify-between rounded-xl border border-[#d1ded0] bg-white p-5 transition-all hover:border-[#1e4f28] hover:shadow-sm"
          >
            <div className="space-y-3">
              {/* Category pill & Stock pill */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
                  {v.commodity_type === "padi" ? "Benih Padi" : "Bibit Ayam"}
                </span>

                <span
                  className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${status.style}`}
                >
                  {status.label}
                </span>
              </div>

              {/* Title & Seed Class */}
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#191c19] leading-snug">
                    {v.name}
                  </h3>
                  {v.seed_class && v.seed_class !== "NONE" && (
                    <span className="rounded bg-[#f8faf4] border border-[#d1ded0] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#191c19]">
                      {v.seed_class}
                    </span>
                  )}
                </div>

                {/* Price Display */}
                <p className="mt-1 font-mono tabular-nums font-extrabold text-sm text-[#1e4f28]">
                  {formatRupiah(v.price_per_unit)}
                  <span className="text-xs font-normal text-[#475447]"> /{v.unit}</span>
                </p>
              </div>

              {/* Description Snippet */}
              <p className="text-xs text-[#475447] leading-relaxed line-clamp-2">
                {v.description || "Varietas unggulan bersertifikasi resmi BRMP Banten."}
              </p>

              {/* Stock Metric Indicator */}
              <div className="rounded-lg bg-[#f8faf4] border border-[#e2e8f0] px-3 py-2 text-xs flex items-center justify-between">
                <span className="text-[#475447]">Sisa Stok:</span>
                <span className="font-mono tabular-nums font-bold text-[#191c19]">
                  {v.total_stock > 0
                    ? `${v.total_stock.toLocaleString("id-ID")} ${v.unit}`
                    : "Hubungi Admin"}
                </span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-4 pt-3 border-t border-[#e2e8f0] flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenDetail(v)}
                className="flex-1 h-10 min-h-[40px] flex items-center justify-center rounded-lg border border-[#d1ded0] px-3 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
              >
                <span>Spesifikasi</span>
              </button>

              {isAskStock ? (
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 h-10 min-h-[40px] flex items-center justify-center rounded-lg bg-[#25D366] px-3 text-xs font-bold text-white shadow-xs hover:bg-[#20ba59] transition-colors"
                >
                  <span>Tanya WA</span>
                </a>
              ) : (
                <Link
                  href={`/ajukan?kategori=BS&varietas=${v.id}`}
                  className="flex-1 h-10 min-h-[40px] flex items-center justify-center rounded-lg bg-[#1e4f28] px-3 text-xs font-bold text-white shadow-xs hover:bg-[#163c1e] transition-colors"
                >
                  <span>Pesan</span>
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
