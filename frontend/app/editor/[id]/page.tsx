"use client";
import Editor from "@monaco-editor/react";
import React, { useEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useSocket } from "@/hooks/websocket";
import getLanguageFromFileName from "@/utils/languageSupport";
import FileStructure from "@/components/FileStructure";
import { HeadingTabs } from "@/components/HeadingTabs";
import XTerminal from "@/components/Terminal";

import { useEditorShortcuts } from "@/hooks/useEditorShortcuts";
import { useEditorSettings } from "@/hooks/useEditorSettings";
import EditorOptions from "@/components/editor/EditorOptions";
import NewFileModal from "@/components/editor/NewFileModal";
import SettingsModal from "@/components/editor/SettingsModal";
import ShortcutsModal from "@/components/editor/ShortcutsModal";
import SplitEditor from "@/components/editor/SplitEditor";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";

interface Project {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: "active" | "idle";
}

export default function EditorPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [editorKey, setEditorKey] = useState(0);
  useEffect(() => setEditorKey(k => k + 1), [projectId]);

  const { socket, connected } = useSocket(projectId);

  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const editor2Ref = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [splitFileIndex, setSplitFileIndex] = useState<number | null>(null);
  const [currentVal, setCurrentVal] = useState<string | null>(null);
  const [currentLanguage, setCurrentLanguage] = useState<string>("");
  const [project, setProject] = useState<Project | null>(null);

  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [newFileName, setNewFileName] = useState("");
  const [isCreatingFile, setIsCreatingFile] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "unsaved">("saved");
  const [loading, setLoading] = useState(true);

  const { settings, setSettings, getEditorOptions } = useEditorSettings();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/join");
    }
  }, [router]);

  useEffect(() => {
    if (projectId) {
      api
        .get(`/api/projects/${projectId}`)
        .then((res) => setProject(res.data))
        .catch(console.error);
    }
  }, [projectId]);

  useEffect(() => {
    if (socket && connected && project) {
      socket.send(JSON.stringify({ type: "init", payload: { language: project.language } }));
    }
  }, [socket, connected, project]);

  const handleRun = () => {
    if (!socket || !currentLanguage || !files[selectedFileIndex]) return;
    const fileName = files[selectedFileIndex].name;
    const baseName = fileName.replace(/\.[^.]+$/, "");
    let command: string;

    switch (currentLanguage) {
      case "python":
        command = `python3 "${fileName}"`;
        break;
      case "javascript":
        command = `node "${fileName}"`;
        break;
case "typescript":
        command = 'cd /workspace && npm install typescript@4.5 ts-node@8 > /dev/null 2>&1 && ./node_modules/.bin/ts-node --transpile-only "' + fileName + '"';
        break;
      case "java":
        command = `javac "${fileName}" && java "${baseName}"`;
        break;
      case "cpp":
        command = `g++ "${fileName}" -o "${baseName}" && ./"${baseName}"`;
        break;
      case "markdown":
        command = `cat "${fileName}"`;
        break;
      default:
        command = `python3 "${fileName}"`;
    }

    socket.send(JSON.stringify({ type: "terminal", payload: { data: `${command}\n` } }));
  };

  useEditorShortcuts({
    socket,
    files,
    editorRef,
    sidebarOpenMobile,
    showNewFileModal,
    showSettings,
    showShortcuts,
    editorSettings: { autoSave: settings.autoSave },
    setSaveStatus,
    setSidebarOpenMobile,
    setShowNewFileModal,
    setShowSettings,
    setShowShortcuts,
    setEditorSettings: setSettings,
    handleRun,
  });

  useEffect(() => {
    if (!connected || !socket || !files.length) return;
    const updatedFiles = files.map((file, i) => i === selectedFileIndex ? { ...file, content: currentVal?.endsWith("\n") ? currentVal : (currentVal || "") + "\n" } : file);
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setSaveStatus("unsaved");
    saveTimeoutRef.current = setTimeout(() => {
      setSaveStatus("saving");
      socket.send(JSON.stringify({ type: "files", payload: { files: updatedFiles } }));
      setTimeout(() => setSaveStatus("saved"), 500);
    }, settings.autoSave ? settings.autoSaveDelay : 0);
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [currentVal]);

  const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
    monaco.editor.defineTheme("my-custom-theme", {
      base: "vs-dark", inherit: true,
      rules: [
        { token: "", foreground: "ECE9E1", background: "0B0B0B" },
        { token: "keyword", foreground: "9CB8FF" },
        { token: "identifier", foreground: "C9D4E3" },
        { token: "string", foreground: "D8FF3E" },
        { token: "number", foreground: "B5CEA8" },
        { token: "comment", foreground: "5C5C54", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#0b0b0b",
        "editor.lineHighlightBackground": "#ffffff08",
        "editorLineNumber.foreground": "#ece9e133",
        "editorLineNumber.activeForeground": "#d8ff3e",
        "editorCursor.foreground": "#d8ff3e",
        "editor.selectionBackground": "#d8ff3e26",
        "editorIndentGuide.background1": "#ffffff0d",
      },
    });
  };

  const handleRemoveFile = (name: string) => {
    const newFiles = files.filter(f => f.name !== name);
    setFiles(newFiles);
    if (selectedFileIndex >= newFiles.length) {
      const next = Math.max(0, newFiles.length - 1);
      setSelectedFileIndex(next);
      setCurrentVal(newFiles[next]?.content ?? null);
      setCurrentLanguage(newFiles[next] ? getLanguageFromFileName(newFiles[next].name) : "");
    }
    if (splitFileIndex !== null && splitFileIndex >= newFiles.length) setSplitFileIndex(Math.max(0, newFiles.length - 1));
  };

  const handleAddFile = () => {
    if (!newFileName.trim()) return;
    setIsCreatingFile(true);
    const newFile = { name: newFileName, content: "" };
    const newFiles = [...files, newFile];
    setFiles(newFiles);
    setSelectedFileIndex(newFiles.length - 1);
    setCurrentVal("");
    setCurrentLanguage(getLanguageFromFileName(newFileName));
    if (socket) socket.send(JSON.stringify({ type: "files", payload: { files: newFiles } }));
    setNewFileName("");
    setShowNewFileModal(false);
    setIsCreatingFile(false);
  };

  const handleAddFolder = (name: string) => {
    const newFiles = [...files, { name: `${name}/.gitkeep`, content: "" }];
    setFiles(newFiles);
    if (socket) socket.send(JSON.stringify({ type: "files", payload: { files: newFiles } }));
  };

  const handleSplitView = () => {
    if (splitFileIndex === null) setSplitFileIndex((selectedFileIndex + 1) % files.length);
    else setSplitFileIndex(null);
  };

  const handleFileClick = (index: number) => {
    setSelectedFileIndex(index);
    setCurrentVal(files[index].content);
    setCurrentLanguage(getLanguageFromFileName(files[index].name));
    setSidebarOpenMobile(false);
  };

  const handleSplitFileClick = (index: number) => setSplitFileIndex(index);

  useEffect(() => {
    if (!socket) return;
    const handler = (event: MessageEvent<string>) => {
      if (typeof event.data === "string") {
        const parsed = JSON.parse(event.data);
        if (parsed.type === "files") {
          const newFiles = parsed.payload.files as { name: string; content: string }[];
          setFiles(newFiles);
          setLoading(false);
          if (newFiles.length > 0) {
            setCurrentVal(newFiles[0].content);
            setSelectedFileIndex(0);
            setCurrentLanguage(getLanguageFromFileName(newFiles[0].name));
          }
        }
      }
    };
    socket.addEventListener("message", handler);
    return () => socket.removeEventListener("message", handler);
  }, [socket]);

  const activeFile = files[selectedFileIndex];

  return (
    <div className="relative z-10 flex h-[100dvh] w-full flex-col bg-ink text-paper">
      {loading && (
        <div className="absolute inset-0 z-30 flex items-center justify-center bg-ink/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-paper/15 border-t-acid" />
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-paper/50">
              Booting workspace…
            </span>
          </div>
        </div>
      )}

      {/* ── Top bar ──────────────────────────────────────────── */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-paper/10 bg-ink px-3 sm:px-4">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={() => setSidebarOpenMobile(true)}
            className="flex items-center justify-center border border-paper/15 bg-paper/5 px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-wider text-paper/70 transition-colors hover:border-paper/30 md:hidden"
          >
            Files
          </button>
          <button
            onClick={() => router.push("/dashboard")}
            title="Back to dashboard"
            className="hidden items-center gap-2 text-paper/60 transition-colors hover:text-paper sm:flex"
          >
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6" />
            </svg>
            <span className="font-display text-sm font-bold uppercase tracking-tight">
              Code<span className="text-acid">/</span>Pilot
            </span>
          </button>
          <span className="hidden h-5 w-px bg-paper/10 sm:block" />
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-medium text-paper/90">
              {project?.name ?? "Untitled project"}
            </span>
            {currentLanguage && (
              <span className="hidden shrink-0 border border-paper/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-acid sm:inline-block">
                {currentLanguage}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="mr-1 hidden items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-paper/45 sm:flex">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-acid" : "animate-pulse bg-paper/40"}`} />
            {connected ? "Live" : "Linking"}
          </span>
          <button
            onClick={handleSplitView}
            title="Split view"
            className={`flex items-center gap-1.5 border px-3 py-1.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              splitFileIndex !== null
                ? "border-acid/60 text-acid"
                : "border-paper/15 text-paper/70 hover:border-paper/30 hover:text-paper"
            }`}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <rect x={3} y={3} width={18} height={18} rx={1} />
              <line x1={12} y1={3} x2={12} y2={21} />
            </svg>
            <span className="hidden sm:inline">Split</span>
          </button>
          <button
            onClick={handleRun}
            title="Run code (Ctrl+Enter)"
            className="flex items-center gap-1.5 bg-acid px-4 py-1.5 font-mono text-[11px] font-medium uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
          >
            <svg width={12} height={12} viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            Run
          </button>
        </div>
      </header>

      {/* ── Body ─────────────────────────────────────────────── */}
      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-[280px] shrink-0 flex-col border-r border-paper/10 bg-[#070707] md:flex">
          <EditorOptions editorRef={editorRef} onAddFile={() => setShowNewFileModal(true)} onToggleSettings={() => setShowSettings(true)} onToggleShortcuts={() => setShowShortcuts(true)} />
          <div className="flex-1 overflow-auto pb-4 [scrollbar-width:thin]">
            <FileStructure removeFile={handleRemoveFile} selected={selectedFileIndex} onClick={handleFileClick} files={files} addFolder={handleAddFolder} splitFileIndex={splitFileIndex} onSplitFileClick={handleSplitFileClick} />
          </div>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <HeadingTabs selectedFile={selectedFileIndex} files={files} onClick={handleFileClick} splitFileIndex={splitFileIndex} onSplitFileClick={handleSplitFileClick} />

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex min-h-0 flex-1 bg-[#0b0b0b]">
              <div className="min-w-0 flex-1">
                <Editor key={`main-${editorKey}`} options={getEditorOptions()} onChange={val => { if (val) setCurrentVal(val); }} beforeMount={handleEditorWillMount} height="100%" className="w-full" value={currentVal || ""} language={currentLanguage} theme="my-custom-theme" onMount={(e) => { editorRef.current = e; }} />
              </div>
              {splitFileIndex !== null && <SplitEditor files={files} splitFileIndex={splitFileIndex} editorKey={String(editorKey)} editorOptions={getEditorOptions()} onMount={(e) => { editor2Ref.current = e; }} />}
            </div>

            <div className="shrink-0 border-t border-paper/10 bg-[#070707]">
              <div className="flex items-center justify-between border-b border-paper/10 px-4 py-2">
                <span className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-paper/50">
                  <span className="text-acid">❯</span> Terminal
                </span>
                <span className="font-mono text-[10px] uppercase tracking-wider text-paper/30">
                  bash · /workspace
                </span>
              </div>
              <div className="h-52 px-3 pb-3 pt-2 sm:h-60">
                <div className="h-full w-full overflow-hidden border border-paper/10 bg-[#0b0b0b] p-2">
                  <XTerminal socket={socket} />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ── Status bar ───────────────────────────────────────── */}
      <footer className="flex h-6 shrink-0 items-center justify-between border-t border-paper/10 bg-ink px-3 font-mono text-[10px] uppercase tracking-wider text-paper/45 sm:text-[11px]">
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="flex items-center gap-1.5">
            <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-acid" : "animate-pulse bg-paper/40"}`} />
            {connected ? "Connected" : "Connecting"}
          </span>
          <span className="hidden items-center gap-1 sm:flex">⎇ main</span>
        </div>
        <div className="flex items-center gap-3 sm:gap-4">
          <span className="truncate max-w-[40vw]">{activeFile?.name ?? "—"}</span>
          <span
            className={
              saveStatus === "saved"
                ? "text-acid"
                : saveStatus === "saving"
                ? "text-paper/70"
                : "text-paper/50"
            }
          >
            {saveStatus === "saved" ? "● Saved" : saveStatus === "saving" ? "◌ Saving" : "○ Editing"}
          </span>
          <span className="hidden sm:inline">{currentLanguage || "text"}</span>
          <span className="hidden md:inline">UTF-8</span>
        </div>
      </footer>

      {/* Mobile sidebar */}
      {sidebarOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={() => setSidebarOpenMobile(false)} />
          <div className="absolute left-0 top-0 flex h-full w-[85vw] max-w-sm flex-col border-r border-paper/10 bg-[#070707]">
            <div className="flex items-center justify-between border-b border-paper/10 px-4 py-3">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-paper/60">Explorer</span>
              <button className="border border-paper/15 bg-paper/5 px-2.5 py-1 font-mono text-[11px] uppercase tracking-wider text-paper/70 hover:border-paper/30" onClick={() => setSidebarOpenMobile(false)}>Done</button>
            </div>
            <EditorOptions editorRef={editorRef} onAddFile={() => setShowNewFileModal(true)} onToggleSettings={() => setShowSettings(true)} onToggleShortcuts={() => setShowShortcuts(true)} />
            <div className="flex-1 overflow-auto pb-4 [scrollbar-width:thin]">
              <FileStructure removeFile={handleRemoveFile} selected={selectedFileIndex} onClick={handleFileClick} files={files} addFolder={handleAddFolder} splitFileIndex={splitFileIndex} onSplitFileClick={handleSplitFileClick} />
            </div>
          </div>
        </div>
      )}

      <NewFileModal isOpen={showNewFileModal} fileName={newFileName} isCreating={isCreatingFile} onFileNameChange={setNewFileName} onCreate={handleAddFile} onClose={() => { setShowNewFileModal(false); setNewFileName(""); }} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={setSettings} />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}
