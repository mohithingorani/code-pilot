import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { Language } from "./types";
import Reple from "./RepleManager";
import app from "./app";


const server = http.createServer(app);
const wss = new WebSocketServer({server});

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  const reple = new Reple(ws, Language.JAVASCRIPT,"mohit-project");
  reple.init();

  ws.on("close", () => {
    console.log("Client disconnected");
    reple.close();
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
    reple.close();
  });
});
server.listen(8080, () => {
  console.log("Server is listening on port 8080");
});