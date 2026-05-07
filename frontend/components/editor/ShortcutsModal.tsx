"use client";

import { SHORTCUTS } from "@/constants/editor";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto">
          {SHORTCUTS.map((shortcut, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
              <span className="text-white/70">{shortcut.action}</span>
              <kbd className="px-3 py-1 bg-white/10 rounded text-xs text-white font-mono">{shortcut.keys}</kbd>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-white/5">
          <p className="text-xs text-gray-500 text-center">Press Escape to close</p>
        </div>
      </div>
    </div>
  );
}