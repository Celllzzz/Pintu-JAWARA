"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log sanitized error message in production
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#f8faf4] px-4 py-8 sm:px-6">
      <div className="w-full max-w-md rounded-xl border border-[#d1ded0] bg-white p-6 sm:p-8 shadow-sm text-center">
        <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#fef2f2] text-[#991b1b] mb-4">
          <AlertTriangle className="h-6 w-6" aria-hidden="true" />
        </div>

        <h1 className="text-lg sm:text-xl font-extrabold text-[#191c19] text-balance">
          Terjadi Gangguan pada Sistem
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-[#475447] leading-relaxed text-pretty">
          Permintaan Anda tidak dapat diproses saat ini. Tim teknis BRMP Banten telah menerima catatan kendala ini.
        </p>

        {error.digest && (
          <p className="mt-3 inline-block rounded bg-[#f1f5f9] px-2.5 py-1 text-[11px] font-mono tabular-nums text-[#475447]">
            Kode Insiden: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={() => reset()}
            className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg bg-[#1e4f28] px-5 text-xs sm:text-sm font-bold text-white hover:bg-[#163c1e] transition-colors"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            <span>Coba Lagi</span>
          </button>

          <Link
            href="/"
            className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#d1ded0] bg-white px-5 text-xs sm:text-sm font-bold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
          >
            <Home className="h-4 w-4 text-[#475447]" aria-hidden="true" />
            <span>Ke Beranda</span>
          </Link>
        </div>

        <div className="mt-6 pt-4 border-t border-[#e2e8f0]">
          <p className="text-[11px] text-[#475447]">
            Jika kendala berlanjut, hubungi layanan bantuan BRMP Banten di{" "}
            <a
              href="https://wa.me/6285111216203"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-[#1e4f28] hover:underline"
            >
              0851-1121-6203
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
