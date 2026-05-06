"use client";

import NavBar from "@/components/NavBar2";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <div className="relative min-h-screen text-white selection:bg-white/20">
      <NavBar />
      
      <main className="relative pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto flex flex-col items-center">
        
        {/* Hero Section */}
        <section className="relative z-10 py-20 md:py-32 flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-gray-400 backdrop-blur-sm"
          >
            Powered by next-gen AI
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-6xl md:text-8xl font-bold tracking-tight mb-8 bg-gradient-to-b from-white to-gray-500 bg-clip-text text-transparent"
          >
            Code at the speed <br /> of thought.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl leading-relaxed"
          >
            Code Pilot is the world's most advanced real-time collaborative IDE 
            with integrated AI that actually understands your intent.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 items-center"
          >
            <a href="/join">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-4 bg-white text-black rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]"
              >
                Start Coding Now
              </motion.button>
            </a>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-xl font-medium text-lg hover:bg-white/10 transition-colors backdrop-blur-sm">
              Watch Demo
            </button>
          </motion.div>
        </section>

        {/* Features Grid */}
        <section id="features" className="w-full py-24 border-t border-white/5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Real-time Sync",
                desc: "Zero-latency collaboration. Watch your teammates code in real-time without the lag.",
                icon: "⚡"
              },
              {
                title: "Contextual AI",
                desc: "An AI pair programmer that knows your whole codebase, not just the file you're in.",
                icon: "🧠"
              },
              {
                title: "Cloud Dev Environments",
                desc: "Spin up a full development environment in seconds. No more 'works on my machine'.",
                icon: "☁️"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative p-8 rounded-3xl bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-2xl border border-white/10 hover:border-white/20 transition-all duration-500 shadow-2xl overflow-hidden"
              >
                {/* Decorative glow */}
                <div className="absolute -inset-x-20 -top-20 h-40 w-80 bg-white/[0.03] blur-3xl group-hover:bg-white/[0.07] transition-colors duration-500" />
                
                <div className="relative z-10">
                  <div className="text-4xl mb-6">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3 text-white/90 group-hover:text-white transition-colors">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

      </main>
      
      {/* Footer-like element */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-500 text-sm">
        &copy; 2026 Code Pilot Inc. All rights reserved.
      </footer>
    </div>
  );
}
