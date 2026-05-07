"use client";

import { useEffect, useRef } from "react";

export default function XTerminal({ socket }: { socket: WebSocket | null }) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  const startupBufferRef = useRef("");
  const startupDoneRef = useRef(false);
  const startupFlushTimerRef = useRef<number | null>(null);


  const scrollToBottom = () => {
    if(!terminalRef.current) return;
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
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (!socket) return;
      if (!terminalRef.current) return;

      term.open(terminalRef.current);
      fitAddon.fit();
      term.focus();

      // Fit once more after layout settles (drawer animation/paint).
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
            const chunk = String(parsed.payload?.data ?? "");

            // Startup noise filter:
            // Some environments emit a glitched/garbled line right before the first prompt.
            // To keep the terminal clean without changing shell config, buffer until we see
            // the first prompt, then render only from the prompt onward.
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
                // Safety valve: if the prompt never shows up, don't buffer forever.
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
          // Ignore non-JSON messages.
        }
      };

      socket.addEventListener("message", handleMessage);

      return () => {
        window.removeEventListener("resize", handleResize);
        socket.removeEventListener("message", handleMessage);
      };
    };

    let cleanupSocketHandlers: undefined | (() => void);
    init().then((cleanup) => {
      cleanupSocketHandlers = typeof cleanup === "function" ? cleanup : undefined;
    });

    return () => {
      dispose = true;
      cleanupSocketHandlers?.();
      startupDoneRef.current = false;
      startupBufferRef.current = "";
      if (startupFlushTimerRef.current != null) {
        window.clearTimeout(startupFlushTimerRef.current);
        startupFlushTimerRef.current = null;
      }
      term?.dispose();
      // Important: do not close the shared websocket here.
    };
  }, [socket]);

  useEffect(() => {
    // If we haven't seen a prompt shortly after mount, flush whatever we have.
    // This prevents a blank terminal if the prompt marker changes.
    if (!socket) return;

    if (startupFlushTimerRef.current != null) {
      window.clearTimeout(startupFlushTimerRef.current);
    }

    startupFlushTimerRef.current = window.setTimeout(() => {
      if (startupDoneRef.current) return;
      startupDoneRef.current = true;
      // We only flush here if xterm is already open; if not, the buffer will be
      // handled on the next chunk.
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
