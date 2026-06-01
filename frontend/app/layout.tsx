import type { Metadata } from "next";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "xterm/css/xterm.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-display",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Code Pilot — Code at the speed of thought",
  description:
    "A real-time, browser-native IDE. Write, run, and ship code from any browser in isolated containers — no setup, no installs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="grain bg-ink text-paper antialiased">
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
