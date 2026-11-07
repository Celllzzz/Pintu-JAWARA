"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface CustomSelectOption {
  value: string | number;
  label: string;
}

export interface CustomSelectProps {
  id?: string;
  value: string | number;
  onChange: (val: string | number) => void;
  options: CustomSelectOption[];
  placeholder?: string;
  className?: string;
  buttonClassName?: string;
  disabled?: boolean;
}

export function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "-- Pilih --",
  className = "",
  buttonClassName = "",
  disabled = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((o) => String(o.value) === String(value));

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleSelect(optVal: string | number) {
    onChange(optVal);
    setIsOpen(false);
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`flex h-11 min-h-[44px] w-full items-center justify-between gap-3 rounded-lg border border-[#d1ded0] bg-white px-3.5 text-xs sm:text-sm transition-all hover:border-[#1e4f28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#1e4f28] disabled:cursor-not-allowed disabled:opacity-50 text-left ${buttonClassName}`}
      >
        <span
          className={`truncate ${
            selectedOption && String(selectedOption.value) !== ""
              ? "font-semibold text-[#191c19]"
              : "text-[#475447]/60 font-normal"
          }`}
        >
          {selectedOption && String(selectedOption.value) !== ""
            ? selectedOption.label
            : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-[#475447] transition-transform duration-150 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1.5 z-50 min-w-full w-max max-w-[min(420px,calc(100vw-2rem))] max-h-60 overflow-y-auto rounded-xl border border-[#d1ded0] bg-white p-1.5 shadow-xl animate-dialog-in"
        >
          {options.map((opt) => {
            const isSelected = String(opt.value) === String(value);
            return (
              <div
                key={String(opt.value)}
                role="option"
                aria-selected={isSelected}
                tabIndex={0}
                onClick={() => handleSelect(opt.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    handleSelect(opt.value);
                  }
                }}
                className={`flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-xs font-medium cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#f0fdf4] font-semibold text-[#1e4f28]"
                    : "text-[#191c19] hover:bg-[#f8faf4]"
                }`}
              >
                <span className="whitespace-nowrap">{opt.label}</span>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 shrink-0 text-[#1e4f28]" />
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
