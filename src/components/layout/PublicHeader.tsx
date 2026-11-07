"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MobileNavDrawer } from "./MobileNavDrawer";

export function PublicHeader() {
  const pathname = usePathname();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/katalog", label: "Katalog UPBS" },
    { href: "/lacak", label: "Lacak Permohonan" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full shadow-xs">
        {/* Tier 1: Top Utility Bar */}
        <div className="bg-[#52792b] text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-1.5 text-[11px] sm:text-xs sm:px-6">
            <div className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-[#e5a91a]" />
              <span className="font-medium tracking-tight">
                BRMP Banten · Pusat Informasi Terpadu
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-white/90">
              <span>Senin–Kamis 07.30–16.00 · Jumat 07.30–16.30 WIB</span>
              <span>·</span>
              <a
                href="https://wa.me/6285111216203"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white font-semibold flex items-center gap-1"
              >
                <span>WA: 0851-1121-6203</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tier 2: Main Navigation Bar */}
        <div className="border-b border-[#d1ded0] bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
            {/* Logo & Brand Identity */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg"
                alt="Logo BRMP Banten"
                width={42}
                height={42}
                className="h-10 sm:h-11 w-auto object-contain transition-transform group-hover:scale-102"
                priority
              />
              <div className="flex flex-col">
                <span className="text-base sm:text-lg font-black uppercase tracking-tight text-[#191c19] leading-tight">
                  PINTU JAWARA
                </span>
                <span className="text-xs font-black text-[#1e4f28] tracking-wide">
                  BRMP Banten
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`h-10 min-h-[40px] px-3.5 rounded-lg flex items-center text-xs sm:text-sm font-semibold transition-colors ${
                      isActive
                        ? "bg-[#f0fdf4] text-[#1e4f28] border border-[#bbf7d0]"
                        : "text-[#191c19] hover:bg-[#f8faf4] hover:text-[#1e4f28]"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action: Portal Petugas / Mobile Hamburger */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex h-10 min-h-[40px] items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e4f28]"
              >
                Portal Petugas
              </Link>

              {/* Hamburger Button (Mobile) */}
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Buka menu navigasi"
                aria-expanded={isDrawerOpen}
                className="md:hidden flex h-11 w-11 min-h-[44px] min-w-[44px] items-center justify-center rounded-lg border border-[#d1ded0] text-[#191c19] hover:bg-[#f8faf4]"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileNavDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
      />
    </>
  );
}
