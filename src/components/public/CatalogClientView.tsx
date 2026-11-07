"use client";

import React, { useState, useMemo } from "react";
import { CatalogVarietyItem } from "@/lib/services/catalog";
import { CatalogFilter, CommodityFilter } from "./CatalogFilter";
import { CatalogGrid } from "./CatalogGrid";
import { CatalogDetailModal } from "./CatalogDetailModal";

interface CatalogClientViewProps {
  initialVarieties: CatalogVarietyItem[];
}

export function CatalogClientView({ initialVarieties }: CatalogClientViewProps) {
  const [selectedCommodity, setSelectedCommodity] = useState<CommodityFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeModalVariety, setActiveModalVariety] = useState<CatalogVarietyItem | null>(null);

  const filteredVarieties = useMemo(() => {
    return initialVarieties.filter((v) => {
      // Commodity Filter
      if (selectedCommodity !== "all" && v.commodity_type !== selectedCommodity) {
        return false;
      }
      // Search Filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = v.name.toLowerCase().includes(query);
        const matchDesc = (v.description || "").toLowerCase().includes(query);
        const matchCode = v.code.toLowerCase().includes(query);
        return matchName || matchDesc || matchCode;
      }
      return true;
    });
  }, [initialVarieties, selectedCommodity, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Filter and Search Bar */}
      <CatalogFilter
        selectedCommodity={selectedCommodity}
        onSelectCommodity={setSelectedCommodity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Catalog Cards Grid */}
      <CatalogGrid
        varieties={filteredVarieties}
        onOpenDetail={(v) => setActiveModalVariety(v)}
      />

      {/* Detail Specifications Modal */}
      <CatalogDetailModal
        variety={activeModalVariety}
        onClose={() => setActiveModalVariety(null)}
      />
    </div>
  );
}
