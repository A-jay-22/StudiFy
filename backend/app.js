import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "config", ".env") });

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import studyRoutes from "./routes/studyRoutes.js";

const app = express();

const frontendOrigins = new Set(
  (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
);
if (process.env.NODE_ENV !== "production") {
  frontendOrigins.add("http://localhost:5173");
  frontendOrigins.add("http://127.0.0.1:5173");
}

app.use(
  cors({
    origin(origin, callback) {
      callback(null, !origin || frontendOrigins.has(origin));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/study", studyRoutes);

app.use((_req, res) => {
  res.status(404).json({ message: "The requested API endpoint was not found." });
});

app.use((error, _req, res, _next) => {
  const status =
    error.status ||
    (["LIMIT_FILE_SIZE", "LIMIT_UNEXPECTED_FILE"].includes(error.code) ? 400 : 500);
  if (status >= 500) console.error(error);
  res.status(status).json({
    message: status < 500 ? error.message : "An unexpected server error occurred.",
  });
});

async function startServer() {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 characters.");
  }

  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/studify",
  );

  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`Studify API listening on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error("Unable to start the Studify API:", error);
  process.exitCode = 1;
});

export default app;
