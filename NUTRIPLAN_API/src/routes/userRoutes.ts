import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import { getUser, updateProfile, updateAllergensController } from "../controllers/userController";

const router = Router();

// GET user profile
router.get("/:id", authMiddleware, getUser);

// UPDATE profile
router.put("/:id/profile", authMiddleware, updateProfile);

// UPDATE allergens (student only)
router.put("/:id/allergens", authMiddleware, updateAllergensController);

export default router;
