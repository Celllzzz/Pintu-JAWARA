"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

export interface CommandItem {
  id: string;
  label: string;
  category: string;
  shortcut?: string;
  onSelect: () => void;
}

export interface CommandMenuProps {
  userRole?: string;
}

export function CommandMenu({ userRole = "admin_l1" }: CommandMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const commands: CommandItem[] = useMemo(() => {
    const list: CommandItem[] = [
      {
        id: "nav-profile",
        label: "Pengaturan Profil Saya",
        category: "Akun",
        shortcut: "P",
        onSelect: () => router.push("/admin/profile"),
      },
      {
        id: "nav-home",
        label: "Lihat Beranda Publik",
        category: "Navigasi",
        shortcut: "H",
        onSelect: () => router.push("/"),
      },
    ];

    if (userRole === "admin_l1") {
      list.push(
        {
          id: "nav-tickets",
          label: "Antrean Tiket (Admin)",
          category: "Layanan",
          shortcut: "T",
          onSelect: () => router.push("/admin/tickets"),
        },
        {
          id: "nav-users",
          label: "Manajemen Akun Petugas",
          category: "Petugas",
          shortcut: "U",
          onSelect: () => router.push("/admin/users"),
        }
      );
    } else if (userRole === "admin_l2") {
      list.push(
        {
          id: "nav-unit-tickets",
          label: "Antrean Tiket (Petugas Unit)",
          category: "Layanan",
          shortcut: "T",
          onSelect: () => router.push("/admin/unit/tickets"),
        },
        {
          id: "nav-unit-catalog",
          label: "Katalog & Stok UPBS",
          category: "Layanan",
          shortcut: "K",
          onSelect: () => router.push("/admin/unit/catalog"),
        }
      );
    } else if (userRole === "pimpinan") {
      list.push({
        id: "nav-pimpinan-dash",
        label: "Dashboard Eksekutif & IKM",
        category: "Laporan",
        shortcut: "D",
        onSelect: () => router.push("/pimpinan"),
      });
    }

    list.push({
      id: "act-logout",
      label: "Keluar dari Sistem (Logout)",
      category: "Sesi",
      onSelect: async () => {
        await fetch("/api/auth/logout", { method: "POST" });
        router.push("/login");
        router.refresh();
      },
    });

    return list;
  }, [userRole, router]);

  const filteredCommands = useMemo(() => {
    if (!query.trim()) return commands;
    const lower = query.toLowerCase();
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(lower) ||
        c.category.toLowerCase().includes(lower)
    );
  }, [commands, query]);

  function openMenu() {
    setQuery("");
    setSelectedIndex(0);
    setIsOpen(true);
  }

  // Open / Close on Ctrl+K or ⌘K
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => {
          if (!prev) {
            setQuery("");
            setSelectedIndex(0);
          }
          return !prev;
        });
      } else if (e.key === "Escape" && isOpen) {
        e.preventDefault();
        setIsOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Arrow navigation
  function handleInputKeyDown(e: React.KeyboardEvent) {
    if (filteredCommands.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredCommands.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? filteredCommands.length - 1 : prev - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = filteredCommands[selectedIndex];
      if (selected) {
        selected.onSelect();
        setIsOpen(false);
      }
    }
  }

  // Group filtered items by category
  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    filteredCommands.forEach((item) => {
      const list = map.get(item.category) || [];
      list.push(item);
      map.set(item.category, list);
    });
    return Array.from(map.entries());
  }, [filteredCommands]);

  return (
    <>
      {/* Search trigger button for Topbar */}
      <button
        type="button"
        onClick={openMenu}
        aria-label="Buka pencarian cepat (Ctrl+K)"
        className="flex items-center gap-2 h-10 px-3 rounded-lg border border-[#d1ded0] bg-[#f8faf4] text-xs text-[#475447] hover:bg-white hover:border-[#52792b] transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e4f28]"
      >
        <svg
          className="h-4 w-4 text-[#475447]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <span className="hidden sm:inline">Pencarian Cepat...</span>
        <kbd className="hidden sm:inline-flex items-center rounded border border-[#d1ded0] bg-white px-1.5 py-0.5 text-[10px] font-semibold text-[#475447]">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Dialog Backdrop */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-16 sm:pt-24 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-xl bg-white shadow-lg border border-[#d1ded0] overflow-hidden animate-dialog-in">
            {/* Search Input */}
            <div className="flex items-center border-b border-[#e2e8f0] px-3.5">
              <svg
                className="h-4 w-4 text-[#475447] shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleInputKeyDown}
                placeholder="Ketik menu atau aksi..."
                className="w-full h-12 bg-transparent px-3 text-sm text-[#191c19] placeholder:text-[#475447]/60 focus:outline-none"
              />
              <kbd className="rounded border border-[#d1ded0] bg-[#f8faf4] px-1.5 py-0.5 text-[10px] font-semibold text-[#475447]">
                ESC
              </kbd>
            </div>

            {/* Results List */}
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-72 overflow-y-auto p-2 divide-y divide-[#f8faf4] text-xs"
            >
              {filteredCommands.length === 0 ? (
                <li className="py-6 text-center text-[#475447]">
                  Tidak ada menu yang sesuai &quot;{query}&quot;
                </li>
              ) : (
                grouped.map(([category, items]) => (
                  <li key={category} className="py-1">
                    <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#475447]">
                      {category}
                    </p>
                    <div className="space-y-0.5">
                      {items.map((cmd) => {
                        const index = filteredCommands.findIndex((c) => c.id === cmd.id);
                        const isSelected = index === selectedIndex;
                        return (
                          <div
                            key={cmd.id}
                            role="option"
                            aria-selected={isSelected}
                            onClick={() => {
                              cmd.onSelect();
                              setIsOpen(false);
                            }}
                            onMouseEnter={() => setSelectedIndex(index)}
                            className={`flex items-center justify-between rounded-lg px-2.5 py-2 cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[#1e4f28] text-white"
                                : "text-[#191c19] hover:bg-[#f8faf4]"
                            }`}
                          >
                            <span className="font-semibold text-xs">{cmd.label}</span>
                            {cmd.shortcut && (
                              <kbd
                                className={`rounded px-1.5 py-0.5 text-[10px] font-mono ${
                                  isSelected
                                    ? "bg-white/20 text-white"
                                    : "bg-[#f8faf4] border border-[#d1ded0] text-[#475447]"
                                }`}
                              >
                                {cmd.shortcut}
                              </kbd>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </li>
                ))
              )}
            </ul>

            {/* Footer Hints */}
            <div className="border-t border-[#e2e8f0] bg-[#f8faf4] px-3.5 py-2 text-[11px] text-[#475447] flex items-center justify-between">
              <span>Gunakan panah ↑ ↓ dan Enter untuk navigasi</span>
              <span>PINTU JAWARA</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
