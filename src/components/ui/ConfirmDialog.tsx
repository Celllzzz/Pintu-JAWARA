"use client";

import React, { useEffect, useRef } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDestructive = false,
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      confirmBtnRef.current?.focus();
    }
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      aria-describedby="dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] animate-backdrop-in"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-lg border border-[#d1ded0] animate-dialog-in"
      >
        <h2 id="dialog-title" className="text-lg font-bold text-[#191c19]">
          {title}
        </h2>
        <p id="dialog-desc" className="mt-2 text-sm text-[#475447] leading-relaxed">
          {description}
        </p>

        <div className="mt-6 flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="flex h-11 min-h-[44px] items-center justify-center rounded-lg border border-[#d1ded0] px-4 text-sm font-semibold text-[#191c19] hover:bg-[#f8faf4] disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`flex h-11 min-h-[44px] items-center justify-center rounded-lg px-4 text-sm font-semibold text-white disabled:opacity-50 ${
              isDestructive
                ? "bg-[#991b1b] hover:bg-[#7f1d1d]"
                : "bg-[#1e4f28] hover:bg-[#163c1e]"
            }`}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
