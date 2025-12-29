import { Router } from "express";
import { 
	generateMealPlan, 
	detectAllergensAI,
	analyzeFood,
	checkAllergenSafety,
	validateIngredient,
	validateIngredientsBatch,
	getAvailableIngredients,
	searchIngredientsByKeyword,
	generateMenuFromIngredient,
	getAllMenuCases,
	getMenuCaseStatistics,
	checkIngredientsAllergen,
	checkSingleIngredientAllergen,
	checkMenuAllergenEndpoint,
	checkUserAllergenSafetyEndpoint,
	getAllIngredientsAllergenEndpoint,
	getAllergenStatisticsEndpoint
} from "../controllers/aiController";
import { authRequired } from "../middleware/authMiddleware";

const router = Router();

// Ingredient Validation (Core Feature)
router.post("/validate-ingredient", validateIngredient);
router.post("/validate-ingredients-batch", validateIngredientsBatch);
router.get("/ingredients", getAvailableIngredients);
router.get("/ingredients/search", searchIngredientsByKeyword);

// Allergen detection (Semantic rule-based)
router.post("/check-allergen", checkIngredientsAllergen);
router.get("/check-allergen/:ingredient", checkSingleIngredientAllergen);
router.get("/check-allergen/menu/:ingredient", checkMenuAllergenEndpoint);
router.post("/check-allergen/user-safety", authRequired, checkUserAllergenSafetyEndpoint);
router.get("/allergen/ingredients", getAllIngredientsAllergenEndpoint);
router.get("/allergen/statistics", getAllergenStatisticsEndpoint);

// Meal planning
router.post("/mealplan", generateMealPlan);

// Food analysis with AI
router.post("/analyze-food", analyzeFood);

// Allergen detection and safety check (public for guest users)
router.post("/detect-allergens", detectAllergensAI);
router.post("/check-allergen-safety", checkAllergenSafety);

// Case-Based Reasoning menu generation
// Align with frontend expectation: POST /api/ai/generate-menu-cbr
router.post("/generate-menu-cbr", generateMenuFromIngredient);
// Backwards-compatible route
router.post("/generate-menu", generateMenuFromIngredient);

export default router;
