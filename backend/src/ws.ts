import { WebSocketServer } from "ws";
import WebSocket  from "ws";
import {spawn} from "child_process";

const wss = new WebSocketServer({ port: 8080 });

wss.on("connection", (ws:WebSocket) => {
    console.log("Client connected");
    
 const docker = spawn("docker", [
  "run",
  "-i",
  "--rm",
  "replit-clone",
  "python3",
  "-u",
  "-i"
]);

  // Step B: Send container output to frontend
  docker.stdout.on("data", (data) => {
    ws.send(data.toString());
  });

  docker.stderr.on("data", (data) => {
    ws.send(data.toString());
  });

  // Step C: When user types → send to container stdin
  ws.on("message", (msg) => {
    const message = msg.toString();
    console.log(`Received from client: ${message}`);
    docker.stdin.write(message + "\n");
  });

  // Cleanup
  ws.on("close", () => {
    docker.kill();
  });
});