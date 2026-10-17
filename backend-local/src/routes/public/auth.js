const router = require("express").Router();
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const Profile = require("../../models/Profile");
const { protect } = require("../../middleware/auth");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, display_name } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email already in use" });

    const user = await User.create({ email, password, display_name });
    await Profile.create({ user_id: user._id, display_name });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/me  — returns currently logged-in user
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
