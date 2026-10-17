const router = require("express").Router();
const HomepageSection = require("../../models/HomepageSection");
const { protect, requireRole } = require("../../middleware/auth");

// ── GET /api/homepage/sections  — public ─────────────────────────────────
router.get("/sections", async (req, res) => {
  try {
    const sections = await HomepageSection.find().sort({ sort_order: 1 });
    res.json(sections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── PUT /api/homepage/sections/:id  — admin only ─────────────────────────
router.put("/sections/:id", protect, requireRole("admin"), async (req, res) => {
  try {
    const { title, subtitle, is_visible, sort_order } = req.body;
    const section = await HomepageSection.findByIdAndUpdate(
      req.params.id,
      { title, subtitle, is_visible, sort_order },
      { new: true }
    );
    if (!section) return res.status(404).json({ message: "Section not found" });
    res.json(section);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
