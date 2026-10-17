const router = require("express").Router();
const Profile = require("../../models/Profile");
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload");

// ── GET /api/profiles/me  — logged-in user's profile ─────────────────────
router.get("/me", protect, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.user._id });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/profiles/me  — update display_name, bio, avatar_url ─────────
router.put("/me", protect, async (req, res) => {
  try {
    const { display_name, bio, avatar_url } = req.body;
    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      { display_name, bio, avatar_url },
      { new: true, upsert: true }
    );
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/profiles/me/avatar  — upload avatar image to Cloudinary ────
router.post("/me/avatar", protect, upload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatar_url = req.file.path; // Cloudinary HTTPS URL

    const profile = await Profile.findOneAndUpdate(
      { user_id: req.user._id },
      { avatar_url },
      { new: true, upsert: true }
    );
    res.json({ avatar_url, profile });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/profiles/:userId  — public profile by user ID ───────────────
router.get("/:userId", async (req, res) => {
  try {
    const profile = await Profile.findOne({ user_id: req.params.userId });
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/profiles/:userId/badges  — earned badges for a user ─────────
router.get("/:userId/badges", async (req, res) => {
  try {
    const [placeCount, reviewCount] = await Promise.all([
      Place.countDocuments({ submitted_by: req.params.userId }),
      Review.countDocuments({ user_id: req.params.userId }),
    ]);

    const badges = [];
    if (reviewCount >= 1) badges.push("Explorer");
    if (placeCount  >= 1) badges.push("Contributor");
    if (placeCount  >= 3) badges.push("Trailblazer");

    res.json({ badges, placeCount, reviewCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
