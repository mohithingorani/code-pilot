"use client";
import { motion } from "framer-motion"

export default function NavBar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 bg-black/20 backdrop-blur-md border-b border-white/5">
            <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Code Pilot
            </div> 
            <div className="flex items-center gap-8">
                <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                    <a href="/features" className="hover:text-white transition-colors">Features</a> 
                    <a href="/dashboard" className="hover:text-white transition-colors">Dashboard</a> 
                    <a href="/join" className="hover:text-white transition-colors">Sign In</a> 
                </div>
                <a href="/join">
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                        Get Started
                    </motion.button>
                </a>
            </div> 
        </nav>
    )
}