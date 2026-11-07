"use client";

import React, { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface UnitBillingCreateFormProps {
  ticketId: string;
  onSuccess: () => void;
}

export function UnitBillingCreateForm({
  ticketId,
  onSuccess,
}: UnitBillingCreateFormProps) {
  const { showToast } = useToast();

  const [amount, setAmount] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [billingNotes, setBillingNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      showToast("Nominal tagihan harus lebih dari 0.", "warning");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/unit/tickets/${ticketId}/billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Number(amount),
          bank_name: bankName.trim(),
          account_number: accountNumber.trim(),
          account_holder: accountHolder.trim(),
          notes: billingNotes.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal membuat tagihan.", "error");
        return;
      }

      showToast("Rincian tagihan berhasil dikirim ke pemohon.", "success");
      onSuccess();
    } catch {
      showToast("Gangguan koneksi.", "error");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 text-xs">
      <p className="text-[#475447] leading-relaxed">
        Kirimkan rincian tagihan biaya resmi dan nomor rekening penampung kepada pemohon.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1">
            Nominal Tagihan (Rupiah)
          </label>
          <input
            type="number"
            required
            min={1}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Contoh: 300000"
            className="w-full h-10 rounded-lg border border-[#d1ded0] bg-white px-3 font-mono tabular-nums text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1">
            Nama Bank Tujuan
          </label>
          <input
            type="text"
            required
            value={bankName}
            onChange={(e) => setBankName(e.target.value)}
            placeholder="Contoh: Bank Mandiri"
            className="w-full h-10 rounded-lg border border-[#d1ded0] bg-white px-3 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1">
            Nomor Rekening
          </label>
          <input
            type="text"
            required
            value={accountNumber}
            onChange={(e) => setAccountNumber(e.target.value)}
            placeholder="Contoh: 163-00-1234567-8"
            className="w-full h-10 rounded-lg border border-[#d1ded0] bg-white px-3 font-mono tabular-nums text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1">
            Atas Nama Rekening
          </label>
          <input
            type="text"
            required
            value={accountHolder}
            onChange={(e) => setAccountHolder(e.target.value)}
            placeholder="Contoh: BPPTP Banten (BRMP)"
            className="w-full h-10 rounded-lg border border-[#d1ded0] bg-white px-3 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-[10px] font-bold uppercase tracking-wider text-[#191c19] mb-1">
          Catatan Tagihan (Opsional)
        </label>
        <input
          type="text"
          value={billingNotes}
          onChange={(e) => setBillingNotes(e.target.value)}
          placeholder="Contoh: Pembayaran 25 kg Benih Padi SS @ Rp 12.000"
          className="w-full h-10 rounded-lg border border-[#d1ded0] bg-white px-3 text-xs text-[#191c19] focus:border-[#1e4f28] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
      >
        <span>{isSubmitting ? "Mengirim..." : "Kirim Tagihan ke Pemohon"}</span>
      </button>
    </form>
  );
}
