import { useEffect, useRef, useState, useCallback } from "react";

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8080';

export const useSocket = (projectId?: string) => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const isConnectingRef = useRef(false);
  const shouldReconnectRef = useRef(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const projectIdRef = useRef(projectId);

  projectIdRef.current = projectId;

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.onopen = null;
      wsRef.current.onclose = null;
      wsRef.current.onerror = null;
      wsRef.current.close();
      wsRef.current = null;
    }
    setSocket(null);
    setConnected(false);
    setConnecting(false);
    isConnectingRef.current = false;
  }, []);

  const connect = useCallback(() => {
    if (isConnectingRef.current) return;
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

    isConnectingRef.current = true;
    shouldReconnectRef.current = true;
    setConnecting(true);

    const wsUrl = projectIdRef.current ? `${WS_URL}?projectId=${projectIdRef.current}` : WS_URL;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected");
      setSocket(ws);
      setConnected(true);
      setConnecting(false);
      isConnectingRef.current = false;
    };

    ws.onclose = () => {
      wsRef.current = null;
      setConnected(false);
      setConnecting(false);
      isConnectingRef.current = false;

      if (shouldReconnectRef.current && !reconnectTimeoutRef.current) {
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectTimeoutRef.current = null;
          connect();
        }, 3000);
      }
    };

    ws.onerror = () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    shouldReconnectRef.current = true;
    connect();

    return () => {
      shouldReconnectRef.current = false;
      cleanup();
    };
  }, [projectId, connect, cleanup]);

  return { socket, connected, connecting };
};