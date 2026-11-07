"use client";

import React from "react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen flex items-center justify-center bg-[#f8faf4] p-4 text-[#191c19] font-sans antialiased">
        <div className="w-full max-w-md rounded-xl border border-[#d1ded0] bg-white p-6 sm:p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-[#991b1b]">Kendala Kritis Sistem</h1>
          <p className="mt-2 text-xs sm:text-sm text-[#475447] leading-relaxed">
            Terjadi kegagalan memuat antarmuka utama. Silakan lakukan pemuatan ulang halaman.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#1e4f28] px-6 text-sm font-bold text-white hover:bg-[#163c1e] transition-colors"
            >
              Muat Ulang Halaman
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
