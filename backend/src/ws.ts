import { WebSocketServer } from "ws";
import WebSocket from "ws";
import Reple from "./RepleManager.js";
import { Language } from "./types.js";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  const reple = new Reple(ws,Language.PYTHON);
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
