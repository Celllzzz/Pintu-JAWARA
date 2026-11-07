"use client";

import React from "react";
import { Search } from "lucide-react";

export type CommodityFilter = "all" | "padi" | "ayam";

interface CatalogFilterProps {
  selectedCommodity: CommodityFilter;
  onSelectCommodity: (c: CommodityFilter) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export function CatalogFilter({
  selectedCommodity,
  onSelectCommodity,
  searchQuery,
  onSearchChange,
}: CatalogFilterProps) {
  const tabs: Array<{ id: CommodityFilter; label: string }> = [
    { id: "all", label: "Semua Komoditas" },
    { id: "padi", label: "Benih Padi" },
    { id: "ayam", label: "Bibit Ayam" },
  ];

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-[#e2e8f0] pb-4">
      {/* Commodity Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
        {tabs.map((tab) => {
          const isActive = selectedCommodity === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectCommodity(tab.id)}
              className={`h-10 min-h-[40px] px-4 rounded-lg text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                isActive
                  ? "bg-[#1e4f28] text-white shadow-xs"
                  : "bg-white border border-[#d1ded0] text-[#191c19] hover:bg-[#f8faf4]"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search Input */}
      <div className="relative w-full sm:w-64">
        <Search className="h-4 w-4 text-[#475447] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Cari nama varietas..."
          className="w-full h-10 min-h-[40px] rounded-lg border border-[#d1ded0] bg-white pl-9 pr-3 text-xs sm:text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
        />
      </div>
    </div>
  );
}
