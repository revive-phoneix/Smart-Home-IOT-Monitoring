import mongoose from "mongoose";

const powerHistorySchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  Power: [{
    power: {
      type: Number,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  }],
  Energy: [{
    energy: {
      type: Number,
      required: true
    },
    time: {
      type: String,
      required: true
    }
  }],
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PowerHistory", powerHistorySchema);
