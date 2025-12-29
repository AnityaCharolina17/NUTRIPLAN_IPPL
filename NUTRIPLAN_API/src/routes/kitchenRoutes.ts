import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getWeeklyRecap,
  getDailyRecap,
} from "../controllers/kitchenController";

const router = Router();

router.get("/recap/:weekStart", authMiddleware, getWeeklyRecap);
router.get("/daily-recap/:weekStart/:day", authMiddleware, getDailyRecap);

export default router;
