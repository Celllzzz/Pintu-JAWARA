import React from "react";

export default function GlobalLoading() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-28 rounded bg-[#e2e8f0]" />
        <div className="h-8 w-72 rounded bg-[#d1ded0]" />
        <div className="h-4 w-96 rounded bg-[#e2e8f0]" />
      </div>

      <div className="rounded-xl border border-[#d1ded0] bg-white p-6 space-y-4">
        <div className="h-6 w-48 rounded bg-[#d1ded0]" />
        <div className="space-y-3 pt-2">
          <div className="h-10 w-full rounded-lg bg-[#f1f5f9]" />
          <div className="h-10 w-full rounded-lg bg-[#f1f5f9]" />
          <div className="h-24 w-full rounded-lg bg-[#f1f5f9]" />
        </div>
      </div>
    </div>
  );
}
