const router = require("express").Router();
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const { protect, requireRole } = require("../../middleware/auth");

const modOrAdmin = [protect, requireRole("admin", "moderator")];

// ── GET /api/admin/places  — all places with optional status filter ────────
router.get("/", ...modOrAdmin, async (req, res) => {
  try {
    const filter = req.query.status ? { status: req.query.status } : {};
    const places = await Place.find(filter)
      .populate("submitted_by", "display_name email")
      .sort({ createdAt: -1 })
      .lean();

    const enriched = await Promise.all(
      places.map(async (p) => {
        const reviewCount = await Review.countDocuments({ place_id: p._id });
        return { ...p, reviewCount };
      })
    );
    res.json(enriched);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/places/:id/status  — approve / reject / pending ──────
router.patch("/:id/status", ...modOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["approved", "rejected", "pending"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const place = await Place.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/places/:id ──────────────────────────────────────────
router.delete("/:id", ...modOrAdmin, async (req, res) => {
  try {
    await Place.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ place_id: req.params.id });
    res.json({ message: "Place deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
