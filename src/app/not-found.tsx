import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Search, Sprout } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#f8faf4] px-4 py-8 sm:px-6 lg:px-8">
      {/* Top Header */}
      <div className="mx-auto w-full max-w-4xl flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#1e4f28] hover:text-[#163c1e] hover:underline min-h-[44px] py-2 px-1 focus-visible:outline-2 focus-visible:outline-[#1e4f28]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          <span>Kembali ke Beranda</span>
        </Link>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#475447]">
          Pintu JAWARA
        </span>
      </div>

      {/* Main Content Card */}
      <div className="mx-auto w-full max-w-lg my-auto py-8">
        <div className="rounded-xl border border-[#d1ded0] bg-white p-6 sm:p-10 shadow-sm text-center">
          <div className="mx-auto inline-flex items-center justify-center p-3 rounded-2xl bg-[#f0fdf4] border border-[#d1ded0] mb-6">
            <Image
              src="/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg"
              alt="Logo Kementerian Pertanian"
              width={48}
              height={48}
              className="h-12 w-auto object-contain"
            />
          </div>

          <div className="inline-block rounded-full bg-[#fef2f2] border border-[#fecaca] px-3 py-1 text-[11px] font-bold font-mono tabular-nums uppercase tracking-wider text-[#991b1b] mb-4">
            Galat 404 · Halaman Tidak Ditemukan
          </div>

          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#191c19] text-balance">
            Halaman yang Anda tuju tidak tersedia
          </h1>

          <p className="mt-3 text-xs sm:text-sm text-[#475447] leading-relaxed text-pretty max-w-md mx-auto">
            Alamat web mungkin telah berubah, berkas telah dipindahkan, atau nomor e-tiket salah ketik. Silakan periksa kembali tautan Anda.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/"
              className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center rounded-lg bg-[#1e4f28] px-6 text-xs sm:text-sm font-bold text-white shadow-sm hover:bg-[#163c1e] transition-colors"
            >
              Kembali ke Beranda
            </Link>

            <Link
              href="/lacak"
              className="flex h-11 min-h-[44px] w-full sm:w-auto items-center justify-center gap-2 rounded-lg border border-[#d1ded0] bg-white px-5 text-xs sm:text-sm font-bold text-[#191c19] hover:bg-[#f8faf4] transition-colors"
            >
              <Search className="h-4 w-4 text-[#475447]" aria-hidden="true" />
              <span>Lacak Tiket</span>
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-[#e2e8f0]">
            <p className="text-xs text-[#475447]">
              Mencari bibit atau benih unggul?{" "}
              <Link
                href="/katalog"
                className="font-bold text-[#1e4f28] hover:underline inline-flex items-center gap-1"
              >
                <Sprout className="h-3.5 w-3.5 inline" aria-hidden="true" />
                <span>Lihat Katalog UPBS</span>
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto w-full max-w-md pt-4 pb-2 text-center text-xs text-[#475447]">
        <p>© 2026 BRMP Banten · Pusat Informasi Terpadu</p>
      </footer>
    </div>
  );
}
