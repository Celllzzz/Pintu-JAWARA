"use client";

import React from "react";
import Link from "next/link";
import { CommandMenu } from "@/components/ui/CommandMenu";
import { UserRole } from "@/types/database";

export interface AdminTopbarProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    team_name?: string | null;
    team_code?: string | null;
  };
  onOpenSidebar: () => void;
  title?: string;
}

export function AdminTopbar({ user, onOpenSidebar, title }: AdminTopbarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b border-[#d1ded0] bg-white px-4 sm:px-6 lg:px-8">
      {/* Left: Mobile/Tablet Sidebar Trigger + Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        <button
          type="button"
          onClick={onOpenSidebar}
          aria-label="Buka menu navigasi"
          className="lg:hidden flex h-10 w-10 min-h-[40px] min-w-[40px] shrink-0 items-center justify-center rounded-lg border border-[#d1ded0] text-[#191c19] hover:bg-[#f8faf4]"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#52792b] block leading-none">
            WORKSPACE PETUGAS
          </span>
          <h1 className="text-sm sm:text-base font-bold text-[#191c19] truncate max-w-[160px] sm:max-w-xs mt-0.5">
            {title || "Pusat Pelayanan Terpadu"}
          </h1>
        </div>
      </div>

      {/* Right: Search / Command Menu + User Profile */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <CommandMenu userRole={user.role} />

        <Link
          href="/admin/profile"
          aria-label="Pengaturan Profil"
          className="flex h-10 items-center gap-2 rounded-lg border border-[#d1ded0] bg-[#f8faf4] px-2 sm:px-2.5 hover:bg-white hover:border-[#52792b] transition-colors"
        >
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e4f28] text-xs font-bold text-white uppercase">
            {user.full_name.charAt(0)}
          </div>
          <span className="hidden lg:inline text-xs font-semibold text-[#191c19] max-w-[120px] truncate">
            {user.full_name}
          </span>
        </Link>
      </div>
    </header>
  );
}
