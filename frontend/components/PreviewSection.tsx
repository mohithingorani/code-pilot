"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import WindowFrame from "./WindowFrame";

type Tab = "editor" | "terminal";

export default function PreviewSection() {
  const [activeTab, setActiveTab] = useState<Tab>("editor");

  const editorLines = [
    { num: 1, code: '<span class="text-white/30">import</span> { useState } <span class="text-white/30">from</span> <span class="text-white/40">"react"</span>' },
    { num: 2, code: '' },
    { num: 3, code: '<span class="text-white/30">export default function</span> <span class="text-white/50">Home</span>() {' },
    { num: 4, code: '  <span class="text-white/30">const</span> [count, setCount] = <span class="text-white/30">useState</span>(<span class="text-white/30">0</span>)' },
    { num: 5, code: '' },
    { num: 6, code: '  <span class="text-white/30">return</span> (' },
    { num: 7, code: '    <span class="text-white/30">&#60;div></span>' },
    { num: 8, code: '      <span class="text-white/30">&#60;h1></span>Count: {count}<span class="text-white/30">&#60;/h1></span>' },
    { num: 9, code: '      <span class="text-white/30">&#60;button</span> <span class="text-white/40">onClick</span>={() => setCount(c => c + <span class="text-white/30">1</span>)}>' },
    { num: 10, code: '        Increment' },
    { num: 11, code: '      <span class="text-white/30">&#60;/button></span>' },
    { num: 12, code: '    <span class="text-white/30">&#60;/div></span>' },
    { num: 13, code: '  )' },
    { num: 14, code: '}' },
  ];

  return (
    <div className="w-full">
      <div className="flex items-center gap-1 mb-6">
        <button
          onClick={() => setActiveTab("editor")}
          className="relative px-4 py-2 text-xs font-mono transition-colors"
        >
          <span className={activeTab === "editor" ? "text-white/50" : "text-white/20"}>editor</span>
          {activeTab === "editor" && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-4 right-4 h-px bg-white/20"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("terminal")}
          className="relative px-4 py-2 text-xs font-mono transition-colors"
        >
          <span className={activeTab === "terminal" ? "text-white/50" : "text-white/20"}>terminal</span>
          {activeTab === "terminal" && (
            <motion.div 
              layoutId="activeTab"
              className="absolute bottom-0 left-4 right-4 h-px bg-white/20"
            />
          )}
        </button>
      </div>

      <div className="min-h-[280px]">
        {activeTab === "editor" ? (
          <WindowFrame title="app/page.tsx">
            <div className="flex font-mono text-sm">
              <div className="flex flex-col pr-4 text-white/10 select-none">
                {editorLines.map((line) => (
                  <span key={line.num}>{line.num}</span>
                ))}
              </div>
              <div
                className="text-white/70 leading-6"
                dangerouslySetInnerHTML={{ __html: editorLines.map((l) => l.code).join("<br/>") }}
              />
              <span className="inline-block w-2 bg-white/50 h-4 ml-0.5 align-middle" />
            </div>
          </WindowFrame>
        ) : (
          <WindowFrame title="Terminal">
            <div className="font-mono text-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/40">~/code-pilot</span>
                <span className="text-white/20">git:main</span>
                <span className="text-white/20">❯</span>
              </div>
              <div className="text-white/60 mb-1">
                $ npm run dev
              </div>
              <div className="text-white/30 mb-3">
                <span className="text-white/20">→</span> Running on localhost:3000
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-white/40">~/code-pilot</span>
                <span className="text-white/20">❯</span>
                <span className="inline-block w-2 h-4 bg-white/40 animate-pulse ml-1" />
              </div>
            </div>
          </WindowFrame>
        )}
      </div>
    </div>
  );
}