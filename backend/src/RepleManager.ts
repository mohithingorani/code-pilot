import WebSocket from "ws";
import pty from "node-pty";
class Reple {
  user: WebSocket;
  shell: pty.IPty | null = null;

  constructor(user: WebSocket) {
    this.user = user;
  }

  init() {
    console.log("Node PATH:", process.env.PATH);
    this.shell = pty.spawn(
      "docker",
      ["run", "-it", "--rm", "codepilot", "bash"],
      {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env,
      },
    );
  }

  sendMessage(message: string) {
    if (this.user.readyState === WebSocket.OPEN) {
      this.user.send(message);
    }
  }

  start() {
    if (!this.shell) return;

    this.shell.onData((data) => {
      this.sendMessage(data);
    });

    this.shell.onExit(() => {
      this.close();
    });

    this.user.on("message", (msg) => {
      this.shell?.write(msg.toString());
    });
  }

  close() {
    this.shell?.kill();
  }
}
export default Reple;
