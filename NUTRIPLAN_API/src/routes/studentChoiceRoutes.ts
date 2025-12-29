import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import {
  getChoiceStatus,
  getMyChoices,
  updateMyChoice,
} from "../controllers/studentChoiceController";

const router = Router();

router.get("/status", authMiddleware, getChoiceStatus);
router.get("/my-choices", authMiddleware, getMyChoices);
router.put("/", authMiddleware, updateMyChoice);

export default router;
