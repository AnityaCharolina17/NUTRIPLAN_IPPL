import { Request, Response } from "express";
import { registerUser, loginUser, requestPasswordReset, resetPassword } from "../services/authService";
import { AuthRequest } from "../middleware/authMiddleware";
import prisma from "../utils/prismaClient";

export const register = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(result.success ? 201 : 400).json(result);
};

export const login = async (req: Request, res: Response) => {
  const { email, password, role } = req.body;
  const result = await loginUser(email, password, role);
  res.status(result.success ? 200 : 401).json(result);
};

export const requestReset = async (req: Request, res: Response) => {
  const { email } = req.body;
  const result = await requestPasswordReset(email);
  res.status(result.success ? 200 : 404).json(result);
};

export const confirmReset = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  const result = await resetPassword(token, newPassword);
  res.status(result.success ? 200 : 400).json(result);
};

/**
 * GET /api/auth/me
 * Return full user profile (not just JWT payload)
 */
export const getMe = async (req: AuthRequest, res: Response) => {
  if (!req.user?.userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        class: true,
        nis: true,
        bio: true,
        customAllergies: true,
        createdAt: true,
        updatedAt: true,
        allergens: {
          select: {
            allergen: true,
            isCustom: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("GET /me error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error fetching profile",
    });
  }
};
