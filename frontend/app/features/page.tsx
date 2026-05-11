"use client";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
    title: "Monaco Editor",
    description: "Industry-standard code editor with syntax highlighting, IntelliSense, and multi-cursor editing. Same engine powering VS Code.",
    tags: ["Syntax Highlighting", "IntelliSense", "Multi-cursor"]
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
        <rect x={2} y={3} width={20} height={14} rx={2} ry={2} />
        <line x1={8} y1={21} x2={16} y2={21} />
        <line x1={12} y1={17} x2={12} y2={21} />
      </svg>
    ),
    title: "Integrated Terminal",
    description: "Full-featured terminal emulator with Docker-based execution. Run Python, JavaScript, TypeScript, Java, C++, and more directly in your browser.",
    tags: ["xterm.js", "Docker", "Multi-language"]
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: "Project Management",
    description: "Create, edit, clone, and export projects as ZIP. Organize your work with an intuitive dashboard supporting grid and list views.",
    tags: ["CRUD Operations", "Grid/List Views", "ZIP Export"]
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
    title: "Split View",
    description: "Compare and work on multiple files side by side. Perfect for reviewing changes, comparing implementations, or working on related files.",
    tags: ["Side-by-side", "File Comparison", "Efficient Workflow"]
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
        <circle cx={12} cy={12} r={3} />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
    title: "Customizable Settings",
    description: "Personalize your experience with adjustable font sizes, toggle minimap, line numbers, word wrap, and smooth caret animation.",
    tags: ["Font Size", "Minimap", "Word Wrap"]
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className="text-white/80">
        <rect x={3} y={11} width={18} height={11} rx={2} ry={2} />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: "Auto-Save",
    description: "Never lose your work. Files are automatically saved after edits with configurable delay. Real-time sync keeps your work safe.",
    tags: ["Auto-Save", "Real-time Sync", "Configurable Delay"]
  },
];

const languages = [
  { name: "Python", icon: "🐍", color: "bg-yellow-500/20 text-yellow-400" },
  { name: "JavaScript", icon: "📜", color: "bg-amber-500/20 text-amber-400" },
  { name: "TypeScript", icon: "🔷", color: "bg-blue-500/20 text-blue-400" },
  { name: "Java", icon: "☕", color: "bg-orange-500/20 text-orange-400" },
  { name: "C++", icon: "⚡", color: "bg-cyan-500/20 text-cyan-400" },
  { name: "Markdown", icon: "📝", color: "bg-purple-500/20 text-purple-400" },
];

const shortcuts = [
  { keys: "Ctrl+S", action: "Save file" },
  { keys: "Ctrl+Enter", action: "Run code" },
  { keys: "Ctrl+F", action: "Find" },
  { keys: "Ctrl+H", action: "Find & Replace" },
  { keys: "Ctrl+Shift+L", action: "Toggle minimap" },
  { keys: "Ctrl+K Ctrl+M", action: "Keyboard shortcuts" },
];

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-neutral-950 to-black" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[200px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-white/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-white/10">
          <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-white to-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-black font-bold text-sm">C</span>
              </div>
              <span className="text-white font-semibold">CodePilot</span>
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/join" className="px-4 py-2 text-sm text-gray-400 hover:text-white transition">
                Sign In
              </Link>
              <Link href="/join" className="px-4 py-2 bg-white text-black text-sm font-medium rounded-lg hover:bg-gray-100 transition">
                Get Started
              </Link>
            </div>
          </div>
        </header>

        {/* Hero */}
        <section className="py-20 sm:py-28 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <span className="inline-block px-4 py-1.5 bg-white/10 border border-white/10 rounded-full text-sm text-gray-400 mb-6">
              Built for developers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
              Everything you need<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-300 to-gray-500">to build faster</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10">
              A modern online IDE with the tools you need to code efficiently. Monaco editor, integrated terminal, and seamless project management.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link href="/join" className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition">
                Start Coding Free
              </Link>
              <Link href="/dashboard" className="px-8 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition border border-white/10">
                View Demo
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Powerful Features</h2>
              <p className="text-gray-500 max-w-lg mx-auto">Built with the best tools to give you the best coding experience.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <div key={i} className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition group">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-white/20 transition">
                    {f.icon}
                  </div>
                  <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                  <p className="text-gray-500 text-sm mb-4 leading-relaxed">{f.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.tags.map((tag, j) => (
                      <span key={j} className="px-2 py-1 bg-white/5 rounded-md text-xs text-gray-500">{tag}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Languages */}
        <section className="py-16 px-6 border-t border-white/10">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Multi-Language Support</h2>
              <p className="text-gray-500 max-w-lg mx-auto">Run your favorite languages directly in the browser.</p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              {languages.map((lang, i) => (
                <div key={i} className={`px-6 py-3 rounded-xl ${lang.color} flex items-center gap-2 font-medium`}>
                  <span>{lang.icon}</span>
                  <span>{lang.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Shortcuts */}
        <section className="py-16 px-6 border-t border-white/10">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-4">Keyboard Shortcuts</h2>
              <p className="text-gray-500">Work efficiently with these keyboard shortcuts.</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {shortcuts.map((s, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                  <span className="text-gray-500 text-sm">{s.action}</span>
                  <kbd className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-white text-sm font-mono">
                    {s.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Ready to start coding?</h2>
            <p className="text-gray-500 mb-8 max-w-lg mx-auto">Join thousands of developers using CodePilot to build their projects.</p>
            <Link href="/join" className="inline-block px-10 py-4 bg-white text-black rounded-xl font-semibold hover:bg-gray-100 transition">
              Create Free Account
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-8 px-6">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-gradient-to-br from-white to-gray-200 rounded-md flex items-center justify-center">
                <span className="text-black font-bold text-xs">C</span>
              </div>
              <span className="text-gray-500 text-sm">CodePilot v1.0.0</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-600">
              <Link href="/features" className="hover:text-white transition">Features</Link>
              <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
              <span>© 2026 CodePilot</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}