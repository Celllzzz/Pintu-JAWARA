import React from "react";
import { getActiveVarieties } from "@/lib/services/catalog";
import { CatalogClientView } from "@/components/public/CatalogClientView";

export const revalidate = 60;

export default async function KatalogPage() {
  const varieties = await getActiveVarieties();

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-6">
      {/* Title & Info Header */}
      <div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b] block">
          UNIT PENGELOLA BENIH SUMBER (UPBS)
        </span>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#191c19] mt-1">
          Katalog Benih Padi &amp; Bibit Ayam
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-[#475447] leading-relaxed max-w-3xl">
          Daftar varietas benih padi bersertifikat resmi kelas Benih Dasar (FS) dan Benih Pokok (SS), serta bibit ayam unggulan. Ketersediaan stok diperbarui secara berkala.
        </p>
      </div>

      {/* Interactive Catalog View */}
      <CatalogClientView initialVarieties={varieties} />
    </main>
  );
}
