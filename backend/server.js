require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const connectDB = require("./config/db");

// Import Routes
const moduleRoutes = require("./routes/moduleRoutes");
const progressRoutes = require("./routes/progressRoutes");
const quizRoutes = require("./routes/quizRoutes");
const leaderboardRoutes = require("./routes/leaderboardRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authRoutes = require("./routes/authRoutes"); // Required for the login flow
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const certificateRoutes = require("./routes/certificateRoutes");

const app = express();

// Middleware
// Ensure CORS accepts requests from your Vite frontend
const corsOrigin = (origin, callback) => {
  const allowed = new Set(
    [
      process.env.FRONTEND_URL,
      "http://localhost:5173",
      "http://localhost:5174",
      "https://swc.iitg.ac.in"
    ].filter(Boolean),
  );

  if (
    !origin ||
    allowed.has(origin) ||
    origin.startsWith("http://localhost:") ||
    origin.startsWith("http://127.0.0.1:")
  ) {
    return callback(null, true);
  }
  return callback(new Error(`CORS blocked origin: ${origin}`));
};

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json()); // Parses incoming JSON payloads
app.use(express.urlencoded({ extended: true })); // Parses URL-encoded form data (EJS forms)
app.use(cookieParser()); // Parse cookies

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Mount API Routes
app.use("/modules", moduleRoutes);
app.use("/progress", progressRoutes);
app.use("/quizzes", quizRoutes);
app.use("/leaderboards", leaderboardRoutes);
app.use("/users", userRoutes);
app.use("/admin", adminRoutes);
app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/notifications", notificationRoutes);
app.use("/certificates", certificateRoutes);

// Mount EJS Whitelist routes
const whitelistRoutes = require("./routes/whitelistRoutes");
app.use("/admin-whitelist", whitelistRoutes);

// Global Error Handler (Optional but recommended)
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const syncLeaderboards = require("./utils/leaderboardSync");

// Start Server
const startServer = async () => {
  try {
    // Connect to database and wait for successful connection
    await connectDB();

    // Auto-sync leaderboards on startup
    await syncLeaderboards();

    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Server is up and running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
