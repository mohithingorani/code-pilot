"use client";
import { motion } from "framer-motion"
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NavBar() {
    const router = useRouter();
    const [hasToken, setHasToken] = useState(false);

    useEffect(() => {
        const sync = () => setHasToken(!!localStorage.getItem("token"));
        sync();
        window.addEventListener("storage", sync);
        return () => window.removeEventListener("storage", sync);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 bg-black/20 backdrop-blur-md border-b border-white/5">
            <div className="text-2xl font-bold tracking-tighter bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Code Pilot
            </div> 
            <div className="flex items-center gap-8">
                <div className="hidden md:flex gap-6 text-sm font-medium text-gray-400">
                    <button className="hover:text-white transition-colors">Features</button> 
                    <button className="hover:text-white transition-colors">Documentation</button> 
                </div>
                {hasToken ? (
                    <div className="flex items-center gap-3">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => router.push("/dashboard")}
                            className="bg-white text-black px-5 py-2 rounded-md text-sm  hover:bg-gray-200 transition-colors"
                        >
                            Dashboard
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => {
                                localStorage.removeItem("token");
                                setHasToken(false);
                                router.replace("/");
                            }}
                            className="bg-white/5 border border-white/10 text-white px-5 py-2 rounded-md text-sm  hover:bg-white/10 hover:border-white/20 transition-colors"
                        >
                            Sign out
                        </motion.button>
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
