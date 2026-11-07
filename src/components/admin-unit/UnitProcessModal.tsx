"use client";

import React, { useState } from "react";
import { Play } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UnitProcessModalProps {
  isOpen: boolean;
  ticketId: string;
  ticketNumber: string;
  isResuming?: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitProcessModal({
  isOpen,
  ticketId,
  ticketNumber,
  isResuming = false,
  onClose,
  onSuccess,
}: UnitProcessModalProps) {
  const { showToast } = useToast();
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/admin/unit/tickets/${ticketId}/process`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: notes.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal memproses tiket.", "error");
        return;
      }

      showToast(
        isResuming
          ? "Penanganan layanan dilanjutkan (SLA aktif)."
          : "Layanan mulai diproses. Argo SLA hari kerja aktif.",
        "success"
      );
      setNotes("");
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
          <div className="rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] p-2 text-[#1e4f28]">
            <Play className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#191c19]">
              {isResuming ? "Lanjutkan Proses Layanan" : "Mulai Pemrosesan Layanan"}
            </h3>
            <p className="text-xs text-[#475447]">
              Tiket <strong className="font-mono tabular-nums">{ticketNumber}</strong>
            </p>
          </div>
        </div>

        <p className="text-xs text-[#475447] leading-relaxed">
          {isResuming
            ? "Layanan akan dialihkan kembali ke status Diproses dan durasi jeda SLA dihentikan."
            : "Memulai proses layanan akan mengaktifkan argo perhitungan standar waktu penyelesaian (SLA hari kerja)."}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="process_notes"
              className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
            >
              Catatan / Pesan Penanganan (Opsional)
            </label>
            <textarea
              id="process_notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Sampel telah diterima di laboratorium / Berkas telah diverifikasi teknis."
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
              disabled={isSubmitting}
              className="h-11 min-h-[44px] px-5 rounded-lg bg-[#1e4f28] text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
            >
              {isSubmitting
                ? "Memproses..."
                : isResuming
                ? "Lanjutkan Proses"
                : "Mulai Proses"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
