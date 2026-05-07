import { useEffect, useState, useRef } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export const useSocket = (projectId?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    if (connecting || socket) return;
    
    setConnecting(true);
    const wsUrl = projectId ? `${WS_URL}?projectId=${projectId}` : WS_URL;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
      setConnected(true);
      setConnecting(false);
    };

    ws.onclose = () => {
      wsRef.current = null;
      setConnected(false);
      setSocket(null);
      setConnecting(false);
      
      if (!reconnectTimeout.current) {
        reconnectTimeout.current = setTimeout(() => {
          reconnectTimeout.current = null;
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  };

  useEffect(() => {
    connect();
    
    return () => {
      if (reconnectTimeout.current) {
        clearTimeout(reconnectTimeout.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [projectId]);

  return { socket, connected, connecting };
};