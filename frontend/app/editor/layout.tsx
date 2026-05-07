import type { Metadata } from "next";



export const metadata: Metadata = {
  title: "CODE PILOT",
  description: "ONLINE CODE EDITOR",
};

export default function EditorLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-[url('/wall2.png')] antialiased bg-cover bg-no-repeat bg-center h-screen w-screen overflow-hidden">
      {children}
    </div>
  );
}
