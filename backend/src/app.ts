import express from "express";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes";
const app = express();
import cors from "cors";

app.use(cors({ origin: process.env.FRONTEND_URL || true }));

app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);

export default app;
