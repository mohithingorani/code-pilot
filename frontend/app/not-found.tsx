"use client";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-neutral-950 to-black" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[180px]" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/3 rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 text-center px-6">
        <div className="mb-8">
          <span className="text-[120px] sm:text-[160px] font-bold text-transparent bg-clip-text bg-gradient-to-b from-white/20 to-white/5 leading-none select-none">
            404
          </span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
            Page not found
          </h1>
          <p className="text-gray-500 text-base max-w-md mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-4">
          <Link 
            href="/dashboard"
            className="px-6 py-3 bg-white text-black rounded-xl font-medium hover:bg-gray-100 transition-all duration-200"
          >
            Go to Dashboard
          </Link>
          <Link 
            href="/"
            className="px-6 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-200 border border-white/10"
          >
            Go Home
          </Link>
        </div>

        <div className="mt-16 flex items-center justify-center gap-8 text-gray-600 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-emerald-500/50 rounded-full" />
            <span>All systems operational</span>
          </div>
          <div>|</div>
          <span>v1.0.0</span>
        </div>
      </div>
    </div>
  );
}