import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Nutriplan API running" });
});

export default app;

import authRoutes from "./routes/authRoutes";
app.use("/api/auth", authRoutes);

import userRoutes from "./routes/userRoutes";
app.use("/api/users", userRoutes);

import menuRoutes from "./routes/menuRoutes";
app.use("/api/menus", menuRoutes);

import studentChoiceRoutes from "./routes/studentChoiceRoutes";
app.use("/api/student-choices", studentChoiceRoutes);

import kitchenRoutes from "./routes/kitchenRoutes";
app.use("/api/kitchen", kitchenRoutes);

import allergenRoutes from "./routes/allergenRoutes";
app.use("/api/allergens", allergenRoutes);

import aiRoutes from "./routes/aiRoutes";
app.use("/api/ai", aiRoutes);
