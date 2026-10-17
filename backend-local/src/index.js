require("dotenv").config();
const express = require("express");
const cors    = require("cors");
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

connectDB();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
    process.env.CLIENT_URL,
  ].filter(Boolean),
  credentials: true,
}));
app.use(express.json());

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

// ── Health check ──────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ── Global error handler ──────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
