"use client";

import { FreighterProvider } from "@/providers/FreighterProvider";
import type { ReactNode } from "react";

export function AppProviders({ children }: { children: ReactNode }) {
  return <FreighterProvider>{children}</FreighterProvider>;
}
