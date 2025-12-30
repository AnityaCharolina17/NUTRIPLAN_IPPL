import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import menuRoutes from "./routes/menuRoutes";
import studentChoiceRoutes from "./routes/studentChoiceRoutes";
import kitchenRoutes from "./routes/kitchenRoutes";
import allergenRoutes from "./routes/allergenRoutes";
import aiRoutes from "./routes/aiRoutes";

dotenv.config();

const app = express();

/**
 * ======================
 * CORS CONFIG (WAJIB)
 * ======================
 * Izinkan frontend Vercel + localhost
 */
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://nutriplan-ippl-jy1w.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

/**
 * ======================
 * HEALTH CHECK
 * ======================
 */
app.get("/", (req, res) => {
  res.json({ message: "Nutriplan API running" });
});

/**
 * ======================
 * ROUTES
 * ======================
 */
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/student-choices", studentChoiceRoutes);
app.use("/api/kitchen", kitchenRoutes);
app.use("/api/allergens", allergenRoutes);
app.use("/api/ai", aiRoutes);

/**
 * ======================
 * EXPORT APP
 * ======================
 */
export default app;
