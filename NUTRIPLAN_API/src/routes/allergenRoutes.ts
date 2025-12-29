import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  checkAllergens,
  checkMenuItemAllergens,
} from "../controllers/allergenController";

const router = Router();

router.post("/check", authMiddleware, checkAllergens);
router.post("/check-menu/:menuItemId", authMiddleware, checkMenuItemAllergens);

export default router;
