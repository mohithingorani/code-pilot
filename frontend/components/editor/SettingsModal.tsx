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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-white">Editor Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}>
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
              <span className="text-white/80">Tab Size: {settings.tabSize} spaces</span>
            </div>
            <div className="flex gap-2">
              {[2, 4].map(size => (
                <button
                  key={size}
                  onClick={() => updateSetting("tabSize", size)}
                  className={`flex-1 py-2 rounded-lg text-sm transition ${
                    settings.tabSize === size 
                      ? "bg-white text-black" 
                      : "bg-white/10 text-white/80 hover:bg-white/20"
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
      <span className="text-white/80">{label}</span>
      <button
        onClick={onToggle}
        className={`w-12 h-6 rounded-full transition ${value ? "bg-emerald-500" : "bg-white/20"}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full transition transform ${value ? "translate-x-6" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SliderSetting({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (val: number) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-white/80">{label}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-white"
      />
    </div>
  );
}