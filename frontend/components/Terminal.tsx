"use client";

import { useEffect, useRef } from "react";

export default function XTerminal({ socket }: { socket: WebSocket | null }) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const startupBufferRef = useRef("");
  const startupDoneRef = useRef(false);
  const startupFlushTimerRef = useRef<number | null>(null);
  const messageHandlerRef = useRef<((event: MessageEvent) => void) | null>(null);
  const resizeHandlerRef = useRef<(() => void) | null>(null);
  const termRef = useRef<import("xterm").Terminal | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    let term: import("xterm").Terminal | null = null;
    let fitAddon: import("xterm-addon-fit").FitAddon | null = null;
    let dispose = false;
    let currentSocket: WebSocket | null = null;

    const init = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      if (dispose) return;
      if (!socket) return;
      if (!terminalRef.current) return;

      currentSocket = socket;
      socketRef.current = socket;

      term = new Terminal({
        cursorBlink: true,
        fontSize: 13,
        scrollback: 2000,
        fontFamily: "'JetBrains Mono', ui-monospace, 'SF Mono', monospace",
        letterSpacing: 0.3,
        theme: {
          background: "#0b0b0b",
          foreground: "#ece9e1",
          cursor: "#d8ff3e",
          cursorAccent: "#0b0b0b",
          selectionBackground: "#d8ff3e33",
          black: "#0b0b0b",
          brightBlack: "#5c5c54",
          green: "#d8ff3e",
          brightGreen: "#d8ff3e",
        },
      });
      termRef.current = term;

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      term.open(terminalRef.current);
      fitAddon.fit();
      term.focus();

      requestAnimationFrame(() => fitAddon?.fit());

      const handleResize = () => fitAddon?.fit();
      resizeHandlerRef.current = handleResize;
      window.addEventListener("resize", handleResize);

      term.onData((data: string) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: "terminal", payload: { data } }));
        }
      });

      const handleMessage = (event: MessageEvent) => {
        if (typeof event.data !== "string") return;
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.type === "terminal") {
            const chunk = String(parsed.payload?.data ?? "");

            if (!startupDoneRef.current) {
              startupBufferRef.current += chunk;

              const marker = ":/workspace#";
              const idx = startupBufferRef.current.indexOf(marker);
              if (idx !== -1) {
                const lineStart =
                  Math.max(
                    startupBufferRef.current.lastIndexOf("\n", idx),
                    startupBufferRef.current.lastIndexOf("\r", idx),
                  ) + 1;

                const cleaned = startupBufferRef.current.slice(lineStart);
                startupDoneRef.current = true;
                startupBufferRef.current = "";
                if (startupFlushTimerRef.current != null) {
                  window.clearTimeout(startupFlushTimerRef.current);
                  startupFlushTimerRef.current = null;
                }
                term?.write(cleaned);
              } else {
                if (startupBufferRef.current.length > 16_384) {
                  startupDoneRef.current = true;
                  term?.write(startupBufferRef.current);
                  startupBufferRef.current = "";
                }
              }
              return;
            }

            term?.write(chunk);
          }
        } catch {
        }
      };

      messageHandlerRef.current = handleMessage;
      currentSocket.addEventListener("message", handleMessage);
    };

    init();

    return () => {
      dispose = true;

      if (resizeHandlerRef.current) {
        window.removeEventListener("resize", resizeHandlerRef.current);
        resizeHandlerRef.current = null;
      }

      if (messageHandlerRef.current && currentSocket) {
        currentSocket.removeEventListener("message", messageHandlerRef.current);
        messageHandlerRef.current = null;
      }

      if (startupFlushTimerRef.current != null) {
        window.clearTimeout(startupFlushTimerRef.current);
        startupFlushTimerRef.current = null;
      }

      startupDoneRef.current = false;
      startupBufferRef.current = "";
      socketRef.current = null;

      term?.dispose();
      termRef.current = null;
    };
  }, [socket]);

  useEffect(() => {
    if (!socket) return;

    if (startupFlushTimerRef.current != null) {
      window.clearTimeout(startupFlushTimerRef.current);
    }

    startupFlushTimerRef.current = window.setTimeout(() => {
      if (startupDoneRef.current) return;
      startupDoneRef.current = true;
    }, 1500);

    return () => {
      if (startupFlushTimerRef.current != null) {
        window.clearTimeout(startupFlushTimerRef.current);
        startupFlushTimerRef.current = null;
      }
    };
  }, [socket]);

  return <div ref={terminalRef} className="w-full h-full" />;
}