import React from "react";
import Link from "next/link";

export function HeroSection() {
  return (
    <section className="rounded-2xl bg-[#1e4f28] p-6 sm:p-10 text-white shadow-sm">
      <div className="max-w-3xl space-y-4">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white text-balance leading-tight">
            Pintu JAWARA - Pusat Informasi Terpadu
          </h1>
        <p className="text-sm sm:text-base text-white/85 leading-relaxed text-pretty">
          Akses terpadu satu pintu untuk 8 layanan resmi BRMP Banten: Penyediaan Benih &amp; Bibit Sumber (UPBS),
          Informasi Publik (PPID), Magang/PKL, Kunjungan Edukasi, Pengujian Laboratorium Mutu &amp; Tanah,
          Konsultasi Teknologi Modernisasi, Pengaduan Masyarakat, serta Pelatihan &amp; Bimtek.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Link
            href="/lacak"
            className="flex h-11 min-h-[44px] items-center justify-center rounded-lg bg-[#e5a91a] px-5 text-sm font-bold text-[#191c19] shadow-sm hover:bg-[#c99212] transition-colors"
          >
            Lacak Permohonan
          </Link>
          <Link
            href="/katalog"
            className="flex h-11 min-h-[44px] items-center justify-center rounded-lg border border-white/30 bg-white/10 px-5 text-sm font-semibold text-white hover:bg-white/20 transition-colors"
          >
            Lihat Katalog Benih UPBS
          </Link>
        </div>
      </div>
    </section>
  );
}
