"use client";

import React from "react";

export interface FilterPillItem {
  id: string;
  label: string;
  count?: number;
}

export interface FilterPillsProps {
  items: FilterPillItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export function FilterPills({
  items,
  activeId,
  onChange,
  className = "",
}: FilterPillsProps) {
  return (
    <div
      role="tablist"
      aria-label="Filter antrean"
      className={`flex items-center gap-2 overflow-x-auto px-1 py-0.5 scroll-px-3 text-sm no-scrollbar ${className}`}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <button
            key={item.id}
            role="tab"
            aria-selected={isActive}
            type="button"
            onClick={() => onChange(item.id)}
            className={`flex shrink-0 items-center gap-1.5 h-9 min-h-[36px] px-3.5 rounded-full text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e4f28] ${
              isActive
                ? "bg-[#1e4f28] text-white shadow-sm"
                : "bg-white border border-[#d1ded0] text-[#191c19] hover:bg-[#f8faf4]"
            }`}
          >
            <span>{item.label}</span>
            {typeof item.count === "number" && (
              <span
                className={`font-mono tabular-nums text-[11px] rounded-full px-1.5 py-0.2 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-[#f8faf4] border border-[#d1ded0] text-[#475447]"
                }`}
              >
                {item.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
