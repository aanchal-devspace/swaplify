import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import users from "./routes/users.js";
import swapRequests from "./routes/swapRequests.js";
import messages from "./routes/messages.js";

const app = express();
app.use(cors());
app.use(express.json());
app.get("/api/health", (req, res) => res.json({ message: "Swaplify API is running" }));
app.use("/api/users", users);
app.use("/api/swap-requests", swapRequests);
app.use("/api/messages", messages);
const port = process.env.PORT || 5000;
mongoose.connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`API running on port ${port}`)))
  .catch(error => { console.error("Could not connect to MongoDB:", error.message); process.exit(1); });
