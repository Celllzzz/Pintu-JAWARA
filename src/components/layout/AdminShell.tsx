"use client";

import React, { useState } from "react";
import { AdminSidebar } from "./AdminSidebar";
import { AdminTopbar } from "./AdminTopbar";
import { UserRole } from "@/types/database";

export interface AdminShellProps {
  user: {
    id: string;
    email: string;
    full_name: string;
    role: UserRole;
    team_name?: string | null;
    team_code?: string | null;
  };
  children: React.ReactNode;
}

export function AdminShell({ user, children }: AdminShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#f8faf4] text-[#191c19] overflow-x-hidden">
      {/* Sidebar */}
      <AdminSidebar
        user={user}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-x-hidden">
        <AdminTopbar
          user={user}
          onOpenSidebar={() => setIsSidebarOpen(true)}
        />
        <main className="flex-1 px-4 sm:px-6 md:px-8 py-5 sm:py-6 md:py-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
