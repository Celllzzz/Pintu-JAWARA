"use client";

import React, { forwardRef } from "react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", label, error, helperText, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-bold uppercase tracking-wider text-[#191c19] mb-1.5"
          >
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={`block w-full h-11 min-h-[44px] rounded-lg border bg-white px-3.5 text-sm text-[#191c19] placeholder:text-[#475447]/60 transition-colors focus:outline-none disabled:bg-gray-50 disabled:opacity-60 ${
            error
              ? "border-[#fecaca] focus:border-[#991b1b] focus:ring-1 focus:ring-[#991b1b]"
              : "border-[#d1ded0] focus:border-[#1e4f28] focus:ring-1 focus:ring-[#1e4f28]"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs font-medium text-[#991b1b]">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-[#475447]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
