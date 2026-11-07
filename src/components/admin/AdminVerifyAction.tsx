"use client";

import React, { useState } from "react";
import { Sprout } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface AdminVerifyActionProps {
  ticket: {
    id: string;
    ticket_number: string;
    variety_id: string | null;
    requested_quantity: number | null;
    varieties?: {
      name: string;
      commodity_type: string;
      unit: string;
    } | null;
  };
  onSuccess: () => void;
  onOpenReviseModal: () => void;
}

export function AdminVerifyAction({
  ticket,
  onSuccess,
  onOpenReviseModal,
}: AdminVerifyActionProps) {
  const { showToast } = useToast();
  const [isVerifying, setIsVerifying] = useState(false);

  const isUPBS = Boolean(ticket.variety_id && ticket.requested_quantity);
  const varietyInfo = ticket.varieties;

  async function handleVerify() {
    setIsVerifying(true);
    try {
      const res = await fetch(`/api/admin/tickets/${ticket.id}/verify`, {
        method: "POST",
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal memverifikasi berkas.", "error");
        return;
      }

      showToast(
        data.holdResult?.warning
          ? `Berkas diverifikasi. Catatan stok: ${data.holdResult.warning}`
          : "Berkas berhasil diverifikasi lengkap.",
        "success"
      );
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsVerifying(false);
    }
  }

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-4 shadow-none">
      <div className="border-b border-[#e2e8f0] pb-3">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
          TINDAKAN VERIFIKATOR (ADMIN)
        </span>
        <h4 className="text-sm font-bold text-[#191c19]">
          Verifikasi Kelengkapan Berkas Administrasi
        </h4>
      </div>

      {/* Notice for UPBS Hold Stock (Padi & Ayam) */}
      {isUPBS && varietyInfo && (
        <div className="rounded-lg border border-[#bbf7d0] bg-[#f0fdf4] p-3 text-xs text-[#1e4f28] space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <Sprout className="h-4 w-4" />
            <span>Alokasi Penahanan Stok UPBS ({varietyInfo.commodity_type === "padi" ? "Benih Padi" : "Bibit Ayam"})</span>
          </div>
          <p className="text-[#475447] leading-relaxed">
            Permohonan mencakup <strong>{ticket.requested_quantity} {varietyInfo.unit}</strong> varietas <strong>{varietyInfo.name}</strong>. Menekan tombol verifikasi di bawah akan otomatis menahan stok (<strong>hold stock</strong>) dari batch terdekat.
          </p>
        </div>
      )}

      <p className="text-xs text-[#475447] leading-relaxed">
        Pastikan seluruh dokumen persyaratan (KTP, formulir permohonan, atau surat pengantar) telah diperiksa keabsahannya sebelum melanjutkan ke tahap disposisi.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
        <button
          type="button"
          disabled={isVerifying}
          onClick={handleVerify}
          className="flex-1 h-11 min-h-[44px] flex items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
        >
          <span>{isVerifying ? "Memverifikasi..." : "Berkas Lengkap & Valid"}</span>
        </button>

        <button
          type="button"
          disabled={isVerifying}
          onClick={onOpenReviseModal}
          className="h-11 min-h-[44px] px-4 flex items-center justify-center rounded-lg border border-[#fde68a] bg-[#fffbeb] text-xs sm:text-sm font-semibold text-[#92400e] hover:bg-[#fef3c7] disabled:opacity-50 transition-colors"
        >
          <span>Minta Perbaikan Berkas</span>
        </button>
      </div>
    </div>
  );
}
