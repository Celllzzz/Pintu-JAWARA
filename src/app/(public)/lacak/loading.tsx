import React from "react";

export default function LacakLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 space-y-6 animate-pulse">
      {/* Header Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-40 rounded bg-[#d1ded0]" />
        <div className="h-8 w-64 rounded bg-[#191c19]/15" />
        <div className="h-4 w-full max-w-lg rounded bg-[#e2e8f0]" />
      </div>

      {/* Tracking Form Card Skeleton */}
      <div className="rounded-xl border border-[#d1ded0] bg-white p-6 sm:p-8 space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <div className="h-3 w-28 rounded bg-[#e2e8f0]" />
            <div className="h-11 rounded-lg bg-[#f1f5f9]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-[#e2e8f0]" />
            <div className="h-11 rounded-lg bg-[#f1f5f9]" />
          </div>
        </div>
        <div className="h-11 w-full rounded-lg bg-[#1e4f28]/25" />
      </div>
    </main>
  );
}
