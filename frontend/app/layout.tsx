import type { Metadata } from "next";
import "./globals.css";
import "xterm/css/xterm.css";
import DotBackground from "@/components/DotBackground";


export const metadata: Metadata = {
  title: "CODE PILOT",
  description: "An AI-powered code review assistant that helps developers improve their code quality and productivity.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
       <body >
        
        <div className="fixed inset-0 -z-10">
          <DotBackground />
        </div>

        {/* Content */}
        <main className="min-h-screen">
          {children}
        </main>

      </body>
    </html>
  );
}
