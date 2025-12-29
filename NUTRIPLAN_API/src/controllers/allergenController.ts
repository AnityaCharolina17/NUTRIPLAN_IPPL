import { Response } from "express";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../utils/prismaClient";
import { openai } from "../utils/openai";

/**
 * POST /api/allergens/check
 * Cek apakah ada allergen dalam menu untuk user tertentu
 * Enhanced dengan AI untuk deteksi lebih akurat
 */
export const checkAllergens = async (req: AuthRequest, res: Response) => {
  try {
    const { ingredients, menuAllergens, useAI = false, foodDescription } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Ambil allergen user
    const userAllergensDb = await prisma.userAllergen.findMany({
      where: { userId },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { customAllergies: true },
    });

    const customList = user?.customAllergies
      ? user.customAllergies.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const userAllergenList = [...userAllergensDb.map(a => a.allergen), ...customList]
      .map(a => a.toLowerCase());

    let matchedAllergens: string[] = [];
    let aiAnalysis: any = null;

    // Use AI if requested and foodDescription is provided
    if (useAI && foodDescription) {
      const prompt = `Analisis apakah makanan berikut mengandung alergen dari daftar ini: ${userAllergenList.join(', ')}.

Deskripsi makanan: ${foodDescription}
Bahan: ${(ingredients || []).join(', ')}

Response dalam JSON:
{
  "detectedAllergens": ["alergen yang terdeteksi"],
  "confidence": "high/medium/low",
  "reasoning": "penjelasan singkat"
}`;

      try {
        const aiResponse = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "Kamu adalah ahli keamanan pangan yang mendeteksi alergen. Jawab dengan JSON valid saja.",
            },
            { role: "user", content: prompt },
          ],
          temperature: 0.2,
        });

        const rawContent = aiResponse.choices[0]?.message?.content || "{}";
        let cleanContent = rawContent.trim();
        if (cleanContent.startsWith('```json')) {
          cleanContent = cleanContent.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        }

        aiAnalysis = JSON.parse(cleanContent);
        matchedAllergens = (aiAnalysis.detectedAllergens || []).map((a: string) => a.toLowerCase());
      } catch (aiError) {
        console.error('AI analysis failed, falling back to keyword matching:', aiError);
        useAI && console.log('Falling back to traditional matching');
      }
    }

    // Fallback to traditional keyword matching if AI not used or failed
    if (!useAI || matchedAllergens.length === 0) {
      const menuAllergenList = (menuAllergens || []).map((a: string) => a.toLowerCase());
      const ingredientList = (ingredients || []).map((i: string) => i.toLowerCase());

      // Check allergens dari menu
      menuAllergenList.forEach((allergen: string) => {
        if (userAllergenList.includes(allergen)) {
          matchedAllergens.push(allergen);
        }
      });

      // Check ingredients (simple keyword matching)
      ingredientList.forEach((ingredient: string) => {
        userAllergenList.forEach(allergen => {
          if (ingredient.includes(allergen) || allergen.includes(ingredient)) {
            if (!matchedAllergens.includes(allergen)) {
              matchedAllergens.push(allergen);
            }
          }
        });
      });
    }

    const hasAllergy = matchedAllergens.length > 0;

    return res.json({
      success: true,
      hasAllergy,
      matchedAllergens,
      severity: hasAllergy ? 'high' : 'none',
      recommendation: hasAllergy 
        ? 'Pilih menu sehat yang aman untuk alergi Anda'
        : 'Menu ini aman untuk Anda',
      aiAnalysis: useAI ? aiAnalysis : undefined,
      method: useAI && aiAnalysis ? 'AI-powered' : 'keyword-matching',
    });
  } catch (error) {
    console.error("Check allergens error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/**
 * POST /api/allergens/check-menu/:menuItemId
 * Cek allergen untuk menu item tertentu
 */
export const checkMenuItemAllergens = async (req: AuthRequest, res: Response) => {
  try {
    const { menuItemId } = req.params;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Ambil menu item
    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: {
        ingredients: true,
        allergens: true,
      },
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found",
      });
    }

    // Ambil allergen user
    const userAllergens = await prisma.userAllergen.findMany({
      where: { userId },
    });

    const userAllergenList = userAllergens.map(a => a.allergen.toLowerCase());
    const menuAllergenList = menuItem.allergens.map(a => a.allergen.toLowerCase());

    const matchedAllergens = menuAllergenList.filter(allergen => 
      userAllergenList.includes(allergen)
    );

    const hasAllergy = matchedAllergens.length > 0;

    return res.json({
      success: true,
      menuItem,
      hasAllergy,
      matchedAllergens,
      severity: hasAllergy ? 'high' : 'none',
      recommendation: hasAllergy 
        ? 'Pilih menu sehat sebagai pengganti'
        : 'Menu ini aman untuk Anda',
    });
  } catch (error) {
    console.error("Check menu item allergens error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
