const router = require("express").Router();
const Review = require("../../models/Review");
const { protect, requireRole } = require("../../middleware/auth");

// ── GET /api/reviews  — filter by place_id or user_id ────────────────────
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.place_id) filter.place_id = req.query.place_id;
    if (req.query.user_id)  filter.user_id  = req.query.user_id;

    const reviews = await Review.find(filter)
      .populate("user_id",  "display_name")
      .populate("place_id", "title")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/reviews  — submit a review (auth required) ─────────────────
router.post("/", protect, async (req, res) => {
  try {
    const { place_id, rating, comment } = req.body;
    if (!place_id || !rating)
      return res.status(400).json({ message: "place_id and rating required" });
    if (rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const review = await Review.create({
      place_id,
      user_id: req.user._id,
      rating,
      comment,
    });
    await review.populate("user_id", "display_name");
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/reviews/:id  — owner can delete their own review ──────────
// (admin/moderator can also delete any review)
router.delete("/:id", protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ message: "Review not found" });

    const isOwner = review.user_id.toString() === req.user._id.toString();
    const isAdmin = ["admin", "moderator"].includes(req.user.role);

    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    await review.deleteOne();
    res.json({ message: "Review deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/reviews/:id/verify  — admin/moderator only ────────────────
router.patch("/:id/verify", protect, requireRole("admin", "moderator"), async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { is_verified: req.body.is_verified ?? true },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
