import express from "express";
import SwapRequest from "../models/SwapRequest.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const requests = await SwapRequest.find().populate("fromUser toUser", "name email").sort({ createdAt: -1 });
  res.json(requests);
});

router.post("/", async (req, res) => {
  const request = await SwapRequest.create(req.body);
  res.status(201).json(request);
});

router.patch("/:id", async (req, res) => {
  const request = await SwapRequest.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!request) return res.status(404).json({ message: "Swap request not found" });
  res.json(request);
});

export default router;
