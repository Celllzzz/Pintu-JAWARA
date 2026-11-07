import React from "react";
import Link from "next/link";
import { WifiOff, Search, RotateCcw } from "lucide-react";

export default function OfflineFallbackPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#f8faf4] p-4 text-[#191c19]">
      <div className="w-full max-w-md rounded-2xl border border-[#d1ded0] bg-white p-6 sm:p-8 text-center space-y-5 shadow-xs">
        <div className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#fffbeb] border border-[#fde68a] text-[#92400e] mx-auto">
          <WifiOff className="h-7 w-7 text-[#d97706]" />
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b]">
            KONEKSI TERPUTUS
          </span>
          <h1 className="text-xl font-bold tracking-tight text-[#191c19]">
            Anda Sedang Offline
          </h1>
          <p className="text-xs text-[#475447] leading-relaxed">
            Halaman ini belum tersimpan di memori perangkat Anda. Pastikan koneksi data atau Wi-Fi Anda aktif untuk memuat halaman baru.
          </p>
        </div>

        <div className="rounded-xl border border-[#e2e8f0] bg-[#f8faf4] p-3.5 text-xs text-[#475447] text-left space-y-1">
          <p className="font-bold text-[#191c19]">Fitur yang Tetap Berfungsi Offline:</p>
          <ul className="list-disc list-inside space-y-0.5 text-[11px]">
            <li>Pelacakan tiket yang pernah Anda buka sebelumnya.</li>
            <li>Pemeriksaan riwayat SLA dan rincian permohonan tersimpan.</li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
          <Link
            href="/lacak"
            className="flex-1 h-11 min-h-[44px] flex items-center justify-center gap-2 rounded-lg bg-[#1e4f28] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
          >
            <Search className="h-4 w-4" />
            <span>Buka Pelacakan Tiket</span>
          </Link>

          <Link
            href="/"
            className="h-11 min-h-[44px] px-4 flex items-center justify-center gap-1.5 rounded-lg border border-[#d1ded0] bg-white text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Coba Lagi</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
