"use client";

import { useState, useCallback, useEffect } from "react";

export interface EditorSettings {
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;
  smoothCaret: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

const DEFAULT_SETTINGS: EditorSettings = {
  minimap: false,
  lineNumbers: true,
  wordWrap: true,
  fontSize: 14,
  tabSize: 2,
  smoothCaret: true,
  autoSave: true,
  autoSaveDelay: 800,
};

export function useEditorSettings() {
  const [settings, setSettings] = useState<EditorSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    const stored = localStorage.getItem("dashboard-settings");
    if (stored) {
      const dashboard = JSON.parse(stored);
      setSettings(prev => ({
        ...prev,
        fontSize: dashboard.editorFontSize || 14,
        autoSaveDelay: dashboard.autoSaveDelay || 800,
      }));
    }
  }, []);

  const getEditorOptions = useCallback(() => ({
    wordWrap: settings.wordWrap ? ("on" as const) : ("off" as const),
    automaticLayout: true,
    minimap: { enabled: settings.minimap },
    fontSize: settings.fontSize,
    lineHeight: 22,
    padding: { top: 14, bottom: 14 },
    smoothScrolling: true,
    cursorSmoothCaretAnimation: settings.smoothCaret ? ("on" as const) : ("off" as const),
    renderLineHighlight: "gutter" as const,
    scrollbar: {
      verticalScrollbarSize: 10,
      horizontalScrollbarSize: 10,
    },
    overviewRulerBorder: false,
    lineNumbers: settings.lineNumbers ? ("on" as const) : ("off" as const),
    folding: true,
    tabSize: settings.tabSize,
    find: {
      seedSearchStringFromSelection: "never" as const,
      autoFindInSelection: "never" as const,
      addExtraSpaceOnTop: false,
    },
  }), [settings]);

  return { settings, setSettings, getEditorOptions };
}