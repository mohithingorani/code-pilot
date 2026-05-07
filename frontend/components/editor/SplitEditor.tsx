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
    <div className="flex-1 min-w-0 border-l border-white/10">
      <div className="h-8 flex items-center px-3 bg-black/30 border-b border-white/10">
        <span className="text-xs text-white/60 truncate">{splitFile.name}</span>
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