const router = require("express").Router();
const Place = require("../../models/Place");
const { protect, requireRole } = require("../../middleware/auth");

const modOrAdmin = [protect, requireRole("admin", "moderator")];

// ── GET /api/admin/amenities  — all amenities across all places ───────────
router.get("/", ...modOrAdmin, async (req, res) => {
  try {
    const places = await Place.find({ "amenities.0": { $exists: true } })
      .select("title amenities")
      .lean();

    const result = [];
    places.forEach((p) =>
      p.amenities.forEach((a) =>
        result.push({ ...a, placeId: p._id, placeTitle: p.title })
      )
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/admin/amenities/:placeId/:amenityId  — update status ───────
router.patch("/:placeId/:amenityId", ...modOrAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    if (!["available", "limited", "unavailable"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const place = await Place.findOneAndUpdate(
      { _id: req.params.placeId, "amenities._id": req.params.amenityId },
      { $set: { "amenities.$.status": status } },
      { new: true }
    );
    if (!place) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Amenity updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
