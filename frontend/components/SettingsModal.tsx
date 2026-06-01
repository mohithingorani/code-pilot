"use client";

import { DashboardSettings } from "@/hooks/useDashboardSettings";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DashboardSettings;
  onUpdate: (updates: Partial<DashboardSettings>) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onUpdate }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0b0b] border border-paper/10 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-paper/10 flex justify-between items-center">
          <div>
            <h2 className="font-display text-xl font-bold uppercase tracking-tight text-paper">Settings</h2>
            <p className="font-mono text-xs text-paper/40 mt-1">Manage your preferences</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-paper/10 text-paper/60 hover:text-acid transition">
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block font-mono text-[11px] uppercase tracking-wider text-paper/40 mb-3">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ theme: "dark" })}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-wider transition ${
                  settings.theme === "dark"
                    ? "bg-acid text-ink"
                    : "bg-paper/10 text-paper/80 hover:bg-paper/20"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => onUpdate({ theme: "light" })}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-wider transition ${
                  settings.theme === "light"
                    ? "bg-acid text-ink"
                    : "bg-paper/10 text-paper/80 hover:bg-paper/20"
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-paper/80 text-sm">Editor Font Size: {settings.editorFontSize}px</label>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              value={settings.editorFontSize}
              onChange={(e) => onUpdate({ editorFontSize: parseInt(e.target.value) })}
              className="w-full accent-[#d8ff3e]"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-paper/80 text-sm">Auto Save Delay: {settings.autoSaveDelay}ms</label>
            </div>
            <input
              type="range"
              min={500}
              max={3000}
              step={100}
              value={settings.autoSaveDelay}
              onChange={(e) => onUpdate({ autoSaveDelay: parseInt(e.target.value) })}
              className="w-full accent-[#d8ff3e]"
            />
          </div>
        </div>

        <div className="p-6 border-t border-paper/10">
          <button onClick={onClose} className="w-full px-4 py-3 bg-acid text-ink font-mono text-xs uppercase tracking-wider font-medium hover:-translate-y-0.5 transition-transform">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}