"use client";

import Editor from "@monaco-editor/react";
import getLanguageFromFileName from "@/utils/languageSupport";
import type { editor as MonacoEditor } from "monaco-editor";

interface SplitEditorProps {
  files: { name: string; content: string }[];
  splitFileIndex: number;
  editorKey: string;
  editorOptions: any;
  onMount: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
}

export default function SplitEditor({ files, splitFileIndex, editorKey, editorOptions, onMount }: SplitEditorProps) {
  const splitFile = files[splitFileIndex];
  if (!splitFile) return null;

  return (
    <div className="flex-1 min-w-0 border-l border-paper/10">
      <div className="h-8 flex items-center gap-2 px-3 bg-ink border-b border-paper/10">
        <span className="h-1.5 w-1.5 rounded-full bg-acid/70" />
        <span className="font-mono text-[11px] text-paper/55 truncate">{splitFile.name}</span>
      </div>
      <Editor
        key={`split-${editorKey}`}
        options={editorOptions}
        height={"calc(100% - 32px)"}
        className="w-full"
        value={splitFile.content || ""}
        language={getLanguageFromFileName(splitFile.name)}
        theme="my-custom-theme"
        onMount={onMount}
      />
    </div>
  );
}