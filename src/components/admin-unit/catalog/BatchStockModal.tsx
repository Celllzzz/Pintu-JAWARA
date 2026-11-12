"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { VarietyItem } from "./VarietyEditModal";

type BatchItem = VarietyItem["batches"][number];

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

  const [editingBatch, setEditingBatch] = useState<BatchItem | null>(null);
  const [deletingBatch, setDeletingBatch] = useState<BatchItem | null>(null);

  const [batchNumber, setBatchNumber] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!variety) return null;

  function resetForm() {
    setEditingBatch(null);
    setBatchNumber("");
    setStockQuantity("");
    setExpiryDate("");
  }

  function startEdit(batch: BatchItem) {
    setEditingBatch(batch);
    setBatchNumber(batch.batch_number);
    setStockQuantity(String(batch.current_stock));
    setExpiryDate(batch.expiry_date);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!variety) return;

    if (!batchNumber.trim() || stockQuantity === "" || !expiryDate) {
      showToast("Lengkapi seluruh data batch stok.", "warning");
      return;
    }

    const numStock = Number(stockQuantity);

    if (editingBatch) {
      const reserved = Number(editingBatch.reserved_stock);
      if (isNaN(numStock) || numStock < reserved) {
        showToast(
          `Stok fisik tidak boleh kurang dari stok hold (${reserved} ${variety.unit}).`,
          "warning"
        );
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await fetch(
          `/api/admin/unit/catalog/${variety.id}/batches/${editingBatch.id}`,
          {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              batch_number: batchNumber.trim(),
              current_stock: numStock,
              expiry_date: expiryDate,
            }),
          }
        );

        const data = await res.json();
        if (!res.ok) {
          showToast(data.error || "Gagal memperbarui batch stok.", "error");
          return;
        }

        showToast(data.message || "Batch stok berhasil diperbarui.", "success");
        resetForm();
        onSuccess();
      } catch {
        showToast("Gangguan koneksi.", "error");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/unit/catalog/${variety.id}/batches`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batch_number: batchNumber.trim(),
          stock_quantity: numStock,
          expiry_date: expiryDate,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menambah batch stok.", "error");
        return;
      }

      showToast(data.message || "Batch stok berhasil ditambahkan.", "success");
      resetForm();
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (!variety || !deletingBatch) return;

    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/admin/unit/catalog/${variety.id}/batches/${deletingBatch.id}`,
        { method: "DELETE" }
      );
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menghapus batch stok.", "error");
        return;
      }

      showToast(data.message || "Batch stok berhasil dihapus.", "success");
      if (editingBatch?.id === deletingBatch.id) {
        resetForm();
      }
      setDeletingBatch(null);
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsDeleting(false);
    }
  }

  const nowStr = new Date().toISOString().split("T")[0];
  const isEditing = Boolean(editingBatch);

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
        onClick={(e) => {
          if (e.target === e.currentTarget && !isSubmitting && !isDeleting && !deletingBatch) {
            onClose();
          }
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

          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#191c19]">
              Daftar Batch Terdaftar ({variety.batches.length})
            </span>

            {variety.batches.length === 0 ? (
              <p className="text-xs text-[#475447] italic p-3.5 bg-[#f8faf4] rounded-xl border border-[#e2e8f0]">
                Belum ada batch stok untuk varietas ini (Stok: 0).
              </p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {variety.batches.map((b) => {
                  const isExpired = b.expiry_date < nowStr;
                  const net = Math.max(0, Number(b.current_stock) - Number(b.reserved_stock));
                  const hasHold = Number(b.reserved_stock) > 0;
                  const isSelected = editingBatch?.id === b.id;

                  return (
                    <div
                      key={b.id}
                      className={`rounded-lg border p-3 text-xs flex flex-wrap items-center justify-between gap-2 transition-colors ${
                        isSelected
                          ? "border-[#f59e0b] bg-[#fffbeb]"
                          : isExpired
                          ? "border-[#fecaca] bg-[#fef2f2]"
                          : "border-[#e2e8f0] bg-[#f8faf4]"
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="font-mono tabular-nums font-bold text-[#191c19] truncate">
                          {b.batch_number}
                        </p>
                        <p className="text-[11px] text-[#475447]">
                          Kedaluwarsa: {b.expiry_date} {isExpired && "(Expired)"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 ml-auto">
                        <div className="text-right">
                          <span className="font-mono tabular-nums font-bold text-[#1e4f28]">
                            {net} {variety.unit}
                          </span>
                          <p className="text-[10px] text-[#475447]">
                            (Fisik: {b.current_stock} | Hold: {b.reserved_stock})
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => (isSelected ? resetForm() : startEdit(b))}
                            disabled={isSubmitting || isDeleting}
                            className={`h-8 px-2.5 rounded-md border text-[11px] font-semibold disabled:opacity-50 transition-colors ${
                              isSelected
                                ? "border-[#fcd34d] bg-white text-[#92400e] hover:bg-[#fef3c7]"
                                : "border-[#d1ded0] bg-white text-[#191c19] hover:bg-[#f8faf4]"
                            }`}
                          >
                            {isSelected ? "Batal" : "Edit"}
                          </button>
                          <button
                            type="button"
                            disabled={hasHold || isSubmitting || isDeleting}
                            onClick={() => setDeletingBatch(b)}
                            title={
                              hasHold
                                ? "Tidak dapat dihapus selama ada stok hold aktif"
                                : "Hapus batch"
                            }
                            className="h-8 px-2.5 rounded-md border border-[#fecaca] bg-[#fef2f2] text-[11px] font-semibold text-[#991b1b] hover:bg-[#fee2e2] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form
            onSubmit={handleSubmit}
            className={`rounded-xl border p-4 sm:p-5 space-y-3.5 text-xs transition-colors ${
              isEditing
                ? "border-[#fde68a] bg-[#fffbeb]"
                : "border-[#bbf7d0] bg-[#f0fdf4]"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span
                className={`font-bold uppercase text-[10px] tracking-wider ${
                  isEditing ? "text-[#92400e]" : "text-[#1e4f28]"
                }`}
              >
                {isEditing
                  ? `Edit Batch: ${editingBatch?.batch_number}`
                  : "Tambah Stok / Batch Masuk Baru"}
              </span>

              {isEditing && (
                <button
                  type="button"
                  onClick={resetForm}
                  disabled={isSubmitting}
                  className="text-[11px] font-semibold text-[#475447] hover:text-[#191c19] underline"
                >
                  Batal Edit
                </button>
              )}
            </div>

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
                  {isEditing
                    ? `Stok Fisik Saat Ini (${variety.unit})`
                    : `Jumlah Stok Masuk (${variety.unit})`}
                </label>
                <input
                  type="number"
                  min={editingBatch ? Number(editingBatch.reserved_stock) : 1}
                  step="any"
                  required
                  value={stockQuantity}
                  onChange={(e) => setStockQuantity(e.target.value)}
                  placeholder="Contoh: 500"
                  className="w-full h-11 min-h-[44px] rounded-lg border border-[#d1ded0] bg-white px-3.5 font-mono tabular-nums text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
                />
                {editingBatch && Number(editingBatch.reserved_stock) > 0 && (
                  <p className="mt-1 text-[10px] text-[#92400e]">
                    Minimal {editingBatch.reserved_stock} {variety.unit} (sedang hold).
                  </p>
                )}
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
              {isSubmitting
                ? "Menyimpan..."
                : isEditing
                ? "Simpan Perubahan Batch"
                : "Tambah Batch Stok"}
            </button>
          </form>

          <div className="flex justify-end pt-3 border-t border-[#e2e8f0]">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="h-11 min-h-[44px] px-5 rounded-lg border border-[#d1ded0] text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deletingBatch)}
        title="Hapus Batch Stok"
        description={
          deletingBatch
            ? `Apakah Anda yakin ingin menghapus batch ${deletingBatch.batch_number} (Stok fisik: ${deletingBatch.current_stock} ${variety.unit})? Tindakan ini tidak dapat dibatalkan.`
            : ""
        }
        confirmText="Ya, Hapus Batch"
        isDestructive={true}
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onClose={() => {
          if (!isDeleting) setDeletingBatch(null);
        }}
      />
    </>
  );
}
