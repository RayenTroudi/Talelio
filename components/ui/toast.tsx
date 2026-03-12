"use client";

import { useEffect } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const toastVariants = cva(
  "fixed top-6 right-6 z-[100] flex items-start gap-3 rounded-xl px-6 py-4 shadow-2xl backdrop-blur-sm transition-all duration-500 ease-out min-w-[320px] max-w-md",
  {
    variants: {
      variant: {
        success:
          "bg-gradient-to-br from-emerald-50/95 to-green-50/95 border border-emerald-200/50 text-emerald-900",
        error:
          "bg-gradient-to-br from-rose-50/95 to-red-50/95 border border-rose-200/50 text-rose-900",
        info:
          "bg-gradient-to-br from-gold-50/95 to-gold-50/95 border border-gold-200/50 text-gold-900",
      },
      visible: {
        true: "animate-in slide-in-from-right-8 fade-in-0 zoom-in-95",
        false: "animate-out slide-out-to-right-8 fade-out-0 zoom-out-95 pointer-events-none",
      },
    },
    defaultVariants: {
      variant: "success",
      visible: true,
    },
  }
);

interface ToastProps extends VariantProps<typeof toastVariants> {
  message: string;
  description?: string;
  duration?: number;
  onClose: () => void;
  visible: boolean;
}

export function Toast({
  message,
  description,
  duration = 4000,
  onClose,
  variant,
  visible,
}: ToastProps) {
  useEffect(() => {
    if (!visible) return;

    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose, visible]);

  const icons = {
    success: (
      <svg
        className="w-6 h-6 text-emerald-600 flex-shrink-0 animate-in zoom-in-50 duration-700"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
    error: (
      <svg
        className="w-6 h-6 text-rose-600 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    info: (
      <svg
        className="w-6 h-6 text-gold-600 flex-shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2.5}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  };

  return (
    <div
      className={cn(toastVariants({ variant, visible }))}
      role="alert"
      aria-live="polite"
    >
      {variant && icons[variant]}
      <div className="flex-1 space-y-0.5">
        <p className="font-semibold text-sm leading-tight tracking-wide">
          {message}
        </p>
        {description && (
          <p className="text-xs opacity-80 leading-relaxed">{description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="text-current opacity-40 hover:opacity-100 transition-opacity duration-200 flex-shrink-0 rounded-lg p-1 hover:bg-black/5"
        aria-label="Close notification"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Elegant progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 rounded-b-xl overflow-hidden">
        <div
          className="h-full bg-current animate-progress"
          style={{
            animation: `progress ${duration}ms linear`,
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for managing toast state
export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{
      id: string;
      message: string;
      description?: string;
      variant?: "success" | "error" | "info";
      visible: boolean;
    }>
  >([]);

  const showToast = (
    message: string,
    options?: {
      description?: string;
      variant?: "success" | "error" | "info";
    }
  ) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [
      ...prev,
      {
        id,
        message,
        description: options?.description,
        variant: options?.variant || "success",
        visible: true,
      },
    ]);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) =>
      prev.map((toast) =>
        toast.id === id ? { ...toast, visible: false } : toast
      )
    );

    // Remove from DOM after animation completes
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 500);
  };

  return { toasts, showToast, dismissToast };
}

import { useState } from "react";
