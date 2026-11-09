"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export interface MobileNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNavDrawer({ isOpen, onClose }: MobileNavDrawerProps) {
  const pathname = usePathname();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/katalog", label: "Katalog UPBS" },
    { href: "/lacak", label: "Lacak Permohonan" },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Menu navigasi mobile"
      className="fixed inset-0 z-50 flex md:hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white p-5 shadow-xl border-r border-[#d1ded0] animate-drawer-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4">
          <div className="flex items-center gap-2.5">
            <Image
              src="/logo/Kementerian Pertanian Kementan Logo - Colored - zonalogo.com.svg"
              alt="Logo BRMP Banten"
              width={34}
              height={34}
              className="h-8 w-auto object-contain"
            />
            <div>
              <p className="text-sm font-black uppercase tracking-tight text-[#191c19]">
                PINTU JAWARA
              </p>
              <p className="text-[10px] font-black text-[#1e4f28] tracking-wide">BRMP Banten</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex h-9 w-9 min-h-[36px] min-w-[36px] items-center justify-center rounded-lg border border-[#d1ded0] text-[#191c19] hover:bg-[#f8faf4]"
          >
            ✕
          </button>
        </div>

        {/* Links */}
        <nav className="mt-6 flex flex-col space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex h-11 min-h-[44px] items-center rounded-lg px-3.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#f0fdf4] text-[#1e4f28] border border-[#bbf7d0]"
                    : "text-[#191c19] hover:bg-[#f8faf4]"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Portal Petugas Button */}
        <div className="mt-auto border-t border-[#e2e8f0] pt-4">
          <Link
            href="/login"
            onClick={onClose}
            className="flex h-11 min-h-[44px] w-full items-center justify-center rounded-lg bg-[#1e4f28] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#163c1e]"
          >
            Portal Petugas
          </Link>
          <div className="mt-3 text-center text-[11px] text-[#475447] leading-relaxed">
            <p className="font-semibold text-[#191c19]">Waktu Pelayanan:</p>
            <p className="mt-1 font-medium">Senin – Kamis</p>
            <p>09.00 – 15.00 WIB</p>
            <p className="text-[10px] text-[#475447]/80">Istirahat 12.00 – 13.00</p>
            <p className="mt-1 font-medium">Jumat</p>
            <p>09.00 – 15.30 WIB</p>
            <p className="text-[10px] text-[#475447]/80">Istirahat 11.00 – 13.00 WIB</p>
          </div>
        </div>
      </div>
    </div>
  );
}
