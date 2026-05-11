"use client";

import { useEffect, useRef } from "react";

export default function XTerminal({ socket }: { socket: WebSocket | null }) {
  const terminalRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    if (!terminalRef.current) return;
    terminalRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
  };

  useEffect(() => {
    let term: import("xterm").Terminal | null = null;
    let fitAddon: import("xterm-addon-fit").FitAddon | null = null;
    let dispose = false;

    const init = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      if (dispose) return;

      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
        scrollback: 2000,
        theme: {
          background: "#000000",
          foreground: "#ffffff",
        },
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (!socket || !terminalRef.current) return;

      term.open(terminalRef.current);
      fitAddon.fit();
      term.focus();

      requestAnimationFrame(() => fitAddon?.fit());

      const handleResize = () => fitAddon?.fit();
      window.addEventListener("resize", handleResize);

      term.onData((data: string) => {
        socket.send(JSON.stringify({ type: "terminal", payload: { data } }));
      });

      const handleMessage = (event: MessageEvent) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "terminal") {
            const data = String(parsed.payload?.data ?? "");
            term?.write(data);
            setTimeout(scrollToBottom, 10);
          }
        } catch {
          // Ignore non-JSON messages.
        }
      };

      socket.addEventListener("message", handleMessage);

      return () => {
        window.removeEventListener("resize", handleResize);
        socket.removeEventListener("message", handleMessage);
      };
    };

    init();

    return () => {
      dispose = true;
      term?.dispose();
    };
  }, [socket]);

  return <div ref={terminalRef} className="w-full h-full" />;
}
