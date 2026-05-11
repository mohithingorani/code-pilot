import WebSocket from "ws";
import * as pty from "node-pty";
import path from "path";
import fs from "fs";
import { Language, LANGUAGE_MAP } from "./types";
import crypto from "crypto";
import { deleteFile, restoreProject, uploadFile } from "./utils/s3.js";

const TEMPLATE_MAP: Record<string, string> = {
  "C++": "cpp",
  "cpp": "cpp",
  Java: "java",
  java: "java",
  JavaScript: "javascript",
  javascript: "javascript",
  Python: "python",
  python: "python",
  TypeScript: "typescript",
  typescript: "typescript",
  Markdown: "markdown",
  markdown: "markdown",
};

class Reple {
  user: WebSocket;
  shell: pty.IPty | null = null;
  code: string = "";
  hostDirectory: string;
  language: Language;
  files: any = null;
  projectId: string;
  projectLanguage: string;
  initialized: boolean = false;

  constructor(user: WebSocket, language: Language, projectId?: string, projectLanguage?: string) {
    this.user = user;
    this.language = language;
    this.projectId = projectId ?? crypto.randomUUID();
    this.projectLanguage = projectLanguage ?? "python";

    this.hostDirectory = path.join("/tmp/codepilot", this.projectId);

    this.user.on("message", async (msg) => {
      const parsed = JSON.parse(msg.toString());

      switch (parsed.type) {
        case "terminal":
          this.shell?.write(parsed.payload.data);
          break;

        case "init":
          if (this.initialized) {
            console.log("Already initialized, skipping");
            return;
          }
          const lang = parsed.payload.language as string;
          const mappedLang = LANGUAGE_MAP[lang] ?? Language.PYTHON;
          this.projectLanguage = lang;
          this.language = mappedLang;
          this.initialized = true;
          await this.init();
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
    if (!fs.existsSync(dir)) {
      return [];
    }
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
    try {
      await fs.promises.mkdir(this.hostDirectory, { recursive: true });
      console.log(`Created temp folder: ${this.hostDirectory}`);

      const existing = fs.readdirSync(this.hostDirectory);

      if (existing.length == 0) {
        console.log("No existing files, attempting restore from S3...");
        try {
          await restoreProject(this.projectId, this.hostDirectory);
        } catch (err) {
          console.log("S3 restore failed or no files in S3, using template");
        }
      }

      const afterRestore = fs.readdirSync(this.hostDirectory);

      if (afterRestore.length == 0) {
        const templateFolder = TEMPLATE_MAP[this.projectLanguage] || this.projectLanguage;
        const templatePath = path.join(process.cwd(), "templates", templateFolder);
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
    } catch (err) {
      console.error("Init error:", err);
      this.close();
    }
  };

  startContainer = () => {
    this.shell = pty.spawn(
      "docker",
      [
        "run",
        "-t",
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
    });
  };

  private getHash = (content: string) => {
    return crypto.createHash("sha256").update(content).digest("hex");
  };

  syncFilesToDisk = async (files: { name: string; content: string }[]) => {
    console.log("Files syncing started");

    const incomingFiles = new Set(files.map((file) => file.name));
    const existingFiles = this.readProjectFiles(this.hostDirectory).map((file) => file.name);

    for (const existingFile of existingFiles) {
      if (!incomingFiles.has(existingFile)) {
        const filePath = path.join(this.hostDirectory, existingFile);
        console.log("Deleting removed file:", existingFile);
        await fs.promises.unlink(filePath);
        await deleteFile(this.projectId, existingFile);
      }
    }

    for (const file of files) {
      const filePath = path.join(this.hostDirectory, file.name);

      await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

      let shouldWrite = true;

      try {
        const existingContent = await fs.promises.readFile(filePath, "utf-8");

        if (existingContent === file.content) {
          shouldWrite = false;
        }
      } catch {
        shouldWrite = true;
      }

      if (shouldWrite) {
        console.log("Writing file:", file.name);
        await fs.promises.writeFile(filePath, file.content, "utf-8");
        await uploadFile(this.projectId, filePath, this.hostDirectory);
      } else {
        console.log("No changes:", file.name);
      }
    }
  };

  close = async () => {
    if (this.shell) {
      this.shell.kill();
      this.shell = null;
      console.log("Shell closed");
    }

    if (this.user.readyState === WebSocket.OPEN) {
      this.user.close();
    }
  };
}
export default Reple;
