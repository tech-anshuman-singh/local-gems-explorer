const router = require("express").Router();
const CrewMember = require("../../models/CrewMember");
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const User = require("../../models/User");
const { protect, requireRole } = require("../../middleware/auth");

const adminOnly = [protect, requireRole("admin")];

// ── Helper: attach live contribution stats ────────────────────────────────
async function withStats(member) {
  const m = member.toObject ? member.toObject() : { ...member };
  if (m.user_id) {
    const [places, reviews] = await Promise.all([
      Place.countDocuments({ submitted_by: m.user_id, status: "approved" }),
      Review.countDocuments({ user_id: m.user_id }),
    ]);
    m.stats = { places, reviews, total: places + reviews };
  } else {
    m.stats = { places: 0, reviews: 0, total: 0 };
  }
  return m;
}

// ── GET /api/crew  — featured members with live stats (public) ───────────
router.get("/", async (req, res) => {
  try {
    const members = await CrewMember.find({ is_featured: true })
      .populate("user_id", "display_name email")
      .sort({ sort_order: 1, createdAt: 1 });

    const enriched = await Promise.all(members.map(withStats));
    // sort by sort_order first, then by total contributions desc
    enriched.sort((a, b) => {
      if (a.sort_order !== b.sort_order) return a.sort_order - b.sort_order;
      return b.stats.total - a.stats.total;
    });

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crew/all  — all members including hidden (admin) ─────────────
router.get("/all", ...adminOnly, async (req, res) => {
  try {
    const members = await CrewMember.find()
      .populate("user_id", "display_name email")
      .sort({ sort_order: 1 });
    const enriched = await Promise.all(members.map(withStats));
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/crew/users  — all platform users with stats (admin picker) ───
router.get("/users", ...adminOnly, async (req, res) => {
  try {
    const users = await User.find().select("-password").lean();
    const enriched = await Promise.all(
      users.map(async (u) => {
        const [places, reviews] = await Promise.all([
          Place.countDocuments({ submitted_by: u._id, status: "approved" }),
          Review.countDocuments({ user_id: u._id }),
        ]);
        const inCrew = await CrewMember.findOne({ user_id: u._id });
        return { ...u, stats: { places, reviews, total: places + reviews }, inCrew: !!inCrew };
      })
    );
    enriched.sort((a, b) => b.stats.total - a.stats.total);
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/crew  — add crew member (admin) ─────────────────────────────
router.post("/", ...adminOnly, async (req, res) => {
  try {
    const { user_id, display_name, role_title, bio, avatar_url, social_links, is_featured, sort_order } = req.body;
    if (!display_name)
      return res.status(400).json({ message: "display_name is required" });

    const member = await CrewMember.create({
      user_id: user_id || undefined,
      display_name, role_title, bio, avatar_url, social_links, is_featured, sort_order,
    });
    res.status(201).json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/crew/:id  — update crew member (admin) ──────────────────────
router.put("/:id", ...adminOnly, async (req, res) => {
  try {
    const { user_id, display_name, role_title, bio, avatar_url, social_links, is_featured, sort_order } = req.body;
    const member = await CrewMember.findByIdAndUpdate(
      req.params.id,
      { user_id: user_id || undefined, display_name, role_title, bio, avatar_url, social_links, is_featured, sort_order },
      { new: true }
    );
    if (!member) return res.status(404).json({ message: "Member not found" });
    res.json(member);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/crew/reorder  — bulk sort_order update (admin) ────────────
router.patch("/reorder", ...adminOnly, async (req, res) => {
  try {
    const { order } = req.body;
    if (!Array.isArray(order))
      return res.status(400).json({ message: "order array required" });

    await Promise.all(
      order.map(({ id, sort_order }) =>
        CrewMember.findByIdAndUpdate(id, { sort_order })
      )
    );
    res.json({ message: "Reordered" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/crew/:id  — remove crew member (admin) ───────────────────
router.delete("/:id", ...adminOnly, async (req, res) => {
  try {
    await CrewMember.findByIdAndDelete(req.params.id);
    res.json({ message: "Member removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
