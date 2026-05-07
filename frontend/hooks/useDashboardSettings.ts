"use client";

import { useState, useEffect } from "react";

export interface DashboardSettings {
  theme: "dark" | "light";
  editorFontSize: number;
  autoSaveDelay: number;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  theme: "dark",
  editorFontSize: 14,
  autoSaveDelay: 800,
};

export function useDashboardSettings() {
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-settings");
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  const updateSettings = (updates: Partial<DashboardSettings>) => {
    const newSettings = { ...settings, ...updates };
    setSettings(newSettings);
    localStorage.setItem("dashboard-settings", JSON.stringify(newSettings));
  };

  return { settings, updateSettings };
}