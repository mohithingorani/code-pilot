"use client";
import Editor from "@monaco-editor/react";
import { useEffect, useRef, useState } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { useSocket } from "@/hooks/websocket";
import getLanguageFromFileName from "@/utils/languageSupport";
import FileStructure from "@/components/FileStructure";
import { HeadingTabs } from "@/components/HeadingTabs";
import XTerminal from "@/components/Terminal";
import { EDITOR_ICONS } from "@/data";
import Image from "next/image";

const Home = () => {
  const { socket, connected } = useSocket();

  const [currentVal, setCurrentVal] = useState<string | null>(null);
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const [files, setFiles] = useState<{ name: string; content: string }[]>([]);
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [currentLanguage, setCurrentLanguage] = useState<string>("");
  // Terminal is always visible for now.
  const [sidebarOpenMobile, setSidebarOpenMobile] = useState(false);

  // Monaco doesn't always re-layout when the container height changes.
  // If we add resizing later, we can re-introduce a layout() on toggle.

  function handleEditorDidMount(
    editor: MonacoEditor.IStandaloneCodeEditor,
    _monaco: typeof import("monaco-editor"),
  ) {
    void _monaco;
    editorRef.current = editor;
  }

  function handleEditorDidChange(value: string | undefined) {
    if (!value || !socket) return;
    setCurrentVal(value);
  }

  useEffect(() => {
    if (!connected || !socket || !files.length) return;

    const updatedFiles = files.map((file, index) => {
      if (index === selectedFileIndex) {
        return {
          ...file,
          content: currentVal?.endsWith("\n") ? currentVal : currentVal + "\n",
        };
      }
      return file;
    });

    const sendCode = setTimeout(() => {
      socket.send(
        JSON.stringify({
          type: "files",
          payload: { files: updatedFiles },
        }),
      );
    }, 800);

    return () => clearTimeout(sendCode);
    // Intentionally debounced on editor changes; keep the dependency list narrow.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentVal]);

  const handleEditorWillMount = (monaco: typeof import("monaco-editor")) => {
    monaco.editor.defineTheme("my-custom-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "FFFFFF", background: "222222" },
        { token: "keyword", foreground: "569CD6" },
        { token: "identifier", foreground: "9CDCFE" },
        { token: "string", foreground: "CE9178" },
        { token: "number", foreground: "B5CEA8" },
        { token: "comment", foreground: "6A9955", fontStyle: "italic" },
      ],
      colors: {
        "editor.background": "#141414",
      },
    });
  };

  const handleRemovFile = (name: string) => {
    const newFiles = files.filter((file) => file.name !== name);
    setFiles(newFiles);

    // Keep selection stable after removing.
    if (selectedFileIndex >= newFiles.length) {
      const nextIndex = Math.max(0, newFiles.length - 1);
      setSelectedFileIndex(nextIndex);
      setCurrentVal(newFiles[nextIndex]?.content ?? null);
      setCurrentLanguage(
        newFiles[nextIndex] ? getLanguageFromFileName(newFiles[nextIndex].name) : "",
      );
    }
  };

  useEffect(() => {
    if (!socket) return;
    console.log("Setting up socket listeners");

    const handleMessage = (event: MessageEvent<string>) => {
      console.log("Received message:", event.data);
      if (typeof event.data === "string") {
        const parsed = JSON.parse(event.data);
        console.log("Received message:", parsed);
        if (parsed.type === "files") {
          const newFiles = parsed.payload.files as {
            name: string;
            content: string;
          }[];

          setFiles(newFiles);

          if (newFiles.length > 0) {
            setCurrentVal(newFiles[0].content);
            setSelectedFileIndex(0);
            setCurrentLanguage(getLanguageFromFileName(newFiles[0].name));
          }
        }
      }
    };
    socket.addEventListener("message", handleMessage);

    return () => {
      socket.removeEventListener("message", handleMessage);
    };
  }, [socket]);

  function handleClick(index: number) {
    setSelectedFileIndex(index);
    setCurrentVal(files[index].content);
    setCurrentLanguage(getLanguageFromFileName(files[index].name));
    setSidebarOpenMobile(false);
  }

  return (
    <div className="w-full min-h-screen flex justify-center items-center px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-6xl h-[90dvh] rounded-2xl  border border-white/10 bg-neutral-950/55 backdrop-blur-xl shadow-2xl ring-1 ring-white/5">
        {/* subtle overlay to keep text readable on bright backgrounds */}
        <div className="h-full w-full bg-linear-to-b from-black/10 via-black/10 to-black/25">
          <div className="h-full grid grid-cols-1 md:grid-cols-[320px_1fr]">
            {/* Sidebar: desktop */}
            <aside className="hidden md:flex flex-col text-white border-r border-white/10">
              <div className="flex items-center justify-between px-4 py-3">
                <div className="text-sm tracking-wide text-white/80">Workspace</div>
                <div
                  className={`text-[11px] px-2 py-1 rounded-full border ${connected ? "border-emerald-400/30 text-emerald-200 bg-emerald-400/10" : "border-white/10 text-white/60 bg-white/5"}`}
                >
                  {connected ? "Connected" : "Connecting"}
                </div>
              </div>
              <div className="px-2">
                <EditorOptions />
              </div>
              <div className="flex-1 overflow-auto pb-4 [scrollbar-width:thin]">
                <FileStructure
                  removeFile={handleRemovFile}
                  selected={selectedFileIndex}
                  onClick={handleClick}
                  files={files}
                />
              </div>
            </aside>

            {/* Main */}
            <section className="flex flex-col min-w-0">
              {/* Top bar (mobile controls + title) */}
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 border-b border-white/10 text-white">
                <div className="flex items-center gap-2 min-w-0">
                  <button
                    className="md:hidden px-2 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-xs"
                    onClick={() => setSidebarOpenMobile(true)}
                  >
                    Files
                  </button>
                  <div className="min-w-0" title={files[selectedFileIndex]?.name ?? "Editor"}>
                    <div className="text-sm font-medium">
                      {files[selectedFileIndex]?.name ?? "Editor"}
                    </div>
                    <div className="text-[11px] text-white/60 truncate">
                      {currentLanguage ? currentLanguage.toUpperCase() : ""}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2" />
              </div>

              <HeadingTabs
                selectedFile={selectedFileIndex}
                files={files}
                onClick={handleClick}
              />

              {/* Editor + terminal drawer */}
              <div className="flex grow justify-end flex-col">
                <div className="h-full bg-[#141414]">
                  <Editor
                    options={{
                      wordWrap: "on",
                      automaticLayout: true,
                      minimap: { enabled: false },
                      fontSize: 14,
                      lineHeight: 22,
                      padding: { top: 14, bottom: 14 },
                      smoothScrolling: true,
                      cursorSmoothCaretAnimation: "on",
                      renderLineHighlight: "gutter",
                      scrollbar: {
                        verticalScrollbarSize: 10,
                        horizontalScrollbarSize: 10,
                      },
                      overviewRulerBorder: false,
                    }}
                    onChange={handleEditorDidChange}
                    beforeMount={handleEditorWillMount}
                    height={"100%"}
                    className="w-full"
                    value={currentVal || ""}
                    language={currentLanguage}
                    theme="my-custom-theme"
                    onMount={handleEditorDidMount}
                  />
                </div>

                {/* Terminal area */}
                <div className="relative z-10 border-t border-white/10 bg-black/35 backdrop-blur-xl">
                  <div className="flex items-center gap-2 px-3 sm:px-4 py-2 text-white/80">
                    <div className="text-xs">Terminal</div>
                  </div>

                  <div className="h-56 sm:h-64 px-3 sm:px-4 pb-3">
                    <div className="h-full p-2 w-full rounded-lg border border-white/10 bg-black/40">
                      <XTerminal socket={socket} />
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Mobile sidebar drawer */}
          {sidebarOpenMobile && (
            <div className="md:hidden fixed inset-0 z-50">
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setSidebarOpenMobile(false)}
              />
              <div className="absolute left-0 top-0 h-full w-[85vw] max-w-sm border-r border-white/10 bg-neutral-950/70 backdrop-blur-xl text-white">
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                  <div className="text-sm text-white/80">Workspace</div>
                  <button
                    className="text-xs px-2 py-1 rounded-md border border-white/10 bg-white/5"
                    onClick={() => setSidebarOpenMobile(false)}
                  >
                    Done
                  </button>
                </div>
                <div className="px-2">
                  <EditorOptions />
                </div>
                <div className="h-[calc(100%-104px)] overflow-auto pb-4 [scrollbar-width:thin]">
                  <FileStructure
                    removeFile={handleRemovFile}
                    selected={selectedFileIndex}
                    onClick={handleClick}
                    files={files}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;

function EditorOptions() {
  return (
    <div className="flex gap-4 w-full justify-center py-4">
      {EDITOR_ICONS.map((icon) => (
        <button key={icon.icon_name} className="p-2 hover:bg-white/10 rounded">
          <Image src={icon.href} alt={icon.icon_name} width={25} height={25} />
        </button>
      ))}
    </div>
  );
}
