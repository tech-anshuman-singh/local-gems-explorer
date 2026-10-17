const router = require("express").Router();
const User = require("../../models/User");
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const { protect, requireRole } = require("../../middleware/auth");

const adminOnly = [protect, requireRole("admin")];

// ── GET /api/admin/users  — all users with contribution counts ────────────
router.get("/", ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 }).lean();
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [placeCount, reviewCount] = await Promise.all([
          Place.countDocuments({ submitted_by: u._id }),
          Review.countDocuments({ user_id: u._id }),
        ]);
        return { ...u, placeCount, reviewCount };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/users/:id/role  — change user role ──────────────────
router.patch("/:id/role", ...adminOnly, async (req, res) => {
  try {
    const { role } = req.body;
    if (!["admin", "moderator", "user"].includes(role))
      return res.status(400).json({ message: "Invalid role" });

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────
router.delete("/:id", ...adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
