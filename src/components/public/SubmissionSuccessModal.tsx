"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Check, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

interface SubmissionSuccessModalProps {
  isOpen: boolean;
  ticketNumber: string;
  pinLast4: string;
  applicantName: string;
  onClose: () => void;
}

export function SubmissionSuccessModal({
  isOpen,
  ticketNumber,
  pinLast4,
  applicantName,
  onClose,
}: SubmissionSuccessModalProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(ticketNumber);
      setCopied(true);
      showToast("Nomor e-tiket berhasil disalin ke clipboard.", "success");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("Gagal menyalin nomor tiket.", "error");
    }
  }

  function handleCloseToHome() {
    onClose();
    router.push("/");
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCloseToHome();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 sm:p-8 shadow-xl border border-[#d1ded0] space-y-5 animate-dialog-in">
        {/* Header Icon & Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ecfdf5] text-[#065f46] border border-[#a7f3d0]">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#191c19]">
            Permohonan Berhasil Diajukan!
          </h2>
          <p className="text-xs sm:text-sm text-[#475447]">
            Terima kasih, <strong className="text-[#191c19]">{applicantName}</strong>. Berkas Anda telah tercatat di sistem Pintu JAWARA BRMP Banten.
          </p>
        </div>

        {/* Big Ticket Display */}
        <div className="rounded-xl border border-[#bbf7d0] bg-[#f0fdf4] p-4 text-center space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#1e4f28]">
            NOMOR E-TIKET RESMI ANDA
          </span>
          <div className="flex items-center justify-center gap-2">
            <span className="font-mono tabular-nums text-2xl sm:text-3xl font-extrabold tracking-wider text-[#1e4f28]">
              {ticketNumber}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              aria-label="Salin nomor tiket"
              className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[#bbf7d0] bg-white text-[#1e4f28] hover:bg-[#ecfdf5] transition-colors"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* Critical Notice */}
        <div className="rounded-xl border border-[#fde68a] bg-[#fffbeb] p-3.5 text-xs text-[#92400e] flex items-start gap-2.5 leading-relaxed">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5 text-[#d97706]" />
          <div>
            <strong className="block font-bold">PENTING: Harap Simpan Nomor Tiket Ini</strong>
            <span>
              Simpan nomor e-tiket Anda. Gunakan nomor tiket dan{" "}
              <strong>4 digit terakhir nomor yang Anda gunakan saat pengajuan</strong> ({pinLast4}) untuk melacak progres layanan dan mengunduh berkas hasil permohonan.
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Link
            href={`/lacak?ticket=${ticketNumber}&pin=${pinLast4}`}
            className="flex-1 h-11 min-h-[44px] flex items-center justify-center rounded-lg bg-[#e5a91a] px-4 text-xs sm:text-sm font-bold text-[#191c19] shadow-sm hover:bg-[#c99212] transition-colors"
          >
            Lacak Permohonan Sekarang
          </Link>
          <button
            type="button"
            onClick={handleCloseToHome}
            className="h-11 min-h-[44px] px-5 flex items-center justify-center rounded-lg border border-[#d1ded0] text-xs sm:text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
