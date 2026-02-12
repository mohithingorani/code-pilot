"use client";

import { useEffect, useRef } from "react";
export default function XTerminal({socket}:{socket:WebSocket}) {
  const terminalRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    let term: any;

    const init = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");
      //@ts-ignore
      await import("xterm/css/xterm.css");

      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
      });

      const fitAddon = new FitAddon();
      term.loadAddon(fitAddon);

      if(!socket) return;
      if (terminalRef.current) {
        term.open(terminalRef.current);
        fitAddon.fit();

        term.onData((data:any) => {
          socket.send(data);
        }); 
      }

      



      socket.onmessage = (event) => {
        term.write(event.data);
      };

    };

    init();

    return () => {
      socket?.close();
      term?.dispose();
    };
  }, [socket]);

  return <div ref={terminalRef} className="w-full h-full" />;
}
