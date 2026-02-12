import { WebSocketServer } from "ws";
import WebSocket from "ws";
import Reple from "./RepleManager.js";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws: WebSocket) => {
  console.log("Client connected");

  const reple = new Reple(ws);
  reple.init();
  reple.start();

  ws.on("close", () => {
    reple.close();
  });
});
