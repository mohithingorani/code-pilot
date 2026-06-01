import http from "http";
import WebSocket, { WebSocketServer, RawData } from "ws";
import jwt from "jsonwebtoken";
import { Language } from "./types";
import Reple from "./RepleManager";
import app from "./app";
import { prisma } from "./lib/prisma.js";

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

/** Verify the JWT and confirm the user owns the requested project. */
async function authorize(
  token: string | null,
  projectId: string | undefined,
): Promise<{ language: string } | null> {
  if (!token || !projectId) return null;

  let userId: string;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    userId = decoded.userId;
  } catch {
    return null;
  }

  const project = await prisma.project.findFirst({
    where: { id: projectId, ownerId: userId },
    select: { language: true },
  });

  return project ? { language: project.language } : null;
}

wss.on("connection", async (ws: WebSocket, req) => {
  // Authentication below is async (JWT verify + DB lookup). The client sends
  // `init` the moment the socket opens, so buffer anything that arrives during
  // that window and replay it once Reple's message handler is attached —
  // otherwise the first frame is dropped and the workspace never boots.
  const earlyMessages: RawData[] = [];
  const bufferEarly = (data: RawData) => earlyMessages.push(data);
  ws.on("message", bufferEarly);

  try {
    const url = new URL(req.url || "", `http://${req.headers.host}`);
    const projectId = url.searchParams.get("projectId") || undefined;
    const token = url.searchParams.get("token");

    const auth = await authorize(token, projectId);
    if (!auth || !projectId) {
      console.warn(`Rejected WS connection (projectId: ${projectId ?? "none"})`);
      ws.off("message", bufferEarly);
      ws.close(4401, "Unauthorized");
      return;
    }

    // The client may have already abandoned this socket while we were
    // authenticating (e.g. React StrictMode's throwaway first mount). Don't
    // spin up a container for a dead socket.
    if (ws.readyState !== WebSocket.OPEN) {
      ws.off("message", bufferEarly);
      return;
    }

    console.log(`Client connected - projectId: ${projectId}`);

    if (activeConnections.has(projectId)) {
      console.log(`Closing existing connection for project: ${projectId}`);
      const existing = activeConnections.get(projectId);
      if (existing) closeConnection(existing);
      activeConnections.delete(projectId);
    }

    ws.off("message", bufferEarly);
    const reple = new Reple(ws, Language.PYTHON, projectId, auth.language);
    activeConnections.set(projectId, { ws, reple });

    // Replay frames received while authenticating (e.g. the client's `init`).
    for (const data of earlyMessages) ws.emit("message", data);

    const cleanup = () => {
      console.log(`Client disconnected - projectId: ${projectId}`);
      activeConnections.delete(projectId);
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
  } catch (err) {
    console.error("Error during WS connection setup:", err);
    try {
      ws.close(1011, "Internal error");
    } catch {
    }
  }
});

const PORT = Number(process.env.PORT) || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

// Graceful shutdown so containers/DB connections aren't left dangling.
const shutdown = async (signal: string) => {
  console.log(`${signal} received, shutting down…`);
  for (const entry of activeConnections.values()) closeConnection(entry);
  activeConnections.clear();
  wss.close();
  server.close();
  await prisma.$disconnect().catch(() => {});
  process.exit(0);
};

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
