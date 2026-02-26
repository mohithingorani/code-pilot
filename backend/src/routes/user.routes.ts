import Router, { Request, Response } from "express";
const router = Router();
import { createUser } from "../controllers/user.controller";


router.post("/signup", createUser);

export default router