import React from "react";

export default function AdminLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Title & Stats Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#e2e8f0] pb-3">
        <div className="space-y-1">
          <div className="h-3 w-36 rounded bg-[#d1ded0]" />
          <div className="h-7 w-60 rounded bg-[#191c19]/15" />
        </div>
        <div className="flex items-center gap-2">
          <div className="h-4 w-24 rounded bg-[#e2e8f0]" />
          <div className="h-9 w-20 rounded-lg bg-[#d1ded0]" />
        </div>
      </div>

      {/* Grid Layout Skeleton (Split Queue & Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (Queue) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="h-10 w-full rounded-lg bg-[#f1f5f9]" />
          <div className="flex gap-2">
            <div className="h-8 w-16 rounded-md bg-[#e2e8f0]" />
            <div className="h-8 w-16 rounded-md bg-[#e2e8f0]" />
            <div className="h-8 w-16 rounded-md bg-[#e2e8f0]" />
          </div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="rounded-xl border border-[#d1ded0] bg-white p-4 space-y-2"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 w-28 rounded bg-[#191c19]/20" />
                <div className="h-5 w-16 rounded-full bg-[#f1f5f9]" />
              </div>
              <div className="h-4 w-44 rounded bg-[#191c19]/15" />
              <div className="h-3 w-32 rounded bg-[#e2e8f0]" />
            </div>
          ))}
        </div>

        {/* Right Column (Detail View) */}
        <div className="lg:col-span-7 rounded-xl border border-[#d1ded0] bg-white p-6 space-y-5">
          <div className="flex justify-between items-center border-b border-[#e2e8f0] pb-4">
            <div className="space-y-1.5">
              <div className="h-5 w-40 rounded bg-[#191c19]/20" />
              <div className="h-3 w-28 rounded bg-[#e2e8f0]" />
            </div>
            <div className="h-6 w-20 rounded-full bg-[#f1f5f9]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-12 rounded-lg bg-[#f8faf4]" />
            <div className="h-12 rounded-lg bg-[#f8faf4]" />
          </div>
          <div className="h-28 rounded-lg bg-[#f8faf4]" />
          <div className="flex gap-2 pt-2">
            <div className="h-10 w-32 rounded-lg bg-[#1e4f28]/25" />
            <div className="h-10 w-32 rounded-lg bg-[#d1ded0]" />
          </div>
        </div>
      </div>
    </div>
  );
}
