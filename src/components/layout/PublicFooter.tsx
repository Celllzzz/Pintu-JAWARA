import React from "react";
import Image from "next/image";
import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="bg-[#1e4f28] text-white pt-12 pb-8 border-t border-[#52792b]">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
          {/* Kolom 1: Profil & Identitas Lembaga */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-white p-1.5 shrink-0">
                <Image
                  src="/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg"
                  alt="Logo BRMP Banten"
                  width={36}
                  height={36}
                  className="h-9 w-auto object-contain"
                />
              </div>
              <div>
                <h3 className="text-base font-bold uppercase tracking-tight text-white leading-tight">
                  PINTU JAWARA
                </h3>
                <p className="text-xs font-semibold text-[#e5a91a]">BRMP Banten</p>
              </div>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Pusat Informasi Terpadu satu pintu BRMP Banten.
              Mendukung Zona Integritas dan pelayanan prima terstandar SLA.
            </p>
            <div className="pt-1">
              <a
                href="https://banten.brmp.pertanian.go.id/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#e5a91a] hover:underline"
              >
                <span>banten.brmp.pertanian.go.id</span>
                <span>↗</span>
              </a>
            </div>
          </div>

          {/* Kolom 2: Jam Pelayanan & Maklumat */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a91a]">
              Jam Pelayanan Publik
            </h4>
            <div className="space-y-1.5 text-xs text-white/80 leading-relaxed font-mono tabular-nums">
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="font-sans font-medium text-white">Senin – Kamis</span>
                <span>07.30 – 16.00 WIB</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="font-sans font-medium text-white">Jumat</span>
                <span>07.30 – 16.30 WIB</span>
              </div>
              <div className="flex justify-between items-center py-0.5 border-b border-white/10">
                <span className="font-sans font-medium text-white/60">Sabtu</span>
                <span className="font-sans text-[#fca5a5]">Tutup</span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <span className="font-sans font-medium text-white/60">Minggu</span>
                <span className="font-sans text-[#fca5a5]">Tutup</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/10">
              <h5 className="text-[11px] font-bold text-[#e5a91a]">Tautan Cepat</h5>
              <div className="mt-1.5 flex flex-wrap gap-2 text-xs text-white/80">
                <Link href="/katalog" className="hover:text-white underline">
                  Katalog UPBS
                </Link>
                <span>·</span>
                <Link href="/lacak" className="hover:text-white underline">
                  Lacak Tiket
                </Link>
              </div>
            </div>
          </div>

          {/* Kolom 3: Kontak Resmi */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a91a]">
              Kontak Resmi
            </h4>
            <ul className="space-y-2 text-xs text-white/80">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">Telepon:</span>
                <span>(0254) 281055</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">WhatsApp:</span>
                <a
                  href="https://wa.me/6285111216203"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#e5a91a] hover:underline font-mono tabular-nums"
                >
                  0851-1121-6203
                </a>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">Fax:</span>
                <span>(0254) 282507</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-white shrink-0">Email:</span>
                <a
                  href="mailto:brmp.banten@pertanian.go.id"
                  className="hover:underline text-white/90"
                >
                  brmp.banten@pertanian.go.id
                </a>
              </li>
              <li className="pt-1 text-[11px] leading-relaxed text-white/70">
                Jl. Ciptayasa KM 01, Ciruas, Kabupaten Serang, Provinsi Banten 42182, Indonesia
              </li>
            </ul>
          </div>

          {/* Kolom 4: Lokasi Maps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#e5a91a]">
                Peta Lokasi Kantor
              </h4>
              <a
                href="https://maps.app.goo.gl/DM76RLjA2vBAFGau8"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-semibold text-[#e5a91a] hover:underline inline-flex items-center gap-1"
              >
                <span>Buka Peta</span>
                <span>↗</span>
              </a>
            </div>
            <div className="overflow-hidden rounded-lg border border-[#52792b] bg-white/5 h-44 w-full">
              <iframe
                title="Peta Lokasi BRMP Banten"
                src="https://www.google.com/maps?q=-6.1189974,106.2391532&hl=id&z=16&output=embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <p className="text-[10px] text-white/60">
              Kec. Ciruas, Kabupaten Serang, Banten
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-white/70 gap-3">
          <p>
            © 2026 BRMP Banten. Hak Cipta Dilindungi Undang-Undang.
          </p>
          <div className="flex items-center gap-4 text-white/80">
            <span>Zona Integritas WBK / WBBM</span>
            <span>·</span>
            <Link href="/login" className="hover:text-white underline">
              Portal Petugas
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
