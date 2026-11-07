"use client";

import React from "react";
import { VarietyItem } from "./VarietyEditModal";
import { DataTable, Column } from "@/components/ui/DataTable";

interface VarietyManagementTableProps {
  varieties: VarietyItem[];
  isLoading: boolean;
  onEdit: (variety: VarietyItem) => void;
  onManageBatches: (variety: VarietyItem) => void;
  onToggleActive: (variety: VarietyItem) => void;
}

export function VarietyManagementTable({
  varieties,
  isLoading,
  onEdit,
  onManageBatches,
  onToggleActive,
}: VarietyManagementTableProps) {
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const columns: Column<VarietyItem>[] = [
    {
      key: "name",
      header: "Nama Varietas & Kode",
      render: (v) => (
        <div>
          <p className="font-bold text-[#191c19]">{v.name}</p>
          <p className="text-[11px] font-mono tabular-nums text-[#475447]">{v.code}</p>
        </div>
      ),
    },
    {
      key: "commodity_type",
      header: "Komoditas & Kelas",
      render: (v) => (
        <div>
          <span className="font-semibold text-[#191c19]">
            {v.commodity_type === "padi" ? "Benih Padi" : "Bibit Ayam"}
          </span>
          {v.seed_class && v.seed_class !== "NONE" && (
            <span className="ml-1.5 rounded bg-[#f8faf4] border border-[#d1ded0] px-1.5 py-0.2 text-[10px] font-mono font-bold text-[#191c19]">
              {v.seed_class}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "price_per_unit",
      header: "Harga Satuan",
      align: "right",
      render: (v) => (
        <span className="font-mono tabular-nums font-bold text-[#1e4f28]">
          {formatRupiah(v.price_per_unit)}
          <span className="text-[10px] font-normal text-[#475447]">/{v.unit}</span>
        </span>
      ),
    },
    {
      key: "net_available_stock",
      header: "Sisa Stok Bersih",
      align: "right",
      render: (v) => (
        <div className="text-right">
          <span className="font-mono tabular-nums font-bold text-xs text-[#191c19]">
            {v.net_available_stock.toLocaleString("id-ID")} {v.unit}
          </span>
          {v.total_reserved_stock > 0 && (
            <p className="text-[10px] text-[#92400e]">
              (Hold: {v.total_reserved_stock} {v.unit})
            </p>
          )}
        </div>
      ),
    },
    {
      key: "is_active",
      header: "Katalog Publik",
      align: "center",
      render: (v) => (
        <button
          type="button"
          onClick={() => onToggleActive(v)}
          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
            v.is_active
              ? "bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0] hover:bg-[#d1fae5]"
              : "bg-[#fef2f2] text-[#991b1b] border border-[#fecaca] hover:bg-[#fee2e2]"
          }`}
          title="Klik untuk ubah visibilitas katalog"
        >
          {v.is_active ? "Tampil di Katalog" : "Disembunyikan"}
        </button>
      ),
    },
    {
      key: "actions",
      header: "Aksi",
      align: "right",
      render: (v) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <button
            type="button"
            onClick={() => onManageBatches(v)}
            className="h-9 min-h-[36px] px-3.5 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] text-xs font-semibold text-[#1e4f28] hover:bg-[#dcfce7] transition-colors whitespace-nowrap inline-flex items-center justify-center"
          >
            Kelola Stok ({v.batches.length} Batch)
          </button>
          <button
            type="button"
            onClick={() => onEdit(v)}
            className="h-9 min-h-[36px] px-3.5 rounded-lg border border-[#d1ded0] bg-white text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors whitespace-nowrap inline-flex items-center justify-center"
          >
            Spesifikasi
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      title="Daftar Varietas &amp; Ketersediaan Stok Unit"
      totalLabel={
        <span>
          Total Varietas:{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">
            {varieties.length}
          </strong>
        </span>
      }
      data={varieties}
      columns={columns}
      keyExtractor={(v) => v.id}
      isLoading={isLoading}
      searchPlaceholder="Cari nama varietas, kode..."
      emptyMessage="Belum ada data varietas terdaftar."
      renderMobileCard={(v, idx) => (
        <div className="space-y-2">
          <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
            <span className="text-[10px] font-bold text-[#52792b] uppercase">
              No. #{idx + 1} · {v.commodity_type === "padi" ? "Benih Padi" : "Bibit Ayam"}
            </span>
            <button
              type="button"
              onClick={() => onToggleActive(v)}
              className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                v.is_active ? "bg-[#ecfdf5] text-[#065f46]" : "bg-[#fef2f2] text-[#991b1b]"
              }`}
            >
              {v.is_active ? "Tampil" : "Sembunyi"}
            </button>
          </div>

          <div>
            <p className="font-bold text-[#191c19]">{v.name}</p>
            <p className="font-mono tabular-nums text-[11px] text-[#475447]">{v.code}</p>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#475447]">Harga:</span>
            <span className="font-mono tabular-nums font-bold text-[#1e4f28]">
              {formatRupiah(v.price_per_unit)}/{v.unit}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-[#475447]">Sisa Stok:</span>
            <span className="font-mono tabular-nums font-bold text-[#191c19]">
              {v.net_available_stock.toLocaleString("id-ID")} {v.unit}
            </span>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={() => onManageBatches(v)}
              className="flex-1 h-9 rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] text-xs font-semibold text-[#1e4f28]"
            >
              Batch Stok ({v.batches.length})
            </button>
            <button
              type="button"
              onClick={() => onEdit(v)}
              className="flex-1 h-9 rounded-lg border border-[#d1ded0] bg-white text-xs font-semibold text-[#191c19]"
            >
              Edit
            </button>
          </div>
        </div>
      )}
    />
  );
}
