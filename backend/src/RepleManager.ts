import WebSocket from "ws";
import pty from "node-pty";
class Reple {
  user: WebSocket;
  shell: pty.IPty | null = null;
  code: string = "";
  files = [
    {
      name: "main.py",
      content: "# Write your code here\nprint('Hello, World!')",
    },
    {
      name: "utils.py",
      content: "# Utility functions\n\ndef add(a, b):\n    return a + b",
    },
    {
      name: "README.md",
      content: "# REPLIT Clone\n\nThis is a simple REPLIT clone built with WebSockets and Docker.",
    }
  ];


  constructor(user: WebSocket) {
    this.user = user;
  }

 createFilesInContainer() {
  if (!this.shell) return;

  this.files.forEach(file => {
    const command = `
cat <<'EOF' > ${file.name}
${file.content}
EOF
`;
    this.shell?.write(command);
  });
}


  init() {
    // console.log("Node PATH:", process.env.PATH);
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

      setTimeout(() => {
    this.createFilesInContainer();
    this.shell?.write("clear\n"); 

    this.sendMessage(JSON.stringify({ type:"files", data: this.files }));
  }, 1000); 
  }

  sendMessage(message: string) {
    if (this.user.readyState === WebSocket.OPEN) {
      this.user.send(message);
    }
  }

  start() {
    if (!this.shell) return;

    this.shell.onData((data) => {
      const parsed = JSON.stringify({ type: "terminal", payload: { data } });
      this.sendMessage(parsed);
    });

    this.shell.onExit(() => {
      this.close();
    });

    this.user.on("message", (msg) => {
      const parsed = JSON.parse(msg.toString());
      // if(parsed.type === "code") {
      //   this.code = parsed.data;
      //   return;
      // }
      if(parsed.type==="terminal"){
        this.shell?.write(parsed.payload.data);
      }
    });
  }

  close() {
    if(this.shell) {

      this.shell.kill();
      this.shell = null;
      console.log("Shell closed");
    }
  }
}
export default Reple;
