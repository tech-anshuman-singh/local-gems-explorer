const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    place_id: { type: mongoose.Schema.Types.ObjectId, ref: "Place", required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    is_verified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);
