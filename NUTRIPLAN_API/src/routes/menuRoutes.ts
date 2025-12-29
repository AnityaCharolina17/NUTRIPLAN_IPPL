import { Router } from "express";
import {
  getCurrentWeekMenu,
  getNextWeekMenu,
  saveWeeklyMenu,
  updatePortionCount,
} from "../controllers/menuController";
import { authMiddleware } from "../middleware/authMiddleware";

const router = Router();

router.get("/current", getCurrentWeekMenu);
router.get("/next-week", getNextWeekMenu);
router.post("/save", authMiddleware, saveWeeklyMenu);
router.put("/:menuItemId/portion", authMiddleware, updatePortionCount);

export default router;
