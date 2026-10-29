import express from "express";
import Message from "../models/message.js";

const router = express.Router();

// Get chat between two users
router.get("/conversation", async (req, res) => {
  try {
    const { userId, peerId } = req.query;

    if (!userId || !peerId) {
      return res.status(400).json({
        message: "userId and peerId are required."
      });
    }

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: peerId },
        { sender: peerId, receiver: userId }
      ]
    })
      .populate("sender receiver", "name email")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Send a message
router.post("/", async (req, res) => {
  try {
    const { sender, receiver, text, swapRequest } = req.body;

    if (!sender || !receiver || !text?.trim()) {
      return res.status(400).json({
        message: "sender, receiver, and text are required."
      });
    }

    if (sender === receiver) {
      return res.status(400).json({
        message: "You cannot send a message to yourself."
      });
    }

    const message = await Message.create({
      sender,
      receiver,
      swapRequest: swapRequest || null,
      text: text.trim()
    });

    const savedMessage = await message.populate(
      "sender receiver",
      "name email"
    );

    res.status(201).json(savedMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;