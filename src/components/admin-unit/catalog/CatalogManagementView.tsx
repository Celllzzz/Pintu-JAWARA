"use client";

import React, { useState, useCallback } from "react";
import { useToast } from "@/components/ui/Toast";
import { VarietyManagementTable } from "./VarietyManagementTable";
import { VarietyEditModal, VarietyItem } from "./VarietyEditModal";
import { BatchStockModal } from "./BatchStockModal";
import { AddVarietyModal } from "./AddVarietyModal";

interface CatalogManagementViewProps {
  initialVarieties: VarietyItem[];
  userCommodity: "padi" | "ayam";
  teamName: string | null;
}

export function CatalogManagementView({
  initialVarieties,
  userCommodity,
  teamName,
}: CatalogManagementViewProps) {
  const { showToast } = useToast();

  const [varieties, setVarieties] = useState<VarietyItem[]>(initialVarieties);
  const [isLoading, setIsLoading] = useState(false);

  // Modals state
  const [editingVarietyId, setEditingVarietyId] = useState<string | null>(null);
  const [batchVarietyId, setBatchVarietyId] = useState<string | null>(null);
  const [isAddOpen, setIsAddOpen] = useState(false);

  const editingVariety = varieties.find((v) => v.id === editingVarietyId) ?? null;
  const batchVariety = varieties.find((v) => v.id === batchVarietyId) ?? null;

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/unit/catalog", { cache: "no-store" });
      const data = await res.json();
      if (res.ok) {
        setVarieties(data.varieties || []);
      }
    } catch {
      showToast("Gagal memuat ulang data katalog.", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  async function handleToggleActive(v: VarietyItem) {
    try {
      const res = await fetch(`/api/admin/unit/catalog/${v.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: !v.is_active }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mengubah status.", "error");
        return;
      }
      showToast(
        !v.is_active
          ? `${v.name} kini tampil di katalog publik.`
          : `${v.name} disembunyikan dari katalog publik.`,
        "success"
      );
      refreshData();
    } catch {
      showToast("Gangguan koneksi.", "error");
    }
  }

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            MANAJEMEN STOK &amp; KATALOG UPBS
          </span>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191c19] mt-0.5">
            {userCommodity === "padi"
              ? "Katalog dan Stok UPBS Padi"
              : "Katalog dan Stok UPBS Ayam"}
          </h1>
          <p className="text-xs text-[#475447]">
            {teamName
              ? `Pengelolaan mandiri unit: ${teamName}`
              : "Kelola status tampil, spesifikasi harga, dan penambahan batch stok masuk."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="h-11 min-h-[44px] px-4 rounded-lg bg-[#1e4f28] text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] self-start sm:self-auto transition-colors"
        >
          Tambah Varietas
        </button>
      </div>

      {/* Management Table */}
      <VarietyManagementTable
        varieties={varieties}
        isLoading={isLoading}
        onEdit={(v) => setEditingVarietyId(v.id)}
        onManageBatches={(v) => setBatchVarietyId(v.id)}
        onToggleActive={handleToggleActive}
      />

      {/* Edit Specifications Modal */}
      <VarietyEditModal
        variety={editingVariety}
        onClose={() => setEditingVarietyId(null)}
        onSuccess={refreshData}
      />

      {/* Manage Batches & Stock Modal */}
      <BatchStockModal
        variety={batchVariety}
        onClose={() => setBatchVarietyId(null)}
        onSuccess={refreshData}
      />

      {/* Add New Variety Modal */}
      <AddVarietyModal
        isOpen={isAddOpen}
        userCommodity={userCommodity}
        onClose={() => setIsAddOpen(false)}
        onSuccess={refreshData}
      />
    </div>
  );
}
