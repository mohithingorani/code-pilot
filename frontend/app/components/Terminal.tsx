"use client";

import { useEffect, useRef } from "react";

export default function XTerminal() {
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let term: any;
    let fitAddon: any;

    const loadTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      await import("xterm/css/xterm.css");

      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
      });

      fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();
        term.write("Cloud Terminal Ready 🚀\r\n");
      }
    };

    loadTerminal();

    return () => {
      if (term) term.dispose();
    };
  }, []);

  return <div ref={terminalRef} className="w-full h-full" />;
}
