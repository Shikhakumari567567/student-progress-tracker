import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import Progress from "./models/Progress.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Home route
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// POST API: Add student progress
app.post("/api/progress", async (req, res) => {
  try {
    const {
      studentName,
      courseName,
      completionPercentage
    } = req.body;

    if (
      typeof studentName !== "string" ||
      !studentName.trim() ||
      typeof courseName !== "string" ||
      !courseName.trim() ||
      completionPercentage === "" ||
      completionPercentage === null ||
      completionPercentage === undefined ||
      !Number.isFinite(Number(completionPercentage)) ||
      Number(completionPercentage) < 0 ||
      Number(completionPercentage) > 100
    ) {
      return res.status(400).json({
        message: "Enter a valid student name, course name, and percentage (0-100)."
      });
    }

    const progress = await Progress.create({
      studentName: studentName.trim(),
      courseName: courseName.trim(),
      completionPercentage: Number(completionPercentage),
      lastUpdated: new Date()
    });

    res.status(201).json({
      message: "Student progress saved successfully!",
      progress
    });
  } catch (error) {
    console.error("Save progress error:", error.message);

    res.status(500).json({
      message: "Failed to save student progress."
    });
  }
});

// GET API: Retrieve all progress entries
app.get("/api/progress", async (req, res) => {
  try {
    const progressEntries = await Progress.find().sort({
      lastUpdated: -1
    });

    res.status(200).json(progressEntries);
  } catch (error) {
    console.error("Fetch progress error:", error.message);

    res.status(500).json({
      message: "Failed to retrieve student progress."
    });
  }
});

// Connect to MongoDB and start server
async function startServer() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI is missing from .env");
    }

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup error:", error.message);
    process.exit(1);
  }
}

startServer();
