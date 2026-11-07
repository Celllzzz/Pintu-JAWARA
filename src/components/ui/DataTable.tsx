"use client";

import React, { useState, useMemo } from "react";
import { CustomSelect } from "./CustomSelect";

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "center" | "right";
  render?: (item: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  title?: string;
  totalLabel?: React.ReactNode;
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  renderMobileCard?: (item: T, index: number) => React.ReactNode;
  isLoading?: boolean;
  emptyMessage?: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  showRowNumber?: boolean;
  initialPageSize?: number;
  className?: string;
}

export function DataTable<T>({
  title,
  totalLabel,
  data,
  columns,
  keyExtractor,
  renderMobileCard,
  isLoading = false,
  emptyMessage = "Tidak ada data ditemukan.",
  searchable = true,
  searchPlaceholder = "Cari data...",
  showRowNumber = true,
  initialPageSize = 10,
  className = "",
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return data;
    const q = searchQuery.toLowerCase().trim();
    return data.filter((item) => {
      const record = item as Record<string, unknown>;
      return Object.values(record).some((val) => {
        if (val === null || val === undefined) return false;
        if (typeof val === "object") {
          return Object.values(val as Record<string, unknown>).some(
            (nested) =>
              typeof nested === "string" && nested.toLowerCase().includes(q)
          );
        }
        return String(val).toLowerCase().includes(q);
      });
    });
  }, [data, searchQuery]);

  // Pagination calculation
  const totalItems = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const paginatedData = useMemo(() => {
    const start = (safeCurrentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safeCurrentPage, pageSize]);

  const startEntry = totalItems === 0 ? 0 : (safeCurrentPage - 1) * pageSize + 1;
  const endEntry = Math.min(safeCurrentPage * pageSize, totalItems);

  const pageSizeOptions = [
    { value: 10, label: "10" },
    { value: 25, label: "25" },
    { value: 50, label: "50" },
    { value: 100, label: "100" },
  ];

  return (
    <div
      className={`rounded-xl border border-[#d1ded0] bg-white shadow-none overflow-hidden ${className}`}
    >
      {/* 1. Optional Card Header (Title & Total count) */}
      {(title || totalLabel) && (
        <div className="flex items-center justify-between p-4 sm:px-6 border-b border-[#e2e8f0] bg-white">
          {title && (
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#1e4f28]">
              {title}
            </h2>
          )}
          {totalLabel && (
            <div className="text-xs text-[#475447]">{totalLabel}</div>
          )}
        </div>
      )}

      {/* 2. Unified Toolbar (Show Per Page & Search Input) */}
      {searchable && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:px-6 border-b border-[#e2e8f0] bg-white text-xs">
          <div className="flex items-center gap-2 text-[#475447]">
            <span>Tampilkan:</span>
            <CustomSelect
              value={pageSize}
              onChange={(val) => {
                setPageSize(Number(val));
                setCurrentPage(1);
              }}
              options={pageSizeOptions}
              className="w-20"
              buttonClassName="w-20"
            />
            <span>data per halaman</span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full h-9 rounded-lg border border-[#d1ded0] bg-white px-3 text-xs text-[#191c19] placeholder:text-[#475447]/60 focus:border-[#1e4f28] focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* 3. Flush Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#f8faf4] border-b border-[#e2e8f0] font-bold uppercase tracking-wider text-[#475447]">
            <tr>
              {showRowNumber && (
                <th scope="col" className="py-3 px-5 text-center w-12">
                  No
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  scope="col"
                  className={`py-3 px-5 ${
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2e8f0]">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, rIdx) => (
                <tr key={rIdx} className="animate-pulse">
                  {showRowNumber && (
                    <td className="py-3.5 px-5 text-center">
                      <div className="h-4 w-4 bg-[#e2e8f0] rounded mx-auto" />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td key={col.key} className="py-3.5 px-5">
                      <div className="h-4 bg-[#e2e8f0] rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (showRowNumber ? 1 : 0)}
                  className="py-10 px-5 text-center text-xs text-[#475447] italic"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginatedData.map((item, itemIdx) => {
                const globalIndex = (safeCurrentPage - 1) * pageSize + itemIdx;
                return (
                  <tr
                    key={keyExtractor(item)}
                    className="hover:bg-[#f8faf4]/60 transition-colors"
                  >
                    {showRowNumber && (
                      <td className="py-3.5 px-5 text-center font-mono tabular-nums text-[#475447]">
                        {globalIndex + 1}
                      </td>
                    )}
                    {columns.map((col) => {
                      const value = (item as Record<string, unknown>)[col.key];
                      return (
                        <td
                          key={col.key}
                          className={`py-3.5 px-5 text-[#191c19] ${
                            col.align === "right"
                              ? "text-right font-mono tabular-nums"
                              : col.align === "center"
                              ? "text-center"
                              : "text-left"
                          }`}
                        >
                          {col.render
                            ? col.render(item, globalIndex)
                            : (value as React.ReactNode) ?? "—"}
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* 4. Flush Mobile Cards */}
      <div className="md:hidden divide-y divide-[#e2e8f0]">
        {isLoading ? (
          <div className="p-6 text-center text-xs text-[#475447] animate-pulse">
            Memuat data...
          </div>
        ) : paginatedData.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#475447] italic">
            {emptyMessage}
          </div>
        ) : (
          paginatedData.map((item, itemIdx) => {
            const globalIndex = (safeCurrentPage - 1) * pageSize + itemIdx;
            return (
              <div key={keyExtractor(item)} className="p-4 space-y-2 text-xs">
                {renderMobileCard ? (
                  renderMobileCard(item, globalIndex)
                ) : (
                  <div className="space-y-2">
                    {showRowNumber && (
                      <div className="flex items-center justify-between pb-1 border-b border-[#e2e8f0]">
                        <span className="text-[10px] font-bold text-[#52792b] uppercase">
                          No. Urut
                        </span>
                        <span className="font-mono tabular-nums font-bold">
                          #{globalIndex + 1}
                        </span>
                      </div>
                    )}
                    {columns.map((col) => {
                      const value = (item as Record<string, unknown>)[col.key];
                      return (
                        <div
                          key={col.key}
                          className="flex items-center justify-between gap-2"
                        >
                          <span className="font-semibold text-[#475447]">
                            {col.header}
                          </span>
                          <span className="text-[#191c19] text-right font-medium">
                            {col.render
                              ? col.render(item, globalIndex)
                              : (value as React.ReactNode) ?? "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Unified Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5 sm:px-6 border-t border-[#e2e8f0] bg-white text-xs">
        <span className="text-[#475447]">
          Menampilkan{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">
            {startEntry} – {endEntry}
          </strong>{" "}
          dari{" "}
          <strong className="font-mono tabular-nums text-[#191c19]">
            {totalItems}
          </strong>{" "}
          data
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={safeCurrentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="h-8 min-h-[32px] px-3 rounded-lg border border-[#d1ded0] font-semibold text-[#191c19] hover:bg-[#f8faf4] disabled:opacity-40 transition-colors"
          >
            Sebelumnya
          </button>
          <span className="px-2 font-mono tabular-nums font-bold text-[#191c19]">
            {safeCurrentPage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safeCurrentPage >= totalPages}
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            className="h-8 min-h-[32px] px-3 rounded-lg border border-[#d1ded0] font-semibold text-[#191c19] hover:bg-[#f8faf4] disabled:opacity-40 transition-colors"
          >
            Berikutnya
          </button>
        </div>
      </div>
    </div>
  );
}
