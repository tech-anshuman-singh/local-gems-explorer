const router = require("express").Router();
const Place = require("../../models/Place");
const { protect, requireRole } = require("../../middleware/auth");

const modOrAdmin = [protect, requireRole("admin", "moderator")];

// ── GET /api/admin/images  — all place images ─────────────────────────────
router.get("/", ...modOrAdmin, async (req, res) => {
  try {
    const places = await Place.find({ "place_images.0": { $exists: true } })
      .select("title place_images")
      .populate("place_images.uploaded_by", "display_name")
      .lean();

    const result = [];
    places.forEach((p) =>
      p.place_images.forEach((img) =>
        result.push({ ...img, placeId: p._id, placeTitle: p.title })
      )
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/admin/images/:placeId/:imageId ────────────────────────────
router.delete("/:placeId/:imageId", ...modOrAdmin, async (req, res) => {
  try {
    await Place.findByIdAndUpdate(req.params.placeId, {
      $pull: { place_images: { _id: req.params.imageId } },
    });
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
