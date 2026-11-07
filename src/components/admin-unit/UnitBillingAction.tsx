"use client";

import React from "react";
import { CreditCard } from "lucide-react";
import { UnitBillingCreateForm } from "./UnitBillingCreateForm";
import { UnitBillingVerifyCard } from "./UnitBillingVerifyCard";

export interface BillingData {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  payment_status: string;
  notes: string | null;
}

interface UnitBillingActionProps {
  ticketId: string;
  billing: BillingData | null;
  paymentReceiptDoc?: { id: string; file_name: string } | null;
  onSuccess: () => void;
}

export function UnitBillingAction({
  ticketId,
  billing,
  paymentReceiptDoc,
  onSuccess,
}: UnitBillingActionProps) {
  const statusBadgeStyle: Record<string, string> = {
    lunas: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
    menunggu_verifikasi: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
    ditolak: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
    menunggu_pembayaran: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
  };

  const statusLabel: Record<string, string> = {
    lunas: "Lunas",
    menunggu_verifikasi: "Bukti Masuk (Perlu Verifikasi)",
    ditolak: "Ditolak (Perlu Perbaikan)",
    menunggu_pembayaran: "Menunggu Pembayaran",
  };

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-4 shadow-none">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#f0fdf4] p-1.5 text-[#1e4f28]">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
              LAYANAN BERBAYAR (PNBP)
            </span>
            <h4 className="text-sm font-bold text-[#191c19]">
              Manajemen Tagihan &amp; Pembayaran
            </h4>
          </div>
        </div>

        {billing && (
          <span
            className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
              statusBadgeStyle[billing.payment_status] ||
              statusBadgeStyle.menunggu_pembayaran
            }`}
          >
            {statusLabel[billing.payment_status] || "Menunggu Pembayaran"}
          </span>
        )}
      </div>

      {!billing ? (
        <UnitBillingCreateForm ticketId={ticketId} onSuccess={onSuccess} />
      ) : (
        <UnitBillingVerifyCard
          ticketId={ticketId}
          billing={billing}
          paymentReceiptDoc={paymentReceiptDoc}
          onSuccess={onSuccess}
        />
      )}
    </div>
  );
}
