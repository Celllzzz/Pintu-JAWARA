"use client";

import React, { forwardRef } from "react";

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "outline"
  | "ghost"
  | "destructive";

export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = "",
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-semibold rounded-lg transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none select-none";

    const variantStyles: Record<ButtonVariant, string> = {
      primary:
        "bg-[#1e4f28] text-white shadow-sm hover:bg-[#163c1e] focus-visible:outline-[#1e4f28]",
      secondary:
        "bg-[#52792b] text-white shadow-sm hover:bg-[#3f5e21] focus-visible:outline-[#52792b]",
      tertiary:
        "bg-[#e5a91a] text-[#191c19] shadow-sm hover:bg-[#c99212] focus-visible:outline-[#e5a91a]",
      outline:
        "border border-[#d1ded0] bg-white text-[#191c19] hover:bg-[#f8faf4] focus-visible:outline-[#1e4f28]",
      ghost:
        "text-[#191c19] hover:bg-black/5 focus-visible:outline-[#1e4f28]",
      destructive:
        "border border-[#fecaca] bg-[#fef2f2] text-[#991b1b] hover:bg-[#fee2e2] focus-visible:outline-[#991b1b]",
    };

    const sizeStyles: Record<ButtonSize, string> = {
      sm: "h-9 min-h-[36px] px-3 text-xs gap-1.5",
      md: "h-11 min-h-[44px] px-4 text-sm gap-2",
      lg: "h-12 min-h-[48px] px-6 text-base gap-2.5",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-4 w-4 shrink-0 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        <span>{children}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
