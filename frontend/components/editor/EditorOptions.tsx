"use client";

import Image from "next/image";
import { useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import { EDITOR_ICONS } from "@/data";

interface EditorOptionsProps {
  editorRef: React.MutableRefObject<MonacoEditor.IStandaloneCodeEditor | null>;
  onAddFile: () => void;
  onToggleSettings: () => void;
  onToggleShortcuts: () => void;
}

export default function EditorOptions({ editorRef, onAddFile, onToggleSettings, onToggleShortcuts }: EditorOptionsProps) {
  const triggerSearch = () => {
    editorRef.current?.getAction("actions.find")?.run();
  };

  return (
    <div className="flex gap-2 w-full justify-center py-4">
      {EDITOR_ICONS.map((icon) => (
        <button
          key={icon.icon_name}
          className="p-2 hover:bg-white/10 rounded"
          title={icon.icon_name}
          onClick={icon.icon_name === "search" ? triggerSearch : undefined}
        >
          <Image src={icon.href} alt={icon.icon_name} width={20} height={20} />
        </button>
      ))}
      <button onClick={onAddFile} className="p-2 hover:bg-white/10 rounded" title="Add file">
        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14"/>
          <path d="M5 12h14"/>
        </svg>
      </button>
      <button onClick={onToggleSettings} className="p-2 hover:bg-white/10 rounded" title="Settings">
        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
          <circle cx={12} cy={12} r={3}/>
        </svg>
      </button>
      <button onClick={onToggleShortcuts} className="p-2 hover:bg-white/10 rounded" title="Keyboard shortcuts">
        <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <rect x={2} y={4} width={20} height={16} rx={2}/>
          <path d="M6 8h.001"/>
          <path d="M10 8h.001"/>
          <path d="M14 8h.001"/>
          <path d="M18 8h.001"/>
          <path d="M8 12h.001"/>
          <path d="M12 12h.001"/>
          <path d="M16 12h.001"/>
          <path d="M7 16h10"/>
        </svg>
      </button>
    </div>
  );
}