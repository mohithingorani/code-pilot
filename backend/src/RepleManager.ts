import WebSocket from "ws";
import pty from "node-pty";
import path from "path";
import fs from "fs";
import { Language } from "./types.js";
import crypto from "crypto";
import { deleteFile, restoreProject, uploadFile } from "./utils/s3.js";

class Reple {
  user: WebSocket;
  shell: pty.IPty | null = null;
  code: string = "";
  hostDirectory: string;
  language: Language;
  files: any = null;
  projectId: string;

  constructor(user: WebSocket, language: Language, projectId?: string) {
    this.user = user;
    this.language = language;
    this.projectId = projectId ?? crypto.randomUUID();

    const hostDir = path.join(
      process.cwd(),
      "codepilot_storage",
      this.projectId,
    );
    this.hostDirectory = hostDir;

    this.user.on("message", async (msg) => {
      const parsed = JSON.parse(msg.toString());

      switch (parsed.type) {
        case "terminal":
          this.shell?.write(parsed.payload.data);
          break;

        case "files":
          console.log("Got files");
          await this.syncFilesToDisk(parsed.payload.files);
          
          
          break;
      }
    });
  }

  private readProjectFiles = (
    dir: string,
  ): { name: string; content: string }[] => {
    const result: { name: string; content: string }[] = [];

    const walk = (currentPath: string) => {
      const items = fs.readdirSync(currentPath);

      for (const item of items) {
        const fullPath = path.join(currentPath, item);
        const stats = fs.statSync(fullPath);

        if (stats.isDirectory()) {
          walk(fullPath);
        } else {
          const relativePath = path
            .relative(this.hostDirectory, fullPath)
            .split(path.sep)
            .join("/");

          const content = fs.readFileSync(fullPath, "utf-8");

          result.push({
            name: relativePath,
            content,
          });
        }
      }
    };

    walk(dir);
    return result;
  };

  sendMessage = (message: string) => {
    if (this.user.readyState === WebSocket.OPEN) {
      this.user.send(message);
    }
  };

  init = async () => {
    await fs.promises.mkdir(this.hostDirectory, { recursive: true });

    await restoreProject(this.projectId, this.hostDirectory);

    const existing = fs.readdirSync(this.hostDirectory);

    if (existing.length == 0) {
      const templatePath = path.join(process.cwd(), "templates", this.language);

      fs.cpSync(templatePath, this.hostDirectory, { recursive: true });
    }
    const files = this.readProjectFiles(this.hostDirectory);
      this.sendMessage(
        JSON.stringify({
          type: "files",
          payload: { files },
        }),
      );
    
    this.startContainer();
  };

  startContainer = () => {
    this.shell = pty.spawn(
      "docker",
      [
        "run",
        "-it",
        "--rm",
        "-v",
        `${this.hostDirectory}:/workspace`,
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

    this.shell.onData((data) => {
      this.sendMessage(
        JSON.stringify({
          type: "terminal",
          payload: { data },
        }),
      );
    });

    this.shell.onExit(({ exitCode }) => {
      console.log("Container exited with code", exitCode);
      this.close();
    });
  };
  private getHash = (content: string)=> {
    return crypto.createHash("sha256").update(content).digest("hex");
  }
syncFilesToDisk = async (files: { name: string; content: string }[]) => {
  console.log("Files syncing started");

  const incomingFiles = new Set(files.map((file)=>file.name))
  const existingFiles = this.readProjectFiles(this.hostDirectory).map((file)=>file.name);

  for (const existingFile of existingFiles){
    if(!incomingFiles.has(existingFile)){
      const filePath = path.join(this.hostDirectory,existingFile);
      console.log("Deleting removed filed : ",existingFile);
      await fs.promises.unlink(filePath);
      await deleteFile(this.projectId,existingFile);
    }
  }

  for (const file of files) {
    const filePath = path.join(this.hostDirectory, file.name);

    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

    let shouldUpload = true;

    try {
      const existingContent = await fs.promises.readFile(filePath, "utf-8");

      const existingHash = this.getHash(existingContent);
      const newHash = this.getHash(file.content);

      if (existingHash === newHash) {
        shouldUpload = false; 
      }
    } catch {
      shouldUpload = true;
    }

    if (shouldUpload) {
      console.log("Uploading changed file:", file.name);

      await fs.promises.writeFile(filePath, file.content);
      await uploadFile(this.projectId, filePath, this.hostDirectory);
    } else {
      console.log("No changes detected:", file.name);
    }
  }
};


  close = () => {
    if (this.shell) {
      this.shell.kill();
      this.shell = null;
      console.log("Shell closed");
    }

    if (this.user.readyState == WebSocket.OPEN) {
      this.user.close();
    }
  };
}
export default Reple;
