"use client";
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import api from "@/lib/api";

export default function NavBar() {
    const router = useRouter();
    const [hasToken, setHasToken] = useState(false);
    const [userEmail, setUserEmail] = useState("");
    const [showUserMenu, setShowUserMenu] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const sync = () => setHasToken(!!localStorage.getItem("token"));
        sync();
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    useEffect(() => {
        if (hasToken) {
            const fetchUser = async () => {
                try {
                    const res = await api.get("/api/users/me");
                    setUserEmail(res.data.email || "");
                } catch (error) {
                    console.error("Error fetching user:", error);
                }
            };
            fetchUser();
        }
    }, [hasToken]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setShowUserMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 bg-black/20 backdrop-blur-md border-b border-white/5">
            <div className="text-2xl font-bold tracking-tighter bg-linear-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Code Pilot
            </div> 
            <div className="flex items-center gap-8">
                <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                    <button className="hover:text-white transition-colors">Features</button> 
                    <button className="hover:text-white transition-colors">Documentation</button> 
                </div>
                {hasToken ? (
                    <div className="flex items-center gap-3 relative" ref={menuRef}>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="bg-white text-black px-5 py-2 rounded-md text-sm hover:bg-gray-200 transition-colors"
                        >
                            Dashboard
                        </motion.button>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            onMouseEnter={() => setShowUserMenu(true)}
                            className="p-2 rounded-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition"
                        >
                            <div className="w-6 h-6 rounded bg-white/20 flex items-center justify-center">
                                <span className="text-white/60 text-xs font-semibold">{userEmail ? userEmail[0].toUpperCase() : ""}</span>
                            </div>
                        </button>
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 bg-[#0f0f0f] border border-white/10 rounded-xl py-2 w-56 shadow-xl z-50"
                                >
                                    <div className="px-4 py-2 border-b border-white/5">
                                        <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("token");
                                            setHasToken(false);
                                            router.replace("/");
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-gray-400 hover:text-white hover:bg-white/5 transition flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                                            <polyline points="16 17 21 12 16 7" />
                                            <line x1={21} x2={9} y1={12} y2={12} />
                                        </svg>
                                        Sign out
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                ) : (
                    <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        type="button"
                        onClick={() => router.push("/join")}
                        className="bg-white text-black px-5 py-2 rounded-md text-sm font-bold hover:bg-gray-200 transition-colors"
                    >
                        Get Started
                    </motion.button>
                )}
            </div> 
        </nav>
    )
}
