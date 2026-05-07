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
import { useParams } from "next/navigation";
import axios from "axios";

interface Project {
  id: string;
  name: string;
  description: string | null;
  language: string;
  status: "active" | "idle";
}

export default function EditorPage() {
  const params = useParams();
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
    if (projectId) {
      axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/projects/${projectId}`)
        .then(res => setProject(res.data))
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
        { token: "", foreground: "FFFFFF", background: "222222" },
        { token: "keyword", foreground: "569CD6" },
        { token: "identifier", foreground: "9CDCFE" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      ],
      colors: { "editor.background": "#141414" },
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

  return (
    <div className="w-full min-h-screen flex justify-center items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-6xl h-[90dvh] rounded-2xl border border-white/10 bg-neutral-950/55 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-950/80 backdrop-blur-sm rounded-2xl z-20">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span className="text-sm text-white/60">Loading workspace...</span>
            </div>
          </div>
        )}
        <div className="h-full w-full bg-linear-to-b from-black/10 via-black/10 to-black/25">
          <div className="h-full grid grid-cols-1 md:grid-cols-[320px_1fr]">
            <aside className="hidden md:flex flex-col text-white border-r border-white/10">
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-sm tracking-wide text-white/80">Workspace</span>
                <span className={`text-[11px] px-2 py-1 rounded-full border ${connected ? "border-emerald-400/30 text-emerald-200 bg-emerald-400/10" : "border-white/10 text-white/60 bg-white/5"}`}>
                  {connected ? "Connected" : "Connecting"}
                </span>
              </div>
              <EditorOptions editorRef={editorRef} onAddFile={() => setShowNewFileModal(true)} onToggleSettings={() => setShowSettings(true)} onToggleShortcuts={() => setShowShortcuts(true)} />
              <div className="flex-1 overflow-auto pb-4 [scrollbar-width:thin]">
                <FileStructure removeFile={handleRemoveFile} selected={selectedFileIndex} onClick={handleFileClick} files={files} addFolder={handleAddFolder} splitFileIndex={splitFileIndex} onSplitFileClick={handleSplitFileClick} />
              </div>
            </aside>

            <section className="flex flex-col min-w-0">
              <div className="flex h-12 items-center justify-between px-3 sm:px-4 py-3 border-b border-white/10 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <button className="md:hidden px-2 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-xs" onClick={() => setSidebarOpenMobile(true)}>Files</button>
                  <div className="min-w-0">
                    <div className="text-sm font-medium flex items-center gap-2">
                      {files[selectedFileIndex]?.name ?? "Editor"}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded ${saveStatus === "saved" ? "bg-emerald-500/20 text-emerald-400" : saveStatus === "saving" ? "bg-amber-500/20 text-amber-400" : "bg-white/10 text-white/60"}`}>
                        {saveStatus === "saved" ? "Saved" : saveStatus === "saving" ? "Saving..." : "Editing"}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/60 truncate">{currentLanguage.toUpperCase()}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={handleSplitView} className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition ${splitFileIndex !== null ? "bg-white/20 text-white" : "bg-white/5 hover:bg-white/10 text-white/80 border border-white/10"}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x={3} y={3} width={18} height={18} rx={2} /><line x1={12} y1={3} x2={12} y2={21} /></svg>
                    Split
                  </button>
                  <button onClick={handleRun} className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium flex items-center gap-1.5 transition" title="Run code (Ctrl+Enter)">
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    Run
                  </button>
                </div>
              </div>
              <div className="h-10">
                <HeadingTabs selectedFile={selectedFileIndex} files={files} onClick={handleFileClick} splitFileIndex={splitFileIndex} onSplitFileClick={handleSplitFileClick} />
              </div>

              <div className="flex grow justify-end flex-col">
                <div className="h-full bg-[#141414] flex">
                  <div className="flex-1 min-w-0">
                    <Editor key={`main-${editorKey}`} options={getEditorOptions()} onChange={val => { if (val) setCurrentVal(val); }} beforeMount={handleEditorWillMount} height="100%" className="w-full" value={currentVal || ""} language={currentLanguage} theme="my-custom-theme" onMount={(e) => { editorRef.current = e; }} />
                  </div>
                  {splitFileIndex !== null && <SplitEditor files={files} splitFileIndex={splitFileIndex} editorKey={String(editorKey)} editorOptions={getEditorOptions()} onMount={(e) => { editor2Ref.current = e; }} />}
                </div>
                <div className="border-t border-white/10 bg-black/35 backdrop-blur-xl">
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white/80"><span className="text-xs">Terminal</span></div>
                  <div className="h-56 sm:h-64 px-3 sm:px-4 pb-3">
                    <div className="h-full p-2 w-full rounded-lg border border-white/10 bg-black/40"><XTerminal socket={socket} /></div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {sidebarOpenMobile && (
            <div className="md:hidden fixed inset-0 z-50">
              <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpenMobile(false)} />
              <div className="absolute left-0 top-0 h-full w-[85vw] max-w-sm border-r border-white/10 bg-neutral-950/70 backdrop-blur-xl text-white">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <span className="text-sm text-white/80">Workspace</span>
                  <button className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5" onClick={() => setSidebarOpenMobile(false)}>Done</button>
                </div>
                <EditorOptions editorRef={editorRef} onAddFile={() => setShowNewFileModal(true)} onToggleSettings={() => setShowSettings(true)} onToggleShortcuts={() => setShowShortcuts(true)} />
                <div className="h-[calc(100%-104px)] overflow-auto pb-4 [scrollbar-width:thin]">
                  <FileStructure removeFile={handleRemoveFile} selected={selectedFileIndex} onClick={handleFileClick} files={files} addFolder={handleAddFolder} splitFileIndex={splitFileIndex} onSplitFileClick={handleSplitFileClick} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <NewFileModal isOpen={showNewFileModal} fileName={newFileName} isCreating={isCreatingFile} onFileNameChange={setNewFileName} onCreate={handleAddFile} onClose={() => { setShowNewFileModal(false); setNewFileName(""); }} />
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} settings={settings} onSettingsChange={setSettings} />
      <ShortcutsModal isOpen={showShortcuts} onClose={() => setShowShortcuts(false)} />
    </div>
  );
}