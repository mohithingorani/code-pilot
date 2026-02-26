import { Request, Response } from "express";
import { prisma as client } from "../lib/prisma";


const createUser = async (req:Request, res:Response) => {
    const { email, password, name } = req.body;
    try {
        const user = await client.user.create({
            data: {
                email,
                password,
                name
            }
        });
        res.status(201).json(user);
    } catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
};

export { createUser };
