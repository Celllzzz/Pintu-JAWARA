"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from "react";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const hideToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "success", duration = 2500) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    []
  );

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-3 right-3 z-50 flex max-w-[340px] w-full flex-col gap-2 pointer-events-none sm:bottom-5 sm:right-5"
      >
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => hideToast(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({
  toast,
  onDismiss,
}: {
  toast: ToastItem;
  onDismiss: () => void;
}) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const remainingRef = useRef(toast.duration ?? 2500);
  const startTimeRef = useRef(0);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    timerRef.current = setTimeout(onDismiss, remainingRef.current);
  }, [onDismiss]);

  const pauseTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
      remainingRef.current -= Date.now() - startTimeRef.current;
    }
  }, []);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [startTimer]);

  const typeConfig: Record<
    ToastType,
    { style: string; icon: string }
  > = {
    success: {
      style: "bg-[#ecfdf5] text-[#065f46] border-[#a7f3d0]",
      icon: "✓",
    },
    error: {
      style: "bg-[#fef2f2] text-[#991b1b] border-[#fecaca]",
      icon: "✕",
    },
    warning: {
      style: "bg-[#fffbeb] text-[#92400e] border-[#fde68a]",
      icon: "!",
    },
    info: {
      style: "bg-[#eff6ff] text-[#1e40af] border-[#bfdbfe]",
      icon: "ℹ",
    },
  };

  const { style, icon } = typeConfig[toast.type];

  return (
    <div
      role="status"
      onMouseEnter={pauseTimer}
      onMouseLeave={startTimer}
      onFocus={pauseTimer}
      onBlur={startTimer}
      className={`animate-toast-in pointer-events-auto flex items-center justify-between gap-2.5 rounded-lg border px-3.5 py-2.5 shadow-sm text-xs sm:text-sm font-medium leading-snug ${style}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-current/10 text-xs font-bold">
          {icon}
        </span>
        <span className="truncate">{toast.message}</span>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Tutup notifikasi"
        className="shrink-0 flex h-7 w-7 min-h-[28px] min-w-[28px] items-center justify-center rounded hover:bg-black/5 active:scale-95 text-current opacity-70 hover:opacity-100"
      >
        ✕
      </button>
    </div>
  );
}
