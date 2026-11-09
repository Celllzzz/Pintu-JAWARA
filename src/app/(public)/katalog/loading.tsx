import React from "react";

export default function KatalogLoading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-44 rounded bg-[#d1ded0]" />
        <div className="h-8 w-72 rounded bg-[#191c19]/15" />
        <div className="h-4 w-full max-w-xl rounded bg-[#e2e8f0]" />
      </div>

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex gap-2">
          <div className="h-9 w-24 rounded-lg bg-[#d1ded0]" />
          <div className="h-9 w-28 rounded-lg bg-[#e2e8f0]" />
          <div className="h-9 w-28 rounded-lg bg-[#e2e8f0]" />
        </div>
        <div className="h-10 w-full sm:w-64 rounded-lg bg-[#f1f5f9]" />
      </div>

      {/* Grid of Variety Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-2">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#d1ded0] bg-white overflow-hidden space-y-4 p-5"
          >
            <div className="h-44 w-full rounded-lg bg-[#f1f5f9]" />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div className="h-3 w-20 rounded bg-[#d1ded0]" />
                <div className="h-5 w-16 rounded-full bg-[#f1f5f9]" />
              </div>
              <div className="h-5 w-40 rounded bg-[#191c19]/20" />
              <div className="h-3 w-full rounded bg-[#e2e8f0]" />
            </div>
            <div className="pt-2 border-t border-[#e2e8f0] flex justify-between items-center">
              <div className="h-4 w-24 rounded bg-[#1e4f28]/20" />
              <div className="h-8 w-20 rounded-lg bg-[#d1ded0]" />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
