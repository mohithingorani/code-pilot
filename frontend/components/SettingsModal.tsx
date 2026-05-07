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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <p className="text-gray-500 text-sm mt-1">Manage your preferences</p>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-white/5 transition">
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-white/80 text-sm mb-3">Theme</label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ theme: "dark" })}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
                  settings.theme === "dark"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => onUpdate({ theme: "light" })}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition ${
                  settings.theme === "light"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/80 hover:bg-white/20"
                }`}
              >
                Light
              </button>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/80 text-sm">Editor Font Size: {settings.editorFontSize}px</label>
            </div>
            <input
              type="range"
              min={12}
              max={24}
              value={settings.editorFontSize}
              onChange={(e) => onUpdate({ editorFontSize: parseInt(e.target.value) })}
              className="w-full accent-white"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-white/80 text-sm">Auto Save Delay: {settings.autoSaveDelay}ms</label>
            </div>
            <input
              type="range"
              min={500}
              max={3000}
              step={100}
              value={settings.autoSaveDelay}
              onChange={(e) => onUpdate({ autoSaveDelay: parseInt(e.target.value) })}
              className="w-full accent-white"
            />
          </div>
        </div>

        <div className="p-6 border-t border-white/5">
          <button onClick={onClose} className="w-full px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}