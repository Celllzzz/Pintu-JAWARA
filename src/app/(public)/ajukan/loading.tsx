import React from "react";

export default function AjukanLoading() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10 space-y-6 animate-pulse">
      {/* Page Title Skeleton */}
      <div className="space-y-2">
        <div className="h-3 w-36 rounded bg-[#d1ded0]" />
        <div className="h-8 w-80 rounded bg-[#191c19]/15" />
        <div className="h-4 w-full max-w-xl rounded bg-[#e2e8f0]" />
      </div>

      <div className="space-y-6">
        {/* Step 1: Category Grid Skeleton */}
        <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#e2e8f0] pb-3 space-y-1">
            <div className="h-3 w-28 rounded bg-[#d1ded0]" />
            <div className="h-5 w-56 rounded bg-[#191c19]/20" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl border border-[#e2e8f0] bg-[#f8faf4] p-3 space-y-2 flex flex-col justify-center items-center text-center"
              >
                <div className="h-7 w-7 rounded-lg bg-[#e2e8f0]" />
                <div className="h-3 w-20 rounded bg-[#d1ded0]" />
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Applicant Data Skeleton */}
        <div className="rounded-xl border border-[#d1ded0] bg-white p-5 sm:p-6 space-y-4">
          <div className="border-b border-[#e2e8f0] pb-3 space-y-1">
            <div className="h-3 w-28 rounded bg-[#d1ded0]" />
            <div className="h-5 w-48 rounded bg-[#191c19]/20" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <div className="h-3 w-24 rounded bg-[#e2e8f0]" />
              <div className="h-11 rounded-lg bg-[#f1f5f9]" />
            </div>
            <div className="space-y-1.5">
              <div className="h-3 w-28 rounded bg-[#e2e8f0]" />
              <div className="h-11 rounded-lg bg-[#f1f5f9]" />
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-32 rounded bg-[#e2e8f0]" />
            <div className="h-11 rounded-lg bg-[#f1f5f9]" />
          </div>
          <div className="space-y-1.5">
            <div className="h-3 w-36 rounded bg-[#e2e8f0]" />
            <div className="h-24 rounded-lg bg-[#f1f5f9]" />
          </div>
        </div>

        {/* Submit Button Skeleton */}
        <div className="h-12 w-full rounded-lg bg-[#1e4f28]/25" />
      </div>
    </main>
  );
}
