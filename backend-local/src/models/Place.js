const mongoose = require("mongoose");

const placeImageSchema = new mongoose.Schema(
  {
    image_url: { type: String, required: true },
    is_primary: { type: Boolean, default: false },
    status: { type: String, default: "active" },
    uploaded_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    status: { type: String, enum: ["available", "limited", "unavailable"], required: true },
  },
  { timestamps: true }
);

const mentionSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["Movie", "Book", "Social"], required: true },
    title: { type: String, required: true },
    link: { type: String },
    status: { type: String, default: "active" },
  },
  { timestamps: true }
);

const placeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    history: { type: String },
    category: {
      type: String,
      required: true,
      enum: ["cafes", "temples", "nature", "food", "mystery", "sports", "fun-activity"],
    },
    city: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    best_time_to_visit: { type: String },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    submitted_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    place_images: [placeImageSchema],
    amenities: [amenitySchema],
    mentions: [mentionSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Place", placeSchema);
