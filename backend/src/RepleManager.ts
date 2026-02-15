import WebSocket from "ws";
import pty from "node-pty";
import path from "path";
import fs from "fs";
import { Language } from "./types.js";
import { FilesMap } from "./data.js";

class Reple {
  user: WebSocket;
  shell: pty.IPty | null = null;
  code: string = "";
  hostDirectory : string | null = null;
  language: Language;
  files :any = null;

  constructor(user: WebSocket,language:Language) {
    this.user = user;
    this.language = language;

  }

  sendMessage = (message: string) => {
    if (this.user.readyState === WebSocket.OPEN) {
      this.user.send(message);
    }
  };

  init = () => {
    const session_id = "123";
    this.files = FilesMap.get(this.language);
    const hostDir = path.join(process.cwd(), "repl_storage", session_id);
    this.hostDirectory = hostDir
    if(!fs.existsSync(hostDir)){
      fs.mkdirSync(hostDir, { recursive: true });
    }
    else{
    fs.rm(hostDir,{ recursive: true, force: true }, (err) => {
      if (err) {
        console.error("Error clearing host directory:", err);
      } else {
        console.log("Host directory cleared successfully");
      }
    });
    }
    console.log("Host Dir", hostDir);
    fs.mkdirSync(hostDir, { recursive: true });
    this.files.forEach((file:any) => {
      fs.writeFileSync(path.join(hostDir, file.name), file.content);
    });

    this.shell = pty.spawn(
      "docker",
      [
        "run",
        "-it",
        "--rm",
        "-v",
        `${hostDir}:/workspace`,
        "-w",
        "/workspace",
        "codepilot",
        "bash",
      ],
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

    this.sendMessage(JSON.stringify({ type: "files", data: this.files }));

    this.shell.onData((data) => {
      const parsed = JSON.stringify({ type: "terminal", payload: { data } });
      this.sendMessage(parsed);
    });

    this.shell.onExit(() => {
      this.close();
    });

    this.user.on("message", (msg) => {
      const parsed = JSON.parse(msg.toString());

      switch (parsed.type) {
        case "terminal":
          this.shell?.write(parsed.payload.data);
          break;

        case "files":
          console.log("Received file update from client:", parsed.payload);
          const { files } = parsed.payload;
          console.log(files);

          if (files) {
            console.log("this is a file");
            this.files = files;
            this.syncFilesToDisk(files);

            console.log("Files updated on disk")
          }
          break;
      }
    });
  };

  syncFilesToDisk = (files:{name:string,content:string}[])=>{
    files.forEach((file)=>{
      if(!this.hostDirectory) return;
      if(!file.content.endsWith("\n")){
        file.content = file.content.concat("\n");
      }
      const filePath = path.join(this.hostDirectory,file.name);
      fs.writeFileSync(filePath,file.content);
    });
  }

  close = () => {
    if (this.shell) {
      this.shell.kill();
      this.shell = null;
      console.log("Shell closed");
    }
  };
}
export default Reple;
