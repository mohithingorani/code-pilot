"use client";

import { motion } from "framer-motion";

interface WindowFrameProps {
  title: string;
  children: React.ReactNode;
  active?: boolean;
}

export default function WindowFrame({ title, children, active = true }: WindowFrameProps) {
  return (
    <motion.div 
      className="rounded-xl border overflow-hidden bg-black/30"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className={`px-4 py-2 border-b transition-colors ${active ? 'border-white/5' : 'border-white/5'}`}>
        <span className={`text-xs font-mono transition-colors ${active ? 'text-white/30' : 'text-white/20'}`}>{title}</span>
      </div>
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  );
}