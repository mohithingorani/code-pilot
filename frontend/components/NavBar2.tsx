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
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-5 sm:px-8 md:px-12 py-5 bg-[#050505]/70 backdrop-blur-md border-b border-[#ece9e1]/10">
            <a href="/" className="font-display text-lg font-bold uppercase tracking-tight text-[#ece9e1]">
                Code<span className="text-[#d8ff3e]">/</span>Pilot
            </a>
            <div className="flex items-center gap-6 sm:gap-8">
                <div className="hidden md:flex gap-7 font-mono text-[11px] uppercase tracking-[0.2em] text-[#ece9e1]/45">
                    <a href="#features" className="hover:text-[#d8ff3e] transition-colors">Features</a>
                    <a href="#how-it-works" className="hover:text-[#d8ff3e] transition-colors">How it works</a>
                    <a href="#faq" className="hover:text-[#d8ff3e] transition-colors">FAQ</a>
                </div>
                {hasToken ? (
                    <div className="flex items-center gap-3 relative" ref={menuRef}>
                        <motion.button
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.97 }}
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="bg-[#d8ff3e] text-[#050505] px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-transform"
                        >
                            Dashboard
                        </motion.button>
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="p-2 bg-[#ece9e1]/5 border border-[#ece9e1]/10 hover:border-[#ece9e1]/30 transition"
                        >
                            <div className="w-6 h-6 bg-[#ece9e1]/15 flex items-center justify-center">
                                <span className="text-[#ece9e1]/70 text-xs font-semibold">{userEmail ? userEmail[0].toUpperCase() : ""}</span>
                            </div>
                        </button>
                        <AnimatePresence>
                            {showUserMenu && (
                                <motion.div
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 5 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 bg-[#0b0b0b] border border-[#ece9e1]/10 py-2 w-56 shadow-xl z-50"
                                >
                                    <div className="px-4 py-2 border-b border-[#ece9e1]/5">
                                        <p className="text-xs text-[#ece9e1]/40 truncate font-mono">{userEmail}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("token");
                                            setHasToken(false);
                                            router.replace("/");
                                        }}
                                        className="w-full px-4 py-2.5 text-left text-sm text-[#ece9e1]/50 hover:text-[#d8ff3e] hover:bg-[#ece9e1]/5 transition flex items-center gap-2"
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
                        whileHover={{ y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        type="button"
                        onClick={() => router.push("/join")}
                        className="bg-[#d8ff3e] text-[#050505] px-5 py-2.5 font-mono text-xs uppercase tracking-wider hover:-translate-y-0.5 transition-transform"
                    >
                        Get Started
                    </motion.button>
                )}
            </div>
        </nav>
    )
}
