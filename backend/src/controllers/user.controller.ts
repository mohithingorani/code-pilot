import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
const createUser = async (req: Request, res: Response) => {
  console.log("Creating user with data:", req.body);
  const { email, password, name } = req.body;
  try {
    const user = await prisma.user.create({
      data: {
        email,
        password,
        name,
      },
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

export { createUser };
