import Router from "express";
const router = Router();
import { prisma } from "../lib/prisma.js";
import { authenticate, AuthRequest } from "../middleware/auth.js";
import archiver from "archiver";
import {
  listAllObjects,
  getObjectStream,
  copyProjectFiles,
  deleteProjectFiles,
} from "../utils/s3.js";

const getIdParam = (id: string | string[]): string => Array.isArray(id) ? id[0] : id;

// Get all projects
router.get("/", authenticate, async (req: AuthRequest, res) => {
  try {
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
      where: { ownerId: req.userId },
      orderBy,
    });

    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ error: "Failed to fetch projects" });
  }
});

// Create new project
router.post("/", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name, description, language } = req.body;

    if (!name) {
      return res.status(400).json({ error: "Project name is required" });
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description || "",
        language,
        status: "active",
        ownerId: req.userId!,
      },
    });

    res.json(project);
  } catch (error) {
    console.error("Error creating project:", error);
    res.status(500).json({ error: "Failed to create project" });
  }
});

// Get single project
router.get("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = getIdParam(req.params.id);
    const project = await prisma.project.findFirst({
      where: { id, ownerId: req.userId },
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
router.put("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = getIdParam(req.params.id);
    const { name, description, language } = req.body;

    const existingProject = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingProject || existingProject.ownerId !== req.userId) {
      return res.status(404).json({ error: "Project not found" });
    }

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
router.post("/:id/clone", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = getIdParam(req.params.id);

    const originalProject = await prisma.project.findFirst({
      where: { id, ownerId: req.userId },
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
        ownerId: req.userId!,
        fileCount: originalProject.fileCount,
      },
    });

    // Copy the actual workspace files in object storage so the clone isn't empty.
    try {
      const copied = await copyProjectFiles(id, newProject.id);
      if (copied !== newProject.fileCount) {
        await prisma.project.update({
          where: { id: newProject.id },
          data: { fileCount: copied },
        });
        newProject.fileCount = copied;
      }
    } catch (err) {
      console.error("Error copying cloned project files:", err);
    }

    res.json(newProject);
  } catch (error) {
    console.error("Error cloning project:", error);
    res.status(500).json({ error: "Failed to clone project" });
  }
});

// Export project as ZIP
router.get("/:id/export", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = getIdParam(req.params.id);

    const project = await prisma.project.findFirst({
      where: { id, ownerId: req.userId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const prefix = `projects/${id}/`;
    const keys = await listAllObjects(prefix);

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${project.name}.zip"`);

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archive error:", err);
      res.destroy(err);
    });

    archive.pipe(res);

    for (const key of keys) {
      const fileName = key.slice(prefix.length);
      if (!fileName || key.endsWith("/")) continue;

      try {
        const body = await getObjectStream(key);
        archive.append(body, { name: fileName });
      } catch (err) {
        console.error(`Error fetching file ${key}:`, err);
      }
    }

    await archive.finalize();
  } catch (error) {
    console.error("Error exporting project:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: "Failed to export project" });
    }
  }
});

// Delete project
router.delete("/:id", authenticate, async (req: AuthRequest, res) => {
  try {
    const id = getIdParam(req.params.id);

    const project = await prisma.project.findFirst({
      where: { id, ownerId: req.userId },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await prisma.project.delete({ where: { id } });

    // Best-effort cleanup of stored workspace files so they don't orphan.
    try {
      await deleteProjectFiles(id);
    } catch (err) {
      console.error("Error deleting project files from storage:", err);
    }

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting project:", error);
    res.status(500).json({ error: "Failed to delete project" });
  }
});

export default router;
