import WebSocket from "ws";
import * as pty from "node-pty";
import path from "path";
import fs from "fs";
import { Language, LANGUAGE_MAP } from "./types";
import crypto from "crypto";
import {
  deleteProjectFile,
  restoreProject,
  putProjectFile,
} from "./utils/s3.js";
import { prisma } from "./lib/prisma.js";

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

    // Per-session directory (not just per-project): if a stale connection for
    // the same project is torn down, its close() must not delete the workspace
    // of the live session. S3 (keyed by projectId) remains the source of truth.
    this.hostDirectory = path.join(
      "/tmp/codepilot",
      `${this.projectId}-${crypto.randomUUID().slice(0, 8)}`,
    );

    this.user.on("message", async (msg) => {
      let parsed: any;
      try {
        parsed = JSON.parse(msg.toString());
      } catch {
        console.warn("Ignoring malformed WS message");
        return;
      }

      try {
        switch (parsed?.type) {
          case "terminal":
            this.shell?.write(parsed.payload?.data ?? "");
            break;

          case "init":
            if (this.initialized) {
              console.log("Already initialized, skipping");
              return;
            }
            const lang = parsed.payload?.language as string;
            const mappedLang = LANGUAGE_MAP[lang] ?? Language.PYTHON;
            this.projectLanguage = lang ?? this.projectLanguage;
            this.language = mappedLang;
            this.initialized = true;
            await this.init();
            break;

          case "files":
            console.log("Got files");
            await this.syncFilesToDisk(parsed.payload?.files ?? []);
            break;
        }
      } catch (err) {
        console.error("Error handling WS message:", err);
      }
    });
  }

  /**
   * Resolve a client-supplied relative path against the workspace, rejecting
   * anything that would escape it (path traversal via "../", absolute paths…).
   */
  private resolveInsideWorkspace = (name: string): string | null => {
    const target = path.resolve(this.hostDirectory, name);
    const rel = path.relative(this.hostDirectory, target);
    if (!rel || rel.startsWith("..") || path.isAbsolute(rel)) {
      return null;
    }
    return target;
  };

  /** Keep the project's file count and edit time fresh in the database. */
  private updateProjectMeta = async (fileCount: number) => {
    try {
      await prisma.project.update({
        where: { id: this.projectId },
        data: { fileCount, lastEditedAt: new Date() },
      });
    } catch (err) {
      // Project may not exist for ad-hoc sessions — don't crash the socket.
      console.warn("Could not update project metadata:", (err as Error).message);
    }
  };

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

      await restoreProject(this.projectId, this.hostDirectory);

      const existing = fs.readdirSync(this.hostDirectory);

      if (existing.length == 0) {
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

      await this.updateProjectMeta(files.length);

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

  private getHash = (content: string) => {
    return crypto.createHash("sha256").update(content).digest("hex");
  };

  syncFilesToDisk = async (files: { name: string; content: string }[]) => {
    console.log("Files syncing started");

    // Drop any path that would escape the workspace before doing anything.
    const safeFiles = files.filter((file) => {
      if (this.resolveInsideWorkspace(file.name)) return true;
      console.warn("Rejecting unsafe file path:", file.name);
      return false;
    });

    const incomingFiles = new Set(safeFiles.map((file) => file.name));
    const existingFiles = this.readProjectFiles(this.hostDirectory).map((file) => file.name);

    // Delete files that were removed on the client (disk + object storage).
    await Promise.all(
      existingFiles
        .filter((existingFile) => !incomingFiles.has(existingFile))
        .map(async (existingFile) => {
          const filePath = this.resolveInsideWorkspace(existingFile);
          if (!filePath) return;
          console.log("Deleting removed file:", existingFile);
          await fs.promises.unlink(filePath).catch(() => {});
          await deleteProjectFile(this.projectId, existingFile).catch((err) =>
            console.error("Failed to delete from storage:", err),
          );
        }),
    );

    // Write + upload only the files whose content actually changed.
    await Promise.all(
      safeFiles.map(async (file) => {
        const filePath = this.resolveInsideWorkspace(file.name);
        if (!filePath) return;

        await fs.promises.mkdir(path.dirname(filePath), { recursive: true });

        let changed = true;
        try {
          const existingContent = await fs.promises.readFile(filePath, "utf-8");
          changed = this.getHash(existingContent) !== this.getHash(file.content);
        } catch {
          changed = true;
        }

        if (!changed) return;

        console.log("Uploading changed file:", file.name);
        await fs.promises.writeFile(filePath, file.content);
        await putProjectFile(this.projectId, file.name, file.content);
      }),
    );

    await this.updateProjectMeta(safeFiles.length);
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

    try {
      if (fs.existsSync(this.hostDirectory)) {
        await fs.promises.rm(this.hostDirectory, { recursive: true, force: true });
        console.log(`Deleted temp folder: ${this.hostDirectory}`);
      }
    } catch (err) {
      console.error("Error cleaning temp folder:", err);
    }
  };
}
export default Reple;
