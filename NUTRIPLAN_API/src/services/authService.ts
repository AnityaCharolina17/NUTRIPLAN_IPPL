import prisma from "../prisma";
import { hashPassword, comparePassword, generateToken } from "../utils/authUtils";
import { sendEmail } from "../utils/email";
import crypto from "crypto";

// In-memory reset token store (dummy for demo)
// key: token, value: { userId, expiresAt }
const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

export const registerUser = async (data: {
  name: string;
  email: string;
  password: string;
  role: "student" | "admin" | "kitchen_staff";
  class?: string;
  nis?: string;
}) => {
  const { name, email, password, role, class: className, nis } = data;

  const existingEmail = await prisma.user.findUnique({ where: { email } });
  if (existingEmail) return { success: false, message: "Email already registered" };

  if (nis) {
    // NIS/NISN must be at least 10 digits and numeric only
    const isValidNIS = /^\d{10,}$/.test(nis);
    if (!isValidNIS) {
      return { success: false, message: "NIS/NISN must be numeric and at least 10 digits" };
    }
    const existingNIS = await prisma.user.findFirst({ where: { nis } });
    if (existingNIS) return { success: false, message: "NIS/NISN already used" };
  }

  const hashed = await hashPassword(password);

  const newUser = await prisma.user.create({
    data: {
      name,
      email,
      password: hashed,
      role,
      class: className,
      nis
    },
  });

  const token = generateToken(newUser.id, newUser.role);

  // Attempt to send a welcome email if SMTP is configured
  try {
    await sendEmail({
      to: newUser.email,
      subject: "Selamat datang di Nutriplan",
      text: `Halo ${newUser.name}, akun Anda berhasil dibuat sebagai ${newUser.role}.`,
      html: `<p>Halo <strong>${newUser.name}</strong>,</p>
             <p>Akun Anda berhasil dibuat sebagai <strong>${newUser.role}</strong>.</p>
             <p>Selamat menggunakan Nutriplan.</p>`,
    });
  } catch (e) {
    // Do not block registration on email failure
    console.warn("Email sending failed (skipped or error):", (e as Error).message);
  }

  return {
    success: true,
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      class: newUser.class,
      nis: newUser.nis,
    },
    token,
  };
};

export const loginUser = async (email: string, password: string, expectedRole?: "student" | "admin" | "kitchen_staff") => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({ where: { email: { equals: normalizedEmail, mode: "insensitive" } } });

  if (!user) return { success: false, message: "Invalid credentials" };

  const match = await comparePassword(password, user.password);
  if (!match) return { success: false, message: "Invalid credentials" };

   if (expectedRole && user.role !== expectedRole) {
    return { success: false, message: "Role tidak sesuai untuk akun ini" };
  }

  const token = generateToken(user.id, user.role);

  return {
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      class: user.class,
      nis: user.nis,
    },
    token,
  };
};

export const requestPasswordReset = async (email: string) => {
  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findFirst({ where: { email: { equals: normalizedEmail, mode: "insensitive" } } });
  if (!user) {
    return { success: false, message: "Email tidak terdaftar" };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = Date.now() + 1000 * 60 * 15; // 15 menit
  resetTokens.set(token, { userId: user.id, expiresAt });

  // Skip real email; return token for demo/testing
  return {
    success: true,
    message: "Token reset dibuat",
    token,
    expiresAt,
  };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const entry = resetTokens.get(token);
  if (!entry) {
    return { success: false, message: "Token tidak valid" };
  }

  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    return { success: false, message: "Token kadaluarsa" };
  }

  if (!newPassword || newPassword.length < 5) {
    return { success: false, message: "Password minimal 5 karakter" };
  }

  const hashed = await hashPassword(newPassword);
  await prisma.user.update({
    where: { id: entry.userId },
    data: { password: hashed },
  });

  resetTokens.delete(token);
  return { success: true, message: "Password berhasil direset" };
};
