"use client";

import React, { forwardRef } from "react";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = "", label, error, helperText, id, children, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            id={selectId}
            ref={ref}
            className={`block w-full appearance-none h-11 min-h-[44px] rounded-lg border bg-white pl-3.5 pr-12 text-sm text-[#191c19] transition-colors focus:outline-none cursor-pointer disabled:bg-gray-50 disabled:opacity-60 ${
              error
                ? "border-[#fecaca] focus:border-[#991b1b] focus:ring-1 focus:ring-[#991b1b]"
                : "border-[#d1ded0] focus:border-[#1e4f28] focus:ring-1 focus:ring-[#1e4f28]"
            } ${className}`}
            {...props}
          >
            {children}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-[#475447]">
            <svg
              className="h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error ? (
          <p className="mt-1 text-xs font-medium text-[#991b1b]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#475447]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
