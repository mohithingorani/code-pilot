"use client";

import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";

export type ToastInput = {
  kind: ToastKind;
  title: string;
  message?: string;
  durationMs?: number;
};

type Toast = ToastInput & {
  id: string;
};

type ToastContextValue = {
  toast: (t: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function ToastItem({ t, onClose }: { t: Toast; onClose: (id: string) => void }) {
  const accent =
    t.kind === "success"
      ? "border-emerald-400/30 bg-emerald-400/10"
      : t.kind === "error"
        ? "border-red-400/30 bg-red-400/10"
        : "border-white/10 bg-white/5";

  const titleColor = t.kind === "error" ? "text-red-200" : "text-white";

  return (
    <div className={`rounded-2xl border ${accent} backdrop-blur-xl shadow-2xl shadow-black/50 overflow-hidden`}>
      <div className="px-4 py-3 flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className={`text-sm font-semibold ${titleColor}`}>{t.title}</div>
          {t.message && <div className="text-xs text-white/70 mt-0.5 break-words">{t.message}</div>}
        </div>
        <button
          onClick={() => onClose(t.id)}
          className="shrink-0 p-1.5 rounded-lg hover:bg-white/10 transition"
          aria-label="Dismiss"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="text-white/60">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const remove = useCallback((id: string) => {
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (input: ToastInput) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const t: Toast = { id, durationMs: 3500, ...input };
      setToasts((prev) => [t, ...prev].slice(0, 4));

      const duration = t.durationMs ?? 3500;
      const timer = setTimeout(() => remove(id), duration);
      timers.current.set(id, timer);
    },
    [remove],
  );

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed top-4 right-4 z-[100] w-[92vw] max-w-sm space-y-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} t={t} onClose={remove} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
