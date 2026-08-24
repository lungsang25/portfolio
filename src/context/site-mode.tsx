"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type SiteMode = "web" | "app";

const STORAGE_KEY = "ls020-site-mode";

type SiteModeContextValue = {
  mode: SiteMode;
  setMode: (mode: SiteMode) => void;
};

const SiteModeContext = createContext<SiteModeContextValue | null>(null);

export function SiteModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<SiteMode>("web");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "web" || stored === "app") {
      setModeState(stored);
    }
  }, []);

  const setMode = (next: SiteMode) => {
    setModeState(next);
    window.localStorage.setItem(STORAGE_KEY, next);
  };

  return (
    <SiteModeContext.Provider value={{ mode, setMode }}>
      {children}
    </SiteModeContext.Provider>
  );
}

export function useSiteMode() {
  const ctx = useContext(SiteModeContext);
  if (!ctx) {
    throw new Error("useSiteMode must be used within a SiteModeProvider");
  }
  return ctx;
}
