import express from "express";
import userRoutes from "./routes/user.routes";
import projectRoutes from "./routes/project.routes";
import { prisma } from "./lib/prisma.js";
const app = express();
import cors from "cors";


app.use(cors());

app.use(express.json());

app.get("/test", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);


export default app;