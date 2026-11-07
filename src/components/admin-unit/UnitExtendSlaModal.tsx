"use client";

import React, { useState } from "react";
import { Clock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UnitExtendSlaModalProps {
  isOpen: boolean;
  ticketId: string;
  ticketNumber: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitExtendSlaModal({
  isOpen,
  ticketId,
  ticketNumber,
  onClose,
  onSuccess,
}: UnitExtendSlaModalProps) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!reason.trim()) {
      showToast("Alasan perpanjangan SLA wajib diisi.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/unit/tickets/${ticketId}/extend-sla`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal memperpanjang SLA.", "error");
        return;
      }

      showToast("SLA berhasil diperpanjang 7 hari kerja.", "success");
      setReason("");
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
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl border border-[#d1ded0] space-y-4 animate-dialog-in">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-[#eff6ff] border border-[#bfdbfe] p-2 text-[#1e40af]">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#191c19]">
              Perpanjang Waktu SLA (+7 Hari Kerja)
            </h3>
            <p className="text-xs text-[#475447]">
              Khusus Layanan PPID · Tiket <strong className="font-mono tabular-nums">{ticketNumber}</strong>
            </p>
          </div>
        </div>

        <p className="text-xs text-[#475447] leading-relaxed">
          Sesuai regulasi UU Keterbukaan Informasi Publik, PPID dapat memperpanjang waktu penanganan permohonan informasi publik maksimal 7 hari kerja dengan melampirkan alasan resmi.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="extend_reason"
              className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
            >
              Alasan Perpanjangan Waktu (Wajib Diisi)
            </label>
            <textarea
              id="extend_reason"
              required
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Contoh: Dokumen memerlukan penelusuran arsip teknis di unit lain..."
              className="block w-full rounded-lg border border-[#d1ded0] bg-white p-3 text-xs sm:text-sm text-[#191c19] focus:border-[#1e4f28] focus:outline-none leading-relaxed"
            />
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2 border-t border-[#e2e8f0]">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className="h-11 min-h-[44px] px-4 rounded-lg border border-[#d1ded0] text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !reason.trim()}
              className="h-11 min-h-[44px] px-5 rounded-lg bg-[#1e40af] text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#1e3a8a] disabled:opacity-50 transition-colors"
            >
              {isSubmitting ? "Menyimpan..." : "Perpanjang +7 Hari"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
