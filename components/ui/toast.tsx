"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastVariant = "success" | "error";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, variant }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:items-end">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "animate-fade-up pointer-events-auto flex max-w-sm items-center gap-2.5 rounded-xl border bg-bg-secondary/95 px-4 py-3 text-sm font-medium text-ink shadow-soft backdrop-blur-md",
              toast.variant === "success" ? "border-accent/25" : "border-red-400/30"
            )}
          >
            {toast.variant === "success" ? (
              <CheckCircle2 size={16} className="shrink-0 text-accent" />
            ) : (
              <XCircle size={16} className="shrink-0 text-red-400" />
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast precisa ser usado dentro de <ToastProvider>.");
  }
  return ctx;
}
