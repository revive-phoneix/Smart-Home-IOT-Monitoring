import mongoose from "mongoose";

const alertSchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
  },
  deviceName: {
    type: String,
    default: "Unknown Device",
  },
  message: String,
  severity: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW",
  },
  status: {
    type: String,
    enum: ["ACTIVE", "RESOLVED"],
    default: "ACTIVE",
  },
  resolvedAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Alert", alertSchema);