const router = require("express").Router();
const Place = require("../../models/Place");
const { protect, requireRole } = require("../../middleware/auth");

const modOrAdmin = [protect, requireRole("admin", "moderator")];

// ── GET /api/admin/mentions  — all mentions across all places ─────────────
router.get("/", ...modOrAdmin, async (req, res) => {
  try {
    const places = await Place.find({ "mentions.0": { $exists: true } })
      .select("title mentions")
      .lean();

    const result = [];
    places.forEach((p) =>
      p.mentions.forEach((m) =>
        result.push({ ...m, placeId: p._id, placeTitle: p.title })
      )
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/mentions/:placeId/:mentionId/status  — update status ─
router.patch("/:placeId/:mentionId/status", ...modOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const place = await Place.findOneAndUpdate(
      { _id: req.params.placeId, "mentions._id": req.params.mentionId },
      { $set: { "mentions.$.status": status } },
      { new: true }
    );
    if (!place) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Mention updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/mentions/:placeId/:mentionId ────────────────────────
router.delete("/:placeId/:mentionId", ...modOrAdmin, async (req, res) => {
  try {
    await Place.findByIdAndUpdate(req.params.placeId, {
      $pull: { mentions: { _id: req.params.mentionId } },
    });
    res.json({ message: "Mention deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
