"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const allergenController_1 = require("../controllers/allergenController");
const router = (0, express_1.Router)();
router.post("/check", authMiddleware_1.authMiddleware, allergenController_1.checkAllergens);
router.post("/check-menu/:menuItemId", authMiddleware_1.authMiddleware, allergenController_1.checkMenuItemAllergens);
exports.default = router;
