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

    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const wsUrl = `${WS_URL}?projectId=${encodeURIComponent(projectId)}${
      token ? `&token=${encodeURIComponent(token)}` : ""
    }`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    setSocket(ws);
    setConnected(false);

    // Only mutate state if this socket is still the active one. Without this
    // guard, a previous socket's late `onclose` (e.g. from React StrictMode's
    // mount→unmount→remount in dev) would wipe the live socket and the
    // workspace would silently fail to boot until a manual reload.
    ws.onopen = () => {
      if (wsRef.current === ws) setConnected(true);
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };

    ws.onerror = () => {
      // Let onclose handle cleanup
    };

    return () => {
      // Detach handlers before closing so this socket's async close event
      // can't fire setState after a newer socket has taken over.
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      try {
        ws.close();
      } catch {
        // ignore
      }
      if (wsRef.current === ws) {
        wsRef.current = null;
        setSocket(null);
        setConnected(false);
      }
    };
  }, [projectId]);

  return { socket, connected };
};