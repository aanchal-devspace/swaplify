import express from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const router = express.Router();

const toSafeUser = user => {
  const safeUser = user.toObject();
  delete safeUser.password;
  return safeUser;
};

// List all users (without passwords)
router.get("/", async (req, res) => {
  const users = await User.find().select("-password").sort({ createdAt: -1 });
  res.json(users);
});

// Sign up
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required." });
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ ...req.body, email: email.toLowerCase(), password: hashed });
    res.status(201).json({ user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Log in
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    res.json({ user: toSafeUser(user) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;