import { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { UserSchema } from "../lib/models.js";
import { compare, hash } from "../lib/scrypt.js";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const createUser = async (req: Request, res: Response) => {
  console.log("Creating user with data:", req.body);
  const parsedData = UserSchema.safeParse(req.body);

  if (!parsedData.success) {
    console.error("Validation failed:", parsedData.error);
    return res.status(400).json({ error: "Invalid user data" });
  }

  const { email, password } = parsedData.data;

  const hashedPassword = await hash(password);

  try {
    const user = await prisma.user.create({
      data: {
        email,
        password:hashedPassword,
      },
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
};

const userSignin = async (req: Request, res: Response) => {
const parsedData = UserSchema.safeParse(req.body);

if (!parsedData.success) {
  return res.status(400).json({ error: "Invalid user data" });
}
try {
  const { email, password } = parsedData.data;

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  const isPasswordValid = await compare(password, user.password);
  if (!isPasswordValid) {
    return res.status(401).json({ error: "Invalid password" });
  }

  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "7d" });
  res.status(200).json({ user, token });
}
catch (error) {
  res.status(500).json({ error: "Failed to sign in" });
}
};


export { createUser, userSignin };
