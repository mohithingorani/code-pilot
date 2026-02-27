import Router, { Request, Response } from "express";
const router = Router();
import { createUser, userSignin } from "../controllers/user.controller";


router.post("/signup", createUser);
router.post("/signin", userSignin);

export default router