"use client";

import React from "react";

export function PrintActionButtons() {
  function handlePrint() {
    window.print();
  }

  function handleBack() {
    window.close();
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={handleBack}
        className="flex h-9 min-h-[36px] items-center justify-center rounded-lg border border-[#d1ded0] px-3.5 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
      >
        Tutup / Kembali
      </button>

      <button
        type="button"
        onClick={handlePrint}
        className="flex h-9 min-h-[36px] items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
      >
        Cetak / Simpan PDF
      </button>
    </div>
  );
}
