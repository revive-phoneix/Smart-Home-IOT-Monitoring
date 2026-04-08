import mongoose from "mongoose";

const deviceSchema = new mongoose.Schema({
  name: String,
  type: {
    type: String,
    enum: [
      "Temperature-Centric",
      "Humidity-Centric",
      "Power-Centric",
      "Energy-Centric",
      "Control-Centric",
      "Air-Quality-Centric",
      "Water-Quality-Centric",
      "Sensor-Centric",
    ],
    default: "Power-Centric",
  },
  status: {
    type: Boolean,
    default: false,
  },
  location: {
    type: String,
    default: 'Unknown location',
  },
  powerUsage: {
    type: Number,
    default: 0,
  },
  energy: {
    type: Number,
    default: 0,
  }, // total energy consumption in kWh
  temperature: {
    type: Number,
    default: 0,
  },
  humidity: {
    type: Number,
    default: 0,
  },
  powerHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PowerHistory",
    },
  ],
  firmware: String,
  mac: String,
  lastMaintenance: String,
});

export default mongoose.model("Device", deviceSchema);