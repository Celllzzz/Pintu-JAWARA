"use client";

import React, { useState } from "react";
import { CreditCard, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface BillingInfo {
  id: string;
  amount: number;
  bank_name: string;
  account_number: string;
  account_holder: string;
  payment_status: string;
  notes: string | null;
}

interface BillingUploadProps {
  ticketId: string;
  billing: BillingInfo;
  onSuccess: () => void;
}

export function BillingUpload({
  ticketId,
  billing,
  onSuccess,
}: BillingUploadProps) {
  const { showToast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) {
      showToast("Pilih berkas bukti transfer terlebih dahulu.", "warning");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("document_type", "bukti_bayar");
      formData.append("file", file);

      const res = await fetch(`/api/tickets/${ticketId}/documents`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Gagal mengunggah bukti pembayaran.", "error");
        return;
      }

      showToast("Bukti transfer berhasil dikirim. Menunggu verifikasi petugas.", "success");
      setFile(null);
      onSuccess();
    } catch {
      showToast("Gangguan koneksi saat mengunggah bukti bayar.", "error");
    } finally {
      setIsUploading(false);
    }
  }

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const statusConfig: Record<
    string,
    { label: string; style: string; icon: React.ComponentType<{ className?: string }> }
  > = {
    menunggu_pembayaran: {
      label: "Menunggu Pembayaran",
      style: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
      icon: Clock,
    },
    menunggu_verifikasi: {
      label: "Bukti Terkirim (Menunggu Verifikasi)",
      style: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
      icon: Clock,
    },
    lunas: {
      label: "Pembayaran Lunas",
      style: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
      icon: CheckCircle2,
    },
    ditolak: {
      label: "Bukti Ditolak / Tidak Sesuai",
      style: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
      icon: AlertCircle,
    },
  };

  const currentStatus =
    statusConfig[billing.payment_status] || statusConfig.menunggu_pembayaran;
  const StatusIcon = currentStatus.icon;

  const canUpload =
    billing.payment_status === "menunggu_pembayaran" ||
    billing.payment_status === "ditolak";

  return (
    <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 shadow-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#e2e8f0] pb-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-[#f0fdf4] p-1.5 text-[#1e4f28]">
            <CreditCard className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
              LAYANAN BERBAYAR
            </span>
            <h3 className="text-base font-bold text-[#191c19]">Rincian Tagihan &amp; Pembayaran</h3>
          </div>
        </div>

        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${currentStatus.style}`}
        >
          <StatusIcon className="h-3.5 w-3.5" />
          <span>{currentStatus.label}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-[#e2e8f0] bg-[#f8faf4] p-4 text-xs">
        <div>
          <span className="text-[#475447] block">Total Tagihan Biaya Layanan:</span>
          <span className="text-lg font-bold font-mono tabular-nums text-[#1e4f28]">
            {formatRupiah(billing.amount)}
          </span>
          {billing.notes && (
            <p className="mt-1 text-[11px] text-[#475447] italic">
              Keterangan: {billing.notes}
            </p>
          )}
        </div>

        <div className="space-y-1 sm:border-l sm:border-[#e2e8f0] sm:pl-4">
          <span className="text-[#475447] block">Rekening Resmi Penerimaan:</span>
          <p className="font-bold text-[#191c19] text-sm">{billing.bank_name}</p>
          <p className="font-mono tabular-nums font-bold text-sm text-[#191c19]">
            {billing.account_number}
          </p>
          <p className="text-[11px] text-[#475447]">a.n. {billing.account_holder}</p>
        </div>
      </div>

      {canUpload && (
        <form onSubmit={handleSubmit} className="pt-2 space-y-3">
          <div>
            <label
              htmlFor="billing_file"
              className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1"
            >
              Unggah Bukti Transfer (PDF, JPG, PNG maks. 10 MB)
            </label>
            <input
              id="billing_file"
              type="file"
              required
              accept=".pdf,image/jpeg,image/png,image/webp"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="block w-full text-xs text-[#475447] file:mr-3 file:h-10 file:min-h-[40px] file:rounded-lg file:border-0 file:bg-[#1e4f28] file:px-4 file:text-xs file:font-semibold file:text-white file:hover:bg-[#163c1e] cursor-pointer"
            />
            {file && (
              <p className="mt-1 text-[11px] font-medium text-[#1e4f28]">
                {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isUploading || !file}
            className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] disabled:opacity-50 transition-colors"
          >
            <span>{isUploading ? "Mengunggah..." : "Kirim Bukti Transfer"}</span>
          </button>
        </form>
      )}
    </div>
  );
}
