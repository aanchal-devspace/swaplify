import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  skillsOffered: [{ type: String, trim: true }],
  skillsWanted: [{ type: String, trim: true }],
  rating: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model("User", userSchema);
