const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    display_name: { type: String, trim: true },
    bio: { type: String },
    avatar_url: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", profileSchema);
