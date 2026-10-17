const router = require("express").Router();
const Place = require("../../models/Place");
const Review = require("../../models/Review");
const { protect } = require("../../middleware/auth");
const upload = require("../../middleware/upload");

// ── Helper: attach avg rating to a place ──────────────────────────────────
async function attachRating(place) {
  const reviews = await Review.find({ place_id: place._id });
  const ratings = reviews.map((r) => r.rating);
  const avg = ratings.length
    ? ratings.reduce((a, b) => a + b, 0) / ratings.length
    : 0;
  return { ...place, avgRating: Math.round(avg * 10) / 10, reviewCount: ratings.length };
}

// ── GET /api/places  — public, approved only ──────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { category, sort, limit, submitted_by } = req.query;
    const filter = {};

    if (submitted_by) {
      // owner can see all their own places regardless of status
      filter.submitted_by = submitted_by;
    } else {
      filter.status = "approved";
    }

    if (category && category !== "all") filter.category = category;

    let query = Place.find(filter).populate("submitted_by", "display_name email");

    if (sort === "recent" || !sort) query = query.sort({ createdAt: -1 });
    if (limit) query = query.limit(Number(limit));

    const places = await query.lean();
    const result = await Promise.all(places.map(attachRating));

    if (sort === "rating")  result.sort((a, b) => b.avgRating - a.avgRating);
    if (sort === "reviews") result.sort((a, b) => b.reviewCount - a.reviewCount);

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── GET /api/places/:id  — single place with reviews ─────────────────────
router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id)
      .populate("submitted_by", "display_name email")
      .lean();
    if (!place) return res.status(404).json({ message: "Place not found" });

    const reviews = await Review.find({ place_id: place._id })
      .populate("user_id", "display_name")
      .sort({ createdAt: -1 })
      .lean();

    const ratings = reviews.map((r) => r.rating);
    const avg = ratings.length
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;

    res.json({
      ...place,
      reviews,
      avgRating: Math.round(avg * 10) / 10,
      reviewCount: ratings.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/places  — submit a new place (auth required) ───────────────
router.post("/", protect, upload.array("images", 10), async (req, res) => {
  try {
    const { title, description, history, category, city, country, address, best_time_to_visit, amenities, mentions } = req.body;

    if (!title || !category || !city || !country)
      return res.status(400).json({ message: "title, category, city, country are required" });

    const place_images = (req.files || []).map((f, i) => ({
      image_url: f.path,
      is_primary: i === 0,
      uploaded_by: req.user._id,
    }));

    const place = await Place.create({
      title,
      description,
      history,
      category,
      city,
      country,
      address,
      best_time_to_visit,
      submitted_by: req.user._id,
      place_images,
      amenities:  amenities  ? JSON.parse(amenities)  : [],
      mentions:   mentions   ? JSON.parse(mentions)   : [],
    });

    res.status(201).json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/places/:id  — edit own place (owner only, re-pending on edit) ─
router.put("/:id", protect, upload.array("images", 10), async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    // only owner or admin can edit
    const isOwner = place.submitted_by.toString() === req.user._id.toString();
    const isAdmin = ["admin", "moderator"].includes(req.user.role);
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    const { title, description, history, category, city, country, address, best_time_to_visit, amenities, mentions } = req.body;

    if (title)              place.title              = title;
    if (description)        place.description        = description;
    if (history)            place.history            = history;
    if (category)           place.category           = category;
    if (city)               place.city               = city;
    if (country)            place.country            = country;
    if (address !== undefined) place.address         = address;
    if (best_time_to_visit) place.best_time_to_visit = best_time_to_visit;
    if (amenities)          place.amenities          = JSON.parse(amenities);
    if (mentions)           place.mentions           = JSON.parse(mentions);

    // append new images if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map((f, i) => ({
        image_url: f.path,
        is_primary: place.place_images.length === 0 && i === 0,
        uploaded_by: req.user._id,
      }));
      place.place_images.push(...newImages);
    }

    // re-submit for review if owner edited (not admin)
    if (isOwner && !isAdmin) place.status = "pending";

    await place.save();
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── POST /api/places/:id/images  — add images to existing place ──────────
// Owner or admin can add more images to a place
router.post("/:id/images", protect, upload.array("images", 10), async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    const isOwner = place.submitted_by.toString() === req.user._id.toString();
    const isAdmin = ["admin", "moderator"].includes(req.user.role);
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: "No images uploaded" });

    const newImages = req.files.map((f, i) => ({
      image_url: f.path,
      // make first image primary only if place has no images yet
      is_primary: place.place_images.length === 0 && i === 0,
      uploaded_by: req.user._id,
    }));

    place.place_images.push(...newImages);
    await place.save();

    res.status(201).json({
      message: `${req.files.length} image(s) added`,
      place_images: place.place_images,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── DELETE /api/places/:id/images/:imageId  — remove a specific image ────
router.delete("/:id/images/:imageId", protect, async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });

    const isOwner = place.submitted_by.toString() === req.user._id.toString();
    const isAdmin = ["admin", "moderator"].includes(req.user.role);
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: "Forbidden" });

    const imgIndex = place.place_images.findIndex(
      (img) => img._id.toString() === req.params.imageId
    );
    if (imgIndex === -1) return res.status(404).json({ message: "Image not found" });

    const wasPrimary = place.place_images[imgIndex].is_primary;
    place.place_images.splice(imgIndex, 1);

    // if deleted image was primary, make the next one primary
    if (wasPrimary && place.place_images.length > 0) {
      place.place_images[0].is_primary = true;
    }

    await place.save();
    res.json({ message: "Image deleted", place_images: place.place_images });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PATCH /api/places/:id/status  — admin/moderator only ─────────────────
router.patch("/:id/status", protect, async (req, res) => {
  try {
    if (!["admin", "moderator"].includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });

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

// ── DELETE /api/places/:id  — admin only ─────────────────────────────────
router.delete("/:id", protect, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Forbidden" });

    await Place.findByIdAndDelete(req.params.id);
    await Review.deleteMany({ place_id: req.params.id });
    res.json({ message: "Place deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
