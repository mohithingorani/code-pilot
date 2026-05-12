import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Language } from "./types";
import Reple from "./RepleManager";
import app from "./app";

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

interface ConnectionEntry {
  ws: WebSocket;
  reple: Reple;
}

const activeConnections = new Map<string, ConnectionEntry>();

function closeConnection(entry: ConnectionEntry) {
  try {
    entry.ws.removeAllListeners();
    entry.ws.close();
  } catch {
  }
  try {
    entry.reple.close();
  } catch {
  }
}

wss.on("connection", (ws: WebSocket, req) => {
  const url = new URL(req.url || "", `http://${req.headers.host}`);
  const projectId = url.searchParams.get("projectId") || undefined;

  console.log(`Client connecting - projectId: ${projectId || "none"}`);

  if (projectId && activeConnections.has(projectId)) {
    console.log(`Closing existing connection for project: ${projectId}`);
    const existing = activeConnections.get(projectId);
    if (existing) {
      closeConnection(existing);
    }
    activeConnections.delete(projectId);
  }

  const reple = new Reple(ws, Language.PYTHON, projectId);

  if (projectId) {
    activeConnections.set(projectId, { ws, reple });
  }

  const cleanup = () => {
    console.log(`Client disconnected - projectId: ${projectId || "none"}`);
    if (projectId) {
      activeConnections.delete(projectId);
    }
    try {
      reple.close();
    } catch {
    }
  };

  ws.on("close", cleanup);
  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    cleanup();
  });
});

server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});