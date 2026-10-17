const mongoose = require("mongoose");

const crewMemberSchema = new mongoose.Schema(
  {
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    display_name: { type: String, required: true, trim: true },
    role_title: { type: String, default: "Explorer" }, // e.g. "Lead Explorer", "Temple Hunter"
    bio: { type: String },
    avatar_url: { type: String },
    social_links: {
      instagram: { type: String },
      twitter: { type: String },
      website: { type: String },
    },
    is_featured: { type: Boolean, default: true },
    sort_order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CrewMember", crewMemberSchema);
