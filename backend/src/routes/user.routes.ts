import Router, { Request, Response } from "express";
const router = Router();
import { createUser, userSignin, getMe } from "../controllers/user.controller";
import { authenticate, AuthRequest } from "../middleware/auth.js";

router.post("/signup", createUser);
router.post("/signin", userSignin);
router.get("/me", authenticate, async (req: AuthRequest, res: Response) => {
  await getMe(req, res);
});

export default router