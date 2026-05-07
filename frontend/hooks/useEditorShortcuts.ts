"use client";

import { useEffect, useCallback } from "react";
import type { editor as MonacoEditor } from "monaco-editor";

interface UseEditorShortcutsOptions {
  socket: WebSocket | null;
  files: { name: string; content: string }[];
  editorRef: React.MutableRefObject<MonacoEditor.IStandaloneCodeEditor | null>;
  sidebarOpenMobile: boolean;
  showNewFileModal: boolean;
  showSettings: boolean;
  showShortcuts: boolean;
  editorSettings: {
    autoSave: boolean;
  };
  setSaveStatus: (status: "saved" | "saving" | "unsaved") => void;
  setSidebarOpenMobile: (open: boolean) => void;
  setShowNewFileModal: (show: boolean) => void;
  setShowSettings: (show: boolean) => void;
  setShowShortcuts: (show: boolean) => void;
  setEditorSettings: (updater: React.SetStateAction<{
    minimap: boolean;
    lineNumbers: boolean;
    wordWrap: boolean;
    fontSize: number;
    tabSize: number;
    smoothCaret: boolean;
    autoSave: boolean;
    autoSaveDelay: number;
  }>) => void;
  handleRun: () => void;
}

export function useEditorShortcuts({
  socket,
  files,
  editorRef,
  sidebarOpenMobile,
  showNewFileModal,
  showSettings,
  showShortcuts,
  setSaveStatus,
  setSidebarOpenMobile,
  setShowNewFileModal,
  setShowSettings,
  setShowShortcuts,
  setEditorSettings,
  handleRun,
}: UseEditorShortcutsOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      if (sidebarOpenMobile) {
        setSidebarOpenMobile(false);
        return;
      }
      if (showNewFileModal) {
        setShowNewFileModal(false);
        return;
      }
      if (showSettings) {
        setShowSettings(false);
        return;
      }
      if (showShortcuts) {
        setShowShortcuts(false);
        return;
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "s") {
      e.preventDefault();
      if (socket && files.length > 0) {
        setSaveStatus("saving");
        socket.send(JSON.stringify({ type: "files", payload: { files } }));
        setTimeout(() => setSaveStatus("saved"), 500);
      }
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      handleRun();
    }

    const isModalOpen = showNewFileModal || showSettings || showShortcuts;

    if ((e.ctrlKey || e.metaKey) && e.key === "f" && !isModalOpen) {
      e.preventDefault();
      editorRef.current?.getAction("actions.find")?.run();
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "h" && !isModalOpen) {
      e.preventDefault();
      editorRef.current?.getAction("editor.action.startFindReplaceAction")?.run();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "H" && !isModalOpen) {
      e.preventDefault();
      editorRef.current?.getAction("editor.action.replaceAll")?.run();
    }

    if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "L") {
      e.preventDefault();
      setEditorSettings(prev => ({ ...prev, minimap: !prev.minimap }));
    }

    if ((e.ctrlKey || e.metaKey) && e.key === "k" && !isModalOpen) {
      const nextKey = (ev: KeyboardEvent) => {
        if (ev.key === "m") {
          ev.preventDefault();
          setShowShortcuts(true);
          window.removeEventListener("keydown", nextKey);
        }
      };
      window.addEventListener("keydown", nextKey);
      setTimeout(() => window.removeEventListener("keydown", nextKey), 1000);
    }
  }, [
    socket, files, editorRef, sidebarOpenMobile, showNewFileModal, 
    showSettings, showShortcuts, setSaveStatus, setSidebarOpenMobile,
    setShowNewFileModal, setShowSettings, setShowShortcuts, 
    setEditorSettings, handleRun
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);
}