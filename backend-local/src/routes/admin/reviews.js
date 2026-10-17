const router = require("express").Router();
const Review = require("../../models/Review");
const { protect, requireRole } = require("../../middleware/auth");

const modOrAdmin = [protect, requireRole("admin", "moderator")];

// ── GET /api/admin/reviews  — all reviews ────────────────────────────────
router.get("/", ...modOrAdmin, async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user_id",  "display_name email")
      .populate("place_id", "title")
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/reviews/:id/verify  — verify a review ───────────────
router.patch("/:id/verify", ...modOrAdmin, async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { is_verified: req.body.is_verified ?? true },
      { new: true }
    )
      .populate("user_id",  "display_name")
      .populate("place_id", "title");

    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/reviews/:id ────────────────────────────────────────
router.delete("/:id", ...modOrAdmin, async (req, res) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
