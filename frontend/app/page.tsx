"use client";

import NavBar from "@/components/NavBar2";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import PreviewSection from "@/components/PreviewSection";

export default function Home() {
  const router = useRouter();

  return (
    <div className="relative min-h-screen text-white selection:bg-white/20">
      <NavBar />
      
      <main className="relative pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="relative z-10 py-20 md:py-28 flex flex-col items-center text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-6 leading-[0.95]"
          >
            <span className="bg-linear-to-b from-white to-gray-500 bg-clip-text text-transparent">
              Code at the speed <br /> of thought.
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="md:text-xl text-white/50 mb-10 max-w-xl leading-relaxed"
          >
            Real-time collaborative IDE for teams who ship faster.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-3 items-center"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                const token = localStorage.getItem("token");
                router.push(token ? "/dashboard" : "/join");
              }}
              className="px-6 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Start Coding
            </motion.button>
            <button className="px-6 py-2.5 bg-white/5 border border-white/10 rounded-lg text-sm hover:bg-white/10 transition-colors">
              Watch Demo
            </button>
          </motion.div>
        </section>

        {/* Preview Section with Tabs */}
        <section className="w-full py-24 border-t border-white/5">
          <div className="max-w-3xl mx-auto">
            <PreviewSection />
          </div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-20 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Real-time Sync",
                desc: "Zero-latency collaboration. Watch your teammates code in real-time without the lag."
              },
              {
                num: "02",
                title: "Contextual AI",
                desc: "An AI pair programmer that knows your whole codebase, not just the file you're in."
              },
              {
                num: "03",
                title: "Cloud Dev Environments",
                desc: "Spin up a full development environment in seconds. No more 'works on my machine'."
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -2 }}
                className="group relative p-6 rounded-2xl border border-white/10 hover:border-white/20 transition-all cursor-pointer"
              >
                <span className="text-xs font-mono text-white/30 mb-3 block group-hover:text-white/40 transition-colors">{feature.num}</span>
                <h3 className="text-base font-medium mb-2 text-white/80 group-hover:text-white/90 transition-colors">{feature.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed group-hover:text-white/50 transition-colors">{feature.desc}</p>
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
      
      <footer className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-gray-500">
            <div>&copy; 2026 Code Pilot Inc.</div>
            <nav className="flex items-center gap-5">
              <a className="hover:text-gray-200 transition-colors" href="#features">Features</a>
              <a className="hover:text-gray-200 transition-colors" href="/join">Join</a>
              <a className="hover:text-gray-200 transition-colors" href="/dashboard">Dashboard</a>
              <a
                className="hover:text-gray-200 transition-colors"
                href="https://github.com/mohithingorani/code-pilot"
                target="_blank"
                rel="noreferrer"
              >
                GitHub
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </div>
  );
}