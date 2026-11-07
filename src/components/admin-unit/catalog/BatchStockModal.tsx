"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { VarietyItem } from "./VarietyEditModal";

interface BatchStockModalProps {
  variety: VarietyItem | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function BatchStockModal(props: BatchStockModalProps) {
  if (!props.variety) return null;
  return <BatchStockModalContent key={props.variety.id} {...props} />;
}

function BatchStockModalContent({
  variety,
  onClose,
  onSuccess,
}: BatchStockModalProps) {
  const { showToast } = useToast();

  const [batchNumber, setBatchNumber] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!variety) return null;

  async function handleAddBatch(e: React.FormEvent) {
    e.preventDefault();
    if (!variety) return;
    if (!batchNumber.trim() || !stockQuantity || !expiryDate) {
      showToast("Lengkapi seluruh data batch stok baru.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/unit/catalog/${variety.id}/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_number: batchNumber.trim(),
          stock_quantity: Number(stockQuantity),
          expiry_date: expiryDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menambah batch stok.", "error");
        return;
      }

      showToast(data.message || "Batch stok berhasil ditambahkan.", "success");
      setBatchNumber("");
      setStockQuantity("");
      setExpiryDate("");
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  const nowStr = new Date().toISOString().split("T")[0];

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
            MANAJEMEN BATCH &amp; STOK MASUK
          </span>
          <h3 className="text-base font-bold text-[#191c19] mt-0.5">
            {variety.name}
          </h3>
          <p className="text-xs text-[#475447]">
            Total Stok Bersih:{" "}
            <strong className="font-mono tabular-nums text-[#1e4f28]">
              {variety.net_available_stock.toLocaleString("id-ID")} {variety.unit}
            </strong>
          </p>
        </div>

        {/* Existing Batches List */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#191c19]">
            Daftar Batch Terdaftar ({variety.batches.length})
          </span>

          {variety.batches.length === 0 ? (
            <p className="text-xs text-[#475447] italic p-3.5 bg-[#f8faf4] rounded-xl border border-[#e2e8f0]">
              Belum ada batch stok untuk varietas ini (Stok: 0).
            </p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {variety.batches.map((b) => {
                const isExpired = b.expiry_date < nowStr;
                const net = Math.max(0, Number(b.current_stock) - Number(b.reserved_stock));
                return (
                  <div
                    key={b.id}
                    className={`rounded-lg border p-3 text-xs flex items-center justify-between ${
                      isExpired ? "border-[#fecaca] bg-[#fef2f2]" : "border-[#e2e8f0] bg-[#f8faf4]"
                    }`}
                  >
                    <div>
                      <p className="font-mono tabular-nums font-bold text-[#191c19]">
                        {b.batch_number}
                      </p>
                      <p className="text-[11px] text-[#475447]">
                        Kedaluwarsa: {b.expiry_date} {isExpired && "(Expired)"}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-mono tabular-nums font-bold text-[#1e4f28]">
                        {net} {variety.unit}
                      </span>
                      <p className="text-[10px] text-[#475447]">
                        (Fisik: {b.current_stock} | Hold: {b.reserved_stock})
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Add New Batch Form */}
        <form onSubmit={handleAddBatch} className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 sm:p-5 space-y-3.5 text-xs">
          <span className="font-bold text-[#1e4f28] uppercase text-[10px] block tracking-wider">
            Tambah Stok / Batch Masuk Baru
          </span>

          <div>
            <label className="block text-[10px] font-bold uppercase text-[#191c19] mb-1.5">
              Nomor Batch
            </label>
            <input
              type="text"
              required
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
              placeholder="Contoh: B-CKB-2026-03"
              className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[10px] font-bold uppercase text-[#191c19] mb-1.5">
                Jumlah Stok Masuk ({variety.unit})
              </label>
              <input
                type="number"
                min={1}
                required
                value={stockQuantity}
                onChange={(e) => setStockQuantity(e.target.value)}
                placeholder="Contoh: 500"
                className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#191c19] mb-1.5">
                Tanggal Kedaluwarsa
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-11 min-h-[44px] w-full rounded-lg bg-[#1e4f28] text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? "Menyimpan..." : "Tambah Batch Stok"}
          </button>
        </form>

        <div className="flex justify-end pt-3 border-t border-[#e2e8f0]">
          <button
            type="button"
            onClick={onClose}
            className="h-11 min-h-[44px] px-5 rounded-lg border border-[#d1ded0] text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
