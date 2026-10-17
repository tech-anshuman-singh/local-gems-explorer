const router = require("express").Router();
const User = require("../../models/User");
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const { protect, requireRole } = require("../../middleware/auth");

const modOrAdmin = [protect, requireRole("admin", "moderator")];

// ── GET /api/admin/stats ──────────────────────────────────────────────────
router.get("/", ...modOrAdmin, async (req, res) => {
  try {
    const [totalUsers, totalPlaces, totalReviews, pending, rejected] = await Promise.all([
      User.countDocuments(),
      Place.countDocuments({ status: "approved" }),
      Review.countDocuments(),
      Place.countDocuments({ status: "pending" }),
      Place.countDocuments({ status: "rejected" }),
    ]);

    const [recentPlaces, recentReviews] = await Promise.all([
      Place.find().sort({ createdAt: -1 }).limit(5)
        .populate("submitted_by", "display_name email").lean(),
      Review.find().sort({ createdAt: -1 }).limit(5)
        .populate("user_id", "display_name")
        .populate("place_id", "title").lean(),
    ]);

    const activity = [
      ...recentPlaces.map((p) => ({
        action: p.status === "pending" ? "New place submitted" : `Place ${p.status}`,
        detail: `${p.title}, ${p.city}`,
        time:   p.createdAt,
        type:   "place",
      })),
      ...recentReviews.map((r) => ({
        action: "New review posted",
        detail: `${r.user_id?.display_name || "User"} on ${r.place_id?.title || "a place"}`,
        time:   r.createdAt,
        type:   "review",
      })),
    ]
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 8);

    res.json({ totalUsers, totalPlaces, totalReviews, pending, rejected, activity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
