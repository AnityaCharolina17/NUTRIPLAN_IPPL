"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const userController_1 = require("../controllers/userController");
const router = (0, express_1.Router)();
// GET user profile
router.get("/:id", authMiddleware_1.authMiddleware, userController_1.getUser);
// UPDATE profile
router.put("/:id/profile", authMiddleware_1.authMiddleware, userController_1.updateProfile);
// UPDATE allergens (student only)
router.put("/:id/allergens", authMiddleware_1.authMiddleware, userController_1.updateAllergensController);
exports.default = router;
