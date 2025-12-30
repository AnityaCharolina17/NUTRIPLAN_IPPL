import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Routes
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
 * CORS CONFIG (FINAL)
 * ======================
 * - Allow localhost
 * - Allow ALL Vercel domains (*.vercel.app)
 * - Prevent random origins
 */
app.use(
  cors({
    origin: (origin, callback) => {
      // allow server-to-server, curl, postman
      if (!origin) return callback(null, true);

      if (
        origin.includes("localhost") ||
        origin.includes("vercel.app")
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
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
 * API ROUTES
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
 * 404 HANDLER (OPTIONAL BUT GOOD)
 * ======================
 */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found",
  });
});

/**
 * ======================
 * EXPORT APP
 * ======================
 */
export default app;
