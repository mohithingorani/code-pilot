import WebSocket from "ws";
import pty from "node-pty";
import path from "path"
import fs from "fs"
class Reple {
  user: WebSocket;
  shell: pty.IPty | null = null;
  code: string = "";
  files = [
    {
      name: "main.py",
      content: "# Write your code here\nprint('Hello, World!')\n",
    },
    {
      name: "utils.py",
      content: "# Utility functions\n\ndef add(a, b):\n    return a + b\n",
    },
    {
      name: "README.md",
      content: "# REPLIT Clone\n\nThis is a simple REPLIT clone built with WebSockets and Docker.\n",
    }
  ];


  constructor(user: WebSocket) {
    this.user = user;
  }

// createFilesInContainer = () => {
//   if (!this.shell) return;

//   this.files.forEach(file => {
//     const escaped = file.content
//       .replace(/\\/g, "\\\\")
//       .replace(/"/g, '\\"')
//       .replace(/\$/g, "\\$")
//       .replace(/`/g, "\\`");

//     const command = `printf "%s" "${escaped}" > ${file.name}\n`;
//     if (this.shell) {
//     this.shell.write(command);
//     }else {      console.error("Shell is not initialized");
//     }
//   });
// };


  init() {
    // console.log("Node PATH:", process.env.PATH);

    const session_id ="123";
    const hostDir = path.join(process.cwd(),"repl_storage",session_id)
    this.files.forEach(file => {
    
    fs.writeFileSync(
      path.join(hostDir, file.name),
      file.content
    );

});
    this.shell = pty.spawn(
      "docker",
      ["run", "-it", "--rm","-v",`${hostDir}:/workspace`,"-w","/workspace", "codepilot", "bash"],
      {
        name: "xterm-color",
        cols: 80,
        rows: 30,
        cwd: process.cwd(),
        env: process.env,
      },
    );

    //  this.createFilesInContainer();
    // this.shell?.write("clear\n"); 

    this.sendMessage(JSON.stringify({ type:"files", data: this.files }));
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
      if(parsed.type === "files") {
        console.log("Received file update from client:", parsed.payload);
        const { files } = parsed.payload;
        console.log(files);
        if(files) {
          console.log("this is a file")
          this.files = files;          
          // this.createFilesInContainer();
        }
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
