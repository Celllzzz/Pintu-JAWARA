import React from "react";

export default function PimpinanLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Executive Header Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0] pb-4">
        <div className="space-y-1">
          <div className="h-3 w-44 rounded bg-[#d1ded0]" />
          <div className="h-7 w-72 rounded bg-[#191c19]/15" />
          <div className="h-3 w-96 rounded bg-[#e2e8f0]" />
        </div>
        <div className="h-4 w-40 rounded bg-[#e2e8f0]" />
      </div>

      {/* 4 KPI Metric Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="rounded-xl border border-[#d1ded0] bg-white p-5 space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-3 w-32 rounded bg-[#d1ded0]" />
              <div className="h-7 w-7 rounded-lg bg-[#f1f5f9]" />
            </div>
            <div className="h-8 w-24 rounded bg-[#191c19]/20" />
            <div className="h-3 w-40 rounded bg-[#e2e8f0]" />
          </div>
        ))}
      </div>

      {/* Overdue / SLA Alert Box Skeleton */}
      <div className="rounded-xl border border-[#d1ded0] bg-white p-6 space-y-3">
        <div className="h-5 w-48 rounded bg-[#191c19]/20" />
        <div className="h-12 w-full rounded-lg bg-[#f8faf4]" />
      </div>

      {/* Report Table Section Skeleton */}
      <div className="rounded-xl border border-[#d1ded0] bg-white p-6 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-[#e2e8f0]">
          <div className="space-y-1">
            <div className="h-3 w-36 rounded bg-[#d1ded0]" />
            <div className="h-5 w-56 rounded bg-[#191c19]/20" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-28 rounded-lg bg-[#e2e8f0]" />
            <div className="h-9 w-32 rounded-lg bg-[#1e4f28]/25" />
          </div>
        </div>
        <div className="h-40 w-full rounded-lg bg-[#f8faf4]" />
      </div>
    </div>
  );
}
