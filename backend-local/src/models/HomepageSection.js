const mongoose = require("mongoose");

const homepageSectionSchema = new mongoose.Schema(
  {
    section_type: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String },
    is_visible: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomepageSection", homepageSectionSchema);
