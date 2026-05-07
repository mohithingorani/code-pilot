import Router from "express";
const router = Router();
import { prisma } from "../lib/prisma.js";
import archiver from "archiver";
import { S3Client, GetObjectCommand, ListObjectsV2Command } from "@aws-sdk/client-s3";
import { Readable } from "stream";

// Configure S3 client
const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.endpoint!,
  credentials: {
    accessKeyId: process.env.accessKeyId!,
    secretAccessKey: process.env.secretAccessKey!,
  },
});

const bucket = "codepilot-bucket";

// Get all projects
router.get("/", async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: { email: "demo@codepilot.com" },
    });

    if (!user) {
      return res.json([]);
    }

    const { sort = "updatedAt" } = req.query;

    const orderBy: any = {};
    switch (sort) {
      case "name":
        orderBy.name = "asc";
        break;
      case "createdAt":
        orderBy.createdAt = "desc";
        break;
      case "lastEditedAt":
        orderBy.lastEditedAt = "desc";
        break;
      default:
        orderBy.lastEditedAt = "desc";
    }

    const projects = await prisma.project.findMany({
      where: { ownerId: user.id },
      orderBy,
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Create new project
router.post("/", async (req, res) => {
  try {
    const { name, description, language } = req.body;

    const user = await prisma.user.findFirst({
      where: { email: "demo@codepilot.com" },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        language,
        status: "active",
        ownerId: user.id,
      },
    });

    res.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get single project
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const project = await prisma.project.findUnique({
      where: { id },
      include: { files: true },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Error fetching project:", error);
    res.status(500).json({ error: "Failed to fetch project" });
  }
});

// Update project
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, language } = req.body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (language !== undefined) updateData.language = language;
    updateData.lastEditedAt = new Date();

    const project = await prisma.project.update({
      where: { id },
      data: updateData,
    });

    res.json(project);
  } catch (error) {
    console.error("Error updating project:", error);
    res.status(500).json({ error: "Failed to update project" });
  }
});

// Clone project
router.post("/:id/clone", async (req, res) => {
  try {
    const { id } = req.params;

    const originalProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!originalProject) {
      return res.status(404).json({ error: "Project not found" });
    }

    const newProject = await prisma.project.create({
      data: {
        name: `${originalProject.name} (Copy)`,
        description: originalProject.description,
        language: originalProject.language,
        status: "active",
        ownerId: originalProject.ownerId,
        fileCount: originalProject.fileCount,
      },
    });

    res.json(newProject);
  } catch (error) {
    console.error("Error cloning project:", error);
    res.status(500).json({ error: "Failed to clone project" });
  }
});

// Export project as ZIP
router.get("/:id/export", async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const prefix = `projects/${id}/`;

    const list = await s3Client.send(
      new ListObjectsV2Command({
        Bucket: bucket,
        Prefix: prefix,
      }),
    );

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${project.name}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      throw err;
    });

    archive.pipe(res);

    if (list.Contents && list.Contents.length > 0) {
      for (const obj of list.Contents) {
        if (!obj.Key) continue;

        const fileName = obj.Key.replace(prefix, "");
        if (!fileName) continue;

        try {
          const data = await s3Client.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: obj.Key,
            }),
          );

          const bodyContents = await streamToBuffer(data.Body as Readable);
          archive.append(bodyContents, { name: fileName });
        } catch (err) {
          console.error(`Error fetching file ${obj.Key}:`, err);
        }
      }
    }

    archive.finalize();
  } catch (error) {
    console.error("Error exporting project:", error);
    res.status(500).json({ error: "Failed to export project" });
  }
});

// Delete project
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.project.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

export default router;
