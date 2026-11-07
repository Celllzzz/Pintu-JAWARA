import React from "react";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "rectangular" | "circular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  variant = "rectangular",
  width,
  height,
  className = "",
  style,
  ...props
}: SkeletonProps) {
  const variantStyles = {
    text: "h-4 rounded",
    rectangular: "rounded-lg",
    circular: "rounded-full",
  };

  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Memuat konten..."
      className={`animate-pulse bg-[#d1ded0]/40 motion-reduce:animate-none ${variantStyles[variant]} ${className}`}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
        ...style,
      }}
      {...props}
    >
      <span className="sr-only">Memuat...</span>
    </div>
  );
}
