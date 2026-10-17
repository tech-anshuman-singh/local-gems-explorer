const router = require("express").Router();
const upload = require("../../middleware/upload");
const cloudinary = require("../../config/cloudinary");
const { protect } = require("../../middleware/auth");

// ── POST /api/upload/image  — upload single image to Cloudinary ───────────
router.post("/image", protect, upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });
  res.json({
    url:       req.file.path,      // Cloudinary HTTPS URL
    public_id: req.file.filename,  // for deletion later
  });
});

// ── DELETE /api/upload/image  — delete image from Cloudinary ─────────────
router.delete("/image", protect, async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) return res.status(400).json({ message: "public_id required" });
    await cloudinary.uploader.destroy(public_id);
    res.json({ message: "Image deleted from Cloudinary" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
