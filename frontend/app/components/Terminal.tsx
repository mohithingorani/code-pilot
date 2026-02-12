"use client";

import { useEffect, useRef, useState } from "react";

export default function XTerminal() {
  const terminalRef = useRef<any>(null);
  const currentTerm = useRef<any>(null);
  const websocketClient = useRef<WebSocket>(null)
  const [currentMessage, setCurrentMessage] = useState<string>("");


  useEffect(() => {
    let term: any;
    let fitAddon: any;

    const loadTerminal = async () => {
      const { Terminal } = await import("xterm");
      const { FitAddon } = await import("xterm-addon-fit");

      //@ts-ignore
      await import("xterm/css/xterm.css");

      term = new Terminal({
        cursorBlink: true,
        fontSize: 14,
      });
      currentTerm.current = term

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

    useEffect(() => {

    const wss = new WebSocket("ws://localhost:8080");
    websocketClient.current = wss
    wss.onopen = () => {
        console.log("Websocket connected");
    };

    wss.onmessage = (event) => {
        const message = event.data;
        currentTerm.current.write(message.toString())
    };
    wss.onclose = () => {
      console.log("WebSocket Disconnected");
    };


    return () => {
      wss.close();
    };
  }, []);

  return <div ref={terminalRef} className="w-full h-full" />;
}
