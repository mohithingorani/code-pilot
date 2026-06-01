"use client";

import { SHORTCUTS } from "@/constants/editor";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0b0b] border border-paper/10 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-paper/10 flex justify-between items-center">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-paper">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-paper/10 text-paper/60 hover:text-acid transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-1 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-paper/5 last:border-0">
              <span className="text-paper/70 text-sm">{shortcut.action}</span>
              <kbd className="px-2.5 py-1 bg-paper/10 border border-paper/10 text-[11px] text-paper/90 font-mono">{shortcut.keys}</kbd>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-paper/10">
          <p className="font-mono text-[10px] uppercase tracking-wider text-paper/30 text-center">Press Escape to close</p>
        </div>
      </div>
    </div>
  );
}