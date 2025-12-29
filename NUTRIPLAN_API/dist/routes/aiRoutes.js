"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const aiController_1 = require("../controllers/aiController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Ingredient Validation (Core Feature)
router.post("/validate-ingredient", aiController_1.validateIngredient);
router.post("/validate-ingredients-batch", aiController_1.validateIngredientsBatch);
router.get("/ingredients", aiController_1.getAvailableIngredients);
router.get("/ingredients/search", aiController_1.searchIngredientsByKeyword);
// Allergen detection (Semantic rule-based)
router.post("/check-allergen", aiController_1.checkIngredientsAllergen);
router.get("/check-allergen/:ingredient", aiController_1.checkSingleIngredientAllergen);
router.get("/check-allergen/menu/:ingredient", aiController_1.checkMenuAllergenEndpoint);
router.post("/check-allergen/user-safety", authMiddleware_1.authRequired, aiController_1.checkUserAllergenSafetyEndpoint);
router.get("/allergen/ingredients", aiController_1.getAllIngredientsAllergenEndpoint);
router.get("/allergen/statistics", aiController_1.getAllergenStatisticsEndpoint);
// Meal planning
router.post("/mealplan", aiController_1.generateMealPlan);
// Food analysis with AI
router.post("/analyze-food", aiController_1.analyzeFood);
// Allergen detection and safety check (public for guest users)
router.post("/detect-allergens", aiController_1.detectAllergensAI);
router.post("/check-allergen-safety", aiController_1.checkAllergenSafety);
// Case-Based Reasoning menu generation
// Align with frontend expectation: POST /api/ai/generate-menu-cbr
router.post("/generate-menu-cbr", aiController_1.generateMenuFromIngredient);
// Backwards-compatible route
router.post("/generate-menu", aiController_1.generateMenuFromIngredient);
exports.default = router;
