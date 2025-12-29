"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../middleware/authMiddleware");
const kitchenController_1 = require("../controllers/kitchenController");
const router = (0, express_1.Router)();
router.get("/recap/:weekStart", authMiddleware_1.authMiddleware, kitchenController_1.getWeeklyRecap);
router.get("/daily-recap/:weekStart/:day", authMiddleware_1.authMiddleware, kitchenController_1.getDailyRecap);
exports.default = router;
