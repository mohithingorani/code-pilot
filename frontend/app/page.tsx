"use client";

import NavBar from "@/components/NavBar2";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

const faqData = [
  {
    question: "Is my code private?",
    answer: "Yes. Your code is encrypted in transit and at rest. Only you and people you explicitly invite can access your projects."
  },
  {
    question: "Can I work offline?",
    answer: "Code Pilot requires an internet connection for real-time collaboration. However, your code is saved continuously so you never lose work."
  },
  {
    question: "What languages are supported?",
    answer: "We support JavaScript, TypeScript, Python, Java, C++, and Markdown. More languages are coming soon."
  },
  {
    question: "Do you train AI models on my code?",
    answer: "No. We never use your code for AI training. Your intellectual property remains yours."
  },
];

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="relative min-h-screen text-white selection:bg-white/20">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[#050505]" />
        <div className="absolute inset-0" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noise\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noise)\' opacity=\'0.015\'/%3E%3C/svg%3E")' }} />
      </div>

      <NavBar />

      <main className="relative pt-24  px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center">

        {/* Hero Section */}
        <section className="relative z-10 py-12 md:py-20 flex flex-col items-center text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl sm:text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-4 sm:mb-6 leading-[0.95]"
          >
            <span className="bg-linear-to-b from-white to-gray-500 bg-clip-text text-transparent">
              Code at the speed <br className="hidden sm:block" /> of thought.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-base sm:text-lg md:text-xl text-white/50 mb-8 sm:mb-10 max-w-xl leading-relaxed px-4 sm:px-0"
          >
            Real-time collaborative IDE for teams who ship faster.
          </motion.p>

          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => {
              const token = localStorage.getItem("token");
              router.push(token ? "/dashboard" : "/join");
            }}
            className="w-full sm:w-auto px-8 py-3.5 bg-white text-black rounded-lg text-base font-medium hover:bg-gray-100 transition-colors"
          >
            Start Coding Now
          </motion.button>
        </section>

        {/* Preview Section */}
        <motion.section
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="w-full py-12 sm:py-16 border-t border-white/5"
        >
          <div className="max-w-3xl mx-auto px-2 sm:px-0 overflow-x-hidden">
            <PreviewSection />
          </div>
        </motion.section>

        {/* Features Grid */}
        <section id="features" className="w-full py-16 border-t border-white/5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                num: "01",
                title: "Real-time Sync",
                desc: "See your team's cursors move as it happens. No refresh, no delays.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                )
              },
              {
                num: "02",
                title: "Contextual AI",
                desc: "Code completion that understands your project, not just the file you're in.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.335.041-.67.072-1.005.072m0 0h.008m.008 0c-.335.041-.67.072-1.005.072m0 0h.008m.008 0c-.335.041-.67.072-1.005.072m0 0h.008m5.667-3.025c-.335.041-.67.072-1.005.072m0 0h.008m.008 0c-.335.041-.67.072-1.005.072m0 0h.008m5.667-3.025c-.335.041-.67.072-1.005.072m-9.75 9.25c-.335.041-.67.072-1.005.072m0 0h.008m.008 0c-.335.041-.67.072-1.005.072m0 0h.008m.008 0c-.335.041-.67.072-1.005.072M12 18a3.75 3.75 0 00.495-7.467 5.99 5.99 0 00-1.925 3.546 5.974 5.974 0 01-2.133-1.001A3.75 3.75 0 0012 18z" />
                  </svg>
                )
              },
              {
                num: "03",
                title: "Cloud Dev Environments",
                desc: "Run your project from any browser. Same setup, everywhere.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.848 5.25 5.25 0 00-10.233 2.33A4.502 4.502 0 002.25 15z" />
                  </svg>
                )
              },
              {
                num: "04",
                title: "Instant Sharing",
                desc: "Share your workspace with a link. Collaborators join instantly.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
                  </svg>
                )
              },
              {
                num: "05",
                title: "Built-in Terminal",
                desc: "Run npm, git, and all your favorite tools without leaving the editor.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                )
              },
              {
                num: "06",
                title: "Version History",
                desc: "Every change is saved. Browse history, restore previous versions.",
                icon: (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -2 }}
                className="group relative p-4 md:p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-white/30">{feature.num}</span>
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-white/40 group-hover:text-white/70 group-hover:bg-white/10 transition-all">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-base font-medium mb-2 text-white/80 group-hover:text-white/90 transition-colors">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/50 transition-colors">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="w-full py-12 sm:py-16 border-t border-white/5">
          <div className="max-w-2xl mx-auto px-4 sm:px-0">
            <h2 className="text-lg sm:text-xl font-medium text-white/80 mb-6 sm:mb-8 text-center">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqData.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="border border-white/10 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-4 sm:px-5 py-3 sm:py-4 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="text-sm text-white/70 pr-2">{faq.question}</span>
                    <motion.svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={16}
                      height={16}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      animate={{ rotate: openFaq === i ? 180 : 0 }}
                      className="text-white/40 shrink-0"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </motion.svg>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pt-3 pb-4 text-sm text-white/40">{faq.answer}</p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

      

      </main>

      <footer className="border-t border-white/10 bg-black mt-16 sm:mt-20 relative z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 py-10 md:py-16">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
              </div>
              <span className="text-white font-medium">Code Pilot</span>
            </div>
            <div className="flex items-center gap-5">
              <a href="/join" className="text-white/40 hover:text-white transition-colors text-sm">Join</a>
              <a href="/dashboard" className="text-white/40 hover:text-white transition-colors text-sm">Dashboard</a>
              <a
                href="https://github.com/mohithingorani/code-pilot"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </a>
              <a
                href="https://www.linkedin.com/in/mohithingorani/"
                target="_blank"
                rel="noreferrer"
                className="w-8 h-8 rounded-lg border border-white/5 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div className="pt-6 mt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-white/30 text-sm">
              &copy; 2026 Code Pilot Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function PreviewSection() {
  const [activeTab, setActiveTab] = useState<"editor" | "terminal">("editor");

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

function WindowFrame({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-white/5 overflow-hidden bg-black/30 shadow-[0_0_60px_rgba(255,255,255,0.02)]"
    >
      <div className="px-3 sm:px-4 py-2 border-b border-white/5">
        <span className="text-xs text-white/30 font-mono">{title}</span>
      </div>
      <div className="p-3 sm:p-4 overflow-x-auto">
        {children}
      </div>
    </motion.div>
  );
}