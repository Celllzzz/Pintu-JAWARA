"use client";

import React, { useState } from "react";
import { FileText, Clock } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { BillingData } from "./UnitBillingAction";

interface UnitBillingVerifyCardProps {
  ticketId: string;
  billing: BillingData;
  paymentReceiptDoc?: { id: string; file_name: string } | null;
  onSuccess: () => void;
}

export function UnitBillingVerifyCard({
  ticketId,
  billing,
  paymentReceiptDoc,
  onSuccess,
}: UnitBillingVerifyCardProps) {
  const { showToast } = useToast();
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  async function handleVerifyPayment(action: "confirm" | "reject") {
    setIsProcessing(true);
    try {
      const res = await fetch(`/api/admin/unit/tickets/${ticketId}/billing`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          notes: action === "reject" ? rejectReason.trim() : undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal memproses bukti bayar.", "error");
        return;
      }

      showToast(data.message || "Tindakan berhasil disimpan.", "success");
      setIsRejecting(false);
      setRejectReason("");
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Overview Invoice Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl border border-[#e2e8f0] bg-[#f8faf4] p-3.5">
        <div>
          <span className="text-[#475447] text-[11px]">Total Tagihan:</span>
          <p className="font-mono tabular-nums font-bold text-sm text-[#1e4f28]">
            {formatRupiah(billing.amount)}
          </p>
          {billing.notes && (
            <p className="text-[#475447] text-[11px] mt-0.5 italic">{billing.notes}</p>
          )}
        </div>

        <div className="space-y-0.5 sm:border-l sm:border-[#e2e8f0] sm:pl-3">
          <span className="text-[#475447] text-[11px]">Rekening Tujuan:</span>
          <p className="font-bold text-[#191c19]">{billing.bank_name}</p>
          <p className="font-mono tabular-nums text-[#191c19]">{billing.account_number}</p>
          <p className="text-[11px] text-[#475447]">a.n. {billing.account_holder}</p>
        </div>
      </div>

      {/* Verification Actions when proof submitted */}
      {billing.payment_status === "menunggu_verifikasi" && (
        <div className="rounded-xl border border-[#bfdbfe] bg-[#eff6ff] p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold text-[#1e40af]">
              <Clock className="h-4 w-4" />
              <span>Bukti Transfer Diterima dari Pemohon</span>
            </div>
            {paymentReceiptDoc && (
              <a
                href={`/api/documents/${paymentReceiptDoc.id}/download`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 items-center gap-1 rounded border border-[#bfdbfe] bg-white px-2.5 text-[11px] font-semibold text-[#1e40af] hover:bg-[#eff6ff]"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>Lihat Bukti Bayar</span>
              </a>
            )}
          </div>

          {!isRejecting ? (
            <div className="flex flex-col sm:flex-row gap-2 pt-1">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleVerifyPayment("confirm")}
                className="flex-1 h-10 flex items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
              >
                <span>Konfirmasi Pembayaran Lunas</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => setIsRejecting(true)}
                className="h-10 px-4 flex items-center justify-center rounded-lg border border-[#fecaca] bg-[#fef2f2] text-xs font-semibold text-[#991b1b] hover:bg-[#fee2e2] disabled:opacity-50 transition-colors"
              >
                <span>Tolak Bukti Bayar</span>
              </button>
            </div>
          ) : (
            <div className="rounded-lg bg-white border border-[#fecaca] p-3 space-y-2">
              <label className="block text-[11px] font-bold uppercase text-[#991b1b]">
                Alasan Penolakan Bukti Transfer (Wajib Diisi):
              </label>
              <textarea
                rows={2}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Contoh: Nominal transfer kurang / bukti tidak dapat terbaca."
                className="w-full rounded-lg border border-[#d1ded0] p-2 text-xs text-[#191c19] focus:border-[#991b1b] focus:outline-none"
              />
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsRejecting(false)}
                  className="h-9 px-3 rounded-lg border border-[#d1ded0] text-xs text-[#475447] hover:bg-[#f8faf4]"
                >
                  Batal
                </button>
                <button
                  type="button"
                  disabled={isProcessing || !rejectReason.trim()}
                  onClick={() => handleVerifyPayment("reject")}
                  className="h-9 px-3 rounded-lg bg-[#991b1b] text-xs font-semibold text-white hover:bg-[#7f1d1d] disabled:opacity-50"
                >
                  Tolak &amp; Minta Perbaikan
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
