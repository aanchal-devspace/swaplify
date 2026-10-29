import mongoose from "mongoose";

const swapRequestSchema = new mongoose.Schema({
  fromUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  toUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true, trim: true },
  status: { type: String, enum: ["pending", "accepted", "declined"], default: "pending" }
}, { timestamps: true });

export default mongoose.model("SwapRequest", swapRequestSchema);
