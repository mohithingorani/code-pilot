"use client";

interface NewFileModalProps {
  isOpen: boolean;
  fileName: string;
  isCreating: boolean;
  onFileNameChange: (name: string) => void;
  onCreate: () => void;
  onClose: () => void;
}

export default function NewFileModal({ isOpen, fileName, isCreating, onFileNameChange, onCreate, onClose }: NewFileModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-ink/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0b0b0b] border border-paper/10 rounded-lg w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-paper/10">
          <h2 className="font-display text-xl font-bold uppercase tracking-tight text-paper">New File</h2>
          <p className="text-paper/40 font-mono text-xs mt-1.5">Enter a file name with extension</p>
        </div>
        <div className="p-6">
          <input
            type="text"
            placeholder="main.py, index.js, app.ts"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
            className="w-full bg-paper/5 border border-paper/15 rounded-md px-4 py-3 font-mono text-sm text-paper placeholder-paper/30 focus:outline-none focus:border-acid/60 transition"
            autoFocus
          />
        </div>
        <div className="p-6 border-t border-paper/10 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-md border border-paper/20 text-paper/80 hover:bg-paper/5 transition font-mono text-xs uppercase tracking-wider"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!fileName.trim() || isCreating}
            className="flex-1 px-4 py-3 rounded-md bg-acid text-ink font-mono text-xs uppercase tracking-wider font-medium hover:-translate-y-0.5 transition-transform disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}