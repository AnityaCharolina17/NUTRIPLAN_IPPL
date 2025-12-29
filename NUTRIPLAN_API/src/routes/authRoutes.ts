import { Router } from "express";
import { register, login, getMe } from "../controllers/authController";
import { authRequired } from "../middleware/authMiddleware";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authRequired, getMe);

export default router;
