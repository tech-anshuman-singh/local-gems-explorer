require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

// ── Public routes ─────────────────────────────────────────────────────────
const authRoutes     = require("./routes/public/auth");
const placesRoutes   = require("./routes/public/places");
const reviewsRoutes  = require("./routes/public/reviews");
const profilesRoutes = require("./routes/public/profiles");
const homepageRoutes = require("./routes/public/homepage");
const crewRoutes     = require("./routes/public/crew");
const uploadRoutes   = require("./routes/public/upload");

// ── Admin routes ──────────────────────────────────────────────────────────
const adminStatsRoutes     = require("./routes/admin/stats");
const adminUsersRoutes     = require("./routes/admin/users");
const adminPlacesRoutes    = require("./routes/admin/places");
const adminReviewsRoutes   = require("./routes/admin/reviews");
const adminAmenitiesRoutes = require("./routes/admin/amenities");
const adminMentionsRoutes  = require("./routes/admin/mentions");
const adminImagesRoutes    = require("./routes/admin/images");

const app = express();

// ── CORS Configuration ───────────────────────────────────────────────────
const staticOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://localhost:5050",
  "https://local-gems-explorer-kappa.vercel.app",
];

const envOrigins = process.env.CLIENT_URL
  ? process.env.CLIENT_URL.split(",").map((s) => s.trim().replace(/\/$/, ""))
  : [];

const allowedOrigins = new Set([...staticOrigins, ...envOrigins]);

const isAllowedOrigin = (origin) => {
  if (!origin) return true; // Allow non-browser requests (curl, Postman, server-to-server)
  const normalized = origin.replace(/\/$/, "");
  if (allowedOrigins.has(normalized)) return true;
  try {
    const hostname = new URL(normalized).hostname;
    if (hostname.endsWith(".vercel.app")) return true;
  } catch {
    return false;
  }
  return false;
};

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

app.options("*", cors());

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Root & Health Check ───────────────────────────────────────────────────
// Accessible without requiring database connection
app.get("/", (req, res) => {
  res.json({
    name: "Local Gems Explorer API",
    status: "running",
    health: "/api/health",
  });
});

app.get("/api/health", (req, res) => {
  const stateMap = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };
  res.json({
    status: "ok",
    database: stateMap[mongoose.connection.readyState] || "unknown",
    environment: process.env.VERCEL ? "vercel-production" : (process.env.NODE_ENV || "development"),
    timestamp: new Date().toISOString(),
  });
});

// ── Database Connection Middleware ─────────────────────────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error("Database connection failed on request:", err.message);
    return res.status(503).json({
      error: "Database connection failed",
      message:
        process.env.NODE_ENV === "production"
          ? "Unable to connect to the database. Please verify MONGO_URI in your environment."
          : err.message,
    });
  }
});

// ── Mount public routes ───────────────────────────────────────────────────
app.use("/api/auth",      authRoutes);
app.use("/api/places",    placesRoutes);
app.use("/api/reviews",   reviewsRoutes);
app.use("/api/profiles",  profilesRoutes);
app.use("/api/homepage",  homepageRoutes);
app.use("/api/crew",      crewRoutes);
app.use("/api/upload",    uploadRoutes);

// ── Mount admin routes ────────────────────────────────────────────────────
app.use("/api/admin/stats",      adminStatsRoutes);
app.use("/api/admin/users",      adminUsersRoutes);
app.use("/api/admin/places",     adminPlacesRoutes);
app.use("/api/admin/reviews",    adminReviewsRoutes);
app.use("/api/admin/amenities",  adminAmenitiesRoutes);
app.use("/api/admin/mentions",   adminMentionsRoutes);
app.use("/api/admin/images",     adminImagesRoutes);

// ── 404 Route handler ─────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack || err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

// ── Local Server Listen ───────────────────────────────────────────────────
// When running locally, start the HTTP server. On Vercel, the app is exported as a Serverless Function.
if (require.main === module && !process.env.VERCEL) {
  const PORT = process.env.PORT || 5050;
  connectDB().catch((err) => {
    console.error("Initial MongoDB connection warning:", err.message);
  });
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
