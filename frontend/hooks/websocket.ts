import { useEffect, useRef, useState } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";

export const useSocket = (projectId?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const projectIdRef = useRef(projectId);

  projectIdRef.current = projectId;

  useEffect(() => {
    if (!projectId) {
      setSocket(null);
      setConnected(false);
      return;
    }

    const wsUrl = `${WS_URL}?projectId=${projectId}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setSocket(ws);

    ws.onopen = () => {
      console.log("WebSocket connected");
      setConnected(true);
    };

    ws.onclose = () => {
      wsRef.current = null;
      setSocket(null);
      setConnected(false);
    };

    ws.onerror = () => {
      // Let onclose handle cleanup
    };

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      setSocket(null);
      setConnected(false);
    };
  }, [projectId]);

  return { socket, connected };
};