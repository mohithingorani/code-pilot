import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Workspace — Code Pilot",
  description: "Browser-native IDE workspace.",
};

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="antialiased h-screen w-screen overflow-hidden bg-ink text-paper">
      {/* faint grid backdrop */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #ece9e1 1px, transparent 1px), linear-gradient(to bottom, #ece9e1 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {children}
    </div>
  );
}
