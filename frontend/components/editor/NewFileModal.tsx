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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#0A0A0A] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-semibold text-white">New File</h2>
          <p className="text-gray-500 text-sm mt-1">Enter a file name with extension</p>
        </div>
        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="main.py, index.js, app.ts"
            value={fileName}
            onChange={(e) => onFileNameChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onCreate()}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-white/30 transition"
            autoFocus
          />
        </div>
        <div className="p-6 border-t border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 rounded-xl border border-white/20 text-white hover:bg-white/5 transition font-medium"
          >
            Cancel
          </button>
          <button
            onClick={onCreate}
            disabled={!fileName.trim() || isCreating}
            className="flex-1 px-4 py-3 rounded-xl bg-white text-black font-medium hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}