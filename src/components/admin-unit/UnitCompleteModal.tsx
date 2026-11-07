"use client";

import React, { useState } from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface UnitCompleteModalProps {
  isOpen: boolean;
  ticketId: string;
  ticketNumber: string;
  varietyName?: string | null;
  quantity?: number | null;
  unit?: string | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function UnitCompleteModal({
  isOpen,
  ticketId,
  ticketNumber,
  varietyName,
  quantity,
  unit,
  onClose,
  onSuccess,
}: UnitCompleteModalProps) {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file && !notes.trim()) {
      showToast(
        "Isi minimal salah satu: Dokumen Hasil Layanan atau Catatan Informasi/Klarifikasi.",
        "warning"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (file) formData.append("file", file);
      if (notes.trim()) formData.append("notes", notes.trim());

      const res = await fetch(`/api/admin/unit/tickets/${ticketId}/complete`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal menyelesaikan layanan.", "error");
        return;
      }

      showToast(
        data.deductResult?.warning
          ? `Layanan selesai. Catatan stok: ${data.deductResult.warning}`
          : "Permohonan layanan berhasil diselesaikan.",
        "success"
      );
      setFile(null);
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
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-[#d1ded0] space-y-4 animate-dialog-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-start gap-3 border-b border-[#e2e8f0] pb-3">
          <div className="rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] p-2 text-[#1e4f28]">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#191c19]">
              Selesaikan Penanganan Layanan
            </h3>
            <p className="text-xs text-[#475447]">
              Tiket <strong className="font-mono tabular-nums">{ticketNumber}</strong>
            </p>
          </div>
        </div>

        {varietyName && quantity && (
          <div className="rounded-lg bg-[#f0fdf4] border border-[#bbf7d0] p-3 text-xs text-[#1e4f28]">
            Menyelesaikan tiket ini akan otomatis memotong stok fisik permanen sebesar{" "}
            <strong>
              {quantity} {unit || "unit"}
            </strong>{" "}
            varietas <strong>{varietyName}</strong> dari batch stok terdekat.
          </div>
        )}

        <p className="text-xs text-[#475447] leading-relaxed">
          Lampirkan dokumen hasil layanan dan/atau isi catatan informasi/klarifikasi. Anda dapat mengisi keduanya atau salah satu saja.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Input 1: Document File */}
          <div>
            <label
              htmlFor="comp_file"
              className="block font-bold uppercase tracking-wider text-[#191c19] mb-1"
            >
              1. Dokumen Hasil Layanan (PDF / Word, maks. 10 MB)
            </label>
            <input
              id="comp_file"
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-[#475447] file:mr-3 file:h-10 file:min-h-[40px] file:rounded-lg file:border-0 file:bg-[#1e4f28] file:px-4 file:text-xs file:font-semibold file:text-white file:hover:bg-[#163c1e] cursor-pointer"
            />
            {file && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-[#1e4f28]">
                <FileText className="h-3.5 w-3.5" />
                <span>{file.name}</span>
              </p>
            )}
          </div>

          {/* Input 2: Notes / Clarification / Apology */}
          <div>
            <label
              htmlFor="comp_notes"
              className="block font-bold uppercase tracking-wider text-[#191c19] mb-1"
            >
              2. Catatan Informasi / Klarifikasi / Permohonan Maaf
            </label>
            <textarea
              id="comp_notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Isi catatan informasi penyelesaian atau permohonan maaf dan klarifikasi jika layanan tidak dapat dipenuhi..."
              className="block w-full rounded-lg border border-[#d1ded0] bg-white p-2.5 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none leading-relaxed"
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
              {isSubmitting ? "Menyelesaikan..." : "Selesaikan Layanan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
