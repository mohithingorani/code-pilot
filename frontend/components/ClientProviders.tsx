"use client";

import type { ReactNode } from "react";
import { ToastProvider } from "@/components/toast/ToastProvider";

export default function ClientProviders({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
