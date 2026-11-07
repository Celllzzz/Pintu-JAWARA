"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardList,
  FileText,
  Users,
  BarChart3,
  Settings,
  X,
  Sprout,
} from "lucide-react";
import { UserRole } from "@/types/database";

export interface AdminSidebarProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    team_name?: string | null;
    team_code?: string | null;
  };
  isOpen: boolean;
  onClose: () => void;
}

export function AdminSidebar({ user, isOpen, onClose }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const isUPBSPadi =
    user.role === "admin_l2" && user.team_code === "upbs_padi";
  const isUPBSAyam =
    user.role === "admin_l2" && user.team_code === "upbs_ayam";
  const showCatalogMenu = isUPBSPadi || isUPBSAyam;
  const catalogLabel = isUPBSAyam
    ? "Katalog & Stok UPBS Ayam"
    : "Katalog & Stok UPBS Padi";

  const navItems = [
    {
      label: "Antrean Tiket",
      href: "/admin/tickets",
      roles: ["admin_l1"],
      icon: ClipboardList,
    },
    {
      label: "Antrean Unit Saya",
      href: "/admin/unit/tickets",
      roles: ["admin_l2"],
      icon: FileText,
    },
    {
      label: catalogLabel,
      href: "/admin/unit/catalog",
      roles: ["admin_l2"],
      visible: showCatalogMenu,
      icon: Sprout,
    },
    {
      label: "Manajemen Petugas",
      href: "/admin/users",
      roles: ["admin_l1"],
      icon: Users,
    },
    {
      label: "Dashboard Eksekutif",
      href: "/pimpinan",
      roles: ["pimpinan"],
      icon: BarChart3,
    },
    {
      label: "Pengaturan Profil",
      href: "/admin/profile",
      roles: ["admin_l1", "admin_l2", "pimpinan"],
      icon: Settings,
    },
  ];

  const filteredNav = navItems.filter((item) => {
    if (!item.roles.includes(user.role)) return false;
    if ("visible" in item && item.visible === false) return false;
    return true;
  });

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      router.push("/login");
    }
  }

  const roleText =
    user.role === "admin_l1"
      ? "Admin"
      : user.role === "admin_l2"
      ? `Petugas Unit: ${user.team_name || "Pelaksana"}`
      : "Pimpinan";

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between bg-white p-4">
      <div className="space-y-6">
        {/* Branding */}
        <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-4 px-1">
          <Link href="/" className="flex items-center gap-2.5">
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
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup menu"
            className="md:hidden flex h-8 w-8 min-h-[32px] min-w-[32px] items-center justify-center rounded-lg border border-[#d1ded0] text-sm text-[#191c19]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* User Info Capsule */}
        <div className="rounded-xl border border-[#d1ded0] bg-[#f8faf4] p-3 text-xs space-y-1">
          <p className="font-bold text-[#191c19] truncate" title={user.full_name}>
            {user.full_name}
          </p>
          <p className="text-[#475447] truncate text-[11px]" title={user.email}>
            {user.email}
          </p>
          <div className="pt-0.5">
            <span
              className="inline-block max-w-full truncate rounded-full bg-[#ecfdf5] border border-[#a7f3d0] px-2.5 py-0.5 text-[10px] font-semibold text-[#065f46]"
              title={roleText}
            >
              {roleText}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-1">
          <p className="px-2 text-[10px] font-bold uppercase tracking-wider text-[#475447]">
            Menu Utama
          </p>
          {filteredNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex h-11 min-h-[44px] items-center gap-2.5 rounded-lg px-3 text-xs sm:text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#1e4f28] text-white shadow-sm"
                    : "text-[#191c19] hover:bg-[#f8faf4]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-[#e2e8f0] pt-3 space-y-2">
        <Link
          href="/"
          className="flex h-10 min-h-[40px] w-full items-center justify-center rounded-lg border border-[#d1ded0] px-3 text-xs font-semibold text-[#191c19] hover:bg-[#f8faf4]"
        >
          Beranda Publik
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="flex h-10 min-h-[40px] w-full items-center justify-center rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 text-xs font-semibold text-[#991b1b] hover:bg-[#fee2e2] transition-colors"
        >
          Keluar Sesi
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 border-r border-[#d1ded0] bg-white h-screen sticky top-0">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex md:hidden"
        >
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
            onClick={onClose}
          />
          <div className="relative flex w-full max-w-xs flex-1 flex-col bg-white shadow-xl animate-drawer-in">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
