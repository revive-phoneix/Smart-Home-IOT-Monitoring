import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  profilePhoto: String,
  email: {
    type: String,
    required: true,
    unique: true,   // 🔥 THIS PREVENTS DUPLICATES
  },
  password: String,
  settings: {
    appearance: {
      theme: { type: String, default: "light" },
      accentColor: { type: String, default: "blue" },
      fontSize: { type: Number, default: 16 },
      layoutDensity: { type: String, default: "comfortable" },
      dashboardDensity: { type: Number, default: 50 },
    },
    localization: {
      language: { type: String, default: "en-US" },
      timezone: { type: String, default: "America/New_York" },
      timeFormat: { type: String, default: "12h" },
      dateFormat: { type: String, default: "MM/DD/YYYY" },
      temperatureUnit: { type: String, default: "F" },
      energyUnit: { type: String, default: "kWh" },
    },
    dataManagement: {
      automaticBackup: { type: Boolean, default: true },
      lastBackupAt: Date,
      lastBackupSize: { type: String, default: "2.4 MB" },
      lastExportAt: Date,
    },
    security: {
      twoFactorEnabled: { type: Boolean, default: false },
    },
  },
});

export default mongoose.model("User", userSchema);