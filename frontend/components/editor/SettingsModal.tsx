"use client";

interface EditorSettings {
  minimap: boolean;
  lineNumbers: boolean;
  wordWrap: boolean;
  fontSize: number;
  tabSize: number;
  smoothCaret: boolean;
  autoSave: boolean;
  autoSaveDelay: number;
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: EditorSettings;
  onSettingsChange: (updater: EditorSettings | ((prev: EditorSettings) => EditorSettings)) => void;
}

export default function SettingsModal({ isOpen, onClose, settings, onSettingsChange }: SettingsModalProps) {
  if (!isOpen) return null;

  const toggle = (key: keyof EditorSettings) => {
    if (typeof settings[key] === "boolean") {
      onSettingsChange((prev: EditorSettings) => {
        const updated = { ...prev, [key]: !prev[key as keyof EditorSettings] };
        return updated;
      });
    }
  };

  const updateSetting = (key: keyof EditorSettings, value: number) => {
    onSettingsChange((prev: EditorSettings) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0b0b] border border-paper/10 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-paper/10 flex justify-between items-center">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-paper">Editor Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-paper/10 text-paper/60 hover:text-acid transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M18 6 6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div className="p-6 space-y-6">
          <ToggleSetting
            label="Minimap"
            value={settings.minimap}
            onToggle={() => toggle("minimap")}
          />
          <ToggleSetting
            label="Line Numbers"
            value={settings.lineNumbers}
            onToggle={() => toggle("lineNumbers")}
          />
          <ToggleSetting
            label="Word Wrap"
            value={settings.wordWrap}
            onToggle={() => toggle("wordWrap")}
          />
          <ToggleSetting
            label="Smooth Caret"
            value={settings.smoothCaret}
            onToggle={() => toggle("smoothCaret")}
          />
          <ToggleSetting
            label="Auto Save"
            value={settings.autoSave}
            onToggle={() => toggle("autoSave")}
          />
          <SliderSetting
            label={`Font Size: ${settings.fontSize}px`}
            value={settings.fontSize}
            min={12}
            max={24}
            onChange={(val) => updateSetting("fontSize", val)}
          />
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-paper/80 text-sm">Tab Size: {settings.tabSize} spaces</span>
            </div>
            <div className="flex gap-2">
              {[2, 4].map(size => (
                <button
                  key={size}
                  onClick={() => updateSetting("tabSize", size)}
                  className={`flex-1 py-2 text-sm font-mono transition ${
                    settings.tabSize === size
                      ? "bg-acid text-ink"
                      : "bg-paper/10 text-paper/80 hover:bg-paper/20"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ToggleSetting({ label, value, onToggle }: { label: string; value: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-paper/80 text-sm">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition ${value ? "bg-acid" : "bg-paper/20"}`}
      >
        <div className={`w-5 h-5 rounded-full transition transform ${value ? "translate-x-6 bg-ink" : "translate-x-0.5 bg-paper"}`} />
      </button>
    </div>
  );
}

function SliderSetting({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (val: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-paper/80 text-sm">{label}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-[#d8ff3e]"
      />
    </div>
  );
}